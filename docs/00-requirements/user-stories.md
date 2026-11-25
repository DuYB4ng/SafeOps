# User story và yêu cầu chức năng

**Đọc file này khi:** hiện thực một chức năng. Mỗi user story trỏ tới các yêu cầu chức năng (FR) tương ứng ở mục 2.
Quy trình và quy tắc nghiệp vụ (BR) xem [`overview.md`](overview.md); vai trò và phân quyền xem [`roles-permissions.md`](roles-permissions.md).

---

## 1. User story theo vai trò

### REPORTER

- US-01: Là người báo cáo, tôi muốn gửi báo cáo sự cố kèm vị trí và ảnh để trung tâm biết và xử lý. _(FR-ALERT-01)_
- US-02: Là người báo cáo, tôi muốn xem báo cáo của mình đang ở trạng thái nào. _(FR-INC-11)_

### OPERATOR

- US-03: Là điều phối viên, tôi muốn thấy cảnh báo mới ngay khi có để xử lý kịp thời. _(FR-ALERT-05, FR-RT-01)_
- US-04: Là điều phối viên, tôi muốn xác nhận, loại bỏ hoặc gộp cảnh báo để hàng đợi luôn sạch. _(FR-ALERT-06, FR-ALERT-07)_
- US-05: Là điều phối viên, tôi muốn nhập cảnh báo khi nhận điện thoại. _(FR-ALERT-02)_
- US-06: Là điều phối viên, tôi muốn xem gợi ý lực lượng phù hợp và gần nhất để điều phối nhanh. _(FR-DISP-01)_
- US-07: Là điều phối viên, tôi muốn giao lệnh cho một hoặc nhiều lực lượng. _(FR-DISP-02, FR-DISP-03)_
- US-08: Là điều phối viên, tôi muốn theo dõi tiến độ mọi sự cố trên bản đồ và danh sách. _(FR-MAP-01, FR-MAP-06)_
- US-09: Là điều phối viên, tôi muốn được cảnh báo khi một việc sắp/đã quá hạn. _(FR-INC-10)_
- US-10: Là điều phối viên, tôi muốn đóng sự cố sau khi lực lượng báo hoàn thành. _(FR-INC-04)_

### RESPONDER

- US-11: Là lực lượng xử lý, tôi muốn nhận thông báo ngay khi được giao việc. _(FR-DISP-04, FR-RT-01)_
- US-12: Là lực lượng xử lý, tôi muốn chấp nhận hoặc từ chối lệnh (có lý do). _(FR-DISP-05)_
- US-13: Là lực lượng xử lý, tôi muốn cập nhật "đang đến", "đã đến", "hoàn thành" và ghi chú, ảnh hiện trường. _(FR-DISP-05, FR-DISP-09)_
- US-14: Là lực lượng xử lý, tôi muốn đánh dấu mình sẵn sàng hoặc không trực. _(FR-UNIT-04)_

### COMMANDER

- US-15: Là chỉ huy, tôi muốn nhìn tổng quan tình hình trên dashboard và bản đồ. _(FR-DASH-01, FR-DASH-02)_
- US-16: Là chỉ huy, tôi muốn xem thống kê và thời gian phản hồi để đánh giá hiệu quả. _(FR-DASH-03, FR-DASH-04)_
- US-17: Là chỉ huy, tôi muốn can thiệp: hủy, mở lại, đóng sự cố khi cần. _(FR-INC-04, FR-INC-09)_
- US-18: Là chỉ huy, tôi muốn xem nhật ký đầy đủ của một sự cố để hậu kiểm. _(FR-LOG-03)_

### ADMIN

- US-19: Là quản trị viên, tôi muốn tạo, khóa tài khoản và đổi vai trò người dùng. _(FR-ADMIN-01)_
- US-20: Là quản trị viên, tôi muốn quản lý danh mục loại sự cố. _(FR-ADMIN-02)_

---

## 2. Yêu cầu chức năng

Ký hiệu độ ưu tiên: **M** = Must (bắt buộc MVP) · **S** = Should (nên có) · **C** = Could (để sau).

### 2.1 Xác thực và người dùng (AUTH)

| Mã         | Yêu cầu                                                                                                         | Ưu tiên |
| ---------- | --------------------------------------------------------------------------------------------------------------- | ------- |
| FR-AUTH-01 | Người dùng đăng nhập bằng tài khoản và mật khẩu; mật khẩu được băm                                              | M       |
| FR-AUTH-02 | Phiên đăng nhập dùng access token có hạn và cơ chế làm mới; hỗ trợ đăng xuất                                    | M       |
| FR-AUTH-03 | Mỗi người dùng có đúng một vai trò trong 5 vai trò ở [`roles-permissions.md`](roles-permissions.md) mục 1       | M       |
| FR-AUTH-04 | Người báo cáo có thể tự đăng ký; tài khoản mới mặc định là `REPORTER`, chỉ ADMIN được nâng quyền **[GIẢ ĐỊNH]** | S       |
| FR-AUTH-05 | Mọi API đều kiểm tra quyền ở backend, không chỉ ẩn nút ở giao diện                                              | M       |

### 2.2 Tiếp nhận cảnh báo (ALERT)

| Mã          | Yêu cầu                                                                                                                          | Ưu tiên |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ------- |
| FR-ALERT-01 | REPORTER gửi báo cáo gồm: loại (tùy chọn), mô tả, vị trí (chọn trên bản đồ hoặc nhập mô tả), ảnh đính kèm (tùy chọn)             | M       |
| FR-ALERT-02 | OPERATOR nhập cảnh báo thủ công (ví dụ khi nhận điện thoại) với đầy đủ thông tin                                                 | M       |
| FR-ALERT-03 | Cung cấp API để nguồn tự động gửi cảnh báo, xác thực bằng khóa API                                                               | M       |
| FR-ALERT-04 | Mỗi cảnh báo ghi nguồn (`REPORTER`, `OPERATOR`, `AUTOMATED`), thời điểm nhận, người gửi (nếu có)                                 | M       |
| FR-ALERT-05 | Hàng đợi cảnh báo mới sắp xếp theo mức ưu tiên (nếu có) rồi theo thời gian nhận; hiển thị thời gian chờ                          | M       |
| FR-ALERT-06 | OPERATOR xác nhận cảnh báo → tạo sự cố, hoặc loại bỏ kèm lý do bắt buộc                                                          | M       |
| FR-ALERT-07 | Gợi ý trùng lặp: cảnh báo cùng loại, cách nhau ≤ 100 m và ≤ 10 phút so với sự cố đang mở thì hệ thống đề xuất gộp **[GIẢ ĐỊNH]** | S       |
| FR-ALERT-08 | Giới hạn tốc độ gửi báo cáo cho tài khoản `REPORTER` để chống spam                                                               | S       |

### 2.3 Quản lý sự cố (INC)

| Mã        | Yêu cầu                                                                                                                                       | Ưu tiên |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| FR-INC-01 | Sự cố có: mã hiển thị, tiêu đề, mô tả, loại, mức ưu tiên, trạng thái, vị trí (tọa độ + mô tả địa điểm), thời điểm các mốc, người tạo/xác nhận | M       |
| FR-INC-02 | OPERATOR tạo sự cố từ cảnh báo, hoặc tạo trực tiếp                                                                                            | M       |
| FR-INC-03 | OPERATOR chỉnh sửa loại, mức ưu tiên, vị trí, mô tả; mọi thay đổi được ghi nhật ký                                                            | M       |
| FR-INC-04 | Chuyển trạng thái theo bảng ở [`roles-permissions.md`](roles-permissions.md) mục 3; chuyển sai trả lỗi rõ ràng                                | M       |
| FR-INC-05 | Đính kèm ảnh vào sự cố (giới hạn loại và dung lượng file)                                                                                     | M       |
| FR-INC-06 | Danh sách sự cố có phân trang, lọc (trạng thái, loại, mức ưu tiên, khoảng thời gian) và tìm kiếm theo mã/tiêu đề                              | M       |
| FR-INC-07 | Trang chi tiết sự cố: thông tin, bản đồ, danh sách lệnh điều phối, ảnh, dòng thời gian (timeline)                                             | M       |
| FR-INC-08 | Gộp sự cố trùng: chuyển các cảnh báo liên quan sang sự cố chính                                                                               | S       |
| FR-INC-09 | Hủy sự cố kèm lý do bắt buộc; không xóa cứng dữ liệu                                                                                          | M       |
| FR-INC-10 | Cảnh báo quá SLA ở các mốc xác nhận và điều phối                                                                                              | S       |
| FR-INC-11 | REPORTER xem được trạng thái các báo cáo do chính mình gửi (chỉ thông tin tối thiểu)                                                          | S       |

### 2.4 Quản lý lực lượng (UNIT)

| Mã         | Yêu cầu                                                                                                    | Ưu tiên |
| ---------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| FR-UNIT-01 | ADMIN/OPERATOR quản lý danh sách lực lượng: tên, loại, khu vực phụ trách, thành viên, liên hệ              | M       |
| FR-UNIT-02 | Mỗi lực lượng có trạng thái `AVAILABLE` / `BUSY` / `OFFLINE`                                               | M       |
| FR-UNIT-03 | Lực lượng có vị trí hiện tại (cập nhật thủ công hoặc theo vị trí đã báo gần nhất), không theo dõi liên tục | M       |
| FR-UNIT-04 | RESPONDER tự chuyển trạng thái `AVAILABLE` ↔ `OFFLINE` khi vào/ra ca                                       | S       |
| FR-UNIT-05 | Mỗi tài khoản `RESPONDER` thuộc đúng một lực lượng                                                         | M       |

### 2.5 Điều phối (DISP)

| Mã         | Yêu cầu                                                                                                                                                           | Ưu tiên |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| FR-DISP-01 | Với sự cố đã xác nhận, hệ thống gợi ý danh sách lực lượng: đúng loại ([`overview.md`](overview.md) mục 5.3), đang `AVAILABLE`, sắp xếp theo khoảng cách đến sự cố | M       |
| FR-DISP-02 | OPERATOR chọn một hoặc nhiều lực lượng và giao lệnh, có thể kèm chỉ dẫn                                                                                           | M       |
| FR-DISP-03 | Một sự cố có thể có nhiều lệnh điều phối; mỗi lệnh có trạng thái riêng ([`overview.md`](overview.md) mục 4.3)                                                     | M       |
| FR-DISP-04 | RESPONDER xem danh sách việc được giao cho lực lượng của mình                                                                                                     | M       |
| FR-DISP-05 | RESPONDER chấp nhận hoặc từ chối lệnh (từ chối bắt buộc có lý do), rồi cập nhật `EN_ROUTE` → `ON_SCENE` → `DONE`                                                  | M       |
| FR-DISP-06 | Khi lực lượng từ chối, hệ thống báo OPERATOR và đưa sự cố về trạng thái chờ điều phối thêm                                                                        | M       |
| FR-DISP-07 | OPERATOR thu hồi lệnh (`CANCELLED`) kèm lý do                                                                                                                     | M       |
| FR-DISP-08 | Khi lệnh được giao, lực lượng chuyển `BUSY`; khi lệnh `DONE`/`DECLINED`/`CANCELLED` và không còn lệnh khác, trở về `AVAILABLE`                                    | M       |
| FR-DISP-09 | RESPONDER ghi chú tiến độ và đính kèm ảnh hiện trường ở mỗi lệnh                                                                                                  | M       |
| FR-DISP-10 | OPERATOR được phép gán lực lượng đang `BUSY` nếu xác nhận ghi đè và nêu lý do                                                                                     | C       |

### 2.6 Bản đồ (MAP)

| Mã        | Yêu cầu                                                                | Ưu tiên |
| --------- | ---------------------------------------------------------------------- | ------- |
| FR-MAP-01 | Bản đồ hiển thị sự cố đang mở, màu/biểu tượng theo mức ưu tiên và loại | M       |
| FR-MAP-02 | Bản đồ hiển thị lực lượng theo trạng thái                              | M       |
| FR-MAP-03 | Bấm vào điểm trên bản đồ xem tóm tắt và đi tới chi tiết                | M       |
| FR-MAP-04 | Công cụ chọn vị trí trên bản đồ khi tạo báo cáo/sự cố                  | M       |
| FR-MAP-05 | Lọc bản đồ theo loại, mức ưu tiên, trạng thái                          | S       |
| FR-MAP-06 | Bản đồ tự cập nhật điểm mới/đổi trạng thái mà không cần tải lại trang  | M       |

### 2.7 Thời gian thực (RT)

| Mã       | Yêu cầu                                                                                      | Ưu tiên |
| -------- | -------------------------------------------------------------------------------------------- | ------- |
| FR-RT-01 | Các sự kiện ở [`overview.md`](overview.md) mục 6 được đẩy tới đúng nhóm người dùng liên quan | M       |
| FR-RT-02 | Kết nối thời gian thực được xác thực bằng token của người dùng                               | M       |
| FR-RT-03 | Mất kết nối rồi kết nối lại thì giao diện tự đồng bộ lại dữ liệu mới nhất                    | M       |
| FR-RT-04 | Hiển thị trạng thái kết nối (đã kết nối/mất kết nối) trên giao diện điều hành                | S       |
| FR-RT-05 | Có âm báo hoặc hiệu ứng nổi bật khi có cảnh báo `CRITICAL`/`HIGH` mới                        | C       |

### 2.8 Thông báo (NOTI)

| Mã         | Yêu cầu                                                                | Ưu tiên |
| ---------- | ---------------------------------------------------------------------- | ------- |
| FR-NOTI-01 | Thông báo được lưu vào cơ sở dữ liệu trước, rồi mới đẩy thời gian thực | S       |
| FR-NOTI-02 | Người dùng xem danh sách thông báo, đánh dấu đã đọc, thấy số chưa đọc  | S       |
| FR-NOTI-03 | Người dùng offline vẫn thấy thông báo khi đăng nhập lại                | S       |

### 2.9 Dashboard và thống kê (DASH)

| Mã         | Yêu cầu                                                                                   | Ưu tiên |
| ---------- | ----------------------------------------------------------------------------------------- | ------- |
| FR-DASH-01 | Thẻ tổng quan: số sự cố đang mở theo mức ưu tiên, số cảnh báo chờ, số lực lượng sẵn sàng  | M       |
| FR-DASH-02 | Danh sách sự cố cần chú ý: ưu tiên cao, quá SLA, chưa có lực lượng                        | M       |
| FR-DASH-03 | Biểu đồ số sự cố theo loại và theo khoảng thời gian (ngày/tuần/tháng)                     | M       |
| FR-DASH-04 | Chỉ số thời gian phản hồi trung bình (nhận → xác nhận → điều phối → đến nơi → hoàn thành) | S       |
| FR-DASH-05 | Tỷ lệ sự cố quá SLA; tỷ lệ báo nhầm                                                       | S       |
| FR-DASH-06 | Thống kê theo khu vực                                                                     | C       |
| FR-DASH-07 | Xuất báo cáo PDF/Excel                                                                    | C       |

### 2.10 Nhật ký và quản trị (LOG/ADMIN)

| Mã          | Yêu cầu                                                                                         | Ưu tiên |
| ----------- | ----------------------------------------------------------------------------------------------- | ------- |
| FR-LOG-01   | Ghi nhật ký mọi thao tác quan trọng trên sự cố: ai, lúc nào, hành động, giá trị cũ → mới, lý do | M       |
| FR-LOG-02   | Nhật ký không thể sửa/xóa từ giao diện                                                          | M       |
| FR-LOG-03   | Timeline của sự cố hiển thị nhật ký theo thứ tự thời gian                                       | M       |
| FR-ADMIN-01 | ADMIN quản lý người dùng: tạo, khóa/mở, đổi vai trò, đặt lại mật khẩu                           | M       |
| FR-ADMIN-02 | ADMIN quản lý danh mục loại sự cố                                                               | S       |
| FR-ADMIN-03 | ADMIN cấu hình bảng SLA theo mức ưu tiên                                                        | C       |
| FR-ADMIN-04 | Dữ liệu mẫu (seed): tài khoản mỗi vai trò, lực lượng, loại sự cố, một số sự cố                  | M       |
| FR-ADMIN-05 | Công cụ giả lập cảnh báo ngẫu nhiên theo chu kỳ để demo                                         | S       |
