# SafeOps — Enterprise Safety & Operations Management System

> **Hệ thống Quản lý và Điều phối Sự cố An ninh theo Thời gian thực (Đề tài G1.1)**

SafeOps là giải pháp nền tảng web tích hợp thời gian thực phục vụ Trung tâm Điều hành An ninh (SOC) cho các khu công nghiệp, khu đô thị hoặc khuôn viên quy mô lớn.

---

## 1. Công nghệ Sử dụng (Tech Stack)

| Tầng            | Công nghệ                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------- |
| **Backend**     | NestJS, TypeScript, PostgreSQL 16, TypeORM (Migration only), Socket.IO                      |
| **Frontend**    | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Leaflet |
| **Giao thức**   | RESTful API (`/api/v1`), WebSocket (`/socket.io`)                                           |
| **Quản lý gói** | `pnpm`                                                                                      |
| **Môi trường**  | Docker & Docker Compose                                                                     |

---

## 2. Cấu trúc Dự án

```
SafeOps/
├── .agent/rules/        # Quy tắc phát triển cho AI Agent
├── AGENTS.md            # Bản đồ điều hướng và quy tắc AI Agent
├── README.md            # Hướng dẫn dự án
├── backend/             # NestJS Server (Cổng 3001, Swagger: /api)
├── frontend/            # Next.js Web App (Cổng 3000)
└── docs/
    ├── 00-requirements/ # Yêu cầu nghiệp vụ, vai trò, User Stories
    ├── 01-srs/          # Đặc tả yêu cầu phần mềm chi tiết (srs.md)
    ├── 02-architecture/ # Cấu trúc thư mục, máy trạng thái, Socket.IO events
    ├── 03-database/     # Thiết kế CSDL TypeORM (erd.md)
    ├── 04-api/          # Hợp đồng REST API (api-contract.md)
    └── 05-plan/         # Kế hoạch thực thi 4 tuần (implementation-plan.md)
```

---

## 3. Cổng & Dịch vụ Mặc định

| Dịch vụ           | Địa chỉ                        | Ghi chú                          |
| ----------------- | ------------------------------ | -------------------------------- |
| **Frontend Web**  | `http://localhost:3000`        | Giao diện người dùng Next.js     |
| **Backend API**   | `http://localhost:3001/api/v1` | API chính thức                   |
| **Swagger Docs**  | `http://localhost:3001/api`    | Tài liệu API tương tác           |
| **Socket.IO**     | `http://localhost:3001`        | Cổng kết nối realtime            |
| **PostgreSQL DB** | `localhost:5432`               | CSDL chính (Database: `safeops`) |

---

## 4. Tài khoản Kiểm thử Mặc định (Seed Data)

Mật khẩu chung cho môi trường phát triển: `{Role}@123`

| Email                               | Vai trò     | Mô tả                                    |
| ----------------------------------- | ----------- | ---------------------------------------- |
| `admin@safeops.local`               | `ADMIN`     | Quản trị hệ thống, người dùng, danh mục  |
| `commander@safeops.local`           | `COMMANDER` | Chỉ huy / Trưởng ca điều hành SOC        |
| `operator1@safeops.local`           | `OPERATOR`  | Điều phối viên trực tiếp nhận cảnh báo   |
| `responder.security1@safeops.local` | `RESPONDER` | Lực lượng bảo vệ (Tổ bảo vệ A)           |
| `responder.fire@safeops.local`      | `RESPONDER` | Lực lượng PCCC (Xe PCCC 1)               |
| `responder.medical@safeops.local`   | `RESPONDER` | Lực lượng y tế (Tổ y tế)                 |
| `reporter1@safeops.local`           | `REPORTER`  | Người báo cáo sự cố (Cư dân / Nhân viên) |

---

## 5. Hướng dẫn Khởi chạy (Quick Start)

### Yêu cầu tiên quyết:

- Đã cài đặt **Docker** và **Docker Compose**
- **Node.js 24.x** và **pnpm 10.x** để chạy các công cụ phát triển dùng chung.
- Nếu máy có Corepack nhưng chưa có lệnh `pnpm`, dùng `corepack pnpm` thay cho `pnpm` trong các lệnh bên dưới.

### Khởi chạy với Docker:

```bash
# 1. Chạy Backend & Database
cd backend
docker compose up --build

# 2. Chạy Frontend
cd frontend
docker compose up --build
```

---

## 6. Công cụ phát triển dùng chung (M0-10)

Repo sử dụng **pnpm workspace**, với `backend/` và `frontend/` là hai package ứng dụng. Các công cụ ESLint, Prettier, Husky và lint-staged được quản lý tại thư mục gốc; mỗi ứng dụng sẽ có `package.json` riêng khi khởi tạo NestJS/Next.js. Commit `pnpm-lock.yaml` để cả nhóm cài cùng phiên bản dependency.

Chạy tại thư mục gốc sau khi clone:

```bash
pnpm install --frozen-lockfile
```

Script `prepare` tự cài Git hooks qua Husky. Khi commit, hook `pre-commit` gọi lint-staged để chạy ESLint và Prettier trên các file đã stage. Lỗi ESLint chưa sửa được sẽ chặn commit; các thay đổi tự sửa được cập nhật vào phần đã stage. Hook hỗ trợ cả lệnh `pnpm` và `corepack pnpm`.

| Lệnh                    | Mục đích                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| `pnpm lint`             | Kiểm tra JavaScript/TypeScript trong toàn repo, không chấp nhận warning |
| `pnpm lint:fix`         | Tự sửa các lỗi ESLint có thể sửa được                                   |
| `pnpm format`           | Định dạng code Backend/Frontend, cấu hình gốc và README bằng Prettier   |
| `pnpm format:check`     | Kiểm tra định dạng mà không sửa file                                    |
| `pnpm exec lint-staged` | Kiểm tra các file đã stage trước khi commit                             |

Chuẩn định dạng chung: thụt lề 2 dấu cách, dấu nháy đơn, dấu chấm phẩy, độ dài dòng mục tiêu 100 ký tự và xuống dòng LF. `.gitattributes` và `.editorconfig` đồng bộ xuống dòng trên Windows/Linux. Với VS Code, cài extension ESLint và Prettier để dùng cấu hình của repo. Lệnh format hiện tập trung vào code, cấu hình gốc và README; tài liệu trong `docs/`, `.agent/` và `AGENTS.md` được định dạng khi chỉnh sửa và stage qua lint-staged.

ESLint hiện cung cấp bộ rule TypeScript cơ bản, chưa yêu cầu `tsconfig.json`. Khi khởi tạo ứng dụng ở M0-14/M0-18, bổ sung rule dành riêng cho NestJS/Next.js và bảo đảm cả lệnh kiểm tra toàn repo lẫn hook đều áp dụng các rule đó. Docker, build/test ứng dụng và CI được triển khai ở các task tiếp theo.

Trước khi tạo PR, chạy `pnpm lint` và `pnpm format:check`, xem lại `git diff`, sau đó dùng thông điệp commit dạng `chore(repo): [M0-10] configure shared tooling`.

## 7. Frontend và bộ UI SafeOps

OPERATOR: `/map` là màn hình bản đồ Leaflet, gồm danh sách sự cố/lực lượng, bộ lọc, marker gom cụm, popup và modal điều phối mẫu. Nền chiến thuật/tối giản dùng sơ đồ minh họa cục bộ; nền đường phố dùng OpenStreetMap và cần mạng. Dữ liệu hiện là fixture, chưa kết nối API hoặc Socket.IO.

Reporter: `/reports` hiển thị báo cáo cá nhân, `/reports/new` là form tạo và `/reports/RPT-20261109-001` là chi tiết có bổ sung minh chứng. Giao diện theo ba file CSS Figma người dùng gửi, có lọc tiếng Việt không dấu, phân trang, ảnh xem trước, nháp trong phiên trình duyệt và GPS theo yêu cầu. Dữ liệu/ảnh nền/sơ đồ là minh họa; gửi và bổ sung báo cáo chưa nối API.

M0-19: tổ chức đủ `app`, `features`, `components`, `services`, `hooks`, `types`. Route chia thành `(auth)` cho `/login`, `/register` và `(dashboard)` cho `/`, `/dashboard`; mỗi nhóm có layout và CSS riêng. Hook form/lọc nằm trong feature, hook phím tắt dùng chung nằm tại `src/hooks`, xuất CSV tại `src/services`, type chia sẻ tại `src/types`. Root layout giữ font, CSS chung và Toaster. `/components` là trang phát triển ngoài hai nhóm. HTTP client và refresh token thuộc M1-13.

Trang `/login` và `/register` dùng thiết kế xác thực từ CSS Figma người dùng cung cấp: giới thiệu SafeOps, form hai chế độ, kiểm tra dữ liệu và ẩn/hiện mật khẩu. Đăng ký công khai dành cho REPORTER; số điện thoại tùy chọn. Đây là giao diện chưa nối API Auth, không tạo phiên đăng nhập hoặc tài khoản thật. Google Workspace và quên mật khẩu hiện hiển thị thông tin hỗ trợ.

Trang chính `/` và `/dashboard` hiển thị Dashboard theo file CSS thiết kế người dùng cung cấp: KPI, sơ đồ mô phỏng, phân bố/SLA và bảng sự cố. Có tìm kiếm, lọc, chọn pin, xuất CSV, xem chi tiết và mở modal điều phối từ từng hàng với dữ liệu minh họa; chưa kết nối API/Socket.IO. Bộ component tiếp tục có tại `/components`; cấu hình công cụ M0-10 giữ nguyên.

Từ thư mục gốc, chạy `pnpm install --frozen-lockfile`, sau đó `pnpm --dir frontend dev`. Nếu chưa có lệnh pnpm, dùng `corepack pnpm` thay thế. Mở `http://localhost:3000/components` để xem bộ UI, đổi trạng thái kết nối mẫu, thử form điều phối, hộp thoại và thông báo. Đây là trang xem thử component với dữ liệu giả, chưa kết nối Backend/Socket.IO.

Component lấy thông số từ page `02-Components` trong [Figma SafeOps](https://www.figma.com/design/WQxeppTQRrMD9dYijJctmV/SafeOps-UI-UX). Table được dựng theo ảnh người dùng cung cấp: 4 hàng, nền trắng, không có header hiển thị, kèm badge, thời gian và nút mở modal. Chi tiết nguồn node, token và giới hạn đối chiếu theo ảnh ở [tài liệu kiến trúc](docs/02-architecture/folder-structure.md#44-bộ-ui-theo-figma-m0-18).

Kiểm tra trước khi commit:

```bash
pnpm lint
pnpm format:check
pnpm --dir frontend typecheck
pnpm --dir frontend build
```

Kiểm thử trình duyệt dùng bản build trên cổng riêng `3100`:

```bash
pnpm --dir frontend exec playwright install chromium
pnpm --dir frontend test
```

Chạy lại `pnpm --dir frontend build` sau khi sửa UI trước khi chạy test. Bộ kiểm thử bao gồm kích thước Badge/Header/Sidebar, phản hồi kết nối, chọn mức độ/lực lượng, giới hạn nút theo `allowedActions`, nhập lý do hủy, tìm kiếm và màn hình mobile 390px.

Nếu dev server báo `Module not found` cho một file vừa được tạo nhưng file đã tồn tại và `pnpm --dir frontend typecheck` vẫn qua, dừng server bằng `Ctrl+C` rồi chạy lại `pnpm --dir frontend dev` để làm mới trạng thái theo dõi file. Khi cần làm mới cache, chỉ đổi tên thư mục sinh tự động `frontend/.next/dev` sau khi đã dừng server; giữ nguyên mã nguồn và `node_modules`.

Dev server hỗ trợ cả `localhost` và `127.0.0.1`. `next.config.ts` khai báo `allowedDevOrigins` cho `127.0.0.1` để kênh hot reload không bị Next.js chặn khi kiểm tra bằng địa chỉ này.
