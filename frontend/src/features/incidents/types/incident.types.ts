import { IncidentSeverity, IncidentStatus } from '@/types';

export interface IncidentData {
  id: string;
  code: string;
  title: string;
  location: string;
  severity: IncidentSeverity;
  reportedAt: string;
}

export interface IncidentRecord extends IncidentData {
  status: IncidentStatus;
  reporter: string;
  description?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
}

export interface DispatchPayload {
  incidentId: string;
  severity: IncidentSeverity;
  officerId: string;
  notes?: string;
}

export interface Officer {
  id: string;
  name: string;
  team: string;
  distance: string;
  status: 'READY' | 'BUSY';
}
