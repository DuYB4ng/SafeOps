import type { UnitSuggestion } from '@/components/common/DispatchDialog';
import type { DashboardIncident } from '@/types/incidents';

// Fixture của bản thiết kế COMMANDER, không dùng làm quyền hoặc dữ liệu API.
export const dashboardIncidents: readonly DashboardIncident[] = [
  {
    id: 'demo-inc-1024',
    code: 'INC-1024',
    title: 'Cảnh báo xâm nhập trái phép',
    source: 'Camera AI · CAM-A12',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: 'Tòa Landmark - Tầng 12',
    area: 'Khu A · Trung tâm',
    unit: 'Alpha 1',
    unitName: 'Nguyễn Văn A',
    time: '10:45:32',
    date: '09/11/2026',
    allowedActions: ['DISPATCH', 'CANCEL'],
  },
  {
    id: 'demo-inc-1023',
    code: 'INC-1023',
    title: 'Báo động cảm biến nhiệt độ kho hóa chất',
    source: 'Cảm biến IoT · IOT-B04',
    priority: 'HIGH',
    status: 'DISPATCHED',
    location: 'Kho hóa chất Zone B4',
    area: 'Khu B · Cụm công nghiệp',
    unit: 'PCCC 02',
    unitName: 'Trần Minh Tuấn',
    time: '10:42:18',
    date: '09/11/2026',
    allowedActions: ['DISPATCH', 'CANCEL'],
  },
  {
    id: 'demo-inc-1022',
    code: 'INC-1022',
    title: 'Cửa thoát hiểm chưa đóng kín',
    source: 'Báo cáo trực tiếp · Bảo vệ',
    priority: 'MEDIUM',
    status: 'CONFIRMED',
    location: 'Cổng an ninh số 3 - Sảnh Nam',
    area: 'Khu A · Trung tâm',
    unit: null,
    unitName: null,
    time: '10:38:05',
    date: '09/11/2026',
    allowedActions: ['DISPATCH', 'CANCEL'],
  },
  {
    id: 'demo-inc-1021',
    code: 'INC-1021',
    title: 'Kiểm tra định kỳ rào chắn hồng ngoại',
    source: 'Tuần tra · Báo cáo hiện trường',
    priority: 'LOW',
    status: 'RESOLVED',
    location: 'Khuôn viên kho Zone C - Rào 08',
    area: 'Khu C · Vành đai ngoài',
    unit: 'Bravo 04',
    unitName: 'Lê Quốc Huy',
    time: '10:25:46',
    date: '09/11/2026',
    allowedActions: [],
  },
];

export const dashboardUnits: readonly UnitSuggestion[] = [
  {
    id: 'demo-alpha-1',
    label: 'Nguyễn Văn A (Đội phản ứng nhanh) — Cách 350m — Sẵn sàng',
    status: 'AVAILABLE',
  },
  {
    id: 'demo-bravo-4',
    label: 'Trần Văn B (Bảo vệ ca trực) — Cách 1.2km — Sẵn sàng',
    status: 'AVAILABLE',
  },
];

export const areaBreakdown = [
  { name: 'Khu A · Trung tâm', count: 12, percent: 50, color: '#004ac6' },
  { name: 'Khu B · Công nghiệp', count: 6, percent: 25, color: '#6366f1' },
  { name: 'Khu C · Vành đai ngoài', count: 4, percent: 17, color: '#f59e0b' },
  { name: 'Khu D · Khu dân cư', count: 2, percent: 8, color: '#94a3b8' },
] as const;
