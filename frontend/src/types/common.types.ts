export type UserRole = 'ADMIN' | 'OPERATOR' | 'SECURITY' | 'REPORTER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'PENDING' | 'ASSIGNED' | 'PROCESSING' | 'RESOLVED' | 'CANCELED';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
