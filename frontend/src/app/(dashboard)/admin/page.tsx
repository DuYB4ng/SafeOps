import { Metadata } from 'next';
import { Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống — SafeOps',
  description: 'Cấu hình hệ thống, phân quyền RBAC và kiểm toán',
};

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Quản trị Hệ thống</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý người dùng, phân quyền RBAC 4 vai trò và cấu hình thông số kỹ thuật SafeOps
        </p>
      </div>

      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
          <Settings className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold">Phân hệ Quản trị Admin</h3>
        <p className="max-w-md text-xs text-muted-foreground mt-1">
          Quản lý danh sách tài khoản, cấu hình ngưỡng cảnh báo khẩn cấp và xem nhật ký audit log
          toàn hệ thống (Milestone M6).
        </p>
      </div>
    </div>
  );
}
