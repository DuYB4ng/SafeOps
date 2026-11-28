import type { ApiErrorResponse, ApiResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorResponse['details'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | null;
  auth?: boolean;
  notify?: boolean;
};

type ClientOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
  getAccessToken?: () => string | null;
  getRevision?: () => number;
  refreshAccessToken?: () => Promise<string>;
  onUnauthorized?: () => void;
  onError?: (error: ApiError) => void;
};

export function createApiClient(options: ClientOptions) {
  async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
    const { auth = true, notify = true, ...requestInit } = init;
    // Only relative API paths are accepted so a caller cannot leak a Bearer token to another host.
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
      throw new ApiError(0, 'INVALID_API_PATH', 'Đường dẫn API không hợp lệ.');
    }
    const url = `${options.baseUrl.replace(/\/$/, '')}${path}`;
    const revision = options.getRevision?.();
    const assertCurrentSession = () => {
      if (auth && options.getRevision && revision !== options.getRevision()) {
        throw new ApiError(401, 'SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
      }
    };
    const token = auth ? options.getAccessToken?.() : null;
    const send = async (accessToken?: string | null) => {
      const headers = new Headers(requestInit.headers);
      if (auth) {
        headers.delete('Authorization');
        if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return (options.fetcher ?? fetch)(url, {
        ...requestInit,
        headers,
        // Business API uses Bearer auth. HttpOnly refresh cookies stay on /api/auth.
        credentials: options.baseUrl === '/api/auth' ? 'same-origin' : 'omit',
        cache: 'no-store',
      });
    };
    try {
      let response = await send(token);
      let retried = false;
      assertCurrentSession();
      if (response.status === 401 && auth && options.refreshAccessToken) {
        const current = options.getAccessToken?.();
        const renewed = current && current !== token ? current : await options.refreshAccessToken();
        assertCurrentSession();
        response = await send(renewed);
        retried = true;
        assertCurrentSession();
      }
      if (response.status === 204 && response.ok) return undefined as T;
      const payload: unknown = await response.json().catch(() => null);
      assertCurrentSession();
      if (!response.ok) {
        if (retried && response.status === 401) options.onUnauthorized?.();
        const error = payload as Partial<ApiErrorResponse> | null;
        throw new ApiError(
          response.status,
          typeof error?.code === 'string' ? error.code : 'HTTP_ERROR',
          typeof error?.message === 'string'
            ? error.message
            : `Yêu cầu thất bại (${response.status}).`,
          error?.details,
        );
      }
      if (!payload || typeof payload !== 'object' || !('data' in payload)) {
        throw new ApiError(
          response.status,
          'INVALID_RESPONSE',
          'Phản hồi từ máy chủ không hợp lệ.',
        );
      }
      return (payload as ApiResponse<T>).data;
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') throw cause;
      const error =
        cause instanceof ApiError
          ? cause
          : new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối máy chủ. Vui lòng thử lại.');
      if (notify && error.code !== 'SESSION_CHANGED') options.onError?.(error);
      throw error;
    }
  }
  return { request };
}
