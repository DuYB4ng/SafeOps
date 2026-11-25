# Quy tắc 60: Quy Chuẩn Git & Kiểm Thử Tối Thiểu (Git & Testing Rules)

**Áp dụng cho:** Toàn bộ repository SafeOps.  
**Tham chiếu tài liệu:** [`docs/02-architecture/folder-structure.md`](../../docs/02-architecture/folder-structure.md), [`docs/02-architecture/incident-state-machine.md`](../../docs/02-architecture/incident-state-machine.md).

---

## 1. Chiến Lược Phân Nhánh Git (Branching Strategy)

- **`main`**: Nhánh sản phẩm ổn định, luôn sẵn sàng chạy demo và nghiệm thu.
- **`develop`**: Nhánh tích hợp chính trong quá trình phát triển nhóm.
- **`feature/<tên-tính-năng>`**: Nhánh làm tính năng độc lập, tách từ `develop` (ví dụ: `feature/alert-queue`, `feature/dispatch-service`, `feature/map-view`).
- **`fix/<tên-lỗi>`**: Nhánh sửa lỗi cấp tốc (ví dụ: `fix/socket-reconnect`, `fix/sla-cron-job`).

---

## 2. Quy Chuẩn Thông Điệp Commit (Conventional Commits)

Định dạng chuẩn:
```
<loại>(<phạm vi>): <mô tả ngắn bằng tiếng Việt hoặc tiếng Anh>
```

### Các loại commit chuẩn:
- `feat`: Tính năng mới (ví dụ: `feat(dispatch): bổ sung thuật toán gợi ý lực lượng theo cự ly Haversine`).
- `fix`: Sửa lỗi (ví dụ: `fix(auth): sửa lỗi thu hồi refresh token khi đăng xuất`).
- `docs`: Cập nhật tài liệu (ví dụ: `docs(api): cập nhật hợp đồng endpoint /api/v1/alerts`).
- `refactor`: Tái cấu trúc mã nguồn không thay đổi hành vi nghiệp vụ.
- `test`: Viết thêm hoặc sửa đổi kiểm thử tự động.
- `chore`: Cấu hình Docker, cập nhật thư viện `pnpm`, biến môi trường.

---

## 3. Danh Mục Kiểm Thử Tối Thiểu Bắt Buộc (Testing Checklist)

Để đảm bảo chất lượng hệ thống và kịch bản demo chạy trơn tru, bắt buộc phải hoàn thành các bài test sau:

### 3.1 Kiểm thử Đơn vị (Unit Tests — Bắt buộc 100% Pass)
1. **Hàm thuần máy trạng thái (`deriveIncidentStatus`):**
   - Đảm bảo trả về đúng kết quả cho tất cả các tình huống:
     - Không có lệnh hoạt động và có lệnh `DONE` → `RESOLVED`.
     - Không có lệnh hoạt động và không có ai `DONE` (bị từ chối hết) → `CONFIRMED`.
     - Có ít nhất một lệnh `ON_SCENE` → `IN_PROGRESS`.
     - Chỉ có lệnh `ASSIGNED`/`EN_ROUTE` → `DISPATCHED`.
2. **Thuật toán tính cự ly Haversine (`geo.util.ts`):**
   - Kiểm tra tính toán khoảng cách đường chim bay giữa các cặp tọa độ mẫu chính xác theo mét.
3. **Tra cứu quy tắc chuyển trạng thái (`findTransition`):**
   - Kiểm tra cặp trạng thái hợp lệ và từ chối các bước chuyển nhảy cóc trái phép.

### 3.2 Kiểm thử Tích hợp & Nghiệp vụ (Integration / Service Tests)
1. **Ràng buộc khả dụng của lực lượng:** Giao lệnh cho đơn vị đang `BUSY` hoặc `OFFLINE` phải bị chặn với lỗi `UNIT_NOT_AVAILABLE`.
2. **Từ chối lệnh điều phối (BR-08):** Khi lực lượng từ chối lệnh, đơn vị phải lập tức quay về `AVAILABLE` và sự cố quay về `CONFIRMED` mà không tự phân bổ lại.
3. **Toàn vẹn Transaction:** Giả lập lỗi tại bước cập nhật nhật ký thì toàn bộ giao dịch giao lệnh và cập nhật trạng thái đơn vị phải được rollback hoàn toàn.

### 3.3 Kiểm thử Đầu cuối (E2E Tests — Luồng Vàng MVP)
Kiểm thử chuỗi hành trình liên hoàn không lỗi:
```
Tạo Cảnh báo -> Operator Xác nhận (thành Sự cố) -> Gợi ý & Giao lệnh 
-> Responder Chấp nhận -> Báo Đang đến -> Báo Đã đến hiện trường (Incident thành IN_PROGRESS)
-> Responder Hoàn tất (Incident thành RESOLVED) -> Operator Đóng sự cố (Incident thành CLOSED)
```

---

## 4. Lệnh Kiểm Tra Trước Khi Đẩy Code (Pre-push Check)

Trước khi tạo Pull Request hoặc gộp nhánh vào `develop` / `main`, chạy chuỗi lệnh sau trong thư mục tương ứng:

```bash
# Tại apps/backend hoặc apps/frontend
pnpm lint          # Đảm bảo không có lỗi quy chuẩn mã nguồn
pnpm test          # Đảm bảo toàn bộ unit test thành công
pnpm build         # Đảm bảo biên dịch TypeScript không lỗi
```
