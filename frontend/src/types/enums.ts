// Bản sao enum từ docs/04-api/api-contract.md. Backend kiểm soát nghiệp vụ.
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  'NEW' | 'CONFIRMED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

export type UnitStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
