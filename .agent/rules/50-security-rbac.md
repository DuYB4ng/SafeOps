# Quy tắc 50: An ninh & Kiểm soát Quyền truy cập RBAC (Security Rules)

**Áp dụng cho:** Thư mục `backend/src/common/guards/`, `modules/auth/`, và `modules/uploads/`.  
**Tham chiếu tài liệu:** [`docs/00-requirements/roles-permissions.md`](../../docs/00-requirements/roles-permissions.md), [`docs/01-srs/srs.md`](../../docs/01-srs/srs.md).

---

## 1. Nguyên Tắc Cốt Lõi: KIỂM SOÁT TẠI BACKEND

> **Quy định bắt buộc (FR-AUTH-05):**  
> Mọi kiểm tra phân quyền và phạm vi dữ liệu phải được thực hiện ở Backend. Việc ẩn nút hoặc chặn route trên giao diện Frontend chỉ phục vụ trải nghiệm người dùng (UX), tuyệt đối không được coi là biện pháp bảo mật.

---

## 2. Hệ Thống Guards & Decorators

1. **`JwtAuthGuard` (Toàn cục):**  
   Mọi endpoint mặc định đều yêu cầu xác thực JWT Bearer Token, trừ các endpoint được đánh dấu công khai bằng decorator `@Public()`.
2. **`RolesGuard` & Decorator `@Roles(...)`:**  
   Thẩm định vai trò người dùng dựa trên metadata gán tại Controller:
   ```typescript
   @Roles(UserRole.OPERATOR, UserRole.COMMANDER)
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Post('confirm')
   async confirmAlert(...) {}
   ```
3. **`ApiKeyGuard`:**  
   Dành riêng cho endpoint tiếp nhận cảnh báo tự động từ cảm biến/camera mô phỏng (`POST /api/v1/alerts/automated`). Kiểm tra Header `x-api-key` so với biến môi trường `ALERT_API_KEY`.
4. **Decorator `@CurrentUser()`:**  
   Trích xuất đối tượng người dùng đã xác thực từ `request.user` một cách tường minh, không ép kiểu thủ công.

---

## 3. Kiểm Soát Phạm Vi Dữ Liệu (Data Scope Enforcement)

Ngoài kiểm tra vai trò (Role), Service phải kiểm tra quyền sở hữu dữ liệu (Scope):

| Ký hiệu | Ý nghĩa | Cách thực hiện tại Service |
|---|---|---|
| **(own)** | Chỉ thao tác dữ liệu do chính mình tạo | So sánh `record.reporterId === user.id` hoặc `record.createdById === user.id`. Nếu không trùng, ném lỗi `403 FORBIDDEN_SCOPE`. |
| **(unit)** | Chỉ thao tác trên lệnh giao cho đơn vị mình | So sánh `dispatch.unitId === user.unitId`. Responder thuộc Đội A không được chấp nhận/từ chối lệnh của Đội B. |
| **(được giao)** | Chỉ xem sự cố đang được giao cho đơn vị mình | Kiểm tra tồn tại bản ghi trong bảng `dispatches` liên kết sự cố đó với `user.unitId`. |

---

## 4. Bảo Vệ Dữ Liệu Nhạy Cảm (Sensitive Data Protection)

1. **Che giấu thông tin liên hệ người báo cáo (BR-09):**  
   - Trường số điện thoại (`phone`) của người báo cáo **CHỈ** được trả về cho người dùng có vai trò `OPERATOR` hoặc `COMMANDER`.
   - Với vai trò `RESPONDER` hoặc khi `REPORTER` xem danh sách chung, trường này bắt buộc phải bị loại bỏ (`phone: null` hoặc không gửi trong JSON response).
2. **Bảo mật mật khẩu (NFR-01):**  
   - Mật khẩu băm bằng `bcrypt` với muối (Salt rounds = 10).
   - Tuyệt đối không bao giờ `select: ['passwordHash']` trong các câu query tìm kiếm thông thường.

---

## 5. An Toàn Tải Tệp Lên (File Upload Security)

Áp dụng tại `modules/uploads/` (FR-ALERT-01, FR-DISP-09, BR-10, NFR-02):

1. **Giới hạn dung lượng:** Tối đa **5 MB (5,242,880 bytes)** cho mỗi file. Vượt quá lập tức từ chối `400 Bad Request`.
2. **Kiểm tra định dạng file (Whitelist):**  
   Chỉ cho phép 3 định dạng: `image/jpeg`, `image/png`, `image/webp`. Kiểm tra cả MIME type từ header lẫn magic numbers của tệp (không chỉ dựa vào đuôi file mở rộng).
3. **Đổi tên file ngẫu nhiên (Prevent Path Traversal):**  
   Tuyệt đối không lưu file bằng tên do client gửi lên. Luôn sinh tên mới bằng UUID:
   ```typescript
   const safeFileName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
   ```
4. **Giới hạn số lượng:** Tối đa 5 ảnh trên mỗi lần gửi báo cáo cảnh báo hoặc báo cáo kết quả hiện trường.
