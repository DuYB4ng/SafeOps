// docs/04-api/api-contract.md — mục 2: định dạng phản hồi chuẩn.
export type ApiResponse<T> = {
  statusCode: number;
  data: T;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginationMeta;
};

export type ApiErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
};
