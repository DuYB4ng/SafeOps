import { Badge } from '@/components/ui/badge';
import type { IncidentStatus } from '@/types/enums';

const statusVariants = {
  NEW: 'pending',
  CONFIRMED: 'pending',
  DISPATCHED: 'assigned',
  IN_PROGRESS: 'processing',
  RESOLVED: 'resolved',
  CLOSED: 'resolved',
  CANCELLED: 'canceled',
} as const satisfies Record<IncidentStatus, string>;

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
