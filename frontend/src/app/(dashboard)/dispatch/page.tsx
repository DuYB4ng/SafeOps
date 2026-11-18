import { Metadata } from 'next';
import { Radio } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều phối lực lượng — SafeOps',
  description: 'Trung tâm điều phối phản ứng nhanh SafeOps',
};

export default function DispatchPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Điều phối Lực lượng Cơ động
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý ca trực, trạng thái sẵn sàng và lịch sử điều động chiến sĩ an ninh
        </p>
      </div>

      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
          <Radio className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold">Phân hệ Điều phối Nâng cao</h3>
        <p className="max-w-md text-xs text-muted-foreground mt-1">
          Hỗ trợ đàm thoại thời gian thực, giám sát lộ trình cơ động của lực lượng Security tại hiện
          trường (Milestone M4).
        </p>
      </div>
    </div>
  );
}
