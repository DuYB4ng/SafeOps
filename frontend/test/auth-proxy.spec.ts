import { expect, test } from '@playwright/test';
import { NextRequest } from 'next/server';
import { GET, POST } from '../src/app/api/auth/[action]/route';

const user = {
  id: 'user-1',
  email: 'reporter@example.com',
  fullName: 'Nguyễn An',
  role: 'REPORTER',
  unitId: null,
  passwordHash: 'never-expose',
};
const context = (action: string) => ({ params: Promise.resolve({ action }) });
const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;
test.beforeEach(() => {
  process.env.API_URL = 'http://backend.test/api/v1';
});
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});
function request(action: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('origin')) headers.set('origin', 'http://localhost:3000');
  return new NextRequest(`http://localhost:3000/api/auth/${action}`, {
    method: action === 'me' ? 'GET' : 'POST',
    ...init,
    signal: init.signal ?? undefined,
    headers,
  });
}

test('login proxies credentials, strips private fields and sets the HttpOnly refresh cookie', async () => {
  globalThis.fetch = async (input, init) => {
    expect(String(input)).toBe('http://backend.test/api/v1/auth/login');
    expect(JSON.parse(String(init?.body))).toEqual({ email: user.email, password: 'Password@123' });
    return Response.json({
      data: { accessToken: 'access-1', refreshToken: 'refresh-secret', expiresIn: 900, user },
    });
  };
  const response = await POST(
    request('login', {
      body: JSON.stringify({ email: user.email, password: 'Password@123', role: 'ADMIN' }),
    }),
    context('login'),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  const cookie = response.headers.get('set-cookie') ?? '';
  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('SameSite=lax');
  expect(cookie).toContain('Path=/api/auth');
  expect(cookie).toContain('refresh-secret');
  const payload = await response.text();
  expect(payload).toContain('access-1');
  expect(payload).not.toContain('refresh-secret');
  expect(payload).not.toContain('passwordHash');
});

test('refresh sends the cookie as JSON upstream and rotates it without exposing it', async () => {
  globalThis.fetch = async (_input, init) => {
    expect(JSON.parse(String(init?.body))).toEqual({ refreshToken: 'old-refresh' });
    return Response.json({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 900 },
    });
  };
  const response = await POST(
    request('refresh', { headers: { cookie: 'safeops_refresh=old-refresh' } }),
    context('refresh'),
  );
  expect(response.cookies.get('safeops_refresh')?.value).toBe('new-refresh');
  expect(await response.json()).toEqual({
    statusCode: 200,
    data: { accessToken: 'new-access', expiresIn: 900 },
  });
});

test('missing cookies, foreign origins and incorrect methods do not reach the backend', async () => {
  globalThis.fetch = async () => {
    throw new Error('must not call upstream');
  };
  expect((await POST(request('refresh'), context('refresh'))).status).toBe(401);
  expect(
    (await POST(request('login', { headers: { origin: 'https://other.test' } }), context('login')))
      .status,
  ).toBe(403);
  expect((await GET(request('login', { method: 'GET' }), context('login'))).status).toBe(405);
});

test('same-origin checks accept the incoming Host when Next normalizes its internal URL', async () => {
  globalThis.fetch = async () =>
    Response.json({ data: { accessToken: 'access', refreshToken: 'rotated', expiresIn: 900 } });
  const response = await POST(
    request('refresh', {
      headers: {
        host: '127.0.0.1:3000',
        origin: 'http://127.0.0.1:3000',
        cookie: 'safeops_refresh=old',
      },
    }),
    context('refresh'),
  );
  expect(response.status).toBe(200);
});

test('logout clears cookies on upstream failure and never exposes upstream diagnostics', async () => {
  globalThis.fetch = async () =>
    Response.json(
      { code: 'UNAUTHORIZED', message: 'secret-refresh database://private-host' },
      { status: 401 },
    );
  const response = await POST(
    request('logout', {
      headers: { cookie: 'safeops_refresh=token', authorization: 'Bearer old' },
    }),
    context('logout'),
  );
  expect(response.status).toBe(401);
  expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  expect(await response.text()).not.toContain('private-host');
});

test('me forwards Bearer authentication, filters user fields and returns safe network errors', async () => {
  globalThis.fetch = async (_input, init) => {
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer access');
    return Response.json({ data: user });
  };
  const response = await GET(
    request('me', { headers: { authorization: 'Bearer access' } }),
    context('me'),
  );
  expect(response.status).toBe(200);
  expect(await response.text()).not.toContain('passwordHash');
  globalThis.fetch = async () => {
    throw new Error('private-infrastructure');
  };
  const failed = await POST(
    request('refresh', { headers: { cookie: 'safeops_refresh=token' } }),
    context('refresh'),
  );
  expect(failed.status).toBe(503);
  expect(failed.headers.get('set-cookie')).toBeNull();
  expect(await failed.text()).not.toContain('private-infrastructure');
});
