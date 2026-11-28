import type { IncidentStatus, UnitStatus } from '@/types/enums';

export const mapStatusLabels: Record<
  IncidentStatus,
  { label: string; variant: 'pending' | 'assigned' | 'processing' | 'resolved' | 'canceled' }
> = {
  NEW: { label: 'PENDING', variant: 'pending' },
  CONFIRMED: { label: 'PENDING', variant: 'pending' },
  DISPATCHED: { label: 'ASSIGNED', variant: 'assigned' },
  IN_PROGRESS: { label: 'PROCESSING', variant: 'processing' },
  RESOLVED: { label: 'RESOLVED', variant: 'resolved' },
  CLOSED: { label: 'CLOSED', variant: 'resolved' },
  CANCELLED: { label: 'CANCELED', variant: 'canceled' },
};
export const mapUnitLabels: Record<UnitStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  BUSY: 'Đang làm nhiệm vụ',
  OFFLINE: 'Ngoài ca trực',
};
