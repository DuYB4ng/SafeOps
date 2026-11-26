import type { IncidentStatus } from '@/types/enums';

export const reportStatusPresentation = {
  NEW: { label: 'PENDING', variant: 'pending' },
  CONFIRMED: { label: 'PENDING', variant: 'pending' },
  DISPATCHED: { label: 'ASSIGNED', variant: 'assigned' },
  IN_PROGRESS: { label: 'PROCESSING', variant: 'processing' },
  RESOLVED: { label: 'RESOLVED', variant: 'resolved' },
  CLOSED: { label: 'RESOLVED', variant: 'resolved' },
  CANCELLED: { label: 'CANCELED', variant: 'canceled' },
} as const;

export const reportStatusFilters: readonly {
  id: string;
  label: string;
  statuses: readonly IncidentStatus[];
}[] = [
  { id: 'ALL', label: 'Tất cả', statuses: [] },
  { id: 'PENDING', label: 'Chờ xác minh', statuses: ['NEW', 'CONFIRMED'] },
  { id: 'PROCESSING', label: 'Đang xử lý', statuses: ['DISPATCHED', 'IN_PROGRESS'] },
  { id: 'RESOLVED', label: 'Đã giải quyết', statuses: ['RESOLVED', 'CLOSED'] },
  { id: 'CANCELLED', label: 'Đã hủy', statuses: ['CANCELLED'] },
];

export function formatReportTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hourCycle: 'h23',
  }).format(new Date(value));
}
