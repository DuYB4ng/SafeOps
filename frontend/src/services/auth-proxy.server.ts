import { NextRequest, NextResponse } from 'next/server';

const cookieName = 'safeops_refresh';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
};
const roles = ['REPORTER', 'OPERATOR', 'RESPONDER', 'COMMANDER', 'ADMIN'];

function error(statusCode: number, code: string, message: string) {
  return NextResponse.json(
    { statusCode, code, message, timestamp: new Date().toISOString() },
    { status: statusCode, headers: { 'Cache-Control': 'no-store' } },
  );
}

async function proxy(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (!['login', 'refresh', 'logout', 'me'].includes(action))
    return error(404, 'NOT_FOUND', 'Không tìm thấy API.');
  if (request.method !== (action === 'me' ? 'GET' : 'POST'))
    return error(405, 'METHOD_NOT_ALLOWED', 'Phương thức không hợp lệ.');
  if (request.method === 'POST') {
    // Next.js can normalize 127.0.0.1 to localhost internally. Compare with the
    // incoming Host rather than that internal URL; never trust forwarded-host.
    let sameOrigin = false;
    try {
      const origin = new URL(request.headers.get('origin') ?? '');
      const host = request.headers.get('host') ?? request.nextUrl.host;
      const protocol = (
        request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')
      )
        .split(',')[0]
        .trim();
      sameOrigin = origin.host === host && origin.protocol === `${protocol}:`;
    } catch {
      /* Missing or malformed Origin is rejected. */
    }
    if (!sameOrigin) return error(403, 'FORBIDDEN_ORIGIN', 'Nguồn yêu cầu không hợp lệ.');
  }
  const upstream = process.env.API_URL;
  const expireCookie = (response: NextResponse) => {
    response.cookies.set(cookieName, '', { ...cookieOptions, maxAge: 0 });
    return response;
  };
  if (!upstream) {
    const response = error(
      503,
      'AUTH_NOT_CONFIGURED',
      'Hệ thống xác thực chưa sẵn sàng. Vui lòng thử lại sau.',
    );
    return action === 'logout' ? expireCookie(response) : response;
  }
  let body: unknown;
  if (action === 'login') {
    try {
      body = await request.json();
    } catch {
      return error(400, 'VALIDATION_FAILED', 'Dữ liệu đăng nhập không hợp lệ.');
    }
    if (
      !body ||
      typeof body !== 'object' ||
      !('email' in body) ||
      typeof body.email !== 'string' ||
      !('password' in body) ||
      typeof body.password !== 'string'
    ) {
      return error(400, 'VALIDATION_FAILED', 'Email và mật khẩu không hợp lệ.');
    }
    body = { email: body.email, password: body.password };
  } else if (action === 'refresh' || action === 'logout') {
    const refreshToken = request.cookies.get(cookieName)?.value;
    if (!refreshToken)
      return expireCookie(
        action === 'logout'
          ? new NextResponse(null, { status: 204 })
          : error(401, 'UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn.'),
      );
    body = { refreshToken };
  }
  try {
    const headers = new Headers({ Accept: 'application/json' });
    if (body) headers.set('Content-Type', 'application/json');
    const bearer = request.headers.get('authorization');
    if ((action === 'me' || action === 'logout') && bearer) headers.set('Authorization', bearer);
    const response = await fetch(`${upstream.replace(/\/$/, '')}/auth/${action}`, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      // Never forward upstream text/details: errors can contain tokens or infrastructure data.
      const payload: unknown = await response.json().catch(() => null);
      const code =
        payload &&
        typeof payload === 'object' &&
        'code' in payload &&
        typeof payload.code === 'string'
          ? payload.code
          : 'AUTH_FAILED';
      const message =
        response.status === 401
          ? action === 'login'
            ? 'Email hoặc mật khẩu không đúng.'
            : 'Phiên đăng nhập đã hết hạn.'
          : response.status === 429
            ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'
            : 'Yêu cầu xác thực thất bại. Vui lòng thử lại.';
      const result = error(response.status, code, message);
      return action === 'logout' || (action === 'refresh' && [401, 403].includes(response.status))
        ? expireCookie(result)
        : result;
    }
    if (action === 'logout')
      return expireCookie(
        new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } }),
      );
    const payload = (await response.json()) as { data?: Record<string, unknown> };
    const data = payload?.data;
    if (!data) return error(502, 'INVALID_RESPONSE', 'Phản hồi xác thực không hợp lệ.');
    const user = action === 'me' ? data : (data.user as Record<string, unknown> | undefined);
    if (
      (action === 'me' || action === 'login') &&
      (!user ||
        typeof user.id !== 'string' ||
        typeof user.email !== 'string' ||
        typeof user.fullName !== 'string' ||
        !roles.includes(String(user.role)) ||
        !(user.unitId === null || typeof user.unitId === 'string'))
    ) {
      return error(502, 'INVALID_RESPONSE', 'Thông tin tài khoản không hợp lệ.');
    }
    const safeUser = user
      ? {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          unitId: user.unitId,
        }
      : undefined;
    if (action === 'me')
      return NextResponse.json(
        { statusCode: 200, data: safeUser },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    if (
      typeof data.accessToken !== 'string' ||
      !data.accessToken ||
      typeof data.refreshToken !== 'string' ||
      !data.refreshToken ||
      typeof data.expiresIn !== 'number' ||
      data.expiresIn <= 0
    ) {
      return error(502, 'INVALID_RESPONSE', 'Phản hồi token không hợp lệ.');
    }
    const result = NextResponse.json(
      {
        statusCode: 200,
        data: {
          accessToken: data.accessToken,
          expiresIn: data.expiresIn,
          ...(action === 'login' ? { user: safeUser } : {}),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    result.cookies.set(cookieName, data.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    });
    return result;
  } catch {
    const result = error(
      503,
      'AUTH_UNAVAILABLE',
      'Không thể kết nối máy chủ xác thực. Vui lòng thử lại.',
    );
    return action === 'logout' ? expireCookie(result) : result;
  }
}

export const GET = proxy;
export const POST = proxy;
