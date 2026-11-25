# SafeOps — AI Agent Guidelines & Project Map

Chào mừng AI Agent! Đây là hệ thống **SafeOps** (Quản lý và Điều phối Sự cố An ninh theo Thời gian thực - Đề tài G1.1).  
Trước khi thực hiện bất kỳ tác vụ đọc, sửa hoặc viết mã nguồn nào, bạn **bắt buộc** phải tuân thủ các tài liệu quy chuẩn sau:

---

## 1. Bản Đồ Quy Tắc AI Agent (`.agent/rules/`)

| File Rule | Nội dung cốt lõi |
|---|---|
| [`00-project-context.md`](.agent/rules/00-project-context.md) | Bối cảnh dự án, 5 vai trò hệ thống, 4 máy trạng thái, nguyên tắc bất biến |
| [`10-backend-nestjs.md`](.agent/rules/10-backend-nestjs.md) | Kiến trúc NestJS, DTO, ValidationPipe, mã lỗi chuẩn, transaction & locking |
| [`20-frontend-nextjs.md`](.agent/rules/20-frontend-nextjs.md) | Next.js App Router, phân tách `app/` vs `features/`, TanStack Query, Leaflet, shadcn/ui |
| [`30-database-typeorm.md`](.agent/rules/30-database-typeorm.md) | PostgreSQL 16, TypeORM, **cấm synchronize**, quy trình migration với `pnpm` |
| [`40-realtime-socketio.md`](.agent/rules/40-realtime-socketio.md) | Socket.IO, cấu trúc Room, danh mục sự kiện, payload tinh gọn, bảo mật Socket |
| [`50-security-rbac.md`](.agent/rules/50-security-rbac.md) | RBAC tại backend guards, che giấu SĐT người báo cáo (BR-09), an toàn upload file |
| [`60-git-testing.md`](.agent/rules/60-git-testing.md) | Nhánh git, quy chuẩn commit, kiểm thử đơn vị & luồng vàng e2e tối thiểu |

---

## 2. Bản Đồ Tài Liệu Kỹ Thuật (`docs/`)

- **Đặc tả Yêu cầu:**
  - [`docs/01-srs/srs.md`](docs/01-srs/srs.md): Đặc tả yêu cầu phần mềm đầy đủ (SRS chuẩn).
  - [`docs/00-requirements/overview.md`](docs/00-requirements/overview.md): Quy trình nghiệp vụ, phân loại & SLA.
  - [`docs/00-requirements/roles-permissions.md`](docs/00-requirements/roles-permissions.md): Ma trận phân quyền chi tiết.
  - [`docs/00-requirements/user-stories.md`](docs/00-requirements/user-stories.md): Danh mục User Story theo vai trò.
- **Kiến trúc & Kỹ thuật:**
  - [`docs/02-architecture/folder-structure.md`](docs/02-architecture/folder-structure.md): Cây thư mục dự án và quy ước đặt tên.
  - [`docs/02-architecture/incident-state-machine.md`](docs/02-architecture/incident-state-machine.md): Đặc tả chuyển trạng thái chi tiết và hàm suy diễn `deriveIncidentStatus`.
  - [`docs/02-architecture/realtime-events.md`](docs/02-architecture/realtime-events.md): Cơ chế Socket.IO và sự kiện domain.
- **Hợp đồng Dữ liệu & Giao diện:**
  - [`docs/03-database/erd.md`](docs/03-database/erd.md): Lược đồ CSDL vật lý (12 bảng), chỉ mục và dữ liệu mẫu (Seed).
  - [`docs/04-api/api-contract.md`](docs/04-api/api-contract.md): Hợp đồng toàn bộ REST API endpoint và format lỗi chuẩn.
- **Kế hoạch Thực thi:**
  - [`docs/05-plan/implementation-plan.md`](docs/05-plan/implementation-plan.md): Kế hoạch thực thi 4 tuần chi tiết cho 2 team (4 Backend, 2 Frontend).

---

## 3. Nguyên Tắc Làm Việc Bắt Buộc Của AI Agent

1. **Docs First:** Khi code mâu thuẫn với docs, sửa docs trước, sửa code sau.
2. **Backend Driven:** Frontend hiển thị nút hành động theo mảng `allowedActions` từ backend trả về.
3. **No Hard Delete:** Chỉ dùng Soft Delete (`deleted_at`), trừ khi được người dùng yêu cầu rõ ràng.
4. **Tooling:** Luôn dùng `pnpm` thay cho `npm`/`yarn`.
