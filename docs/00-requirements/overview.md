# Tổng quan yêu cầu nghiệp vụ

**Đề tài:** G1.1 — Xây dựng hệ thống quản lý và điều phối sự cố an ninh theo thời gian thực
**Phiên bản:** 0.1 (bản nháp để nhóm duyệt)
**Trạng thái:** Chờ xác nhận các mục đánh dấu **[GIẢ ĐỊNH]**

> Công ty chỉ cung cấp tên đề tài, không cung cấp yêu cầu, dữ liệu hay cơ sở dữ liệu. Vì vậy tài liệu này do nhóm tự định nghĩa bài toán. Mọi điểm đánh dấu **[GIẢ ĐỊNH]** là quyết định của nhóm và cần được người hướng dẫn xác nhận. Nếu thay đổi, sửa tài liệu trước rồi mới sửa code.

## Bộ tài liệu yêu cầu

| File                                           | Nội dung                                                                                                                                                   | Đọc khi                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `overview.md` (file này)                       | Mục tiêu, phạm vi, quy trình, trạng thái, phân loại và SLA, sự kiện realtime, quy tắc nghiệp vụ (BR), yêu cầu phi chức năng (NFR), kịch bản demo, giả định | Cần hiểu bài toán, luồng nghiệp vụ, quy tắc              |
| [`roles-permissions.md`](roles-permissions.md) | Các vai trò, ma trận quyền, quyền chuyển trạng thái, phạm vi dữ liệu                                                                                       | Làm xác thực, phân quyền, guard, kiểm tra ai được làm gì |
| [`user-stories.md`](user-stories.md)           | User story theo vai trò và danh sách yêu cầu chức năng chi tiết (FR)                                                                                       | Hiện thực một chức năng cụ thể                           |

Mã định danh dùng trong cả ba file: `FR-*` (yêu cầu chức năng), `BR-*` (quy tắc nghiệp vụ), `NFR-*` (phi chức năng), `US-*` (user story), `A-*` (giả định).

---

## 1. Tổng quan

### 1.1 Mục tiêu

Xây dựng một nền tảng tập trung giúp trung tâm chỉ huy an ninh:

1. Tiếp nhận cảnh báo từ nhiều nguồn.
2. Xác minh, phân loại và đặt mức ưu tiên cho sự cố.
3. Xác định vị trí sự cố trên bản đồ.
4. Điều phối lực lượng xử lý phù hợp.
5. Theo dõi tiến độ xử lý theo thời gian thực.
6. Lưu vết và thống kê để hậu kiểm.

### 1.2 Sản phẩm dự kiến (theo đề bài)

- Web application
- Cơ sở dữ liệu sự kiện
- Dashboard điều hành
- Module điều phối

### 1.3 Bối cảnh triển khai **[GIẢ ĐỊNH]**

Hệ thống phục vụ **trung tâm điều hành an ninh của một khu công nghiệp / khu đô thị / khuôn viên lớn**, nơi có nhiều lực lượng chuyên trách: bảo vệ, phòng cháy chữa cháy (PCCC), y tế, kỹ thuật. Bối cảnh này chỉ ảnh hưởng đến tên loại sự cố và lực lượng; kiến trúc hệ thống không phụ thuộc vào nó.

### 1.4 Thuật ngữ

| Thuật ngữ                 | Ý nghĩa                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| Cảnh báo (Alert)          | Tín hiệu thô, chưa xác minh, từ một nguồn bất kỳ                          |
| Sự cố (Incident)          | Cảnh báo đã được Operator xác minh và đưa vào xử lý                       |
| Lực lượng (Unit)          | Một đơn vị/nhóm có thể được điều đi xử lý (ví dụ: Tổ bảo vệ A, Xe PCCC 1) |
| Lệnh điều phối (Dispatch) | Việc giao một lực lượng cho một sự cố                                     |
| SLA                       | Thời hạn tối đa cho một bước xử lý                                        |
| Operator                  | Điều phối viên trực trung tâm chỉ huy                                     |
| Responder                 | Người thuộc lực lượng xử lý ngoài hiện trường                             |

---

## 2. Phạm vi

### 2.1 Trong phạm vi (MVP)

- Đăng nhập, phân quyền theo vai trò.
- Tiếp nhận cảnh báo từ: người báo cáo, Operator nhập tay, nguồn tự động (mô phỏng).
- Xác minh, phân loại, đặt mức ưu tiên, chuyển cảnh báo thành sự cố.
- Quản lý lực lượng và trạng thái sẵn sàng.
- Điều phối lực lượng, có gợi ý lực lượng phù hợp.
- Lực lượng cập nhật tiến độ xử lý.
- Bản đồ sự cố và lực lượng.
- Cập nhật thời gian thực.
- Nhật ký thao tác, thông báo, dashboard thống kê.

### 2.2 Ngoài phạm vi (không làm)

- Nhận diện hình ảnh, khuôn mặt, AI dự đoán sự cố.
- Theo dõi GPS liên tục theo thời gian thực của lực lượng.
- Tích hợp thiết bị thật (camera, báo cháy, cảm biến) — chỉ mô phỏng bằng API.
- Định tuyến đường đi, tính thời gian di chuyển thực tế.
- Ứng dụng di động native.
- Gọi điện, nhắn tin SMS thật.

---

## 3. Quy trình nghiệp vụ tổng thể

1. **Phát sinh cảnh báo** — từ người báo cáo, từ cuộc gọi do Operator nhập tay, hoặc từ nguồn tự động.
2. **Tiếp nhận** — cảnh báo vào hàng đợi "cảnh báo mới", hệ thống ghi thời điểm nhận và bắt đầu tính SLA.
3. **Xác minh và phân loại** — Operator kiểm tra thông tin, rồi chọn một trong ba hướng:
   - Xác nhận: tạo sự cố với loại, mức ưu tiên, vị trí.
   - Loại bỏ: báo nhầm hoặc không hợp lệ (bắt buộc ghi lý do).
   - Gộp: trùng với sự cố đang xử lý.
4. **Điều phối** — hệ thống gợi ý lực lượng phù hợp; Operator chọn và giao lệnh.
5. **Xử lý hiện trường** — lực lượng nhận lệnh → di chuyển → đến nơi → xử lý, cập nhật trạng thái, ghi chú, ảnh.
6. **Theo dõi** — Operator và Commander theo dõi mọi thay đổi trên bản đồ và danh sách theo thời gian thực.
7. **Kết thúc** — lực lượng báo hoàn thành → Operator xác nhận đã giải quyết → Commander (hoặc Operator, tùy cấu hình) đóng sự cố, ghi kết quả.
8. **Hậu kiểm** — xem nhật ký, thống kê, báo cáo.

---

## 4. Vòng đời và trạng thái

### 4.1 Cảnh báo (Alert)

| Trạng thái  | Ý nghĩa                                   |
| ----------- | ----------------------------------------- |
| `NEW`       | Mới nhận, chưa xử lý                      |
| `CONFIRMED` | Đã xác nhận, đã tạo sự cố tương ứng       |
| `DISMISSED` | Loại bỏ (báo nhầm/không hợp lệ), có lý do |
| `MERGED`    | Gộp vào một sự cố có sẵn                  |

### 4.2 Sự cố (Incident)

```
NEW → CONFIRMED → DISPATCHED → IN_PROGRESS → RESOLVED → CLOSED
                       │
                       └──→ CANCELLED (từ bất kỳ trạng thái trước RESOLVED)
```

| Trạng thái    | Ý nghĩa                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `NEW`         | Sự cố vừa tạo (nhập trực tiếp hoặc từ cảnh báo), chưa được xác minh đầy đủ |
| `CONFIRMED`   | Đã xác minh, chờ điều phối                                                 |
| `DISPATCHED`  | Đã giao lệnh cho ít nhất một lực lượng                                     |
| `IN_PROGRESS` | Ít nhất một lực lượng đã đến hiện trường                                   |
| `RESOLVED`    | Mọi lệnh điều phối đã hoàn thành, chờ xác nhận đóng                        |
| `CLOSED`      | Đã đóng, có kết quả xử lý                                                  |
| `CANCELLED`   | Hủy (nhập sai, không còn cần xử lý), có lý do                              |

### 4.3 Lệnh điều phối (Dispatch)

```
ASSIGNED → ACCEPTED → EN_ROUTE → ON_SCENE → DONE
    │
    ├──→ DECLINED   (lực lượng từ chối, có lý do)
    └──→ CANCELLED  (Operator thu hồi lệnh)
```

### 4.4 Lực lượng (Unit)

`AVAILABLE` (sẵn sàng) · `BUSY` (đang xử lý) · `OFFLINE` (không trực)

---

## 5. Phân loại và mức ưu tiên

### 5.1 Loại sự cố **[GIẢ ĐỊNH]** (ADMIN có thể quản lý danh mục)

| Mã               | Nhóm                   | Ví dụ                                   |
| ---------------- | ---------------------- | --------------------------------------- |
| `SECURITY`       | An ninh trật tự        | Xâm nhập trái phép, trộm cắp, ẩu đả     |
| `FIRE`           | Cháy nổ (PCCC)         | Cháy, báo cháy tự động, nghi cháy       |
| `MEDICAL`        | Y tế khẩn cấp          | Tai nạn, người ngất, bị thương          |
| `INFRASTRUCTURE` | Sự cố kỹ thuật/hạ tầng | Mất điện, rò rỉ nước/khí, hỏng thiết bị |
| `OTHER`          | Khác                   | Phản ánh, nhắc nhở                      |

### 5.2 Mức ưu tiên và SLA **[GIẢ ĐỊNH]** (giá trị cấu hình được)

| Mức        | Mã         | Ví dụ                                | Xác nhận trong | Điều phối trong |
| ---------- | ---------- | ------------------------------------ | -------------- | --------------- |
| Khẩn cấp   | `CRITICAL` | Cháy lan, người bị thương nặng       | 2 phút         | 5 phút          |
| Cao        | `HIGH`     | Xâm nhập trái phép, báo cháy tự động | 5 phút         | 10 phút         |
| Trung bình | `MEDIUM`   | Mất cắp nhỏ, hư hỏng thiết bị        | 15 phút        | 30 phút         |
| Thấp       | `LOW`      | Phản ánh, nhắc nhở                   | 60 phút        | 120 phút        |

- "Xác nhận trong": tính từ lúc nhận cảnh báo đến lúc cảnh báo được xác nhận hoặc loại bỏ.
- "Điều phối trong": tính từ lúc xác nhận đến lúc có lệnh điều phối đầu tiên.

### 5.3 Loại lực lượng **[GIẢ ĐỊNH]**

`SECURITY` (bảo vệ) · `FIRE_FIGHTING` (PCCC) · `MEDICAL` (y tế) · `TECHNICAL` (kỹ thuật)

Quan hệ gợi ý loại sự cố → loại lực lượng phù hợp:

| Loại sự cố       | Lực lượng phù hợp                               |
| ---------------- | ----------------------------------------------- |
| `SECURITY`       | `SECURITY`                                      |
| `FIRE`           | `FIRE_FIGHTING`, `SECURITY`, `MEDICAL` (hỗ trợ) |
| `MEDICAL`        | `MEDICAL`, `SECURITY`                           |
| `INFRASTRUCTURE` | `TECHNICAL`, `SECURITY`                         |
| `OTHER`          | Operator tự chọn                                |

---

## 6. Sự kiện thời gian thực

| Sự kiện                | Khi nào                                           | Người nhận                                                                    | Hiển thị                          |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| `alert.created`        | Có cảnh báo mới                                   | OPERATOR, COMMANDER                                                           | Hàng đợi tăng, thông báo nổi      |
| `alert.resolved`       | Cảnh báo được xác nhận/loại bỏ/gộp                | OPERATOR, COMMANDER                                                           | Hàng đợi giảm                     |
| `incident.created`     | Sự cố được tạo                                    | OPERATOR, COMMANDER                                                           | Danh sách, bản đồ                 |
| `incident.updated`     | Đổi thông tin hoặc trạng thái                     | OPERATOR, COMMANDER, REPORTER (báo cáo của mình), RESPONDER (sự cố được giao) | Danh sách, bản đồ, chi tiết       |
| `dispatch.assigned`    | Có lệnh điều phối mới                             | RESPONDER của lực lượng được giao                                             | Thông báo nổi, mục "việc của tôi" |
| `dispatch.updated`     | Lực lượng cập nhật tiến độ / từ chối / bị thu hồi | OPERATOR, COMMANDER, RESPONDER liên quan                                      | Chi tiết sự cố, bản đồ            |
| `unit.updated`         | Lực lượng đổi trạng thái hoặc vị trí              | OPERATOR, COMMANDER                                                           | Danh sách lực lượng, bản đồ       |
| `sla.breached`         | Quá thời hạn SLA                                  | OPERATOR, COMMANDER                                                           | Cảnh báo nổi bật                  |
| `notification.created` | Có thông báo cá nhân                              | Người nhận                                                                    | Chuông thông báo                  |

**Nguyên tắc:** dữ liệu gốc nằm ở cơ sở dữ liệu và API REST. Sự kiện thời gian thực chỉ báo "có thay đổi" kèm dữ liệu tối thiểu để giao diện cập nhật hoặc tải lại. Nhờ đó, mất kết nối thời gian thực không làm mất dữ liệu.

---

## 7. Quy tắc nghiệp vụ

| Mã    | Quy tắc                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| BR-01 | Mỗi sự cố có mã hiển thị duy nhất, dễ đọc (ví dụ `INC-20261124-0001`)                                                                |
| BR-02 | Loại bỏ cảnh báo, hủy sự cố, từ chối lệnh, thu hồi lệnh, mở lại sự cố đều bắt buộc có lý do                                          |
| BR-03 | Không xóa cứng cảnh báo, sự cố, lệnh điều phối, nhật ký; chỉ đổi trạng thái hoặc xóa mềm                                             |
| BR-04 | Sự cố chỉ chuyển trạng thái theo bảng ở [`roles-permissions.md`](roles-permissions.md) mục 3; mọi chuyển trạng thái phải ghi nhật ký |
| BR-05 | Sự cố chuyển `IN_PROGRESS` khi có ít nhất một lực lượng `ON_SCENE`; chỉ chuyển `RESOLVED` khi mọi lệnh đang hoạt động đã `DONE`      |
| BR-06 | Lực lượng `BUSY` hoặc `OFFLINE` không xuất hiện trong gợi ý điều phối                                                                |
| BR-07 | Lực lượng chuyển `BUSY` khi nhận lệnh, trở về `AVAILABLE` khi không còn lệnh hoạt động nào                                           |
| BR-08 | Khi lực lượng từ chối lệnh, sự cố không tự động giao lại; hệ thống báo OPERATOR quyết định                                           |
| BR-09 | Thông tin liên hệ nhạy cảm của người báo cáo chỉ OPERATOR và COMMANDER xem được                                                      |
| BR-10 | Ảnh đính kèm chỉ chấp nhận định dạng ảnh phổ biến, mỗi file tối đa 5 MB, tối đa 5 ảnh mỗi báo cáo **[GIẢ ĐỊNH]**                     |
| BR-11 | Khoảng cách gợi ý lực lượng tính theo đường chim bay giữa tọa độ sự cố và vị trí lực lượng                                           |
| BR-12 | Mức ưu tiên có thể được nâng/hạ sau khi tạo sự cố; thay đổi phải ghi nhật ký kèm lý do                                               |
| BR-13 | Báo cáo của REPORTER mặc định ở mức ưu tiên chưa xác định cho tới khi OPERATOR phân loại                                             |
| BR-14 | Cảnh báo từ nguồn tự động có thể mang sẵn loại và mức ưu tiên đề xuất, nhưng OPERATOR vẫn xác nhận                                   |

---

## 8. Yêu cầu phi chức năng

| Mã     | Nhóm       | Yêu cầu                                                                                             |
| ------ | ---------- | --------------------------------------------------------------------------------------------------- |
| NFR-01 | Bảo mật    | Mật khẩu băm, token có hạn, kiểm tra quyền ở backend, không lộ thông tin nhạy cảm qua API           |
| NFR-02 | Bảo mật    | Kiểm tra loại và dung lượng file upload; chống nhập liệu độc hại (validate đầu vào)                 |
| NFR-03 | Bảo mật    | Giới hạn tốc độ cho các điểm vào công khai (đăng ký, gửi báo cáo, API nguồn tự động)                |
| NFR-04 | Truy vết   | Nhật ký thao tác không thể sửa/xóa qua giao diện                                                    |
| NFR-05 | Hiệu năng  | Sự kiện thời gian thực hiển thị trên giao diện trong vài giây; danh sách phân trang                 |
| NFR-06 | Độ tin cậy | Mất kết nối thời gian thực không làm mất dữ liệu; kết nối lại tự đồng bộ                            |
| NFR-07 | Triển khai | Chạy toàn bộ hệ thống bằng một lệnh Docker Compose; có dữ liệu mẫu                                  |
| NFR-08 | Dễ dùng    | Giao diện tiếng Việt; dashboard dùng được trên màn hình lớn; form báo cáo dùng được trên điện thoại |
| NFR-09 | Bảo trì    | Mã nguồn có cấu trúc module, tài liệu API (Swagger), kiểm thử cho luồng nghiệp vụ chính             |
| NFR-10 | Dữ liệu    | Thời gian lưu theo UTC, hiển thị theo múi giờ Việt Nam                                              |

---

## 9. Tiêu chí chấp nhận cho kịch bản demo (luồng chính)

Hệ thống đạt yêu cầu MVP khi trình diễn được liên tục các bước sau mà không cần tải lại trang:

1. REPORTER gửi báo cáo kèm vị trí và ảnh → OPERATOR thấy cảnh báo mới xuất hiện ngay.
2. OPERATOR xác nhận thành sự cố, đặt loại và mức ưu tiên → sự cố hiện trên bản đồ và dashboard.
3. Hệ thống gợi ý lực lượng phù hợp; OPERATOR giao lệnh → RESPONDER nhận thông báo ngay.
4. RESPONDER chấp nhận, cập nhật `EN_ROUTE` → `ON_SCENE` → `DONE` → OPERATOR và COMMANDER thấy từng thay đổi tức thì.
5. Sự cố tự chuyển `IN_PROGRESS` rồi `RESOLVED`; OPERATOR đóng sự cố.
6. Timeline của sự cố hiển thị đầy đủ mọi bước, người thực hiện và thời điểm.
7. Dashboard cập nhật số liệu; REPORTER thấy trạng thái báo cáo của mình.
8. Công cụ giả lập sinh hàng loạt cảnh báo → hàng đợi và bản đồ cập nhật liên tục.

---

## 10. Giả định và câu hỏi mở

### 10.1 Giả định đang sử dụng (cần xác nhận)

| Mã   | Giả định                                                                            | Xác nhận bởi    | Trạng thái |
| ---- | ----------------------------------------------------------------------------------- | --------------- | ---------- |
| A-01 | Bối cảnh: trung tâm điều hành an ninh khu công nghiệp / khu đô thị / khuôn viên lớn | Người hướng dẫn | Chưa       |
| A-02 | Chấp nhận dữ liệu và nguồn cảnh báo giả lập cho bản demo                            | Người hướng dẫn | Chưa       |
| A-03 | 5 vai trò như [`roles-permissions.md`](roles-permissions.md) mục 1                  | Nhóm            | Chưa       |
| A-04 | Danh mục loại sự cố, lực lượng ở mục 5                                              | Nhóm            | Chưa       |
| A-05 | Bảng SLA ở mục 5.2                                                                  | Nhóm            | Chưa       |
| A-06 | Quy tắc phát hiện trùng: 100 m và 10 phút                                           | Nhóm            | Chưa       |
| A-07 | Giới hạn ảnh: 5 MB, tối đa 5 ảnh                                                    | Nhóm            | Chưa       |
| A-08 | Vị trí lực lượng cập nhật thủ công, không GPS liên tục                              | Nhóm            | Chưa       |
| A-09 | Chỉ COMMANDER được mở lại sự cố đã giải quyết/đóng                                  | Nhóm            | Chưa       |

### 10.2 Câu hỏi cần hỏi người hướng dẫn

1. Hệ thống nên hướng tới bối cảnh triển khai nào, hay nhóm tự chọn?
2. Có chấp nhận dữ liệu và nguồn cảnh báo giả lập cho bản demo không?
3. Tiêu chí đánh giá cuối kỳ là gì (demo, tài liệu, chất lượng code, kiến trúc)?
4. Thời hạn chính xác và thời điểm demo; có mốc kiểm tra giữa kỳ không?
5. Có ràng buộc về công nghệ hoặc triển khai (Docker, máy chủ của công ty) không?
6. Công ty có yêu cầu riêng về bảo mật hoặc lưu nhật ký không?

---

## 11. Lịch sử thay đổi

| Phiên bản | Ngày       | Nội dung          | Người thực hiện |
| --------- | ---------- | ----------------- | --------------- |
| 0.1       | 2026-11-24 | Bản nháp đầu tiên | Nhóm G1.1       |
