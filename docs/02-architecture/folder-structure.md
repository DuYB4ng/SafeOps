# Cấu trúc thư mục dự án SafeOps

**Đọc file này khi:** tạo file mới, quyết định đặt mã ở đâu, hoặc cần biết chạy backend/frontend như thế nào.

**Liên quan:** [`incident-state-machine.md`](incident-state-machine.md), [`realtime-events.md`](realtime-events.md), [`overview.md`](../00-requirements/overview.md).

## 1. Nguyên tắc (giữ đơn giản)

1. **Hai ứng dụng độc lập** trong cùng một repo: `apps/backend` (NestJS) và `apps/frontend` (Next.js). Mỗi bên có `package.json`, `Dockerfile`, `docker-compose.yml`, `.env` riêng và **tự chạy được độc lập**.
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
│
├── apps/
│   ├── backend/                  # NestJS, tự chạy docker compose riêng
│   └── frontend/                 # Next.js, tự chạy docker compose riêng
│
└── docs/
    ├── 00-requirements/          # overview, roles-permissions, user-stories
    ├── 01-srs/                   # srs.md (Đặc tả yêu cầu phần mềm chuẩn)
    ├── 02-architecture/          # folder-structure, incident-state-machine, realtime-events
    ├── 03-database/              # erd.md
    └── 04-api/                   # api-contract.md
```

**Ghi chú về `AGENTS.md` và `.agent/`:**

- Theo tài liệu Antigravity tôi đã tra, tên file chuẩn dùng chung giữa các công cụ là **`AGENTS.md`** (có chữ **S**). Trong ảnh của bạn hiện là `AGENT.md`; nên đổi tên, rồi mở phần Customizations/Rules trong ứng dụng để kiểm tra agent đã nhận.
- Thư mục `.agent/rules/` (số ít) là tên cũ nhưng vẫn được hỗ trợ; tên mới là `.agents/rules/`. Giữ `.agent/` như hiện tại là được, đừng tạo cả hai.
- Chỉ các file `.md` nằm **trực tiếp** trong `rules/` được nạp, không đặt thư mục con.
- Đừng đặt `AGENTS.md` bên trong `apps/backend` hay `apps/frontend`: quy tắc riêng của từng bên hãy viết thành file trong `.agent/rules/` (ví dụ `backend-nestjs.md`, `frontend-nextjs.md`).

---

## 3. Backend (`apps/backend`)

Theo cách tổ chức phổ biến của NestJS: **chia theo tính năng (module)**, phần dùng chung đặt ở `common`, cấu hình ở `config`, cơ sở dữ liệu ở `database`.

```
apps/backend/
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

## 4. Frontend (`apps/frontend`)

Theo cách tổ chức phổ biến của Next.js App Router: thư mục `app/` chỉ chứa **route và layout**, phần còn lại chia theo tính năng ở `features/`.

```
apps/frontend/
├── src/
│   ├── app/                                 # chỉ route và layout mỏng
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (app)/                           # khu vực sau đăng nhập
│   │       ├── layout.tsx                   # sidebar, header
│   │       ├── dashboard/page.tsx
│   │       ├── reports/                     # REPORTER
│   │       │   ├── page.tsx                 # báo cáo của tôi
│   │       │   └── new/page.tsx             # gửi báo cáo
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
│   ├── lib/
│   │   ├── api-client.ts                    # gắn token, làm mới khi gặp 401
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
│   ├── types/                               # bản sao enum và kiểu dữ liệu từ backend
│   │   ├── enums.ts
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
└── api.ts             # các hàm gọi REST của nghiệp vụ này
```

### 4.2 Quy tắc giữ code gọn

1. `app/` chỉ chứa route, layout và gọi component từ `features/`. Không viết logic hay gọi API trực tiếp trong `page.tsx`.
2. Dữ liệu từ backend lấy bằng **TanStack Query** trong `hooks/`; trạng thái giao diện tạm thời (bộ lọc, mục đang chọn) dùng **Zustand**.
3. Component dùng `window` hoặc hook (bản đồ Leaflet, form, socket) ghi `"use client"`; Leaflet import bằng `next/dynamic` với `ssr: false`.
4. Một feature **không import trực tiếp** từ feature khác. Phần dùng chung đưa lên `components/common` hoặc `lib/`.
5. `permissions.ts` chỉ để ẩn/hiện menu và nút. Quyền thật do backend kiểm tra.
6. Nút hành động trên sự cố hiển thị theo `allowedActions` backend trả về, không tự viết luật chuyển trạng thái.
7. `src/types/` là bản sao; khi backend đổi enum hay payload thì cập nhật ở đây cùng lúc.

### 4.3 Route theo vai trò

| Route                           | Vai trò truy cập                                                    |
| ------------------------------- | ------------------------------------------------------------------- |
| `/login`, `/register`           | Chưa đăng nhập                                                      |
| `/reports`, `/reports/new`      | REPORTER (các vai trò khác cũng có thể gửi báo cáo)                 |
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

## 5. Docker: mỗi bên tự chạy riêng

|                       | Backend                                                             | Frontend                    |
| --------------------- | ------------------------------------------------------------------- | --------------------------- |
| Thư mục               | `apps/backend`                                                      | `apps/frontend`             |
| Lệnh chạy             | `docker compose up --build`                                         | `docker compose up --build` |
| Service trong compose | `db` (PostgreSQL), `backend`                                        | `frontend`                  |
| Cổng                  | `3001` (API + Socket.IO), `5432` (DB)                               | `3000`                      |
| Địa chỉ               | `http://localhost:3001/api/v1`, Swagger `http://localhost:3001/api` | `http://localhost:3000`     |

### 5.1 `apps/backend/docker-compose.yml` (mẫu)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: .
      target: development
    ports:
      - "3001:3001"
    env_file: .env
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      CHOKIDAR_USEPOLLING: "true" # hot reload ổn định trên Windows
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

### 5.2 `apps/frontend/docker-compose.yml` (mẫu)

```yaml
services:
  frontend:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      WATCHPACK_POLLING: "true" # hot reload ổn định trên Windows
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

### 6.1 Backend (`apps/backend/.env.example`)

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

### 6.2 Frontend (`apps/frontend/.env.example`)

| Biến                     | Ý nghĩa                                           |
| ------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Địa chỉ API, ví dụ `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Địa chỉ Socket.IO, ví dụ `http://localhost:3001`  |

Không commit file `.env`. Mọi biến mới phải được thêm vào `.env.example` (và `env.validation.ts` ở backend).

---

## 7. Script thường dùng

**Backend** (chạy trong `apps/backend`, thay `npm` bằng `pnpm` nếu nhóm dùng pnpm):

| Lệnh                                                 | Việc làm                                           |
| ---------------------------------------------------- | -------------------------------------------------- |
| `npm run start:dev`                                  | Chạy chế độ phát triển (compose đã gọi sẵn)        |
| `npm run lint` / `npm run test` / `npm run test:e2e` | Lint, kiểm thử đơn vị, kiểm thử e2e                |
| `npm run migration:generate -- <tên>`                | Sinh migration mới                                 |
| `npm run migration:run`                              | Chạy migration                                     |
| `npm run seed`                                       | Nạp dữ liệu mẫu                                    |
| `npm run simulate`                                   | Chạy `scripts/simulate-alerts.ts` bắn cảnh báo giả |

**Frontend** (chạy trong `apps/frontend`):

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
| FR-ALERT (tiếp nhận cảnh báo)  | `alerts`, `uploads`                                     | `reports` / `/reports/*`; `alerts` / `/alerts/*`         |
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
