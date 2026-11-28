import { expect, test } from '@playwright/test';
import { createAuthService } from '../src/services/auth.service';
import { ApiError, createApiClient } from '../src/services/api-client';
import { createAuthSession } from '../src/services/auth-session';
import type { AuthUser } from '../src/types/auth';

const user: AuthUser = {
  id: 'user-1',
  email: 'reporter@example.com',
  fullName: 'Nguyễn An',
  role: 'REPORTER',
  unitId: null,
};
const ok = (data: unknown) => Response.json({ statusCode: 200, data });
const denied = () =>
  Response.json({ code: 'UNAUTHORIZED', message: 'Phiên đã hết hạn.' }, { status: 401 });
function signedIn() {
  const session = createAuthSession();
  session.authenticate('old', user, session.getRevision());
  return session;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test('parallel 401 requests share one refresh and replay with the new Bearer token', async () => {
  let refreshes = 0;
  const headers: string[] = [];
  const gate = deferred<void>();
  const session = signedIn();
  const fetcher: typeof fetch = async (input, init) => {
    if (String(input).endsWith('/auth/refresh')) {
      refreshes += 1;
      await gate.promise;
      return ok({ accessToken: 'new', expiresIn: 900 });
    }
    const bearer = new Headers(init?.headers).get('authorization') ?? '';
    headers.push(bearer);
    return bearer === 'Bearer new' ? ok({ title: 'Sự cố' }) : denied();
  };
  const service = createAuthService({ session, fetcher, notify: () => undefined });
  const requests = ['/incidents/1', '/incidents/2', '/incidents/3'].map((path) =>
    service.api.request(path),
  );
  await expect.poll(() => refreshes).toBe(1);
  gate.resolve();
  await expect(Promise.all(requests)).resolves.toHaveLength(3);
  expect(headers.filter((header) => header === 'Bearer new')).toHaveLength(3);
  expect(refreshes).toBe(1);
});

test('a late 401 reuses a token already refreshed by another request', async () => {
  let refreshes = 0;
  const late = deferred<Response>();
  const service = createAuthService({
    session: signedIn(),
    notify: () => undefined,
    fetcher: async (input, init) => {
      if (String(input).endsWith('/auth/refresh')) {
        refreshes += 1;
        return ok({ accessToken: 'new' });
      }
      if (new Headers(init?.headers).get('authorization') === 'Bearer new') return ok('done');
      return String(input).endsWith('/late') ? late.promise : denied();
    },
  });
  const pending = service.api.request('/late');
  await service.api.request('/first');
  late.resolve(denied());
  await expect(pending).resolves.toBe('done');
  expect(refreshes).toBe(1);
});

test('a second 401 ends the session without a refresh loop', async () => {
  let requests = 0;
  let refreshes = 0;
  const service = createAuthService({
    session: signedIn(),
    notify: () => undefined,
    fetcher: async (input) => {
      if (String(input).endsWith('/auth/refresh')) {
        refreshes += 1;
        return ok({ accessToken: 'new' });
      }
      requests += 1;
      return denied();
    },
  });
  await expect(service.api.request('/incidents')).rejects.toMatchObject({ statusCode: 401 });
  expect({ requests, refreshes }).toEqual({ requests: 2, refreshes: 1 });
  expect(service.session.getSnapshot().status).toBe('anonymous');
});

test('403 does not refresh; network failure during refresh does not erase a valid session', async () => {
  let mode: 'forbidden' | 'network' = 'forbidden';
  let refreshes = 0;
  const service = createAuthService({
    session: signedIn(),
    notify: () => undefined,
    fetcher: async (input) => {
      if (String(input).endsWith('/auth/refresh')) {
        refreshes += 1;
        throw new TypeError('offline');
      }
      return mode === 'forbidden'
        ? Response.json({ code: 'FORBIDDEN_ROLE', message: 'Không có quyền.' }, { status: 403 })
        : denied();
    },
  });
  await expect(service.api.request('/incidents')).rejects.toMatchObject({ statusCode: 403 });
  expect(refreshes).toBe(0);
  mode = 'network';
  await expect(service.api.request('/incidents')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  expect(service.session.getSnapshot().status).toBe('authenticated');
});

test('rejected refresh clears the session and failed login is never refreshed', async () => {
  let refreshes = 0;
  const service = createAuthService({
    session: signedIn(),
    notify: () => undefined,
    fetcher: async (input) => {
      if (String(input).endsWith('/auth/refresh')) refreshes += 1;
      return denied();
    },
  });
  await expect(service.api.request('/incidents')).rejects.toMatchObject({ statusCode: 401 });
  expect(service.session.getSnapshot().accessToken).toBeNull();
  await expect(service.login({ email: user.email, password: 'wrong' })).rejects.toMatchObject({
    statusCode: 401,
  });
  expect(refreshes).toBe(1);
});

test('reload restoration fetches the current user and distinguishes offline from anonymous', async () => {
  const paths: string[] = [];
  const service = createAuthService({
    notify: () => undefined,
    fetcher: async (input) => {
      paths.push(String(input));
      return String(input).endsWith('/refresh') ? ok({ accessToken: 'restored' }) : ok(user);
    },
  });
  await Promise.all([service.restore(), service.restore()]);
  expect(paths).toEqual(['/api/auth/refresh', '/api/auth/me']);
  expect(service.session.getSnapshot()).toMatchObject({
    status: 'authenticated',
    user,
    accessToken: 'restored',
  });
  const offline = createAuthService({
    notify: () => undefined,
    fetcher: async () => {
      throw new TypeError('offline');
    },
  });
  await offline.restore();
  expect(offline.session.getSnapshot().status).toBe('error');
  const anonymous = createAuthService({ notify: () => undefined, fetcher: async () => denied() });
  await anonymous.restore();
  expect(anonymous.session.getSnapshot().status).toBe('anonymous');
});

test('logout waits for an in-flight refresh and prevents a stale response from restoring the user', async () => {
  const gate = deferred<Response>();
  const paths: string[] = [];
  const service = createAuthService({
    session: signedIn(),
    notify: () => undefined,
    fetcher: async (input) => {
      paths.push(String(input));
      return String(input).endsWith('/refresh')
        ? gate.promise
        : new Response(null, { status: 204 });
    },
  });
  const refresh = service.refresh().catch((error: unknown) => error);
  const logout = service.logout();
  expect(service.session.getSnapshot().status).toBe('anonymous');
  expect(paths).toEqual(['/api/auth/refresh']);
  gate.resolve(ok({ accessToken: 'late' }));
  await logout;
  expect(await refresh).toMatchObject({ code: 'SESSION_CHANGED' });
  expect(paths).toEqual(['/api/auth/refresh', '/api/auth/logout']);
  expect(service.session.getSnapshot().accessToken).toBeNull();
});

test('an old request cannot invalidate a newly signed-in session', async () => {
  const late = deferred<Response>();
  const session = signedIn();
  let refreshes = 0;
  const service = createAuthService({
    session,
    notify: () => undefined,
    fetcher: async (input) => {
      if (String(input).endsWith('/refresh')) refreshes += 1;
      return late.promise;
    },
  });
  const request = service.api.request('/incidents').catch((error: unknown) => error);
  const revision = session.begin();
  session.authenticate('different-user-token', { ...user, id: 'user-2' }, revision);
  late.resolve(denied());
  expect(await request).toMatchObject({ code: 'SESSION_CHANGED' });
  expect(refreshes).toBe(0);
  expect(session.getSnapshot().user?.id).toBe('user-2');
});

test('a stale retry 401 cannot clear a newly signed-in user or show an obsolete Toast', async () => {
  const session = signedIn();
  const retry = deferred<Response>();
  const retryStarted = deferred<void>();
  let requests = 0;
  let notifications = 0;
  const service = createAuthService({
    session,
    notify: () => {
      notifications += 1;
    },
    fetcher: async (input) => {
      if (String(input).endsWith('/refresh')) return ok({ accessToken: 'refreshed' });
      if (++requests === 1) return denied();
      retryStarted.resolve();
      return retry.promise;
    },
  });
  const request = service.api.request('/incidents').catch((error: unknown) => error);
  await retryStarted.promise;
  const revision = session.begin();
  session.authenticate('new-user-token', { ...user, id: 'user-2' }, revision);
  retry.resolve(denied());
  expect(await request).toMatchObject({ code: 'SESSION_CHANGED' });
  expect(session.getSnapshot()).toMatchObject({
    status: 'authenticated',
    user: { id: 'user-2' },
    accessToken: 'new-user-token',
  });
  expect(notifications).toBe(0);
});

for (const status of [200, 204]) {
  test(`a stale ${status} response cannot deliver data after logout`, async () => {
    const session = signedIn();
    const response = deferred<Response>();
    let notifications = 0;
    const service = createAuthService({
      session,
      notify: () => {
        notifications += 1;
      },
      fetcher: async () => response.promise,
    });
    const request = service.api.request('/incidents').catch((error: unknown) => error);
    session.clear();
    response.resolve(
      status === 200 ? ok({ owner: 'user-1' }) : new Response(null, { status: 204 }),
    );
    expect(await request).toMatchObject({ code: 'SESSION_CHANGED' });
    expect(session.getSnapshot().status).toBe('anonymous');
    expect(notifications).toBe(0);
  });
}

test('a session change while reading JSON rejects the old payload', async () => {
  const session = signedIn();
  const bodyStarted = deferred<void>();
  const body = deferred<unknown>();
  const response = ok(null);
  response.json = () => {
    bodyStarted.resolve();
    return body.promise;
  };
  const service = createAuthService({
    session,
    notify: () => undefined,
    fetcher: async () => response,
  });
  const request = service.api.request('/incidents').catch((error: unknown) => error);
  await bodyStarted.promise;
  const revision = session.begin();
  session.authenticate('new-user-token', { ...user, id: 'user-2' }, revision);
  body.resolve({ statusCode: 200, data: { owner: 'user-1' } });
  expect(await request).toMatchObject({ code: 'SESSION_CHANGED' });
  expect(session.getSnapshot().user?.id).toBe('user-2');
});

test('logout during login revokes the newly issued session without restoring local identity', async () => {
  const gate = deferred<Response>();
  let loginStarted = false;
  let logoutToken = '';
  const service = createAuthService({
    notify: () => undefined,
    fetcher: async (input, init) => {
      if (String(input).endsWith('/login')) {
        loginStarted = true;
        return gate.promise;
      }
      logoutToken = new Headers(init?.headers).get('authorization') ?? '';
      return new Response(null, { status: 204 });
    },
  });
  const login = service
    .login({ email: user.email, password: 'Password@123' })
    .catch((error: unknown) => error);
  await expect.poll(() => loginStarted).toBe(true);
  const logout = service.logout();
  gate.resolve(ok({ accessToken: 'just-issued', user, expiresIn: 900 }));
  await logout;
  expect(await login).toMatchObject({ code: 'SESSION_CHANGED' });
  expect(logoutToken).toBe('Bearer just-issued');
  expect(service.session.getSnapshot().status).toBe('anonymous');
});

test('a new login waits for logout to finish so an older logout cannot erase its cookie', async () => {
  const gate = deferred<Response>();
  const paths: string[] = [];
  const service = createAuthService({
    session: signedIn(),
    notify: () => undefined,
    fetcher: async (input) => {
      paths.push(String(input));
      return String(input).endsWith('/logout')
        ? gate.promise
        : ok({ accessToken: 'signed-in-again', user, expiresIn: 900 });
    },
  });
  const logout = service.logout();
  const login = service.login({ email: user.email, password: 'Password@123' });
  await expect.poll(() => paths).toEqual(['/api/auth/logout']);
  gate.resolve(new Response(null, { status: 204 }));
  await logout;
  await login;
  expect(paths).toEqual(['/api/auth/logout', '/api/auth/login']);
  expect(service.session.getSnapshot()).toMatchObject({
    status: 'authenticated',
    accessToken: 'signed-in-again',
  });
});

test('HTTP client supports query strings, FormData, empty responses, malformed JSON and cancellation', async () => {
  let seenHeaders = new Headers();
  let seenBody: BodyInit | null | undefined;
  const client = createApiClient({
    baseUrl: '/api/v1',
    fetcher: async (input, init) => {
      expect(String(input)).toBe('/api/v1/uploads?kind=evidence');
      seenHeaders = new Headers(init?.headers);
      seenBody = init?.body;
      return new Response(null, { status: 204 });
    },
  });
  const body = new FormData();
  body.append('image', new Blob(['image'], { type: 'image/png' }), 'evidence.png');
  await expect(
    client.request('/uploads?kind=evidence', { method: 'POST', body }),
  ).resolves.toBeUndefined();
  expect(seenHeaders.has('Content-Type')).toBe(false);
  expect(seenBody).toBe(body);
  const invalid = createApiClient({
    baseUrl: '/api/v1',
    fetcher: async () => new Response('<html/>'),
  });
  await expect(invalid.request('/incidents')).rejects.toBeInstanceOf(ApiError);
  let notifications = 0;
  const aborted = createApiClient({
    baseUrl: '/api/v1',
    fetcher: async () => {
      throw new DOMException('Aborted', 'AbortError');
    },
    onError: () => {
      notifications += 1;
    },
  });
  await expect(aborted.request('/incidents')).rejects.toMatchObject({ name: 'AbortError' });
  expect(notifications).toBe(0);
});
