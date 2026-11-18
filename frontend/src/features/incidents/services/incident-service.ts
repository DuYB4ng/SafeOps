import { apiClient } from '@/services';
import { DispatchPayload, IncidentRecord } from '../types/incident.types';

export class IncidentService {
  public static async getIncidents(): Promise<IncidentRecord[]> {
    return apiClient.get<IncidentRecord[]>('/incidents');
  }

  public static async getIncidentById(id: string): Promise<IncidentRecord> {
    return apiClient.get<IncidentRecord>(`/incidents/${id}`);
  }

  public static async dispatchOfficer(payload: DispatchPayload): Promise<IncidentRecord> {
    return apiClient.post<IncidentRecord>(`/incidents/${payload.incidentId}/dispatch`, payload);
  }

  public static async rejectIncident(id: string, reason?: string): Promise<IncidentRecord> {
    return apiClient.post<IncidentRecord>(`/incidents/${id}/reject`, { reason });
  }
}
