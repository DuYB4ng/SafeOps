# Quy tắc 20: Phát triển Frontend Next.js (Frontend Rules)

**Áp dụng cho:** Thư mục `frontend/`.  
**Tham chiếu tài liệu:** [`docs/02-architecture/folder-structure.md`](../../docs/02-architecture/folder-structure.md), [`docs/02-architecture/realtime-events.md`](../../docs/02-architecture/realtime-events.md), [`docs/04-api/api-contract.md`](../../docs/04-api/api-contract.md).

---

## 1. Phân Tách Kiến Trúc: `app/` vs `features/`

Tuân thủ nguyên tắc **Feature-Driven Architecture** kết hợp Next.js App Router:

```
src/
├── app/                  # CHỈ chứa route và layout mỏng
│   ├── (auth)/login/page.tsx
│   └── (app)/incidents/[id]/page.tsx
├── features/             # CHỨA TOÀN BỘ logic theo từng phân hệ nghiệp vụ
│   ├── auth/
│   ├── alerts/
│   ├── incidents/
│   ├── dispatch/
│   ├── units/
│   └── map/
├── components/           # Components dùng chung (shadcn/ui, layout chung)
│   ├── ui/
│   ├── layout/
│   └── common/
├── lib/                  # api-client, query-keys, utils
├── providers/            # QueryProvider, AuthProvider, SocketProvider
├── stores/               # Zustand stores cho UI state
└── types/                # Types/Interfaces đồng bộ từ API Contract
```

### Quy tắc bất di bất dịch:
1. **`app/**/page.tsx` phải cực kỳ mỏng:** Tuyệt đối không viết logic fetch API, form state hay tính toán dữ liệu trong `page.tsx`. `page.tsx` chỉ import Component từ `features/` và truyền params.
2. **Không import chéo giữa các feature:** `features/incidents` không import trực tiếp từ `features/dispatch`. Nếu có component/hàm dùng chung, đưa lên `components/common/` hoặc `lib/`.

---

## 2. Cấu trúc một Feature Chuẩn

Mỗi feature trong `src/features/<tên-feature>/` có cấu trúc:

```
features/incidents/
├── components/           # IncidentTable.tsx, IncidentDetail.tsx, StatusBadge.tsx, IncidentTimeline.tsx
├── hooks/                # useIncidents.ts, useIncident.ts, useIncidentMutations.ts
├── schemas.ts            # Schema Zod cho validation form
└── api.ts                # Các hàm gọi REST API (axios/fetch)
```

---

## 3. Quản lý Dữ liệu: TanStack Query & Zustand

1. **Dữ liệu từ Máy chủ (Server State) → TanStack Query:**
   - Dùng hook `useQuery` để fetch danh sách, chi tiết.
   - Quản lý tập trung query key tại `lib/query-keys.ts`:
     ```typescript
     export const queryKeys = {
       incidents: {
         all: ['incidents'] as const,
         list: (filters: object) => ['incidents', 'list', filters] as const,
         detail: (id: string) => ['incidents', 'detail', id] as const,
       },
     };
     ```
   - Dùng `useMutation` cho thao tác POST, PATCH, DELETE. Sau khi mutation thành công, invalidate query tương ứng.
2. **Trạng thái Giao diện tạm thời (Client State) → Zustand:**
   - Chỉ dùng Zustand cho: Bộ lọc bản đồ, ID sự cố đang được chọn trên bản đồ, trạng thái mở/đóng sidebar, trạng thái kết nối Socket.
   - Tuyệt đối không lưu dữ liệu cache của API vào Zustand.

---

## 4. Hiển thị Giao diện theo Máy Trạng Thái (State Machine UI)

1. **Frontend không tự phán đoán luật chuyển trạng thái:**  
   Backend luôn trả về trường `allowedActions: string[]` (ví dụ: `["ACCEPT", "DECLINE"]` hoặc `["DISPATCH", "CANCEL"]`).
2. **Render nút hành động dựa trên `allowedActions`:**
   ```tsx
   {incident.allowedActions.includes('CANCEL') && (
     <Button variant="destructive" onClick={() => openReasonDialog('CANCEL')}>
       Hủy sự cố
     </Button>
   )}
   ```
3. **Các hành động yêu cầu lý do (BR-02):**  
   Khi bấm nút hủy/thu hồi/từ chối, bắt buộc mở `ReasonDialog` để người dùng nhập lý do trước khi gửi API.

---

## 5. Bản đồ Số Leaflet & Next.js SSR

1. Bản đồ Leaflet phụ thuộc vào `window`. Để tránh lỗi Hydration Error trong Next.js App Router, luôn import dynamic:
   ```tsx
   import dynamic from 'next/dynamic';

   const IncidentMap = dynamic(
     () => import('@/features/map/components/IncidentMap'),
     { ssr: false, loading: () => <MapSkeleton /> }
   );
   ```
2. Mọi component Leaflet đều phải có khai báo `"use client"` ở đầu file.
3. Tọa độ tâm bản đồ mặc định đặt theo khu vực TP.HCM (`[10.7625, 106.6600]`).

---

## 6. Giao diện Người dùng (UI/UX) với Tailwind CSS & shadcn/ui

1. **Hệ thống Design:** Dùng toàn bộ component chuẩn từ `shadcn/ui` (Button, Dialog, Badge, Table, Form, DropdownMenu, Toast).
2. **Phân vùng giao diện theo vai trò:**
   - `REPORTER`: Ưu tiên giao diện tối giản, nút to, form gửi báo cáo nhanh kèm chọn vị trí, thân thiện với màn hình di động.
   - `RESPONDER`: Màn hình "Việc của tôi" (`/my-tasks`) với các nút trạng thái to rõ (`ĐÃ ĐẾN`, `HOÀN THÀNH`), hỗ trợ chụp ảnh trực tiếp.
   - `OPERATOR` & `COMMANDER`: Giao diện Dashboard màn hình rộng, tối ưu hiển thị danh sách hàng đợi, bản đồ chia đôi màn hình (Split view).
3. **Trạng thái kết nối Socket (ConnectionBadge):**  
   Luôn hiển thị huy hiệu trạng thái tại Header: Xanh lá (Đã kết nối) / Vàng (Đang kết nối lại) / Đỏ (Mất kết nối).
