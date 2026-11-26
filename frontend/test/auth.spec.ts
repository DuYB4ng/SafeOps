import { expect, test } from '@playwright/test';

test('register validates required fields, email, password, phone and agreement', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByLabel('Họ và tên', { exact: true })).toBeFocused();
  await expect(page.getByText('Vui lòng nhập họ và tên.', { exact: true })).toBeVisible();
  await page.getByLabel('Họ và tên', { exact: true }).fill('Nguyễn Văn An');
  await page.getByLabel('Địa chỉ email', { exact: true }).fill('email-sai');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('12345678');
  await page.getByLabel('Số điện thoại', { exact: false }).fill('abc');
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByText('Địa chỉ email không hợp lệ.', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Mật khẩu cần ít nhất 8 ký tự, gồm số và ký tự đặc biệt.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Số điện thoại cần có từ 9 đến 15 chữ số.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Vui lòng đồng ý với điều khoản và chính sách bảo mật.', { exact: true }),
  ).toBeVisible();
});

test('register supports optional phone, password visibility and reports the actual preview result', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel('Họ và tên', { exact: true }).fill('Nguyễn Văn An');
  await page.getByLabel('Địa chỉ email', { exact: true }).fill('an@example.com');
  const password = page.getByLabel('Mật khẩu', { exact: true });
  await password.fill('SafeOps@2026!');
  await expect(page.getByRole('meter', { name: 'Độ mạnh mật khẩu' })).toHaveAttribute(
    'aria-valuenow',
    '4',
  );
  await page.getByRole('button', { name: 'Hiện mật khẩu', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Chưa tạo tài khoản');
  await expect(page).toHaveURL(/\/register$/);
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
});

test('login does not apply registration password policy and switching modes clears credentials', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByText('Vui lòng nhập địa chỉ email.', { exact: true })).toBeVisible();
  await page.getByLabel('Địa chỉ email', { exact: true }).fill('operator@example.com');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('x');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Chưa đăng nhập');
  await page
    .getByRole('navigation', { name: 'Đăng nhập hoặc đăng ký' })
    .getByRole('link', { name: 'Đăng ký', exact: true })
    .click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Địa chỉ email', { exact: true })).toHaveValue('');
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('SSO and password recovery give honest feedback and restore keyboard focus', async ({
  page,
}) => {
  await page.goto('/login');
  const sso = page.getByRole('button', { name: 'Tiếp tục với Google Workspace' });
  await sso.click();
  await expect(page.getByRole('dialog')).toContainText(
    'Đăng nhập Google Workspace chưa được kết nối.',
  );
  await page.keyboard.press('Escape');
  await expect(sso).toBeFocused();
  await page.getByRole('button', { name: 'Quên mật khẩu?', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Không có email đặt lại mật khẩu nào được gửi',
  );
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Đăng ký ngay', exact: true }).click();
  await page.getByRole('button', { name: 'Điều khoản sử dụng', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Nội dung điều khoản chính thức');
});

test('both auth pages fit mobile widths and keep the form before feature descriptions', async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/login', '/register']) {
      await page.goto(route);
      await expect(page.getByLabel('Địa chỉ email', { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const form = await page.locator('.auth-card').boundingBox();
      const intro = await page.locator('.auth-introduction').boundingBox();
      expect(form!.y).toBeLessThan(intro!.y);
      expect(form!.x).toBeGreaterThanOrEqual(0);
      expect(form!.x + form!.width).toBeLessThanOrEqual(width);
    }
  }
});
