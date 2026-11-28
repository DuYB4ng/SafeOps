import { expect, test } from '@playwright/test';

const user = {
  id: 'reporter-1',
  email: 'reporter@example.com',
  fullName: 'Nguyễn Văn An',
  role: 'REPORTER',
  unitId: null,
};

test('the actual Next auth route accepts its browser origin and rejects a foreign origin', async ({
  request,
  baseURL,
}) => {
  const response = await request.post('/api/auth/refresh', {
    headers: { Origin: new URL(baseURL!).origin },
  });
  expect([401, 503]).toContain(response.status());
  expect((await response.json()).code).not.toBe('FORBIDDEN_ORIGIN');
  const foreign = await request.post('/api/auth/refresh', {
    headers: { Origin: 'https://other.test' },
  });
  expect(foreign.status()).toBe(403);
});

test('login uses the API, reload restores identity via refresh, and logout survives another reload', async ({
  page,
  context,
}) => {
  let refreshes = 0;
  let logins = 0;
  await page.route('**/api/auth/**', async (route) => {
    const action = new URL(route.request().url()).pathname.split('/').at(-1);
    if (action === 'login') {
      logins += 1;
      expect(route.request().postDataJSON()).toEqual({
        email: user.email,
        password: 'Reporter@123',
      });
      await route.fulfill({
        json: { statusCode: 200, data: { accessToken: 'access-1', expiresIn: 900, user } },
        headers: {
          'Set-Cookie': 'safeops_refresh=test-refresh; HttpOnly; SameSite=Lax; Path=/api/auth',
        },
      });
    } else if (action === 'refresh') {
      refreshes += 1;
      const hasCookie = (route.request().headers().cookie ?? '').includes(
        'safeops_refresh=test-refresh',
      );
      await route.fulfill(
        hasCookie
          ? { json: { statusCode: 200, data: { accessToken: 'restored-access', expiresIn: 900 } } }
          : { status: 401, json: { code: 'UNAUTHORIZED', message: 'Phiên hết hạn.' } },
      );
    } else if (action === 'me') {
      expect(route.request().headers().authorization).toBe('Bearer restored-access');
      await route.fulfill({ json: { statusCode: 200, data: user } });
    } else if (action === 'logout') {
      await route.fulfill({
        status: 204,
        headers: {
          'Set-Cookie': 'safeops_refresh=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/api/auth',
        },
      });
    } else await route.abort();
  });
  await page.goto('/login');
  await page.getByLabel('Địa chỉ email', { exact: true }).fill(user.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Reporter@123');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đăng nhập thành công');
  expect(logins).toBe(1);
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveValue('');
  expect(
    (await context.cookies()).find((cookie) => cookie.name === 'safeops_refresh')?.httpOnly,
  ).toBe(true);
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  await page.reload();
  await expect(page.getByText(`Phiên hiện tại: ${user.fullName}`, { exact: true })).toBeVisible();
  expect(refreshes).toBe(2);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page.getByText(`Phiên hiện tại: ${user.fullName}`, { exact: true })).toHaveCount(0);
  await expect
    .poll(async () => (await context.cookies()).some((cookie) => cookie.name === 'safeops_refresh'))
    .toBe(false);
  await page.reload();
  await expect.poll(() => refreshes).toBe(3);
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toHaveCount(0);
});

test('failed login shows a Toast and does not recursively refresh the login request', async ({
  page,
}) => {
  let refreshes = 0;
  await page.route('**/api/auth/**', async (route) => {
    if (route.request().url().endsWith('/refresh')) refreshes += 1;
    await route.fulfill({
      status: 401,
      json: { statusCode: 401, code: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng.' },
    });
  });
  await page.goto('/login');
  await page.getByLabel('Địa chỉ email', { exact: true }).fill(user.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Email hoặc mật khẩu không đúng.');
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  expect(refreshes).toBe(1);
});

test('a failed bootstrap can be retried after the network recovers', async ({ page }) => {
  let offline = true;
  await page.route('**/api/auth/**', async (route) => {
    if (offline) return route.abort('failed');
    await route.fulfill({
      json: {
        statusCode: 200,
        data: route.request().url().endsWith('/refresh')
          ? { accessToken: 'recovered', expiresIn: 900 }
          : user,
      },
    });
  });
  await page.goto('/login');
  await expect(page.getByText('Chưa thể kiểm tra phiên đăng nhập.', { exact: true })).toBeVisible();
  offline = false;
  await page.getByRole('button', { name: 'Thử lại kiểm tra phiên', exact: true }).click();
  await expect(page.getByText(`Phiên hiện tại: ${user.fullName}`, { exact: true })).toBeVisible();
});
