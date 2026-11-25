# Quy tắc 30: Thiết kế & Quản trị Cơ sở Dữ liệu TypeORM (Database Rules)

**Áp dụng cho:** Thư mục `apps/backend/src/database/` và các file `*.entity.ts`.  
**Tham chiếu tài liệu:** [`docs/03-database/erd.md`](../../docs/03-database/erd.md), [`docs/02-architecture/folder-structure.md`](../../docs/02-architecture/folder-structure.md).

---

## 1. Nguyên Tắc Cốt Lõi: CẤM SYNCHRONIZE

1. **Tuyệt đối cấm `synchronize: true`:**  
   Trong file cấu hình kết nối TypeORM (`database.config.ts`), thuộc tính `synchronize` **bắt buộc luôn là `false`** ở mọi môi trường (kể cả Local Dev).
2. **100% thay đổi lược đồ qua Migration:**  
   Mọi thay đổi bảng, cột, khóa ngoại hoặc index đều phải tạo file Migration có phiên bản kiểm soát bằng Git.

### Lệnh Migration chuẩn với `pnpm`:
```bash
# 1. Sinh migration tự động từ chênh lệch giữa Entity và Database
pnpm migration:generate -- src/database/migrations/<TênMigration>

# 2. Thực thi migration vào database
pnpm migration:run

# 3. Hoàn tác migration gần nhất nếu có lỗi
pnpm migration:revert

# 4. Nạp dữ liệu mẫu ban đầu
pnpm seed
```

---

## 2. Tiêu Chuẩn Thiết Kế Entity

### 2.1 Base Entity Kế thừa
Tất cả Entity nghiệp vụ đều kế thừa từ `BaseEntity` (`src/common/entities/base.entity.ts`):

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
```

*Ngoại lệ:* Bảng `incident_logs` là nhật ký bất biến (FR-LOG-02, BR-03), **không có** `updated_at` và `deleted_at`.

### 2.2 Quy ước Đặt tên & Kiểu Dữ liệu
- **Tên bảng:** `snake_case`, danh từ số nhiều: `@Entity('incidents')`, `@Entity('dispatches')`.
- **Tên cột:** Thuộc tính code là `camelCase`, tên cột database là `snake_case`:
  ```typescript
  @Column({ name: 'incident_type_id', type: 'uuid' })
  incidentTypeId: string;
  ```
- **Tọa độ địa lý:** Sử dụng kiểu số thực chính xác cao:
  ```typescript
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;
  ```
- **Thời gian:** Bắt buộc dùng `type: 'timestamptz'` để đảm bảo lưu trữ chuẩn UTC (NFR-10).
- **Khóa lạc quan:** Bắt buộc có `@VersionColumn({ default: 1 }) version: number` trên các bảng `incidents`, `dispatches`, `units` để ngăn chặn xung đột cập nhật đồng thời.

---

## 3. Khóa Ngoại & Quan Hệ (Relationships)

1. **Luôn chỉ định rõ `@JoinColumn({ name: '...' })`:**  
   Không để TypeORM tự suy diễn tên cột khóa ngoại.
2. **Ràng buộc an toàn `onDelete: 'RESTRICT'`:**  
   Mặc định không dùng `CASCADE` xóa, nhằm tránh mất dữ liệu liên đới không kiểm soát được:
   ```typescript
   @ManyToOne(() => IncidentType, { onDelete: 'RESTRICT' })
   @JoinColumn({ name: 'incident_type_id' })
   incidentType: IncidentType;
   ```
3. **Phạm vi quan hệ:**  
   Chỉ định nghĩa quan hệ hai chiều (`@OneToMany`) khi thực sự cần thiết truy vấn từ thực thể cha. Tránh eager loading tự động (`eager: true`) trên các quan hệ lớn để tránh làm chậm truy vấn.

---

## 4. Thiết Lập Chỉ Mục (Indexing)

Ngoài Primary Key và Unique Key, phải đánh Index cho các cột thường xuyên tìm kiếm và lọc:

1. **Composite Index cho hàng đợi và danh sách:**
   ```typescript
   // Lọc hàng đợi cảnh báo mới theo thời gian
   @Index('IDX_alerts_status_received', ['status', 'receivedAt'])
   // Lọc sự cố theo mức ưu tiên và trạng thái
   @Index('IDX_incidents_priority_status', ['priority', 'status'])
   ```
2. **Partial Index (Chỉ mục có điều kiện):**  
   Dùng cho thuật toán tìm kiếm sự cố trùng lặp lân cận (FR-ALERT-07):
   ```sql
   CREATE INDEX "IDX_alerts_new_location" 
   ON "alerts" ("incident_type_id", "latitude", "longitude", "received_at") 
   WHERE "status" = 'NEW';
   ```

---

## 5. Dữ Liệu Mẫu (Seed Data)

Tệp seed `src/database/seeds/seed.ts` được chạy bằng `pnpm seed` để chuẩn bị dữ liệu demo cho kịch bản MVP:
1. **5 Loại sự cố:** `SECURITY`, `FIRE`, `MEDICAL`, `INFRASTRUCTURE`, `OTHER`.
2. **5 Đội lực lượng:** Tổ bảo vệ A, Tổ bảo vệ B, Xe PCCC 1, Tổ y tế, Tổ kỹ thuật (tọa độ tại TP.HCM).
3. **11 Tài khoản mẫu:** Đầy đủ các vai trò với mật khẩu băm chuẩn `{Role}@123` (ví dụ: `Admin@123`, `Operator@123`).
