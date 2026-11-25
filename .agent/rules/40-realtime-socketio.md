# Quy tắc 40: Truyền thông Thời gian thực Socket.IO (Realtime Rules)

**Áp dụng cho:** Module `realtime` ở backend và `providers/SocketProvider` ở frontend.  
**Tham chiếu tài liệu:** [`docs/02-architecture/realtime-events.md`](../../docs/02-architecture/realtime-events.md), [`docs/01-srs/srs.md`](../../docs/01-srs/srs.md).

---

## 1. Nguyên Tắc Thiết Kế: REST Là Chân Lý, Socket Là Tín Hiệu

1. **REST là nguồn sự thật (Single Source of Truth):**  
   Mọi giao dịch ghi dữ liệu và kiểm tra quyền hạn đều thực hiện qua REST API.
2. **Socket.IO chỉ gửi tín hiệu thông báo thay đổi:**  
   Payload của sự kiện socket phải **cực kỳ tinh gọn** (chỉ chứa ID, trạng thái, mã code, tọa độ).
3. **TUYỆT ĐỐI KHÔNG gửi dữ liệu nhạy cảm qua Socket (BR-09):**  
   Không gửi số điện thoại người báo cáo, thông tin cá nhân, nội dung mô tả đầy đủ hay danh sách ảnh qua Socket.IO payload. Client khi nhận được sự kiện sẽ gọi REST API tương ứng để lấy chi tiết (nơi quyền hạn được kiểm tra đầy đủ).

---

## 2. Quy Chuẩn Phòng (Rooms) & Xác Thực Handshake

### 2.1 Xác thực kết nối
- Client bắt buộc truyền JWT qua thuộc tính `auth`:
  ```typescript
  const socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ['websocket'],
  });
  ```
- Server kiểm tra JWT tại Middleware của Socket.IO lúc Handshake. Nếu không hợp lệ hoặc hết hạn, từ chối kết nối với mã lỗi `UNAUTHORIZED`.

### 2.2 Quy ước Đặt tên Phòng (Room Naming)
Khi kết nối thành công, Server tự động đưa socket vào các phòng logic dựa theo dữ liệu trong Token:
- **`user:{userId}`**: Phòng riêng của cá nhân (nhận thông báo cá nhân, cập nhật báo cáo của mình).
- **`role:{ROLE}`**: Phòng theo vai trò (`role:OPERATOR`, `role:COMMANDER`).
- **`unit:{unitId}`**: Phòng của đội lực lượng (toàn bộ thành viên của đơn vị nhận lệnh điều phối).

*Lưu ý:* Luôn dùng helper hàm tạo tên phòng (`Rooms.user(id)`, `Rooms.role(role)`, `Rooms.unit(id)`), không ghép chuỗi thủ công rải rác trong code.

---

## 3. Danh Mục Sự Kiện & Chuẩn Payload

### 3.1 Quy ước Đặt tên Sự kiện
Định dạng: `đối-tượng.hành-động` (chữ thường, ngăn cách bằng dấu chấm).

| Tên sự kiện | Phòng nhận | Mục đích |
|---|---|---|
| `alert.created` | `role:OPERATOR`, `role:COMMANDER` | Cảnh báo mới vào hàng đợi SOC |
| `alert.resolved` | `role:OPERATOR`, `role:COMMANDER`, `user:{reporterId}` | Cảnh báo đã duyệt / loại bỏ / gộp |
| `incident.created` | `role:OPERATOR`, `role:COMMANDER` | Sự cố mới được khởi tạo |
| `incident.updated` | `role:OPERATOR`, `role:COMMANDER`, `user:{reporterId}`, `unit:{activeUnitIds}` | Cập nhật tiến độ / trạng thái sự cố |
| `dispatch.assigned` | `unit:{unitId}` | Giao nhiệm vụ khẩn cấp cho lực lượng |
| `dispatch.updated` | `role:OPERATOR`, `role:COMMANDER`, `unit:{unitId}` | Lực lượng đổi tiến độ (đang đến, đến nơi, xong) |
| `unit.updated` | `role:OPERATOR`, `role:COMMANDER` | Đổi trạng thái khả dụng / vị trí lực lượng |
| `sla.breached` | `role:OPERATOR`, `role:COMMANDER` | Cảnh báo đỏ vi phạm hạn mức SLA |
| `notification.created` | `user:{userId}` | Chuông thông báo cá nhân |

### 3.2 Chuẩn Payload Cơ bản (BaseEventPayload)
Mọi payload sự kiện đều phải kế thừa 2 trường bắt buộc:
```typescript
export interface BaseEventPayload {
  eventId: string;     // UUID duy nhất của sự kiện (client dùng để khử trùng lặp)
  occurredAt: string;  // Thời điểm ISO 8601 UTC
}
```

---

## 4. Tách Biệt Nghiệp Vụ & Phát Sự Kiện (Event-Driven)

1. **Phát sự kiện SAU KHI Transaction Commit:**  
   Tuyệt đối không phát sự kiện khi đang ở giữa Transaction của cơ sở dữ liệu. Chỉ phát khi dữ liệu đã ghi xuống ổ đĩa thành công:
   ```typescript
   // Tại Service nghiệp vụ (ví dụ: DispatchesService)
   await queryRunner.commitTransaction();
   this.eventEmitter.emit(DomainEvents.DISPATCH_ASSIGNED, eventData);
   ```
2. **Listener trung gian (`RealtimeListener`):**  
   Module nghiệp vụ không bao giờ gọi trực tiếp `RealtimeGateway`. Module `realtime` đăng ký `@OnEvent(...)` để bắt domain event và gọi `gateway.emitTo(rooms, event, payload)`.

---

## 5. Phía Frontend: Xử lý Sự kiện & Invalidate Cache

1. **Khử trùng lặp (De-duplication):** Client duy trì bộ nhớ tạm (Set) chứa 50 `eventId` gần nhất; nếu nhận trùng ID thì bỏ qua.
2. **Gộp tần suất (Debounce Invalidation ~300ms):** Khi công cụ giả lập bắn hàng loạt cảnh báo, không reload API liên tục. Gộp các sự kiện cùng loại trong 300ms thành 1 lần gọi lại TanStack Query.
3. **Tự động đồng bộ khi Reconnect:**  
   Khi bắt được sự kiện socket `connect` (sau khi đứt mạng), Frontend gọi ngay `queryClient.invalidateQueries()` để kéo lại trạng thái mới nhất từ server (NFR-06).
