import type { ConnectionStatus } from '@/types/ui';
import { cn } from '@/lib/utils';

export function ConnectionBanner({
  status,
  className,
}: {
  status: ConnectionStatus;
  className?: string;
}) {
  if (status === 'connected') return null;

  return (
    <div className={cn('safeops-banner', className)} role="status" data-figma-node="14:38">
      <span aria-hidden="true">⚠️</span>
      {status === 'reconnecting'
        ? 'Đang mất kết nối, đang thử lại...'
        : 'Mất kết nối. Vui lòng kiểm tra kết nối mạng.'}
    </div>
  );
}
