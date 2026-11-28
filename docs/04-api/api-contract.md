# Hợp đồng API (API Contract) — SafeOps REST API

**Đọc file này khi:** phát triển Controller/DTO ở backend, viết API client/hooks ở frontend, hoặc kiểm thử API.

**Nguồn yêu cầu:** [`overview.md`](../00-requirements/overview.md), [`roles-permissions.md`](../00-requirements/roles-permissions.md), [`user-stories.md`](../00-requirements/user-stories.md), [`incident-state-machine.md`](../02-architecture/incident-state-machine.md), [`erd.md`](../03-database/erd.md).

---

## 1. Nguyên tắc thiết kế chung

1. **Giao thức & Tiền tố:**
   - Mọi endpoint có tiền tố: `/api/v1`
   - Chuẩn dữ liệu trao đổi: `application/json` (trừ upload file dùng `multipart/form-data`).
   - Múi giờ: Tất cả timestamp gửi và nhận đều theo định dạng **ISO 8601 UTC** (ví dụ: `2026-11-24T08:00:00.000Z`).
2. **Xác thực & Ủy quyền:**
   - Người dùng đăng nhập gửi Header: `Authorization: Bearer <access_token>`.
   - Nguồn tự động gửi Header: `x-api-key: <ALERT_API_KEY>`.
   - Mọi phân quyền được kiểm tra chặt chẽ ở backend (FR-AUTH-05).
3. **Quy chuẩn mã HTTP:**
   - `200 OK`: Thành công với phương thức GET, PUT, PATCH.
   - `201 Created`: Tạo mới thành công (POST).
   - `204 No Content`: Xóa thành công hoặc không có dữ liệu trả về.
   - `400 Bad Request`: Sai định dạng đầu vào (DTO validation lỗi).
   - `401 Unauthorized`: Chưa xác thực hoặc token không hợp lệ / hết hạn.
   - `403 Forbidden`: Không có quyền truy cập (`FORBIDDEN_ROLE` hoặc `FORBIDDEN_SCOPE`).
   - `404 Not Found`: Không tìm thấy tài nguyên.
   - `409 Conflict`: Vi phạm nghiệp vụ chuyển trạng thái hoặc tranh chấp phiên bản (`INVALID_TRANSITION`, `CONCURRENT_MODIFICATION`, ...).
   - `422 Unprocessable Entity`: Dữ liệu vi phạm ràng buộc nghiệp vụ (thiếu lý do bắt buộc, chưa nhập giải pháp khi đóng...).
   - `429 Too Many Requests`: Vượt quá giới hạn tần suất gọi API (Rate limit).
   - `500 Internal Server Error`: Lỗi máy chủ không mong muốn.

---

## 2. Định dạng phản hồi chuẩn

### 2.1 Phản hồi đơn lẻ thành công (Single Response)

```json
{
  "statusCode": 200,
  "data": { ... }
}
```

### 2.2 Phản hồi danh sách có phân trang (Paginated Response)

Áp dụng cho mọi danh sách hỗ trợ query `page` (mặc định 1) và `limit` (mặc định 20, tối đa 100).

```json
{
  "statusCode": 200,
  "data": [ ... ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

### 2.3 Phản hồi lỗi chuẩn (Error Response)

```json
{
  "statusCode": 409,
  "code": "INVALID_TRANSITION",
  "message": "Không thể chuyển trạng thái sự cố từ RESOLVED sang DISPATCHED.",
  "details": {
    "currentStatus": "RESOLVED",
    "targetStatus": "DISPATCHED"
  },
  "timestamp": "2026-11-24T08:00:00.000Z",
  "path": "/api/v1/incidents/a1b2c3d4/status"
}
```

---

## 3. Danh mục Endpoint

### 3.1 Xác thực (`/api/v1/auth`)

| Phương thức | Đường dẫn               | Vai trò       | Mô tả                                       |
| ----------- | ----------------------- | ------------- | ------------------------------------------- |
| `POST`      | `/api/v1/auth/register` | Public        | Đăng ký tài khoản người báo cáo (REPORTER)  |
| `POST`      | `/api/v1/auth/login`    | Public        | Đăng nhập tài khoản & nhận JWT token        |
| `POST`      | `/api/v1/auth/refresh`  | Public        | Làm mới access token bằng refresh token     |
| `POST`      | `/api/v1/auth/logout`   | Authenticated | Đăng xuất và thu hồi refresh token hiện tại |
| `GET`       | `/api/v1/auth/me`       | Authenticated | Lấy thông tin tài khoản đang đăng nhập      |

---

### 3.2 Quản trị người dùng (`/api/v1/users`)

| Phương thức | Đường dẫn                  | Vai trò | Mô tả                                            |
| ----------- | -------------------------- | ------- | ------------------------------------------------ |
| `GET`       | `/api/v1/users`            | ADMIN   | Lấy danh sách người dùng (lọc theo role, status) |
| `POST`      | `/api/v1/users`            | ADMIN   | Tạo tài khoản người dùng nội bộ                  |
| `GET`       | `/api/v1/users/:id`        | ADMIN   | Xem chi tiết thông tin người dùng                |
| `PATCH`     | `/api/v1/users/:id`        | ADMIN   | Cập nhật thông tin (tên, sđt, đơn vị)            |
| `PATCH`     | `/api/v1/users/:id/role`   | ADMIN   | Phân lại vai trò người dùng                      |
| `PATCH`     | `/api/v1/users/:id/status` | ADMIN   | Khóa / Kích hoạt tài khoản (`is_active`)         |

---

### 3.3 Danh mục loại sự cố (`/api/v1/incident-types`)

| Phương thức | Đường dẫn                    | Vai trò       | Mô tả                                      |
| ----------- | ---------------------------- | ------------- | ------------------------------------------ |
| `GET`       | `/api/v1/incident-types`     | Authenticated | Lấy danh sách loại sự cố đang hoạt động    |
| `GET`       | `/api/v1/incident-types/:id` | Authenticated | Chi tiết loại sự cố                        |
| `POST`      | `/api/v1/incident-types`     | ADMIN         | Tạo mới loại sự cố                         |
| `PATCH`     | `/api/v1/incident-types/:id` | ADMIN         | Sửa loại sự cố (tên, nhóm lực lượng gợi ý) |
| `DELETE`    | `/api/v1/incident-types/:id` | ADMIN         | Vô hiệu hóa (is_active = false)            |

---

### 3.4 Tiếp nhận cảnh báo (`/api/v1/alerts`)

| Phương thức | Đường dẫn                            | Vai trò                                          | Mô tả                                         |
| ----------- | ------------------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `POST`      | `/api/v1/alerts`                     | REPORTER, OPERATOR, COMMANDER                    | Gửi báo cáo / nhập cảnh báo thủ công          |
| `POST`      | `/api/v1/alerts/automated`           | API Key (`x-api-key`)                            | Nguồn tự động (cảm biến, camera) gửi cảnh báo |
| `GET`       | `/api/v1/alerts`                     | OPERATOR, COMMANDER                              | Lấy hàng đợi cảnh báo (chờ xác nhận)          |
| `GET`       | `/api/v1/alerts/my-reports`          | REPORTER                                         | Lấy danh sách báo cáo do tài khoản tự gửi     |
| `GET`       | `/api/v1/alerts/:id`                 | OPERATOR, COMMANDER, REPORTER (chỉ xem của mình) | Chi tiết cảnh báo                             |
| `POST`      | `/api/v1/alerts/:id/confirm`         | OPERATOR, COMMANDER                              | Xác nhận cảnh báo -> Tạo sự cố (Incident)     |
| `POST`      | `/api/v1/alerts/:id/dismiss`         | OPERATOR, COMMANDER                              | Loại bỏ cảnh báo (bắt buộc kèm lý do)         |
| `POST`      | `/api/v1/alerts/:id/merge`           | OPERATOR, COMMANDER                              | Gộp cảnh báo vào sự cố đang hoạt động         |
| `GET`       | `/api/v1/alerts/:id/check-duplicate` | OPERATOR, COMMANDER                              | Kiểm tra các sự cố tương đồng lân cận         |

---

### 3.5 Quản lý sự cố (`/api/v1/incidents`)

| Phương thức | Đường dẫn                        | Vai trò                                                                            | Mô tả                                            |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| `GET`       | `/api/v1/incidents`              | OPERATOR, COMMANDER, ADMIN; RESPONDER (giao cho mình); REPORTER (báo cáo của mình) | Danh sách sự cố (lọc, phân trang)                |
| `POST`      | `/api/v1/incidents`              | OPERATOR, COMMANDER                                                                | Tạo sự cố trực tiếp (không qua cảnh báo)         |
| `GET`       | `/api/v1/incidents/:id`          | Theo quyền xem sự cố                                                               | Chi tiết sự cố kèm dispatches, allowedActions    |
| `PATCH`     | `/api/v1/incidents/:id`          | OPERATOR, COMMANDER                                                                | Cập nhật thông tin cơ bản (tiêu đề, loại, mô tả) |
| `PATCH`     | `/api/v1/incidents/:id/priority` | OPERATOR, COMMANDER                                                                | Thay đổi mức ưu tiên (bắt buộc lý do)            |
| `POST`      | `/api/v1/incidents/:id/confirm`  | OPERATOR, COMMANDER                                                                | Xác nhận sự cố (nếu tạo trực tiếp ở `NEW`)       |
| `POST`      | `/api/v1/incidents/:id/close`    | OPERATOR, COMMANDER                                                                | Đóng sự cố (bắt buộc ghi nhận kết quả xử lý)     |
| `POST`      | `/api/v1/incidents/:id/cancel`   | OPERATOR, COMMANDER                                                                | Hủy sự cố (bắt buộc kèm lý do)                   |
| `POST`      | `/api/v1/incidents/:id/reopen`   | COMMANDER                                                                          | Mở lại sự cố đã hoàn thành/đóng                  |
| `GET`       | `/api/v1/incidents/:id/logs`     | Theo quyền xem sự cố                                                               | Lấy toàn bộ timeline/nhật ký sự cố               |

---

### 3.6 Quản lý lực lượng (`/api/v1/units`)

| Phương thức | Đường dẫn                    | Vai trò                                      | Mô tả                                       |
| ----------- | ---------------------------- | -------------------------------------------- | ------------------------------------------- |
| `GET`       | `/api/v1/units`              | OPERATOR, COMMANDER, ADMIN                   | Danh sách lực lượng & trạng thái            |
| `GET`       | `/api/v1/units/suggestions`  | OPERATOR, COMMANDER                          | Gợi ý lực lượng sẵn sàng theo vị trí sự cố  |
| `GET`       | `/api/v1/units/:id`          | OPERATOR, COMMANDER, ADMIN                   | Chi tiết lực lượng                          |
| `POST`      | `/api/v1/units`              | ADMIN, OPERATOR                              | Thêm mới lực lượng                          |
| `PATCH`     | `/api/v1/units/:id`          | ADMIN, OPERATOR                              | Cập nhật thông tin lực lượng                |
| `PATCH`     | `/api/v1/units/:id/status`   | RESPONDER (đơn vị mình), OPERATOR, COMMANDER | Cập nhật trạng thái `AVAILABLE` / `OFFLINE` |
| `PATCH`     | `/api/v1/units/:id/location` | RESPONDER (đơn vị mình), OPERATOR            | Cập nhật vị trí thủ công                    |

---

### 3.7 Điều phối lực lượng (`/api/v1/dispatches`)

| Phương thức | Đường dẫn                         | Vai trò                                           | Mô tả                                   |
| ----------- | --------------------------------- | ------------------------------------------------- | --------------------------------------- |
| `POST`      | `/api/v1/dispatches`              | OPERATOR, COMMANDER                               | Giao lệnh điều phối cho một lực lượng   |
| `GET`       | `/api/v1/dispatches/my-tasks`     | RESPONDER                                         | Lấy danh sách lệnh giao cho đơn vị mình |
| `GET`       | `/api/v1/dispatches/:id`          | OPERATOR, COMMANDER, RESPONDER (đơn vị nhận lệnh) | Chi tiết lệnh điều phối                 |
| `POST`      | `/api/v1/dispatches/:id/accept`   | RESPONDER (đơn vị nhận lệnh)                      | Chấp nhận lệnh điều phối                |
| `POST`      | `/api/v1/dispatches/:id/decline`  | RESPONDER (đơn vị nhận lệnh)                      | Từ chối lệnh (bắt buộc kèm lý do)       |
| `POST`      | `/api/v1/dispatches/:id/en-route` | RESPONDER (đơn vị nhận lệnh)                      | Báo đang di chuyển đến hiện trường      |
| `POST`      | `/api/v1/dispatches/:id/on-scene` | RESPONDER (đơn vị nhận lệnh)                      | Báo đã tới hiện trường                  |
| `POST`      | `/api/v1/dispatches/:id/done`     | RESPONDER (đơn vị nhận lệnh)                      | Báo hoàn thành xử lý                    |
| `POST`      | `/api/v1/dispatches/:id/cancel`   | OPERATOR, COMMANDER                               | Thu hồi / hủy lệnh điều phối            |

---

### 3.8 Đính kèm & Tải file (`/api/v1/uploads`)

| Phương thức | Đường dẫn         | Vai trò       | Mô tả                                    |
| ----------- | ----------------- | ------------- | ---------------------------------------- |
| `POST`      | `/api/v1/uploads` | Authenticated | Tải lên 1 ảnh hiện trường (giới hạn 5MB) |

---

### 3.9 Thông báo (`/api/v1/notifications`)

| Phương thức | Đường dẫn                             | Vai trò       | Mô tả                               |
| ----------- | ------------------------------------- | ------------- | ----------------------------------- |
| `GET`       | `/api/v1/notifications`               | Authenticated | Danh sách thông báo của cá nhân     |
| `GET`       | `/api/v1/notifications/unread-count`  | Authenticated | Đếm số thông báo chưa đọc           |
| `PATCH`     | `/api/v1/notifications/:id/read`      | Authenticated | Đánh dấu một thông báo là đã đọc    |
| `POST`      | `/api/v1/notifications/mark-all-read` | Authenticated | Đánh dấu tất cả thông báo là đã đọc |

---

### 3.10 Thống kê & Dashboard (`/api/v1/statistics`)

| Phương thức | Đường dẫn                              | Vai trò                    | Mô tả                                      |
| ----------- | -------------------------------------- | -------------------------- | ------------------------------------------ |
| `GET`       | `/api/v1/statistics/overview`          | OPERATOR, COMMANDER, ADMIN | Số liệu tổng quan (thẻ card dashboard)     |
| `GET`       | `/api/v1/statistics/incidents-by-type` | OPERATOR, COMMANDER, ADMIN | Biểu đồ sự cố theo phân loại               |
| `GET`       | `/api/v1/statistics/response-times`    | COMMANDER, ADMIN           | Chỉ số thời gian phản hồi trung bình & SLA |
| `GET`       | `/api/v1/statistics/sla-breached`      | OPERATOR, COMMANDER, ADMIN | Danh sách các sự cố / cảnh báo vi phạm SLA |

---

### 3.11 Health Check (`/api/v1/health`)

| Phương thức | Đường dẫn        | Vai trò | Mô tả                               |
| ----------- | ---------------- | ------- | ----------------------------------- |
| `GET`       | `/api/v1/health` | Public  | Kiểm tra kết nối dịch vụ & Database |

---

## 4. Chi tiết Schema Request / Response

### 4.1 Module Auth

#### Tích hợp frontend M1-13

Backend vẫn dùng hợp đồng JSON bên dưới. Trình duyệt gọi các route cùng origin của Next.js: `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`. Next.js chuyển tiếp đến `/api/v1/auth/*` tại `API_URL` (biến môi trường chỉ phía server).

Lớp trung gian giữ `refreshToken` trong cookie `safeops_refresh`, HttpOnly, SameSite=Lax, Secure khi production, Path=/api/auth, thời hạn tối đa 7 ngày. Refresh token không xuất hiện trong response gửi về trình duyệt. Khi refresh thành công, cookie được thay bằng token mới. Logout xóa cookie kể cả khi backend không phản hồi thành công; frontend báo lỗi nếu chưa xác nhận được thu hồi token phía backend. POST yêu cầu Origin trùng origin ứng dụng để chống yêu cầu từ website khác. Backend cần thu hồi token khi logout và triển khai rotation theo hợp đồng.

Access token chỉ giữ trong bộ nhớ tab. Khi F5, AuthProvider gọi refresh rồi `/me`; không dùng dữ liệu user lưu trong browser storage để coi là đã đăng nhập. Request nghiệp vụ gọi `NEXT_PUBLIC_API_URL` (mặc định `/api/v1`) với Bearer token, retry tối đa một lần sau 401; các request đồng thời dùng chung một lần refresh. 403 không kích hoạt refresh. Lỗi mạng không bị coi là phiên bị thu hồi. Các route auth không dùng interceptor refresh đệ quy.

Backend local hiện chưa có Auth: M1-13 được kiểm chứng bằng mock theo contract; nghiệm thu tích hợp thật cần backend Auth hoàn thành. Route guard, AppShell theo vai trò và form đăng ký tích hợp thuộc các task tiếp theo.

Mỗi request cần xác thực gắn với revision của phiên khi gửi. Client kiểm tra lại revision sau response đầu tiên, sau refresh, sau response retry và sau khi đọc JSON. Nếu phiên đã thay đổi do logout hoặc đăng nhập tài khoản khác, request kết thúc bằng `SESSION_CHANGED`, không trả dữ liệu, không xóa phiên mới và không hiển thị Toast. Chỉ response retry 401 còn thuộc phiên hiện tại mới được xóa phiên và báo lỗi xác thực.

#### `POST /api/v1/auth/login`

- **Request Body:**

```json
{
  "email": "operator1@safeops.local",
  "password": "Operator@123"
}
```

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "d7a8e2...",
    "expiresIn": 900,
    "user": {
      "id": "e6a0fd62-b7e2-45e1-89e5-9d3fa6b510a1",
      "email": "operator1@safeops.local",
      "fullName": "Nguyễn Văn Điều Phối",
      "role": "OPERATOR",
      "unitId": null
    }
  }
}
```

#### `POST /api/v1/auth/refresh`

- **Request Body:**

```json
{
  "refreshToken": "d7a8e2..."
}
```

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "f8b9e1...",
    "expiresIn": 900
  }
}
```

---

### 4.2 Module Alerts

#### `POST /api/v1/alerts`

- **Request Body:**

```json
{
  "description": "Phát hiện mùi khét và khói tại tầng hầm khu B",
  "incidentTypeId": "b1a134a4-5690-4822-a548-8dfc437fef12",
  "latitude": 10.7635,
  "longitude": 106.662,
  "locationDescription": "Tầng hầm B, gần trụ B08",
  "priority": "HIGH",
  "attachmentIds": ["c8a14b09-fae2-484d-b941-8e01f63dc4e9"]
}
```

_(Ghi chú: Đối với REPORTER thì `incidentTypeId` và `priority` là tùy chọn)_.

- **Response `201 Created`:**

```json
{
  "statusCode": 201,
  "data": {
    "id": "7fae98f0-1c09-41e9-92c2-b5e09f7a77e3",
    "source": "REPORTER",
    "description": "Phát hiện mùi khét và khói tại tầng hầm khu B",
    "status": "NEW",
    "latitude": 10.7635,
    "longitude": 106.662,
    "receivedAt": "2026-11-24T08:15:00.000Z"
  }
}
```

#### `POST /api/v1/alerts/automated`

- **Headers:** `x-api-key: your-secret-api-key`
- **Request Body:**

```json
{
  "description": "Cảm biến khói FS-01 kích hoạt báo động mức 2",
  "incidentTypeCode": "FIRE",
  "priority": "HIGH",
  "latitude": 10.764,
  "longitude": 106.661,
  "locationDescription": "Kho hóa chất tầng trệt"
}
```

#### `POST /api/v1/alerts/:id/confirm`

Xác nhận cảnh báo và chuyển thành sự cố:

- **Request Body:**

```json
{
  "incidentTypeId": "b1a134a4-5690-4822-a548-8dfc437fef12",
  "priority": "CRITICAL",
  "title": "Cháy tại kho hóa chất tầng trệt",
  "latitude": 10.764,
  "longitude": 106.661,
  "locationDescription": "Kho hóa chất tầng trệt"
}
```

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "alertId": "7fae98f0-1c09-41e9-92c2-b5e09f7a77e3",
    "incidentId": "a87901fb-9cf9-42b7-a870-13f56e9c20a1",
    "incidentCode": "INC-20261124-0001",
    "status": "CONFIRMED"
  }
}
```

#### `POST /api/v1/alerts/:id/dismiss`

- **Request Body:**

```json
{
  "reason": "Báo nhầm, khói do công nhân hàn xì có giấy phép."
}
```

---

### 4.3 Module Incidents

#### `GET /api/v1/incidents`

- **Query Params:**
  - `page`: số trang (mặc định 1)
  - `limit`: số dòng (mặc định 20)
  - `status`: `NEW`, `CONFIRMED`, `DISPATCHED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`
  - `priority`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
  - `typeId`: UUID
  - `search`: tìm theo mã hoặc tiêu đề
  - `startDate`, `endDate`: khoảng thời gian tạo
- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "a87901fb-9cf9-42b7-a870-13f56e9c20a1",
      "code": "INC-20261124-0001",
      "title": "Cháy tại kho hóa chất tầng trệt",
      "priority": "CRITICAL",
      "status": "DISPATCHED",
      "latitude": 10.764,
      "longitude": 106.661,
      "locationDescription": "Kho hóa chất tầng trệt",
      "incidentType": {
        "id": "b1a134a4-5690-4822-a548-8dfc437fef12",
        "code": "FIRE",
        "name": "Cháy nổ (PCCC)"
      },
      "activeDispatchesCount": 1,
      "createdAt": "2026-11-24T08:16:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### `GET /api/v1/incidents/:id`

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "a87901fb-9cf9-42b7-a870-13f56e9c20a1",
    "code": "INC-20261124-0001",
    "title": "Cháy tại kho hóa chất tầng trệt",
    "description": "Báo cháy diện tích khoảng 20m2",
    "priority": "CRITICAL",
    "status": "DISPATCHED",
    "latitude": 10.764,
    "longitude": 106.661,
    "locationDescription": "Kho hóa chất tầng trệt",
    "incidentType": {
      "id": "b1a134a4-5690-4822-a548-8dfc437fef12",
      "code": "FIRE",
      "name": "Cháy nổ (PCCC)"
    },
    "reporter": {
      "id": "u1...",
      "fullName": "Trần Nhân Viên",
      "phone": "0901234567"
    },
    "dispatches": [
      {
        "id": "d1...",
        "unit": {
          "id": "un1...",
          "name": "Xe PCCC 1",
          "type": "FIRE_FIGHTING"
        },
        "status": "ASSIGNED",
        "assignedAt": "2026-11-24T08:18:00.000Z"
      }
    ],
    "attachments": [
      {
        "id": "att1...",
        "filePath": "/uploads/2026/11/fire1.jpg",
        "originalName": "fire1.jpg",
        "fileSize": 1048576,
        "mimeType": "image/jpeg"
      }
    ],
    "allowedActions": ["DISPATCH", "CANCEL", "CHANGE_PRIORITY"],
    "version": 1,
    "createdAt": "2026-11-24T08:16:00.000Z"
  }
}
```

_(Lưu ý: Đối với vai trò `RESPONDER` hoặc `REPORTER`, thông tin số điện thoại của người báo cáo sẽ được ẩn tự động theo BR-09)_.

#### `POST /api/v1/incidents/:id/close`

- **Request Body:**

```json
{
  "resolutionNote": "Đám cháy đã được dập tắt hoàn toàn lúc 08:45, không thiệt hại về người."
}
```

#### `POST /api/v1/incidents/:id/cancel`

- **Request Body:**

```json
{
  "reason": "Xác minh lại đây là sự cố thử nghiệm hệ thống báo cháy nội bộ."
}
```

#### `POST /api/v1/incidents/:id/reopen`

- **Request Body:**

```json
{
  "reason": "Phát hiện tàn tro còn âm ỉ có nguy cơ bùng phát lại."
}
```

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "a87901fb-9cf9-42b7-a870-13f56e9c20a1",
    "code": "INC-20261124-0001",
    "status": "CONFIRMED",
    "allowedActions": ["DISPATCH", "CANCEL", "CHANGE_PRIORITY"]
  }
}
```

---

### 4.4 Module Units & Dispatch

#### `GET /api/v1/units/suggestions?incidentId=...`

Lấy danh sách lực lượng phù hợp để điều phối thủ công (lọc `AVAILABLE`, ưu tiên theo thứ tự chuyên môn trong `incident_types.suggested_unit_types` — ví dụ sự cố `FIRE` ưu tiên `FIRE_FIGHTING` trước `SECURITY`/`MEDICAL` — sau đó sắp xếp tăng dần theo khoảng cách Haversine):

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "un1...",
      "name": "Xe PCCC 1",
      "type": "FIRE_FIGHTING",
      "status": "AVAILABLE",
      "area": "Trạm PCCC",
      "distanceMeters": 120,
      "latitude": 10.764,
      "longitude": 106.661
    },
    {
      "id": "un2...",
      "name": "Tổ bảo vệ A",
      "type": "SECURITY",
      "status": "AVAILABLE",
      "area": "Khu A — Cổng chính",
      "distanceMeters": 210,
      "latitude": 10.7625,
      "longitude": 106.66
    }
  ]
}
```

_(Ghi chú: Nếu các lực lượng gợi ý đều đang bận hoặc cần chọn ngoài chuyên môn gợi ý, Frontend dùng `GET /api/v1/units?status=AVAILABLE` để Operator chọn thủ công từ toàn bộ lực lượng sẵn sàng)._

#### `POST /api/v1/dispatches`

Giao lệnh điều phối **thủ công** cho 1 lực lượng đang `AVAILABLE` (hệ thống không tự động điều phối; Backend không bắt buộc trùng loại lực lượng gợi ý):

- **Request Body:**

```json
{
  "incidentId": "a87901fb-9cf9-42b7-a870-13f56e9c20a1",
  "unitId": "un1...",
  "instruction": "Tiếp cận cửa thoát hiểm số 2, mang theo bình bọt CO2"
}
```

- **Response `201 Created`:**

```json
{
  "statusCode": 201,
  "data": {
    "id": "d1...",
    "incidentId": "a87901fb-9cf9-42b7-a870-13f56e9c20a1",
    "unitId": "un1...",
    "status": "ASSIGNED",
    "assignedAt": "2026-11-24T08:20:00.000Z"
  }
}
```

#### `POST /api/v1/dispatches/:id/decline`

- **Request Body:**

```json
{
  "reason": "Xe chữa cháy đang gặp sự cố hỏng bơm áp lực"
}
```

#### `POST /api/v1/dispatches/:id/done`

- **Request Body:**

```json
{
  "resultNote": "Đã dập tắt điểm phát lửa và thông gió hoàn tất",
  "attachmentIds": ["att_scene_done_1..."]
}
```

---

### 4.5 Module Uploads

#### `POST /api/v1/uploads`

- **Content-Type:** `multipart/form-data`
- **Body:** `file`: binary file (ảnh JPEG/PNG/WebP, tối đa 5MB)
- **Response `201 Created`:**

```json
{
  "statusCode": 201,
  "data": {
    "id": "att_123456...",
    "filePath": "/uploads/2026/11/uuid-name.jpg",
    "originalName": "hien_truong.jpg",
    "fileSize": 2048123,
    "mimeType": "image/jpeg"
  }
}
```

---

### 4.6 Module Statistics

#### `GET /api/v1/statistics/overview`

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "activeIncidentsCount": 4,
    "pendingAlertsCount": 2,
    "availableUnitsCount": 3,
    "busyUnitsCount": 2,
    "criticalIncidentsCount": 1,
    "slaBreachedCount": 0
  }
}
```

#### `GET /api/v1/statistics/response-times`

- **Response `200 OK`:**

```json
{
  "statusCode": 200,
  "data": {
    "averageConfirmMinutes": 1.5,
    "averageDispatchMinutes": 3.8,
    "averageOnSceneMinutes": 6.2,
    "averageResolutionMinutes": 24.5,
    "slaComplianceRatePercent": 96.5
  }
}
```

---

## 5. Danh mục mã lỗi nghiệp vụ

| HTTP Code | Error Code                  | Ý nghĩa                                                                     |
| --------- | --------------------------- | --------------------------------------------------------------------------- |
| `400`     | `VALIDATION_FAILED`         | Dữ liệu gửi lên sai định dạng hoặc thiếu trường bắt buộc                    |
| `401`     | `UNAUTHORIZED`              | Token không hợp lệ hoặc đã hết hạn                                          |
| `403`     | `FORBIDDEN_ROLE`            | Vai trò người dùng không được phép gọi endpoint này                         |
| `403`     | `FORBIDDEN_SCOPE`           | Không có quyền thao tác trên tài nguyên của người khác / đơn vị khác        |
| `404`     | `NOT_FOUND`                 | Không tìm thấy thực thể tương ứng                                           |
| `409`     | `INVALID_TRANSITION`        | Trạng thái chuyển đổi không hợp lệ theo máy trạng thái                      |
| `409`     | `UNIT_NOT_AVAILABLE`        | Lực lượng được giao hiện không ở trạng thái sẵn sàng (đang bận/ngoại tuyến) |
| `409`     | `UNIT_HAS_ACTIVE_DISPATCH`  | Lực lượng đang có lệnh điều phối hoạt động, không thể chuyển `OFFLINE`      |
| `409`     | `INCIDENT_NOT_DISPATCHABLE` | Sự cố không ở trạng thái được phép giao lệnh điều phối                      |
| `409`     | `CONCURRENT_MODIFICATION`   | Dữ liệu bị thay đổi bởi người khác trong cùng thời điểm (xung đột version)  |
| `422`     | `REASON_REQUIRED`           | Bắt buộc phải nhập lý do khi thực hiện hành động này                        |
| `422`     | `RESOLUTION_REQUIRED`       | Bắt buộc phải có kết quả xử lý (`resolutionNote`) khi đóng sự cố            |
| `422`     | `MISSING_CLASSIFICATION`    | Thiếu thông tin phân loại (loại, mức ưu tiên, vị trí) khi xác nhận          |
| `429`     | `RATE_LIMIT_EXCEEDED`       | Thao tác gửi quá nhanh (chống spam báo cáo/cảnh báo)                        |
