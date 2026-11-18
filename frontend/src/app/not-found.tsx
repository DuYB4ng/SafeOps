import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive mb-4">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">404 — Không tìm thấy trang</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Đường dẫn bạn yêu cầu không tồn tại trên hệ thống điều hành an ninh SafeOps.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="default">Quay về Trung tâm chỉ huy</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Đăng nhập lại</Button>
        </Link>
      </div>
    </div>
  );
}
