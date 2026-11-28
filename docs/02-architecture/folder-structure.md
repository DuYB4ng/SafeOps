# Cấu trúc thư mục dự án SafeOps

**Đọc file này khi:** tạo file mới, quyết định đặt mã ở đâu, hoặc cần biết chạy backend/frontend như thế nào.

**Liên quan:** [`incident-state-machine.md`](incident-state-machine.md), [`realtime-events.md`](realtime-events.md), [`overview.md`](../00-requirements/overview.md).

## 1. Nguyên tắc (giữ đơn giản)

1. **Hai ứng dụng độc lập** trong cùng một repo: `backend/` (NestJS) và `frontend/` (Next.js). Mỗi bên có `package.json`, `Dockerfile`, `docker-compose.yml`, `.env` riêng và **tự chạy được độc lập**.
2. **Không có package dùng chung.** Backend là nguồn sự thật cho enum, trạng thái và quy tắc nghiệp vụ. Frontend giữ một bản sao nhỏ các enum và kiểu dữ liệu ở `src/types/`; khi backend đổi thì cập nhật theo `docs/04-api/`.
3. **Frontend không tự viết lại luật chuyển trạng thái.** Backend trả về danh sách hành động được phép trong dữ liệu sự cố (ví dụ `allowedActions: ["CANCEL", "ASSIGN"]`), frontend chỉ hiển thị nút theo danh sách đó.
4. **Tài liệu ở `docs/`** là chuẩn. Khi code và tài liệu mâu thuẫn, sửa tài liệu trước rồi mới sửa code.
5. **Stack đã chốt:** Next.js + TypeScript, NestJS + TypeScript, PostgreSQL + TypeORM (không PostGIS), Socket.IO, Docker. Không dùng Redis, BullMQ, Nginx.

---

## 2. Cây thư mục tổng thể

```
SafeOps/
├── .agent/
│   └── rules/                    # quy tắc cho AI agent (file .md phẳng, không thư mục con)
├── AGENTS.md                     # bản đồ dự án cho AI agent (xem ghi chú bên dưới)
├── README.md                     # cách chạy backend và frontend
├── .gitignore
├── package.json                  # tooling dùng chung, pnpm workspace
├── pnpm-workspace.yaml           # backend/ và frontend/
├── pnpm-lock.yaml                # lockfile chung
├── eslint.config.mjs             # cấu hình nền cho repo
├── backend/                      # NestJS, tự chạy docker compose riêng
├── frontend/                     # Next.js, tự chạy docker compose riêng
└── docs/
    ├── 00-requirements/          # overview, roles-permissions, user-stories
    ├── 01-srs/                   # srs.md (Đặc tả yêu cầu phần mềm chuẩn)
    ├── 02-architecture/          # folder-structure, incident-state-machine, realtime-events
    ├── 03-database/              # erd.md
    ├── 04-api/                   # api-contract.md
    └── 05-plan/                  # implementation-plan.md
```

**Ghi chú về `AGENTS.md` và `.agent/`:**

- Theo tài liệu Antigravity tôi đã tra, tên file chuẩn dùng chung giữa các công cụ là **`AGENTS.md`** (có chữ **S**). Trong ảnh của bạn hiện là `AGENT.md`; nên đổi tên, rồi mở phần Customizations/Rules trong ứng dụng để kiểm tra agent đã nhận.
- Thư mục `.agent/rules/` (số ít) là tên cũ nhưng vẫn được hỗ trợ; tên mới là `.agents/rules/`. Giữ `.agent/` như hiện tại là được, đừng tạo cả hai.
- Chỉ các file `.md` nằm **trực tiếp** trong `rules/` được nạp, không đặt thư mục con.
- Đừng đặt `AGENTS.md` bên trong `backend/` hay `frontend/`: quy tắc riêng của từng bên hãy viết thành file trong `.agent/rules/` (ví dụ `10-backend-nestjs.md`, `20-frontend-nextjs.md`).

---

## 3. Backend (`backend/`)

Theo cách tổ chức phổ biến của NestJS: **chia theo tính năng (module)**, phần dùng chung đặt ở `common`, cấu hình ở `config`, cơ sở dữ liệu ở `database`.

```
backend/
├── src/
│   ├── main.ts                          # khởi động: tiền tố /api/v1, Swagger, CORS, ValidationPipe
│   ├── app.module.ts
│   │
│   ├── config/                          # cấu hình đọc từ biến môi trường
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── env.validation.ts            # kiểm tra biến môi trường khi khởi động
│   │
│   ├── database/
│   │   ├── data-source.ts               # dùng cho TypeORM CLI
│   │   ├── migrations/                  # luôn dùng migration, tắt synchronize
│   │   └── seeds/                       # dữ liệu mẫu: loại sự cố, tài khoản, lực lượng
│   │
│   ├── common/                          # dùng chung nhiều module
│   │   ├── decorators/                  # @Roles(), @CurrentUser(), @Public()
│   │   ├── guards/                      # JwtAuthGuard, RolesGuard, ApiKeyGuard
│   │   ├── filters/                     # AllExceptionsFilter: định dạng lỗi thống nhất
│   │   ├── interceptors/                # logging, chuẩn hóa response
│   │   ├── errors/                      # lỗi nghiệp vụ: InvalidTransitionError, ReasonRequiredError...
│   │   ├── enums/                       # UserRole, AlertStatus, IncidentStatus, DispatchStatus...
│   │   ├── events/                      # tên sự kiện nội bộ (domain-events.ts)
│   │   ├── state-machine/               # kiểu TransitionRule + hàm findTransition dùng chung
│   │   ├── dto/                         # PaginationQueryDto, PaginatedResponseDto
│   │   ├── entities/                    # base.entity.ts (id, createdAt, updatedAt, deletedAt, version)
│   │   └── utils/                       # geo.util.ts (Haversine), code-generator.util.ts
│   │
│   └── modules/                         # mỗi nghiệp vụ một module (mục 3.2)
│       ├── auth/
│       ├── users/
│       ├── incident-types/
│       ├── alerts/
│       ├── incidents/
│       ├── units/
│       ├── dispatch/
│       ├── incident-logs/
│       ├── notifications/
│       ├── uploads/
│       ├── statistics/
│       ├── sla/
│       ├── realtime/
│       └── health/
│
├── scripts/
│   └── simulate-alerts.ts               # giả lập nguồn cảnh báo để demo
├── test/                                # kiểm thử e2e
├── uploads/                             # ảnh tải lên (mount volume, không commit)
│
├── Dockerfile
├── docker-compose.yml                   # db (PostgreSQL) + backend
├── .dockerignore
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── eslint.config.mjs
```

### 3.1 Cấu trúc bên trong một module

Mọi module theo cùng một mẫu, chỉ tạo phần cần thiết. Ví dụ `incidents`:

```
modules/incidents/
├── incidents.module.ts
├── incidents.controller.ts
├── incidents.service.ts
├── incidents.service.spec.ts             # kiểm thử đơn vị đặt cạnh file nguồn
├── entities/
│   ├── incident.entity.ts
│   └── incident-attachment.entity.ts
├── dto/
│   ├── create-incident.dto.ts
│   ├── update-incident.dto.ts
│   ├── change-incident-status.dto.ts
│   └── incident-query.dto.ts
├── incident-transitions.ts               # bảng chuyển trạng thái của sự cố
└── derive-incident-status.ts             # hàm suy ra trạng thái từ các lệnh điều phối
```

Với các module có bảng chuyển trạng thái, file `*-transitions.ts` nằm ngay trong module đó: `alerts/alert-transitions.ts`, `dispatch/dispatch-transitions.ts`, `units/unit-transitions.ts`.

### 3.2 Các module

| Module           | Làm gì                                                | Bảng                                | Ghi chú                                                                              |
| ---------------- | ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `auth`           | Đăng nhập, làm mới token, đăng xuất, `me`             | —                                   | `strategies/` chứa JWT strategy                                                      |
| `users`          | Tài khoản, vai trò, khóa/mở                           | `users`                             | Cột `role` kiểu enum, `unitId` cho RESPONDER, không có bảng `roles`                  |
| `incident-types` | Danh mục loại sự cố                                   | `incident_types`                    |                                                                                      |
| `alerts`         | Tiếp nhận cảnh báo; xác nhận / loại bỏ / gộp          | `alerts`                            | Endpoint công khai có giới hạn tốc độ; nguồn tự động dùng `ApiKeyGuard`              |
| `incidents`      | Sự cố, ảnh đính kèm, chuyển trạng thái thủ công       | `incidents`, `incident_attachments` | Có hàm `recomputeStatus()`                                                           |
| `units`          | Lực lượng, trạng thái, vị trí, gợi ý theo khoảng cách | `units`                             | Dùng Haversine ở `common/utils/geo.util.ts`                                          |
| `dispatch`       | Lệnh điều phối và mọi hệ quả liên động                | `dispatches`                        | Gọi `IncidentsService`, `UnitsService` trong cùng transaction                        |
| `incident-logs`  | Nhật ký bất biến                                      | `incident_logs`                     | Chỉ ghi qua service, không có API sửa/xóa                                            |
| `notifications`  | Lưu và đọc thông báo                                  | `notifications`                     | Có `listeners/` lắng nghe sự kiện nội bộ                                             |
| `uploads`        | Nhận và phục vụ ảnh                                   | (dùng `incident_attachments`)       | Giới hạn loại và dung lượng file                                                     |
| `statistics`     | Số liệu cho dashboard                                 | —                                   | Chỉ đọc                                                                              |
| `sla`            | Tác vụ định kỳ kiểm tra SLA                           | —                                   | `@Cron`, hằng số SLA nằm ở `sla.constants.ts`                                        |
| `realtime`       | Gateway Socket.IO                                     | —                                   | `realtime.gateway.ts`, `realtime.listener.ts`, `rooms.ts`, `events/socket-events.ts` |
| `health`         | `GET /health` cho Docker                              | —                                   |                                                                                      |

### 3.3 Quy tắc giữ code gọn

1. **Controller chỉ** nhận DTO, gắn quyền, gọi service, trả kết quả. Logic nghiệp vụ nằm ở service.
2. **Module chỉ dùng module khác qua service được export**, không đọc thẳng repository của module khác.
3. **Không có phụ thuộc vòng.** `dispatch` là bên điều phối nên gọi `incidents` và `units`; ngược lại thì không.
4. **Mọi thay đổi trạng thái** đi qua đúng service và đúng bảng chuyển trong `*-transitions.ts` (xem `incident-state-machine.md`).
5. **Thông báo và đẩy socket** đi qua sự kiện nội bộ (`EventEmitter2`), phát sau khi commit. Module nghiệp vụ không import `RealtimeGateway`.
6. Enum dùng ở nhiều module đặt ở `common/enums/`; kiểu chỉ dùng trong một module thì để trong module đó.

---

## 4. Frontend (`frontend/`)

Theo cách tổ chức phổ biến của Next.js App Router: thư mục `app/` chỉ chứa **route và layout**, phần còn lại chia theo tính năng ở `features/`.

Cây dưới đây là kiến trúc đích của toàn bộ sản phẩm; các module nghiệp vụ được tạo theo từng task. Cây thực tế đã tổ chức cho M0-19 được mô tả tại mục 4.7.

```
frontend/
├── src/
│   ├── app/                                 # chỉ route và layout mỏng
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/                     # khu vực ứng dụng
│   │       ├── layout.tsx                   # CSS nhóm; AppShell theo task layout
│   │       ├── dashboard/page.tsx
│   │       ├── (reporter)/                  # REPORTER: /, /new, /[id]
│   │       │   ├── layout.tsx               # ReporterShell và CSS Reporter
│   │       │   ├── page.tsx                 # / — báo cáo của tôi
│   │       │   ├── new/page.tsx             # /new — gửi báo cáo
│   │       │   └── [id]/page.tsx            # /[id] — chi tiết báo cáo
│   │       ├── alerts/                      # OPERATOR, COMMANDER
│   │       │   ├── page.tsx                 # hàng đợi cảnh báo
│   │       │   └── new/page.tsx             # nhập thủ công
│   │       ├── incidents/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx            # chi tiết, điều phối, timeline
│   │       ├── map/page.tsx
│   │       ├── units/page.tsx
│   │       ├── my-tasks/                    # RESPONDER
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── statistics/page.tsx
│   │       └── admin/
│   │           ├── users/page.tsx
│   │           └── incident-types/page.tsx
│   │
│   ├── features/                            # logic và giao diện theo nghiệp vụ
│   │   ├── auth/
│   │   ├── reports/
│   │   ├── alerts/
│   │   ├── incidents/
│   │   ├── dispatch/
│   │   ├── units/
│   │   ├── map/
│   │   ├── notifications/
│   │   ├── statistics/
│   │   └── users/
│   │
│   ├── components/
│   │   ├── ui/                              # shadcn/ui
│   │   ├── layout/                          # Sidebar, Header, ConnectionBadge
│   │   └── common/                          # EmptyState, LoadingState, ConfirmDialog, ReasonDialog
│   │
│   ├── services/                           # I/O, API dùng chung
│   │   ├── incident-export.service.ts       # xuất CSV từ danh sách sự cố
│   │   └── api-client.ts                    # M1-13: token, làm mới khi gặp 401
│   ├── hooks/                              # hook dùng chung, độc lập feature
│   │   └── useKeyboardShortcut.ts
│   ├── lib/
│   │   ├── socket.ts                        # tạo kết nối socket.io-client
│   │   ├── query-client.ts
│   │   ├── query-keys.ts                    # khóa TanStack Query dùng chung
│   │   ├── permissions.ts                   # vai trò nào thấy menu/nút nào (chỉ để hiển thị)
│   │   ├── realtime/
│   │   │   ├── event-handlers.ts            # sự kiện socket -> làm mới dữ liệu nào
│   │   │   └── notify.ts                    # toast, âm báo
│   │   └── utils.ts
│   │
│   ├── providers/                           # QueryProvider, AuthProvider, SocketProvider
│   ├── stores/                              # Zustand: bộ lọc bản đồ, sự cố đang chọn, trạng thái kết nối
│   ├── types/                               # enum, API contract và kiểu dữ liệu chia sẻ
│   │   ├── enums.ts
│   │   ├── auth.ts                          # kiểu dữ liệu form xác thực
│   │   ├── incidents.ts                     # view model sự cố mẫu
│   │   ├── api.ts                           # kiểu response, phân trang, lỗi
│   │   └── socket-events.ts                 # kiểu payload sự kiện socket
│   └── middleware.ts                        # chặn route khi chưa đăng nhập
│
├── public/
├── Dockerfile
├── docker-compose.yml                       # chỉ có service frontend
├── .dockerignore
├── .env.example
├── components.json                          # cấu hình shadcn/ui
├── next.config.ts
├── postcss.config.mjs
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

### 4.1 Cấu trúc bên trong một feature

```
features/incidents/
├── components/        # IncidentTable, IncidentFilters, IncidentDetail, StatusBadge, Timeline
├── hooks/             # useIncidents, useIncident, useChangeIncidentStatus
├── schemas.ts         # Zod cho form
└── api.ts             # tùy chọn: API riêng feature, dùng services/api-client
```

### 4.2 Quy tắc giữ code gọn

1. `app/` chỉ chứa route, layout và gọi component từ `features/`. Không viết logic hay gọi API trực tiếp trong `page.tsx`.
2. Dữ liệu từ backend lấy bằng **TanStack Query** trong `hooks/`; trạng thái giao diện tạm thời (bộ lọc, mục đang chọn) dùng **Zustand**.
3. Component dùng `window` hoặc hook (bản đồ Leaflet, form, socket) ghi `"use client"`; Leaflet import bằng `next/dynamic` với `ssr: false`.
4. Một feature **không import trực tiếp** từ feature khác. Phần dùng chung đưa lên `components/common` hoặc `lib/`.
5. `permissions.ts` chỉ để ẩn/hiện menu và nút. Quyền thật do backend kiểm tra.
6. Nút hành động trên sự cố hiển thị theo `allowedActions` backend trả về, không tự viết luật chuyển trạng thái.
7. Kiểu API trong `src/types/` đồng bộ từ backend; khi backend đổi enum hay payload thì cập nhật cùng lúc. Kiểu form và view model được định nghĩa riêng, không coi là DTO của backend.
8. `src/services/` tập trung I/O dùng chung (API, xuất file), không import từ `features/` hoặc `components/`. `src/hooks/` chỉ chứa hook dùng chung; hook có nghiệp vụ nằm trong `features/<feature>/hooks/`. Kiểu dữ liệu chia sẻ nằm trong `src/types/`; kiểu props riêng của một component có thể đặt cùng component.

### 4.3 Route theo vai trò

| Route                           | Vai trò truy cập                                                    |
| ------------------------------- | ------------------------------------------------------------------- |
| `/login`, `/register`           | Chưa đăng nhập                                                      |
| `/`, `/new`                     | REPORTER (các vai trò khác cũng có thể gửi báo cáo)                 |
| `/alerts`, `/alerts/new`        | OPERATOR, COMMANDER                                                 |
| `/incidents`, `/incidents/[id]` | OPERATOR, COMMANDER, ADMIN (chỉ đọc); RESPONDER chỉ sự cố được giao |
| `/map`                          | OPERATOR, COMMANDER, ADMIN; RESPONDER chỉ sự cố được giao           |
| `/units`                        | OPERATOR, COMMANDER, ADMIN                                          |
| `/my-tasks`                     | RESPONDER                                                           |
| `/dashboard`, `/statistics`     | OPERATOR (cơ bản), COMMANDER, ADMIN                                 |
| `/notifications`                | Mọi vai trò                                                         |
| `/admin/*`                      | ADMIN                                                               |

Chi tiết quyền ở [`roles-permissions.md`](../00-requirements/roles-permissions.md).

---

### 4.4 Bộ UI theo Figma (M0-18)

Nguồn thiết kế: [SafeOps UI/UX](https://www.figma.com/design/WQxeppTQRrMD9dYijJctmV/SafeOps-UI-UX), gồm `01-Foundation` (`2:20`), `Display` (`38:2`) và `02-Components` (`2:21`).

- `src/app/globals.css`: token màu, typography Inter, kích thước, bo góc từ Figma và theme Tailwind/shadcn.
- `src/components/ui/`: primitives shadcn có theme SafeOps (Button, Input, Select, Badge, Dialog, Table, Toast).
- `src/components/layout/`: `Sidebar`, `Header`, `ConnectionBadge`; nhận trạng thái và callback qua props.
- `src/components/common/`: `ConnectionBanner`, `SeverityBadge`, `IncidentStatusBadge`, `DispatchDialog`, `IncidentQueueTable`. Modal nhận danh sách đơn vị từ bên gọi, không tự tính khoảng cách hay quyết định chuyển trạng thái.
- `src/features/design-system/`: dữ liệu mẫu và trang xem thử tại `/components`, truy cập trực tiếp cho phát triển; Dashboard không hiển thị liên kết đến thư viện trong sidebar hoặc trợ giúp. Dữ liệu mẫu chỉ dùng để kiểm tra giao diện, không gửi API và không mô phỏng kết nối Socket thật.
- `src/features/statistics/`: trang Dashboard tại `/` và `/dashboard`, gồm dữ liệu mẫu, thẻ KPI, sơ đồ điều hành, phân bố khu vực/SLA và bảng sự cố. Route chỉ import component của feature.

Thông số đã đọc trực tiếp từ Figma: font Inter; màu primary `#2563EB`; chữ chính `#0F172A`; chữ phụ `#475569`; border `#E2E8F0`; sidebar 256px, nền `#475569`, padding 16px/24px; header 64px; banner 40px; badge 100×25px, font 12/16px; modal 480px, padding 24px, radius 12px.

Badge giữ nguyên 9 kiểu hiển thị của Figma: `CANCELED`, `RESOLVED`, `PROCESSING`, `ASSIGNED`, `PENDING`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. Đây là **visual variants**, không phải enum nghiệp vụ. `IncidentStatusBadge` nhận trạng thái API hiện tại: `NEW`/`CONFIRMED` dùng màu pending, `DISPATCHED` dùng màu assigned, `IN_PROGRESS` dùng màu processing, `RESOLVED`/`CLOSED` dùng màu resolved, `CANCELLED` dùng màu canceled; chữ vẫn phản ánh trạng thái thật. Các nút nghiệp vụ của `DispatchDialog` hiển thị theo `allowedActions` do bên gọi cung cấp.

Figma MCP đã trả thiết kế chi tiết và ảnh đối chiếu cho Badge (`13:3`), Sidebar (`13:29`), Header (`14:34`), Banner (`14:38`), Modal (`25:78`) và Heading 1 (`3:25`). Table (`25:43`) được đối chiếu theo ảnh người dùng cung cấp sau khi MCP hết hạn mức: khung 1184×204px, radius 8px, nền trắng, padding ngoài 0, 4 hàng cao 51px, không có header hiển thị. Thứ tự cột: mã, tiêu đề, badge mức độ, badge trạng thái, thời gian và nút `Xác minh & Giao việc`. Khoảng cách cột và cỡ chữ được ước lượng theo ảnh; chưa đọc được giá trị từng cell từ MCP. Header vẫn có trong HTML ở dạng chỉ dành cho trình đọc màn hình. Bảng cuộn ngang trong vùng riêng trên màn hình hẹp.

`IncidentQueueTable` nhận dữ liệu và `allowedActions` từ bên gọi; chỉ hiện nút khi có `CONFIRM` hoặc `DISPATCH` và callback xử lý. Callback mở modal với đúng dòng được chọn; component không gọi API hoặc tự chuyển trạng thái. Thời gian ISO UTC được hiển thị theo `Asia/Ho_Chi_Minh`. Trong trang mẫu, 4 dòng lặp lại nội dung ảnh (`#INC-001`, `Báo cháy tầng hầm B2`, `CRITICAL`, `PENDING`, `10:45 - 09/11/2026`), mỗi dòng có ID mẫu riêng. `PENDING` chỉ là nhãn minh họa Figma qua render prop; trạng thái API của dữ liệu mẫu vẫn là `CONFIRMED`.

Nội dung page Display mới được kiểm tra ở mức cấu trúc, chưa xác nhận khớp hình ảnh các màn hình.

### 4.5 Dashboard theo CSS người dùng cung cấp

Nguồn bổ sung: file `Pasted text.txt` có frame `Admin Dashboard` (1280×1983px), do người dùng gửi. Bố cục dùng nền `#FAF8FF`, surface trắng, border `#C3C6D7`, primary `#004AC6`; header 56px, banner 33px, sidebar 256px, nội dung padding/gap 20px. Dashboard dùng CSS riêng có phạm vi, giữ nguyên token và giao diện mặc định của thư viện `/components`. Header/Sidebar có biến thể dashboard và slot nội dung; Badge, Button, Table, ConnectionBadge, ConnectionBanner, DispatchDialog tiếp tục dùng chung. Theo yêu cầu cập nhật của người dùng, Dashboard bỏ khối xem thử điều phối nhúng và nút dẫn đến khối đó; thao tác trên từng hàng sự cố vẫn mở `DispatchDialog`.

File CSS có hình học và một số tên layer, thiếu phần lớn nội dung text, dữ liệu và đường vector. Nội dung còn thiếu được bổ sung bằng fixture minh họa; sơ đồ SVG tái hiện blueprint và pin, không phải Leaflet hay bản đồ địa lý thật. Layer, zoom, chọn pin, tìm kiếm, lọc, xuất CSV và xem chi tiết hoạt động cục bộ. Không gọi API, không mở socket, không gửi lệnh hay thay đổi dữ liệu nghiệp vụ.

Tên frame `Admin Dashboard` là tên thiết kế, không cấp quyền nghiệp vụ cho vai trò `ADMIN`. Profile mẫu theo CSS là `COMMANDER` (SOC Lead Commander); `allowedActions` trong fixture điều khiển nút điều phối của bản xem thử. Khi tích hợp xác thực/API, `ADMIN` chỉ đọc sự cố và không được điều phối theo ma trận quyền; backend vẫn kiểm tra quyền. Không suy diễn quyền từ tên trang. Trạng thái API được giữ trong dữ liệu; nhãn PROCESSING/ASSIGNED/PENDING chỉ dùng làm visual variant tương ứng trên bản thiết kế.

Trang Dashboard responsive: thu gọn sidebar trên mobile, KPI chia 2/1 cột, map và phân bố xếp dọc, bảng cuộn trong vùng riêng. Không ép chiều cao 1983px khi nội dung hoặc viewport thay đổi. Bộ công cụ M0-10 (ESLint, Prettier, Husky, lint-staged, pnpm workspace) giữ nguyên.

Frontend dùng pnpm workspace và lockfile gốc; Dockerfile tương lai phải truy cập được các file gốc cần thiết. Chạy local bằng `pnpm --dir frontend dev`; kiểm tra bằng `pnpm lint`, `pnpm --dir frontend typecheck`, `pnpm --dir frontend build`. Docker chưa được khởi tạo trong phần việc UI này.

---

### 4.6 Giao diện đăng nhập / đăng ký

Nguồn: CSS frame `Xác thực tài khoản` (1280×1062px) do người dùng gửi, nền `#F0F6FD`, font Inter, header/footer padding ngang 48px, nội dung hai cột cách 56px. Cột giới thiệu có headline 38/46px và 3 thẻ tính năng tối đa 576px; thẻ đăng ký khoảng 461px, padding 36px, radius 16px, input 42px, nút chính 48px. Trang đăng nhập dùng cùng bố cục và ngôn ngữ hình ảnh; nội dung chữ chưa có trong CSS được bổ sung theo nghiệp vụ SafeOps.

- Route mỏng `src/app/(auth)/login/page.tsx` và `register/page.tsx`, layout auth dùng CSS có phạm vi trong `src/features/auth/auth.css`.
- `src/features/auth/components/`: khung giới thiệu, form chung và trường mật khẩu. Dùng Button, Input, Label, Dialog hiện có; không thay đổi Dashboard hoặc thư viện component.
- `src/features/auth/validation.ts`: kiểm tra email, họ tên, số điện thoại tùy chọn (ERD cho phép null), mật khẩu đăng ký tối thiểu 8 ký tự có số và ký tự đặc biệt theo file thiết kế, đồng ý điều khoản. Mật khẩu đăng nhập chỉ kiểm tra bắt buộc, không áp chính sách tạo mật khẩu lên tài khoản hiện hữu.
- Đăng ký công khai tương ứng `REPORTER` (FR-AUTH-04), không có lựa chọn tự cấp vai trò. Form đăng ký vẫn chỉ kiểm tra dữ liệu và chưa tạo tài khoản. M1-13 nối form đăng nhập qua lớp trung gian Auth của Next.js; backend local hiện chưa có module auth nên chỉ đăng nhập thật khi cấu hình backend có Auth. Không lưu mật khẩu/token vào browser storage. Điều hướng và bảo vệ route theo vai trò thuộc các task tiếp theo.
- Google Workspace, quên mật khẩu và nội dung điều khoản chưa có hợp đồng API/cấu hình; giao diện mở thông tin hỗ trợ, không mô phỏng đăng nhập SSO hoặc gửi email đặt lại mật khẩu. Khi tích hợp backend, dùng API Auth và TanStack Query theo quy chuẩn dự án; backend tiếp tục kiểm tra dữ liệu và quyền.
- Mobile ưu tiên form trước cột giới thiệu; hỗ trợ bàn phím, nhãn trường, lỗi liên kết qua `aria-describedby`, ẩn/hiện mật khẩu và chuyển giữa `/login` / `/register`.

### 4.7 Route group (M0-19)

Task M0-19 yêu cầu đủ sáu tầng `app`, `features`, `components`, `services`, `hooks`, `types`. Cây hiện thực sau khi hoàn thiện phần tổ chức kiến trúc:

```text
src/
├── app/
│   ├── (auth)/                  # layout, login/page, register/page
│   ├── (dashboard)/             # layout, page (/), dashboard/page
│   └── components/page.tsx      # thư viện UI cho phát triển
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/useAuthForm.ts
│   │   ├── validation.ts
│   │   └── auth.css
│   ├── statistics/
│   │   ├── components/
│   │   ├── hooks/useIncidentFilters.ts
│   │   ├── fixtures.ts
│   │   └── dashboard.css
│   ├── reports/                 # components, hooks, fixtures, validation, reporter.css
│   ├── map/                     # Leaflet, danh sách, bộ lọc, popup, fixture
│   └── design-system/           # components, fixtures
├── components/                 # ui, common, layout
├── services/                   # incident-export, image-attachments, report-draft, geolocation
├── hooks/                      # useKeyboardShortcut, useImageAttachments
├── types/                      # auth, incidents, reports, uploads, map, geo, api, enums, ui
└── lib/                        # utils, search, map/geometry
```

`useAuthForm` quản lý state, validation, submit và focus lỗi của form mẫu; component giữ phần hiển thị. `useIncidentFilters` quản lý tìm kiếm/lọc trong dữ liệu fixture. `useKeyboardShortcut` gom cơ chế phím tắt dùng chung. `incident-export.service` nhận dữ liệu qua type chung, tạo/tải CSV và thu hồi Object URL; component không trực tiếp thao tác Blob/DOM tải file. Các phần này được sử dụng trong giao diện hiện tại, không tạo thư mục rỗng.

`types/api.ts` mô tả response đơn, phân trang và lỗi theo API contract. Type của form auth và view model Dashboard được tách khỏi `validation.ts`/`fixtures.ts`. Enum API giữ nguyên. M1-13 bổ sung `services/api-client.ts` (factory HTTP), `auth-session.ts` (store phiên trong bộ nhớ), `auth.service.ts` (singleton `apiClient`, điều phối refresh/login/logout), `providers/AuthProvider.tsx` và `hooks/useAuth.ts`. AuthContext chỉ giữ phiên; cache dữ liệu nghiệp vụ vẫn thuộc TanStack Query khi tích hợp các feature.

- Root `app/layout.tsx` giữ HTML/body, Inter, `globals.css` và Toaster.
- `app/(auth)/layout.tsx` dùng `AuthShell` và import `features/auth/auth.css`; chứa `/login`, `/register`.
- `app/(dashboard)/layout.tsx` import `features/statistics/dashboard.css`; chứa `/` tại `(dashboard)/page.tsx` và `/dashboard` tại `(dashboard)/dashboard/page.tsx`. Hai page chỉ gọi `AdminDashboard`, giữ nguyên URL và nội dung.
- `app/components/page.tsx` nằm ngoài hai nhóm, tiếp tục phục vụ trang phát triển `/components` và dùng CSS chung.
- Tên group không xuất hiện trong URL. Mỗi URL có đúng một file page; không giữ bản sao tại `app/page.tsx` hoặc `app/dashboard/page.tsx` sau khi di chuyển.
- Phân tách group là tổ chức layout và mã nguồn. API/Auth hiện chưa tích hợp; bảo vệ route và AppShell theo vai trò được triển khai trong các task xác thực/layout tiếp theo. Sidebar/Header hiện do `AdminDashboard` quản lý để tránh lặp giao diện.

### 4.8 Giao diện Reporter theo ba file CSS Figma

Nguồn người dùng cung cấp: frame `Trang chủ/Web` (1280×1441), `Bổ sung chi tiết` (1280×1768.5), `Tạo báo cáo` (1280×1340.42). Trang danh sách có sidebar 256px, header 56px, hero đỏ, 4 thẻ thống kê, bộ lọc và 3 card/trang. Trang tạo/chi tiết dùng header rộng, nội dung hai cột, nền sáng, card radius 12px, badge 100×25px. CSS có phạm vi `.reporter-*`; giữ Dashboard và bộ UI hiện tại.

- Route mỏng trong `app/(dashboard)/(reporter)/`: `layout.tsx` dùng `ReporterShell`, `page.tsx` cho danh sách, `new/page.tsx` cho tạo báo cáo, `[id]/page.tsx` cho chi tiết và bổ sung. Layout dùng sidebar cho danh sách, header rộng cho trang con như file thiết kế. Đây là bố cục UI, chưa là phân quyền.
- `features/reports/`: components, hooks, fixture, validation, CSS và trình bày trạng thái. Types tại `types/reports.ts`, `types/uploads.ts`; hook ảnh dùng chung tại `hooks/useImageAttachments.ts`; service chọn ảnh/nháp tại `services/`.
- Dữ liệu là fixture của một Reporter mẫu. Tìm kiếm hỗ trợ tiếng Việt không dấu, lọc trạng thái/loại/ngày, phân trang và xem chi tiết. `allowedActions` mẫu điều khiển bổ sung/đánh giá, không suy diễn quyền từ status. Backend sau này phải áp phạm vi `own`; UI chưa gọi API.
- Nhãn PENDING/PROCESSING/ASSIGNED là trình bày Figma; enum nghiệp vụ hiện tại được giữ nguyên. Mức độ trên form là đề xuất hỗ trợ của người báo cáo, không ấn định priority chính thức (BR-13). Chưa thêm trường/endpoint API ngoài hợp đồng hiện hành.
- Bổ sung minh chứng và đánh giá xuất hiện trong thiết kế nhưng hợp đồng API hiện chưa mô tả thao tác tương ứng cho Reporter. Bản UI chỉ kiểm tra nội dung và hiển thị phản hồi mẫu, không sửa sự cố/nhật ký hoặc gửi đến SOC. Bổ sung API/RBAC phải là phần việc riêng khi tích hợp.
- Chỉ ảnh JPEG/PNG/WebP, tối đa 5 ảnh và 5MB/ảnh theo BR-10, không nhận video như một số label trong CSS. File được chọn chỉ xem trước bằng Object URL, thu hồi khi xóa/unmount; không hiển thị tiến độ upload giả. Backend phải kiểm tra lại nội dung file khi tích hợp.
- Lưu/khôi phục nháp là thao tác chủ động trong sessionStorage, chỉ lưu nội dung và vị trí, không lưu file ảnh. Submit hợp lệ mở bản kiểm tra thông tin và thông báo rõ chưa gửi thật. GPS chỉ được gọi khi người dùng bấm định vị; xử lý từ chối/timeout. Sơ đồ khuôn viên và thumbnail là SVG minh họa vì CSS không chứa asset gốc; chưa thay thế Leaflet của FR-ALERT-01.
- Chi tiết bỏ số điện thoại người báo cáo theo BR-09. Hotline chưa cấu hình nên hiển thị hướng dẫn liên hệ đơn vị, không dùng số điện thoại giả. Màn hình mobile xếp cột dọc và thu gọn sidebar.

### 4.9 Bản đồ OPERATOR theo CSS Figma

Nguồn: file CSS frame `Bản đồ leaflet` (1280×1024), sidebar 240px, danh sách 370px và canvas bản đồ 670px, giao diện chiến thuật tối. Route `/map` tại `app/(dashboard)/map/page.tsx` gọi màn hình trong `features/map/`. Module gồm components, hooks, fixture, trình bày trạng thái và CSS có phạm vi `operator-map-*`; type dùng chung tại `types/map.ts`, hàm gom cụm/lọc không phụ thuộc React tại `lib/map/`.

Leaflet 1.9.4 stable được import bằng `next/dynamic` với `ssr: false` trong Client Component. Khởi tạo map trong effect, hủy map/layer/listener/ResizeObserver khi unmount. Canvas dùng Leaflet thật cho pan, zoom, fit bounds, marker và gom cụm theo khoảng cách pixel; số đếm cụm lấy từ fixture thật đang hiển thị. Tâm mặc định TP.HCM `[10.7625, 106.6600]`. Zoom lớn tách cụm để truy cập từng marker.

Nền chiến thuật là SVG khuôn viên minh họa được georeference trên Leaflet; chế độ tối giản dùng cùng sơ đồ với màu sáng, không phải ảnh vệ tinh. Chế độ đường phố dùng tile OpenStreetMap qua HTTPS và giữ attribution; có phản hồi khi tile không tải được. Chỉ đường phố cần truy cập tile ngoài, chế độ chiến thuật không phụ thuộc mạng.

Tìm kiếm không dấu, lọc ưu tiên/loại/trạng thái/bán kính, chuyển danh sách sự cố/lực lượng, chọn card hoặc marker và bật/tắt lớp lực lượng hoạt động trên fixture. Bán kính dùng khoảng cách địa lý để lọc giao diện, không dùng để suy diễn gợi ý điều phối. Gợi ý lực lượng/khoảng cách là dữ liệu mẫu do bên gọi cung cấp; tích hợp thật phải dùng API gợi ý từ backend. Nhãn PENDING/ASSIGNED/PROCESSING là visual variant, enum API không đổi. Nút điều phối hiển thị theo `allowedActions`, dùng lại `DispatchDialog`; hủy yêu cầu lý do. Không gửi lệnh, không chuyển trạng thái thật, không mở Socket.IO hoặc giả lập thông báo đã phát từ SOC.

Sidebar chỉ hiển thị chức năng của OPERATOR, không cấp menu quản trị tài khoản/danh mục của ADMIN dù CSS có tên mục này. Xác thực và guards backend còn thuộc phần tích hợp. Mobile thu gọn sidebar và chuyển giữa danh sách/bản đồ; popup co thành thẻ dưới bản đồ, container tự cập nhật kích thước khi đổi chế độ. Dashboard và Reporter giữ nguyên màn hình đã có.

Mục Bản đồ trực tuyến trong sidebar Dashboard dẫn đến `/map`; khối sơ đồ minh họa trên Dashboard vẫn giữ nguyên.

## 5. Docker: mỗi bên tự chạy riêng

|                       | Backend                                                             | Frontend                    |
| --------------------- | ------------------------------------------------------------------- | --------------------------- |
| Thư mục               | `backend/`                                                          | `frontend/`                 |
| Lệnh chạy             | `docker compose up --build`                                         | `docker compose up --build` |
| Service trong compose | `db` (PostgreSQL), `backend`                                        | `frontend`                  |
| Cổng                  | `3001` (API + Socket.IO), `5432` (DB)                               | `3000`                      |
| Địa chỉ               | `http://localhost:3001/api/v1`, Swagger `http://localhost:3001/api` | `http://localhost:3000`     |

### 5.1 `backend/docker-compose.yml` (mẫu)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: .
      target: development
    ports:
      - '3001:3001'
    env_file: .env
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      CHOKIDAR_USEPOLLING: 'true' # hot reload ổn định trên Windows
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
    command: npm run start:dev

volumes:
  pgdata:
```

### 5.2 `frontend/docker-compose.yml` (mẫu)

```yaml
services:
  frontend:
    build:
      context: .
      target: development
    ports:
      - '3000:3000'
    env_file: .env
    environment:
      WATCHPACK_POLLING: 'true' # hot reload ổn định trên Windows
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
```

### 5.3 `Dockerfile` (cả hai bên theo cùng khuôn)

Dùng một Dockerfile nhiều giai đoạn: `development` (cài thư viện, chạy chế độ phát triển) và `production` (build rồi chạy bản build). Khi làm việc hằng ngày chỉ cần giai đoạn `development`; giai đoạn `production` để dành cho lúc nộp/demo.

### 5.4 Chạy backend và frontend riêng nhưng nói chuyện được với nhau

- Frontend gọi backend từ **trình duyệt**, nên dùng địa chỉ `localhost`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`, `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`.
- Backend cho phép origin của frontend: `CORS_ORIGIN=http://localhost:3000`.
- Frontend muốn làm việc khi chưa có backend thì dùng dữ liệu giả (mock) theo `docs/04-api/api-contract.md`; khi backend sẵn sàng chỉ đổi biến môi trường.
- Hai compose chạy độc lập, không dùng chung mạng Docker, nên **không cần** cấu hình thêm gì khác.

### 5.5 Mẹo khi dùng Docker trên Windows

- Giữ mã nguồn trong thư mục của chính máy (ví dụ `C:\Users\...`) thay vì thư mục đồng bộ qua mạng để hot reload nhanh hơn.
- Nếu hot reload không chạy, kiểm tra hai biến `CHOKIDAR_USEPOLLING` và `WATCHPACK_POLLING` ở trên.
- Chạy migration và seed trong container: `docker compose exec backend npm run migration:run` và `docker compose exec backend npm run seed`.
- Nếu cổng `5432` đã bị PostgreSQL cài sẵn trên máy chiếm, đổi thành `"5433:5432"` ở dịch vụ `db`.

---

## 6. Biến môi trường

### 6.1 Backend (`backend/.env.example`)

| Biến                                                | Ý nghĩa                                               |
| --------------------------------------------------- | ----------------------------------------------------- |
| `PORT`                                              | Cổng backend (mặc định 3001)                          |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Khởi tạo và kết nối cơ sở dữ liệu                     |
| `DATABASE_URL`                                      | Chuỗi kết nối (compose tự ghép khi chạy trong Docker) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`           | Khóa ký token                                         |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`                 | Thời hạn token (ví dụ `15m`, `7d`)                    |
| `ALERT_API_KEY`                                     | Khóa cho nguồn cảnh báo tự động và script giả lập     |
| `CORS_ORIGIN`                                       | Origin của frontend (REST và Socket.IO)               |
| `UPLOAD_DIR`                                        | Thư mục lưu ảnh                                       |
| `SLA_CHECK_INTERVAL_SECONDS`                        | Chu kỳ kiểm tra SLA (mặc định 30)                     |

### 6.2 Frontend (`frontend/.env.example`)

| Biến                     | Ý nghĩa                                           |
| ------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Địa chỉ API, ví dụ `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Địa chỉ Socket.IO, ví dụ `http://localhost:3001`  |

Không commit file `.env`. Mọi biến mới phải được thêm vào `.env.example` (và `env.validation.ts` ở backend).

---

## 7. Script thường dùng

**Backend** (chạy trong `backend/`, thay `npm` bằng `pnpm` nếu nhóm dùng pnpm):

| Lệnh                                                 | Việc làm                                           |
| ---------------------------------------------------- | -------------------------------------------------- |
| `npm run start:dev`                                  | Chạy chế độ phát triển (compose đã gọi sẵn)        |
| `npm run lint` / `npm run test` / `npm run test:e2e` | Lint, kiểm thử đơn vị, kiểm thử e2e                |
| `npm run migration:generate -- <tên>`                | Sinh migration mới                                 |
| `npm run migration:run`                              | Chạy migration                                     |
| `npm run seed`                                       | Nạp dữ liệu mẫu                                    |
| `npm run simulate`                                   | Chạy `scripts/simulate-alerts.ts` bắn cảnh báo giả |

**Frontend** (chạy trong `frontend/`):

| Lệnh                             | Việc làm                                    |
| -------------------------------- | ------------------------------------------- |
| `npm run dev`                    | Chạy chế độ phát triển (compose đã gọi sẵn) |
| `npm run lint` / `npm run build` | Lint, build kiểm tra                        |

---

## 8. Quy ước đặt tên

| Đối tượng           | Quy ước                                                                    | Ví dụ                                         |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| File và thư mục     | `kebab-case`                                                               | `incident-attachment.entity.ts`               |
| Hậu tố file backend | `.module`, `.controller`, `.service`, `.entity`, `.dto`, `.guard`, `.spec` | `create-incident.dto.ts`                      |
| Component React     | `PascalCase`, tên file trùng tên component                                 | `IncidentTable.tsx`                           |
| Hook                | `useXxx`                                                                   | `useIncidents.ts`                             |
| Bảng DB             | `snake_case`, số nhiều                                                     | `incident_logs`, `dispatches`                 |
| Enum                | Tên `PascalCase`, giá trị `UPPER_SNAKE_CASE`                               | `IncidentStatus.IN_PROGRESS`                  |
| Endpoint REST       | Tiền tố `/api/v1`, danh từ số nhiều, `kebab-case`                          | `/api/v1/incident-types`                      |
| Sự kiện socket      | `đối-tượng.hành-động`                                                      | `dispatch.assigned`                           |
| Nhánh git           | `feature/<mô-tả-ngắn>`                                                     | `feature/dispatch-create`                     |
| Commit              | Conventional Commits                                                       | `feat(dispatch): kiểm tra lực lượng sẵn sàng` |

Trong frontend dùng alias `@/` trỏ tới `src/`, không dùng đường dẫn tương đối dài kiểu `../../../`.

---

## 9. Bản đồ yêu cầu → nơi hiện thực

| Nhóm yêu cầu                   | Backend (module)                                        | Frontend (feature / route)                               |
| ------------------------------ | ------------------------------------------------------- | -------------------------------------------------------- |
| FR-AUTH (xác thực, người dùng) | `auth`, `users`                                         | `auth` / `/login`, `/register`                           |
| FR-ALERT (tiếp nhận cảnh báo)  | `alerts`, `uploads`                                     | `reports` / `/`, `/new`, `/[id]`; `alerts` / `/alerts/*` |
| FR-INC (sự cố)                 | `incidents`, `uploads`, `incident-logs`                 | `incidents` / `/incidents/*`                             |
| FR-UNIT (lực lượng)            | `units`                                                 | `units` / `/units`                                       |
| FR-DISP (điều phối)            | `dispatch`                                              | `dispatch` (dùng trong `/incidents/[id]`), `/my-tasks/*` |
| FR-MAP (bản đồ)                | `incidents`, `units` (dữ liệu)                          | `map` / `/map`                                           |
| FR-RT (thời gian thực)         | `realtime`                                              | `providers/SocketProvider`, `lib/realtime/`              |
| FR-NOTI (thông báo)            | `notifications`                                         | `notifications` / `/notifications`                       |
| FR-DASH (thống kê)             | `statistics`, `sla`                                     | `statistics` / `/dashboard`, `/statistics`               |
| FR-LOG (nhật ký)               | `incident-logs`                                         | Timeline trong `incidents`                               |
| FR-ADMIN (quản trị)            | `users`, `incident-types`, `database/seeds`, `scripts/` | `users` / `/admin/*`                                     |

---

## 10. Thứ tự dựng khung đề xuất

1. **Cả hai bên:** tạo dự án, `Dockerfile`, `docker-compose.yml`, `.env.example`; kiểm tra `docker compose up` chạy được.
2. **Backend:** `config`, `database` (migration đầu), `common`, `users`, `auth` kèm `RolesGuard`.
3. **Chốt hợp đồng:** viết `docs/03-database/erd.md` và `docs/04-api/api-contract.md` trước khi hai bên làm song song.
4. **Frontend:** layout, đăng nhập, `api-client`, `permissions`, `SocketProvider` (kết nối rỗng), dùng dữ liệu giả theo hợp đồng API.
5. **Backend:** `incident-types`, `alerts`, `incidents`, `incident-logs`; **frontend:** `reports`, `alerts`, `incidents`.
6. **Backend:** `units`, `dispatch`, `realtime`; **frontend:** `units`, `dispatch`, `map`, `my-tasks`.
7. **Cả hai:** `notifications`, `sla`, `statistics`, `uploads`.
8. Seed dữ liệu mẫu, script giả lập cảnh báo, chạy thử kịch bản demo ở `overview.md` mục 9.
