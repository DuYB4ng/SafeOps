# Quy tắc 10: Phát triển Backend NestJS (Backend Rules)

**Áp dụng cho:** Thư mục `backend/`.  
**Tham chiếu tài liệu:** [`docs/02-architecture/folder-structure.md`](../../docs/02-architecture/folder-structure.md), [`docs/02-architecture/incident-state-machine.md`](../../docs/02-architecture/incident-state-machine.md), [`docs/04-api/api-contract.md`](../../docs/04-api/api-contract.md).

---

## 1. Cấu trúc Module Chuẩn

Mỗi nghiệp vụ nằm trong một module độc lập tại `src/modules/<tên-module>/`:

```
modules/incidents/
├── incidents.module.ts
├── incidents.controller.ts
├── incidents.service.ts
├── incidents.service.spec.ts             # Unit test đặt cạnh service
├── entities/
│   ├── incident.entity.ts
│   └── incident-attachment.entity.ts
├── dto/
│   ├── create-incident.dto.ts
│   ├── update-incident.dto.ts
│   └── incident-query.dto.ts
├── incident-transitions.ts               # Định nghĩa bảng máy trạng thái
└── derive-incident-status.ts             # Hàm thuần tính toán trạng thái
```

### Nguyên tắc liên kết giữa các module:
1. **Controller mỏng, Service dày:** Controller chỉ nhận DTO, áp Guard, gọi Service và trả kết quả. Mọi logic nghiệp vụ, transaction, kiểm tra dữ liệu nằm trong Service.
2. **Không inject Repository chéo:** Module A muốn truy cập dữ liệu của Module B **bắt buộc** phải gọi qua `Service` được export của Module B. Tuyệt đối không `@InjectRepository()` của module khác.
3. **Không phụ thuộc vòng (Circular Dependency):** `dispatch` được phép gọi `incidents` và `units`; chiều ngược lại thì không. Nếu cần báo tin, sử dụng **EventEmitter2**.

---

## 2. DTO & Validation (Kiểm định dữ liệu vào)

1. **Thư viện chuẩn:** Sử dụng `class-validator` và `class-transformer`.
2. **Cấu hình Global ValidationPipe:**
   ```typescript
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,              // Tự động loại bỏ các field không khai báo trong DTO
       forbidNonWhitelisted: true,   // Báo lỗi 400 nếu client gửi field lạ
       transform: true,              // Tự động convert type (ví dụ query string 'page=1' -> number 1)
       transformOptions: { enableImplicitConversion: true },
     }),
   );
   ```
3. **Quy tắc viết DTO:**
   - Mọi field phải có decorator xác thực (ví dụ `@IsString()`, `@IsUUID()`, `@IsNotEmpty()`, `@IsOptional()`).
   - Các field dạng số vĩ độ/kinh độ dùng `@IsLatitude()`, `@IsLongitude()`.
   - Các query phân trang dùng `PaginationQueryDto` kế thừa dùng chung ở `common/dto/`.

---

## 3. Quản lý Lỗi & Chuẩn hóa Phản hồi (Error Handling)

Mọi ngoại lệ phải đi qua `AllExceptionsFilter` (`src/common/filters/all-exceptions.filter.ts`) để trả về chuẩn JSON duy nhất:

```json
{
  "statusCode": 409,
  "code": "INVALID_TRANSITION",
  "message": "Không thể chuyển trạng thái sự cố từ RESOLVED sang DISPATCHED.",
  "details": { "currentStatus": "RESOLVED", "targetStatus": "DISPATCHED" },
  "timestamp": "2026-11-24T08:00:00.000Z",
  "path": "/api/v1/incidents/uuid/status"
}
```

### Bảng mã lỗi nghiệp vụ quy chuẩn:
- `VALIDATION_FAILED` (400): Dữ liệu DTO không hợp lệ.
- `UNAUTHORIZED` (401): Thiếu hoặc sai token xác thực.
- `FORBIDDEN_ROLE` (403): Vai trò không có quyền truy cập endpoint.
- `FORBIDDEN_SCOPE` (403): Đúng vai trò nhưng không có quyền trên tài nguyên (không phải lệnh của mình).
- `NOT_FOUND` (404): Không tìm thấy bản ghi.
- `INVALID_TRANSITION` (409): Chuyển trạng thái vi phạm máy trạng thái.
- `UNIT_NOT_AVAILABLE` (409): Đơn vị không ở trạng thái sẵn sàng (`AVAILABLE`).
- `UNIT_HAS_ACTIVE_DISPATCH` (409): Đơn vị đang có lệnh hoạt động, không thể chuyển `OFFLINE`.
- `INCIDENT_NOT_DISPATCHABLE` (409): Sự cố chưa xác nhận hoặc đã kết thúc, không thể giao lệnh.
- `CONCURRENT_MODIFICATION` (409): Xung đột phiên bản (Optimistic lock failed).
- `REASON_REQUIRED` (422): Bắt buộc nhập lý do bằng văn bản (BR-02).
- `RESOLUTION_REQUIRED` (422): Bắt buộc nhập kết quả xử lý khi đóng sự cố.
- `MISSING_CLASSIFICATION` (422): Thiếu loại hoặc mức ưu tiên khi xác nhận sự cố.
- `RATE_LIMIT_EXCEEDED` (429): Gửi yêu cầu quá nhanh.

---

## 4. Giao dịch Cơ sở dữ liệu & Chống Deadlock (Transactions & Locks)

Mọi thao tác thay đổi trạng thái (Confirm alert, Dispatch unit, Update dispatch progress, Cancel/Close incident) bắt buộc chạy trong **1 Transaction duy nhất**:

1. **Khóa bi quan theo thứ tự cố định (Strict Locking Order):**  
   Để chống Deadlock khi nhiều Operator cùng điều phối hoặc nhiều Responder cùng cập nhật:
   ```
   Thứ tự khóa: INCIDENT -> DISPATCH -> UNIT
   ```
   ```typescript
   await queryRunner.manager.findOne(Incident, {
     where: { id: incidentId },
     lock: { mode: 'pessimistic_write' },
   });
   ```
2. **Khóa lạc quan (Optimistic Lock):**  
   Thực thể `Incident`, `Dispatch`, `Unit` phải có `@VersionColumn() version: number`. Khi lưu, TypeORM tự kiểm tra `version`. Nếu bị ghi đè đồng thời sẽ ném `OptimisticLockVersionMismatchError` -> filter chuyển thành `CONCURRENT_MODIFICATION`.

---

## 5. Phát Sự kiện Nội bộ (Event-Driven Architecture)

- **TUYỆT ĐỐI KHÔNG** import `RealtimeGateway` vào các module nghiệp vụ (`alerts`, `incidents`, `dispatch`).
- Khi giao dịch hoàn tất, phát sự kiện qua `EventEmitter2` **SAU KHI TRANSACTION COMMIT**:
  ```typescript
  await queryRunner.commitTransaction();
  this.eventEmitter.emit(DomainEvents.DISPATCH_ASSIGNED, new DispatchAssignedEvent(...));
  ```
- Module `realtime` lắng nghe sự kiện nội bộ và chịu trách nhiệm định tuyến gửi Socket.IO đến đúng phòng (Room).
- Module `notifications` lắng nghe sự kiện nội bộ, lưu vào database rồi mới phát thông báo realtime.
