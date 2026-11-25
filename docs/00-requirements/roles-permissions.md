# Vai trò và phân quyền

**Đọc file này khi:** làm xác thực, phân quyền (guard, decorator), kiểm tra "ai được làm gì", hoặc chuyển trạng thái sự cố.
Bối cảnh và quy trình xem [`overview.md`](overview.md); yêu cầu chi tiết xem [`user-stories.md`](user-stories.md).

> Nguyên tắc: **mọi kiểm tra quyền phải thực hiện ở backend** (FR-AUTH-05). Ẩn nút ở giao diện chỉ để tiện dùng, không thay thế kiểm tra quyền.

---

## 1. Các bên tham gia

| Mã vai trò    | Tên               | Mô tả                                    | Việc chính                                              |
| ------------- | ----------------- | ---------------------------------------- | ------------------------------------------------------- |
| `REPORTER`    | Người báo cáo     | Nhân viên, cư dân, bảo vệ chốt           | Gửi báo cáo sự cố, theo dõi trạng thái báo cáo của mình |
| `OPERATOR`    | Điều phối viên    | Nhân sự trực trung tâm chỉ huy           | Tiếp nhận, xác minh, phân loại, điều phối               |
| `RESPONDER`   | Lực lượng xử lý   | Bảo vệ, PCCC, y tế, kỹ thuật             | Nhận lệnh, cập nhật tiến độ hiện trường                 |
| `COMMANDER`   | Chỉ huy / Quản lý | Trưởng ca, quản lý trung tâm             | Giám sát, xem thống kê, can thiệp, đóng sự cố           |
| `ADMIN`       | Quản trị hệ thống | Quản trị kỹ thuật                        | Quản lý người dùng, danh mục, cấu hình                  |
| Nguồn tự động | Hệ thống ngoài    | Báo cháy, camera, cảm biến, nút khẩn cấp | Gọi API để sinh cảnh báo (nhóm mô phỏng)                |

---

## 2. Ma trận quyền theo vai trò

Ký hiệu: ✔ được phép · — không · (own) chỉ với dữ liệu của chính mình · (unit) chỉ với lực lượng của mình.

| Chức năng                         | REPORTER | OPERATOR   | RESPONDER   | COMMANDER | ADMIN       |
| --------------------------------- | -------- | ---------- | ----------- | --------- | ----------- |
| Đăng ký / đăng nhập               | ✔        | ✔          | ✔           | ✔         | ✔           |
| Gửi báo cáo sự cố                 | ✔        | ✔          | ✔           | ✔         | —           |
| Xem báo cáo đã gửi                | (own)    | ✔          | —           | ✔         | —           |
| Xem hàng đợi cảnh báo             | —        | ✔          | —           | ✔         | —           |
| Xác nhận / loại bỏ / gộp cảnh báo | —        | ✔          | —           | —         | —           |
| Tạo sự cố trực tiếp               | —        | ✔          | —           | ✔         | —           |
| Sửa thông tin sự cố               | —        | ✔          | —           | ✔         | —           |
| Xem danh sách / chi tiết sự cố    | (own)    | ✔          | (được giao) | ✔         | ✔ (chỉ đọc) |
| Hủy sự cố                         | —        | ✔          | —           | ✔         | —           |
| Đóng sự cố                        | —        | ✔          | —           | ✔         | —           |
| Mở lại sự cố                      | —        | —          | —           | ✔         | —           |
| Xem bản đồ điều hành              | —        | ✔          | (được giao) | ✔         | ✔           |
| Quản lý lực lượng                 | —        | ✔          | —           | ✔         | ✔           |
| Giao / thu hồi lệnh điều phối     | —        | ✔          | —           | ✔         | —           |
| Nhận / từ chối / cập nhật lệnh    | —        | —          | (unit)      | —         | —           |
| Xem dashboard thống kê            | —        | ✔ (cơ bản) | —           | ✔         | ✔           |
| Xem nhật ký sự cố                 | —        | ✔          | (được giao) | ✔         | ✔           |
| Quản lý người dùng                | —        | —          | —           | —         | ✔           |
| Quản lý danh mục / cấu hình       | —        | —          | —           | —         | ✔           |

> Ma trận này là đề xuất. Chi tiết "được giao" và "own" phải được kiểm tra ở backend (xem FR-AUTH-05).

---

## 3. Quyền chuyển trạng thái sự cố

| Từ                                                 | Sang                   | Ai được thực hiện   | Điều kiện                         |
| -------------------------------------------------- | ---------------------- | ------------------- | --------------------------------- |
| `NEW`                                              | `CONFIRMED`            | OPERATOR            | Đã có loại, mức ưu tiên, vị trí   |
| `CONFIRMED`                                        | `DISPATCHED`           | OPERATOR            | Đã giao ít nhất một lệnh          |
| `DISPATCHED`                                       | `IN_PROGRESS`          | Hệ thống            | Có lệnh chuyển sang `ON_SCENE`    |
| `IN_PROGRESS`                                      | `RESOLVED`             | Hệ thống            | Mọi lệnh đang hoạt động đã `DONE` |
| `RESOLVED`                                         | `CLOSED`               | OPERATOR, COMMANDER | Đã nhập kết quả xử lý             |
| `NEW` / `CONFIRMED` / `DISPATCHED` / `IN_PROGRESS` | `CANCELLED`            | OPERATOR, COMMANDER | Bắt buộc có lý do                 |
| `RESOLVED` / `CLOSED`                              | `CONFIRMED` (mở lại)   | COMMANDER           | Bắt buộc có lý do (để Operator giao lệnh mới) |

Các trạng thái và ý nghĩa của chúng được mô tả ở [`overview.md`](overview.md) mục 4.

---

## 4. Phạm vi dữ liệu theo vai trò

Các ký hiệu trong ma trận quyền (mục 2) được hiểu như sau:

| Ký hiệu     | Ý nghĩa                                                          | Cách kiểm tra ở backend                                                     |
| ----------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| (own)       | Chỉ dữ liệu do chính người dùng tạo                              | So khớp `createdBy` / `reporterId` với người dùng hiện tại                  |
| (unit)      | Chỉ thao tác trên lệnh điều phối của lực lượng mình              | So khớp lực lượng của người dùng với lực lượng được giao trong lệnh         |
| (được giao) | Chỉ xem sự cố đang có lệnh điều phối giao cho lực lượng của mình | Kiểm tra tồn tại lệnh điều phối liên kết sự cố với lực lượng của người dùng |
| (chỉ đọc)   | Xem được, không có thao tác ghi                                  | Chỉ cho phép các route GET                                                  |

Thông tin liên hệ của người báo cáo chỉ OPERATOR và COMMANDER xem được (BR-09).
