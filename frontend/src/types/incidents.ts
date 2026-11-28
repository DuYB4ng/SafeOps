import type { IncidentPriority, IncidentStatus } from '@/types/enums';

// View model của Dashboard mẫu; giữ trạng thái API nhưng chưa phải DTO đầy đủ.
export type DashboardIncident = {
  id: string;
  code: string;
  title: string;
  source: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  location: string;
  area: string;
  unit: string | null;
  unitName: string | null;
  time: string;
  date: string;
  allowedActions: readonly string[];
};
