# SafeOps — Enterprise Safety & Operations Management System

> **Hệ thống Quản lý và Điều phối Sự cố An ninh theo Thời gian thực (Đề tài G1.1)**

SafeOps là giải pháp nền tảng web tích hợp thời gian thực phục vụ Trung tâm Điều hành An ninh (SOC) cho các khu công nghiệp, khu đô thị hoặc khuôn viên quy mô lớn.

---

## 1. Công nghệ Sử dụng (Tech Stack)

| Tầng | Công nghệ |
|---|---|
| **Backend** | NestJS, TypeScript, PostgreSQL 16, TypeORM (Migration only), Socket.IO |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Leaflet |
| **Giao thức** | RESTful API (`/api/v1`), WebSocket (`/socket.io`) |
| **Quản lý gói** | `pnpm` |
| **Môi trường** | Docker & Docker Compose |

---

## 2. Cấu trúc Dự án

```
SafeOps/
├── .agent/rules/        # Quy tắc phát triển cho AI Agent
├── AGENTS.md            # Bản đồ điều hướng và quy tắc AI Agent
├── README.md            # Hướng dẫn dự án
│
├── apps/
│   ├── backend/         # NestJS Server (Cổng 3001, Swagger: /api)
│   └── frontend/        # Next.js Web App (Cổng 3000)
│
└── docs/
    ├── 00-requirements/ # Yêu cầu nghiệp vụ, vai trò, User Stories
    ├── 01-srs/          # Đặc tả yêu cầu phần mềm chi tiết (srs.md)
    ├── 02-architecture/ # Cấu trúc thư mục, máy trạng thái, Socket.IO events
    ├── 03-database/     # Thiết kế CSDL TypeORM (erd.md)
    └── 04-api/          # Hợp đồng REST API (api-contract.md)
```

---

## 3. Cổng & Dịch vụ Mặc định

| Dịch vụ | Địa chỉ | Ghi chú |
|---|---|---|
| **Frontend Web** | `http://localhost:3000` | Giao diện người dùng Next.js |
| **Backend API** | `http://localhost:3001/api/v1` | API chính thức |
| **Swagger Docs** | `http://localhost:3001/api` | Tài liệu API tương tác |
| **Socket.IO** | `http://localhost:3001` | Cổng kết nối realtime |
| **PostgreSQL DB** | `localhost:5432` | CSDL chính (Database: `safeops`) |

---

## 4. Tài khoản Kiểm thử Mặc định (Seed Data)

Mật khẩu chung cho môi trường phát triển: `{Role}@123`

| Email | Vai trò | Mô tả |
|---|---|---|
| `admin@safeops.local` | `ADMIN` | Quản trị hệ thống, người dùng, danh mục |
| `commander@safeops.local` | `COMMANDER` | Chỉ huy / Trưởng ca điều hành SOC |
| `operator1@safeops.local` | `OPERATOR` | Điều phối viên trực tiếp nhận cảnh báo |
| `responder.security1@safeops.local` | `RESPONDER` | Lực lượng bảo vệ (Tổ bảo vệ A) |
| `responder.fire@safeops.local` | `RESPONDER` | Lực lượng PCCC (Xe PCCC 1) |
| `responder.medical@safeops.local` | `RESPONDER` | Lực lượng y tế (Tổ y tế) |
| `reporter1@safeops.local` | `REPORTER` | Người báo cáo sự cố (Cư dân / Nhân viên) |

---

## 5. Hướng dẫn Khởi chạy (Quick Start)

### Yêu cầu tiên quyết:
- Đã cài đặt **Docker** và **Docker Compose**
- Hoặc cài đặt **Node.js 20+** và **pnpm** (`npm install -g pnpm`)

### Khởi chạy với Docker:
```bash
# 1. Chạy Backend & Database
cd apps/backend
docker compose up --build

# 2. Chạy Frontend
cd ../frontend
docker compose up --build
```
