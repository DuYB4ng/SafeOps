# SafeOps — AI Assistant Guidelines & Task Tracking Rules

Tài liệu này định nghĩa quy tắc hoạt động, quy ước phát triển và cơ chế theo dõi tiến độ công việc cho AI Assistant (Antigravity / Gemini) trong dự án **SafeOps**.

---

## 1. Nguồn quản lý Task (`tasks.csv`)

- **File nguồn:** `tasks.csv` nằm tại thư mục gốc của dự án.
- **Mục đích:** Quản lý toàn bộ backlog, phân công công việc, milestone và tiến độ thực tế của toàn dự án SafeOps.
- **Cấu trúc cột:**
  - `ID`: Mã định danh duy nhất của task (ví dụ: `M0-01`, `M0-18`, `M1-05`, ...).
  - `Milestone`: Giai đoạn dự án (`M0` đến `M9`).
  - `Mảng`: Bộ phận phụ trách (`FE`, `BE`, `Design`, `Docs`, `Infra`, `QA`).
  - `Hạng mục`: Nhóm công việc chi tiết (Setup, UI/UX, API, Database, Auth, Incident, v.v.).
  - `Task`: Tên và mô tả ngắn nhiệm vụ.
  - `Tiêu chí hoàn thành`: Điều kiện nghiệm thu (Acceptance Criteria) bắt buộc phải đạt được.
  - `Phụ thuộc`: Danh sách Task ID tiên quyết phải hoàn thành trước.
  - `Ưu tiên`: Mức độ ưu tiên (`P0` - Khẩn cấp/Chặn, `P1` - Cao, `P2` - Trung bình/Thấp).
  - `Ước tính (ngày)`: Thời gian ước tính hoàn thành.
  - `Người làm`: Thành viên phụ trách (`Hoàng`, `Quốc Việt`, `Bằng`, `Phú`, `Anh Kiệt`, `Trí`, `Cả nhóm`).
  - `Trạng thái`: Trạng thái thực tế của task (`Chưa làm`, `Đang làm`, `Review`, `Xong`, `Tạm hoãn`).
  - `Bắt đầu`: Ngày bắt đầu thực hiện (DD/MM/YYYY).
  - `Kết thúc`: Ngày hoàn thành (DD/MM/YYYY).
  - `Ghi chú`: Thông tin bổ sung, tuần triển khai, blocker hoặc lưu ý kỹ thuật.

---

## 2. Quy tắc làm việc của AI khi thực hiện và theo dõi Task

### 2.1. Tra cứu và bắt đầu Task

1. **Kiểm tra thông tin:** Khi được yêu cầu thực hiện chức năng, sửa lỗi hoặc tiếp tục công việc:
   - Tra cứu Task ID tương ứng trong `tasks.csv` (hoặc kiểm tra tên nhánh Git hiện tại, ví dụ: nhánh `feature-M0-18-Hoang` tương ứng task `M0-18`).
   - Đọc kỹ **Tiêu chí hoàn thành** để nắm rõ phạm vi nghiệm thu.
   - Kiểm tra các task trong cột **Phụ thuộc** xem đã hoàn thành (`Xong`) chưa.
2. **Cập nhật trạng thái:**
   - Khi bắt đầu thực hiện một task chưa làm, cập nhật `Trạng thái` từ `Chưa làm` sang `Đang làm`.
   - Bổ sung ngày `Bắt đầu` nếu chưa có.

### 2.2. Trong quá trình phát triển

1. **Bám sát tiêu chí hoàn thành:** Thực hiện đúng và đủ theo phạm vi yêu cầu trong cột `Tiêu chí hoàn thành`, không tự ý thêm bớt ngoài phạm vi task.
2. **Tuân thủ kiến trúc công nghệ dự án:**
   - **Frontend (`/frontend`):** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
   - **Backend (`/backend`):** NestJS + TypeORM + PostgreSQL + Socket.IO.
3. **Quy chuẩn mã nguồn:** Trước khi kết thúc công việc hoặc tạo commit, luôn đảm bảo code vượt qua kiểm tra:
   - `npm run lint`
   - `npm run format:check` / `npm run format`

### 2.3. Hoàn thành Task & Cập nhật file

1. **Đối chiếu nghiệm thu:** Tự kiểm tra lại toàn bộ tiêu chí trong cột `Tiêu chí hoàn thành`.
2. **Cập nhật `tasks.csv`:**
   - Chuyển `Trạng thái` sang `Review` (khi đã hoàn thành code và chuẩn bị tạo PR) hoặc `Xong` (khi đã merge/nghiệm thu).
   - Điền ngày `Kết thúc` và cập nhật cột `Ghi chú` nếu có phát sinh kỹ thuật cần lưu lại.
3. **Bảo toàn định dạng file `tasks.csv`:**
   - Luôn lưu file với mã hóa **UTF-8**.
   - Giữ nguyên cấu trúc header và thứ tự 14 cột.
   - Các trường có chứa dấu phẩy, dấu nháy kép hoặc ký tự đặc biệt phải được escape chuẩn CSV (RFC 4180).

---

## 3. Quy ước Git & Commit liên kết với Task

Mọi nhánh và commit trong dự án đều phải gắn liền với Task ID:

### 3.1. Quy ước đặt tên nhánh (Branching)

- Nhánh tính năng: `feature/<Task-ID>-<TênThànhViên>` hoặc `feature-<Task-ID>-<TênThànhViên>`  
  _(Ví dụ: `feature-M0-18-Hoang`)_
- Nhánh sửa lỗi: `hotfix/<Task-ID>-<MôTả>` hoặc `bugfix/<Task-ID>-<MôTả>`

### 3.2. Quy ước Commit Message

Mọi commit phải tuân thủ định dạng chuẩn:

```
<type>(<scope>): [<Task-ID>] <mô tả ngắn>
```

- **Types:** `feat` | `fix` | `chore` | `docs` | `style` | `refactor` | `test` | `perf` | `ci`
- **Scopes phổ biến:** `auth`, `incident`, `dashboard`, `frontend`, `backend`, `infra`, `ui`, `db`, v.v.
- **Ví dụ:**
  - `feat(frontend): [M0-18] setup Next.js App Router and core shadcn UI components`
  - `fix(incident): [M2-03] handle transaction rollback on attachment error`
  - `chore(infra): [M0-10] setup ESLint, Prettier và Husky`

---

## 4. Hỗ trợ tra cứu nhanh trạng thái dự án

Khi người dùng hỏi về tiến độ (ví dụ: _"Hôm nay tôi cần làm gì?"_, _"Tiến độ M0 thế nào?"_, _"Ai đang làm task nào?"_):

- AI đọc trực tiếp file `tasks.csv` để tổng hợp báo cáo súc tích, phân loại theo Milestone, Người làm, hoặc Mức độ ưu tiên (`P0` -> `P1` -> `P2`).
