import type { IncidentPriority, IncidentStatus } from '@/types/enums';
import type { GeoPoint } from '@/types/geo';
export type { GeoPoint } from '@/types/geo';

export type ReportCategory = 'FIRE' | 'SECURITY' | 'MEDICAL' | 'INFRASTRUCTURE' | 'OTHER';
export type ReportScene = 'fire' | 'parking' | 'electrical';

// View model minh họa của Reporter, không phải DTO của API.
export type ReporterReport = GeoPoint & {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  priority: IncidentPriority | null;
  status: IncidentStatus;
  location: string;
  receivedAt: string;
  scene: ReportScene;
  unit: string | null;
  progress: number;
  supplementRequest?: string;
  allowedActions: readonly ('ADD_INFORMATION' | 'RATE')[];
};

export type ReportDraft = GeoPoint & {
  title: string;
  category: ReportCategory | '';
  priority: IncidentPriority;
  description: string;
  building: string;
  location: string;
};

export type ReportFormErrors = Partial<Record<'title' | 'description' | 'location', string>>;
