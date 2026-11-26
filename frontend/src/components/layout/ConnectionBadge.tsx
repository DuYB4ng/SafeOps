import type { ConnectionStatus } from '@/types/ui';
import { cn } from '@/lib/utils';

const connectionLabels: Record<ConnectionStatus, string> = {
  connected: 'Đã kết nối',
  reconnecting: 'Đang kết nối lại',
  disconnected: 'Mất kết nối',
};

export function ConnectionBadge({
  status,
  className,
}: {
  status: ConnectionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn('connection-badge', className)}
      data-status={status}
      role="status"
      title={`Socket: ${connectionLabels[status]}`}
    >
      <span className="connection-dot" aria-hidden="true" />
      <span>Socket: {connectionLabels[status]}</span>
    </span>
  );
}
