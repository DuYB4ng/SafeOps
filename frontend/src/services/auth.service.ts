import { toast } from 'sonner';
import type { AccessTokenResponse, AuthUser, LoginRequest, LoginResponse } from '@/types/auth';
import { ApiError, createApiClient } from './api-client';
import { createAuthSession, type AuthSession } from './auth-session';

function reportError(error: ApiError) {
  toast.error(error.message, { id: `api-${error.code}` });
}

export function createAuthService({
  session = createAuthSession(),
  fetcher,
  notify = reportError,
  apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1',
}: {
  session?: AuthSession;
  fetcher?: typeof fetch;
  notify?: (error: ApiError) => void;
  apiUrl?: string;
} = {}) {
  const auth = createApiClient({ baseUrl: '/api/auth', fetcher });
  let refreshFlight: { revision: number; promise: Promise<string> } | null = null;
  let restoreFlight: Promise<void> | null = null;
  let loginFlight: Promise<AuthUser> | null = null;
  let logoutFlight: Promise<void> | null = null;
  let latestIssuedToken: string | null = null;
  function changed() {
    return new ApiError(401, 'SESSION_CHANGED', 'Phiên đăng nhập đã thay đổi.');
  }
  function refresh(): Promise<string> {
    const revision = session.getRevision();
    if (refreshFlight?.revision === revision) return refreshFlight.promise;
    const promise = auth
      .request<AccessTokenResponse>('/refresh', { method: 'POST', auth: false })
      .then((data) => {
        if (!data.accessToken || typeof data.accessToken !== 'string') {
          throw new ApiError(502, 'INVALID_RESPONSE', 'Phản hồi xác thực không hợp lệ.');
        }
        latestIssuedToken = data.accessToken;
        if (session.getRevision() !== revision) throw changed();
        session.setToken(data.accessToken, revision);
        return data.accessToken;
      })
      .catch((error: unknown) => {
        if (
          error instanceof ApiError &&
          [401, 403].includes(error.statusCode) &&
          error.code !== 'SESSION_CHANGED'
        ) {
          session.clear(revision);
        }
        throw error;
      })
      .finally(() => {
        if (refreshFlight?.promise === promise) refreshFlight = null;
      });
    refreshFlight = { revision, promise };
    return promise;
  }
  const api = createApiClient({
    baseUrl: apiUrl,
    fetcher,
    getAccessToken: () => session.getSnapshot().accessToken,
    getRevision: session.getRevision,
    refreshAccessToken: refresh,
    onUnauthorized: () => session.clear(),
    onError: notify,
  });
  async function loadUser(token: string, revision: number) {
    const user = await auth.request<AuthUser>('/me', {
      headers: { Authorization: `Bearer ${token}` },
      auth: false,
    });
    if (session.getRevision() !== revision) throw changed();
    session.authenticate(token, user, revision);
  }
  function restore() {
    if (logoutFlight) return logoutFlight.catch(() => undefined);
    if (loginFlight)
      return loginFlight.then(
        () => undefined,
        () => undefined,
      );
    if (restoreFlight) return restoreFlight;
    if (session.getSnapshot().status === 'authenticated') return Promise.resolve();
    const revision = session.begin();
    const promise = refresh()
      .then((token) => loadUser(token, revision))
      .catch((error: unknown) => {
        if (session.getRevision() !== revision) return;
        if (error instanceof ApiError && [401, 403].includes(error.statusCode))
          session.clear(revision);
        else
          session.fail(
            error instanceof Error ? error.message : 'Chưa thể khôi phục phiên đăng nhập.',
            revision,
          );
      })
      .finally(() => {
        if (restoreFlight === promise) restoreFlight = null;
      });
    restoreFlight = promise;
    return promise;
  }
  async function performLogin(values: LoginRequest) {
    // Invalidate stale state now, then finish older cookie rotations before login.
    const olderRefresh = refreshFlight?.promise;
    const pendingLogout = logoutFlight;
    const revision = session.begin();
    try {
      await restoreFlight;
      await olderRefresh?.catch(() => undefined);
      await pendingLogout?.catch(() => undefined);
      if (session.getRevision() !== revision) throw changed();
      const data = await auth.request<LoginResponse>('/login', {
        method: 'POST',
        auth: false,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      latestIssuedToken = data.accessToken;
      if (session.getRevision() !== revision) throw changed();
      session.authenticate(data.accessToken, data.user, revision);
      return data.user;
    } catch (error) {
      if (session.getRevision() === revision) session.clear(revision);
      if (error instanceof ApiError && error.code !== 'SESSION_CHANGED') notify(error);
      throw error;
    }
  }
  function login(values: LoginRequest) {
    if (loginFlight) return Promise.reject(new ApiError(409, 'AUTH_BUSY', 'Đang xử lý đăng nhập.'));
    const promise = performLogin(values).finally(() => {
      if (loginFlight === promise) loginFlight = null;
    });
    loginFlight = promise;
    return promise;
  }
  async function performLogout() {
    const token = session.getSnapshot().accessToken;
    const flight = refreshFlight?.promise;
    const pendingLogin = loginFlight;
    session.clear();
    // A late refresh response must not replace the cookie after logout clears it.
    await flight?.catch(() => undefined);
    await pendingLogin?.catch(() => undefined);
    try {
      await auth.request<void>('/logout', {
        method: 'POST',
        auth: false,
        headers:
          latestIssuedToken || token
            ? { Authorization: `Bearer ${latestIssuedToken ?? token}` }
            : {},
      });
    } catch (error) {
      if (error instanceof ApiError)
        notify(
          new ApiError(
            error.statusCode,
            'LOGOUT_FAILED',
            'Đã xóa phiên trên thiết bị. Chưa xác nhận được đăng xuất trên máy chủ.',
          ),
        );
      throw error;
    } finally {
      latestIssuedToken = null;
    }
  }
  function logout() {
    if (logoutFlight) return logoutFlight;
    const promise = performLogout().finally(() => {
      if (logoutFlight === promise) logoutFlight = null;
    });
    logoutFlight = promise;
    return promise;
  }
  return { session, api, login, logout, refresh, restore };
}

// This instance is consumed by client components. No tokens are persisted in browser storage.
export const authService = createAuthService();
export const apiClient = authService.api;
