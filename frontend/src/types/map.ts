import type { IncidentPriority, IncidentStatus, UnitStatus } from '@/types/enums';
import type { GeoPoint } from '@/types/geo';

export type MapIncidentType = 'FIRE' | 'SECURITY' | 'INFRASTRUCTURE' | 'MEDICAL' | 'OTHER';
export type MapIncident = GeoPoint & {
  id: string;
  code: string;
  title: string;
  description: string;
  location: string;
  category: MapIncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  receivedAt: string;
  clusterable: boolean;
  allowedActions: readonly string[];
  suggestions: readonly { unitId: string; distanceLabel: string }[];
};

export type MapUnit = GeoPoint & {
  id: string;
  name: string;
  code: string;
  assignment: string;
  status: UnitStatus;
};

export type MarkerCluster = {
  incidents: MapIncident[];
  x: number;
  y: number;
};
