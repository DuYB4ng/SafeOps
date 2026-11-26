import type { SidebarItem } from '@/components/layout/Sidebar';
import type { UnitSuggestion } from '@/components/common/DispatchDialog';
import type { IncidentPriority, IncidentStatus } from '@/types/enums';
import type { IncidentQueueItem } from '@/components/common/IncidentQueueTable';

export const sidebarItems: readonly SidebarItem[] = [
  { id: 'overview', label: 'Tổng quan Dashboard', href: '#overview' },
  { id: 'status', label: 'Bản đồ trực tuyến', href: '#status' },
  { id: 'dispatch', label: 'Điều phối lực lượng', href: '#dispatch' },
  { id: 'controls', label: 'Quản trị hệ thống', href: '#controls' },
];

export const priorities: readonly IncidentPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const incidentStatuses: readonly IncidentStatus[] = [
  'NEW',
  'CONFIRMED',
  'DISPATCHED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
];

// Nhãn mẫu trong Figma, ID biểu diễn đơn vị. Không dùng các ID này gọi API.
export const unitSuggestions: readonly UnitSuggestion[] = [
  {
    id: 'demo-unit-a',
    label: 'Nguyễn Văn A (Đội phản ứng nhanh) — Cách 350m — Sẵn sàng',
    status: 'AVAILABLE',
  },
  {
    id: 'demo-unit-b',
    label: 'Trần Văn B (Bảo vệ ca trực) — Cách 1.2km — Sẵn sàng',
    status: 'AVAILABLE',
  },
];

// Bốn dòng lặp trong ảnh Figma; ID riêng để React và callback nhận đúng dòng.
export const incidentExamples: readonly IncidentQueueItem[] = Array.from(
  { length: 4 },
  (_, index) => ({
    id: `demo-incident-${index + 1}`,
    code: '#INC-001',
    title: 'Báo cháy tầng hầm B2',
    location: 'Tầng hầm B2',
    priority: 'CRITICAL',
    status: 'CONFIRMED',
    receivedAt: '2026-11-09T03:45:00.000Z',
    allowedActions: ['DISPATCH', 'CANCEL'],
  }),
);
