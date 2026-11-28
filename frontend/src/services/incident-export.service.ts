import type { DashboardIncident } from '@/types/incidents';

// Chỉ thực thi ở trình duyệt khi người dùng yêu cầu tải báo cáo.
export function downloadIncidentReport(incidents: readonly DashboardIncident[]) {
  const rows = [
    ['Mã sự cố', 'Nội dung', 'Ưu tiên', 'Vị trí', 'Lực lượng', 'Trạng thái'],
    ...incidents.map((incident) => [
      incident.code,
      incident.title,
      incident.priority,
      incident.location,
      incident.unit ?? '',
      incident.status,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'safeops-su-co-mau.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
