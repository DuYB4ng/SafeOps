# Quy tắc 00: Bối cảnh Dự án & Nguyên tắc Cốt lõi (Project Context)

**Áp dụng cho:** Tất cả AI Agent và lập trình viên làm việc trên SafeOps.  
**Tham chiếu tài liệu:** [`docs/00-requirements/`](../../docs/00-requirements/), [`docs/01-srs/srs.md`](../../docs/01-srs/srs.md), [`docs/02-architecture/`](../../docs/02-architecture/).

---

## 1. Thông tin Đề tài & Bối cảnh

- **Tên dự án:** SafeOps — Hệ thống Quản lý và Điều phối Sự cố An ninh theo Thời gian thực (Đề tài G1.1).
- **Bối cảnh vận hành:** Phục vụ Trung tâm Điều hành An ninh (SOC) tại khu công nghiệp, khu đô thị hoặc khuôn viên quy mô lớn với nhiều lực lượng chuyên trách (Bảo vệ, PCCC, Y tế, Kỹ thuật).
- **Mục tiêu sản phẩm:** Tiếp nhận cảnh báo đa nguồn → Thẩm định, phân loại, xác định vị trí → Gợi ý và điều phối lực lượng → Giám sát diễn biến thời gian thực trên bản đồ → Lưu vết nhật ký bất biến & Báo cáo thống kê.

---

## 2. Vai trò Hệ thống (5 Roles)

Tuyệt đối tuân thủ 5 vai trò hệ thống (FR-AUTH-03), mỗi tài khoản chỉ có duy nhất 1 vai trò:
1. `REPORTER`: Người báo cáo (cư dân, nhân viên). Gửi báo cáo kèm ảnh, tọa độ; theo dõi trạng thái báo cáo của mình.
2. `OPERATOR`: Điều phối viên trung tâm SOC. Thẩm định cảnh báo, phát hiện trùng lặp, khởi tạo sự cố, giao lệnh điều phối, đôn đốc SLA.
3. `RESPONDER`: Lực lượng ứng trực hiện trường. Bắt buộc thuộc 1 lực lượng (`unitId`). Tiếp nhận lệnh, cập nhật lộ trình (`EN_ROUTE` → `ON_SCENE` → `DONE`), gửi ảnh hiện trường.
4. `COMMANDER`: Chỉ huy / Trưởng ca. Giám sát toàn cục, can thiệp điều phối, phê duyệt đóng sự cố, mở lại sự cố (`REOPEN`), xử lý vi phạm SLA.
5. `ADMIN`: Quản trị viên hệ thống. Quản trị người dùng, phân vai trò, quản lý danh mục loại sự cố.

---

## 3. Máy Trạng Thái Cốt Lõi (State Machines)

Hệ thống vận hành xoay quanh 4 máy trạng thái có mối liên hệ mật thiết:

```
1. Cảnh báo (Alert):
   NEW ──> CONFIRMED (tạo Incident) / DISMISSED (có lý do) / MERGED (vào Incident khác)

2. Sự cố (Incident):
   NEW ──> CONFIRMED ──> DISPATCHED ──> IN_PROGRESS ──> RESOLVED ──> CLOSED
      └──> CANCELLED (từ bất kỳ trạng thái nào trước RESOLVED, bắt buộc có lý do)
      * RESOLVED/CLOSED ──> CONFIRMED (Mở lại sự cố, chỉ COMMANDER, có lý do)

3. Lệnh điều phối (Dispatch):
   ASSIGNED ──> ACCEPTED ──> EN_ROUTE ──> ON_SCENE ──> DONE
      ├──> DECLINED (từ chối tại ASSIGNED, bắt buộc có lý do)
      └──> CANCELLED (thu hồi lệnh, bắt buộc có lý do)

4. Lực lượng (Unit):
   AVAILABLE <──> BUSY (tự động khi có/hết lệnh hoạt động)
   AVAILABLE <──> OFFLINE (thủ công khi vào/hết ca trực)
```

---

## 4. Nguyên Tắc Bất Di Bất Dịch (Golden Rules)

1. **Docs là nguồn chân lý (Single Source of Truth):**  
   Mọi logic code phải tuân thủ nghiêm ngặt tài liệu trong `docs/`. Nếu phát hiện mâu thuẫn giữa code và tài liệu, **phải cập nhật tài liệu trước**, sau đó mới sửa code.
2. **Backend kiểm soát toàn bộ nghiệp vụ (Backend-driven):**  
   - Frontend **không** tự viết logic kiểm tra điều kiện chuyển trạng thái. Backend trả về danh sách `allowedActions`, Frontend chỉ việc render UI theo danh sách đó.
   - Mọi kiểm tra phân quyền (RBAC) thực hiện tại Backend Guards (FR-AUTH-05).
3. **Không xóa cứng (Soft Delete Only):**  
   Các thực thể cốt lõi (`alerts`, `incidents`, `dispatches`, `units`, `users`) sử dụng xóa mềm (`deleted_at`). Không bao giờ dùng `DELETE` SQL trực tiếp (BR-03).
4. **Nhật ký bất biến (Immutable Audit Log):**  
   Bảng `incident_logs` chỉ được phép `INSERT`, không bao giờ được `UPDATE` hoặc `DELETE` (FR-LOG-02, NFR-04).
5. **Đồng bộ hóa 2 tầng (REST + Socket.IO):**  
   REST là nơi ghi dữ liệu và xác thực. Socket.IO chỉ gửi tín hiệu sự kiện thông báo thay đổi với payload tối giản. Khi nhận sự kiện, client tự gọi REST để làm mới dữ liệu (NFR-06).
6. **Công nghệ & Công cụ chuẩn:**  
   - Package manager: Bắt buộc dùng `pnpm` (không dùng npm hay yarn).
   - Backend: NestJS + TypeORM + PostgreSQL 16.
   - Frontend: Next.js (App Router) + Tailwind CSS + shadcn/ui + TanStack Query.
   - Container: Docker & Docker Compose độc lập cho từng service.
