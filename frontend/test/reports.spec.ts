import { expect, test } from '@playwright/test';

const firstReport = '/RPT-20261109-001';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB1kAAAAASUVORK5CYII=',
  'base64',
);

test('filters personal reports without accents, resets dates and paginates', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.reporter-report-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Trang báo cáo 2', exact: true }).click();
  await expect(page.locator('.reporter-card-grid')).toContainText('Nước rò rỉ');
  await page.getByLabel('Tìm báo cáo của tôi').fill('khoi boc');
  await expect(page.locator('.reporter-report-card')).toHaveCount(1);
  await expect(page.locator('.reporter-report-card')).toContainText('RPT-20261109-001');
  await page.getByLabel('Từ ngày', { exact: true }).fill('2026-11-10');
  await expect(page.getByText('Không tìm thấy báo cáo phù hợp', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Xóa bộ lọc báo cáo' }).click();
  await page.getByRole('button', { name: /Chờ xác minh/ }).click();
  await expect(page.locator('.reporter-report-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Đặt lại bộ lọc báo cáo' }).click();
  await expect(page.getByLabel('Tìm báo cáo của tôi')).toHaveValue('');
});

test('SOS opens the new report with suggested urgency and validates before preview', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Báo cáo sự cố khẩn cấp', exact: true }).click();
  await expect(page.getByRole('radio', { name: /CRITICAL/ })).toBeChecked();
  await page.getByRole('button', { name: 'Kiểm tra phản ánh khẩn cấp', exact: true }).click();
  await expect(page.getByLabel('Tiêu đề sự cố', { exact: false })).toBeFocused();
  await expect(page.getByText('Tiêu đề cần ít nhất 5 ký tự.', { exact: true })).toBeVisible();
  await page.getByLabel('Tiêu đề sự cố', { exact: false }).fill('Khói tại hành lang tầng 12');
  await page
    .getByLabel('Chi tiết sự cố / Ghi chú', { exact: false })
    .fill('Tôi quan sát thấy khói mỏng tại tủ điện gần thang bộ.');
  await page
    .getByLabel('Tầng / Vị trí chi tiết', { exact: false })
    .fill('Tầng 12, gần cửa thang bộ số 2');
  await page.getByRole('button', { name: 'Kiểm tra phản ánh khẩn cấp', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Khói tại hành lang tầng 12');
  await page.getByRole('button', { name: 'Xác nhận bản xem thử', exact: true }).click();
  await expect(page.locator('.reporter-form-result')).toContainText('chưa được gửi đến SOC');
});

test('validates image formats, size and count, then removes selected previews', async ({
  page,
}) => {
  await page.goto('/new');
  const input = page.getByLabel('Chọn ảnh minh chứng', { exact: true });
  await input.setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg />'),
  });
  await expect(page.locator('.reporter-evidence-uploader').getByRole('alert')).toContainText(
    'chỉ nhận JPG, PNG hoặc WebP',
  );
  await input.setInputFiles({
    name: 'large.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(page.locator('.reporter-evidence-uploader').getByRole('alert')).toContainText(
    'vượt quá 5 MB',
  );
  await input.setInputFiles(
    Array.from({ length: 6 }, (_, index) => ({
      name: `photo-${index}.png`,
      mimeType: 'image/png',
      buffer: png,
    })),
  );
  await expect(page.getByRole('img', { name: /Ảnh đã chọn:/ })).toHaveCount(5);
  await expect(page.locator('.reporter-evidence-uploader').getByRole('alert')).toContainText(
    'Tối đa 5 ảnh',
  );
  await page.getByRole('button', { name: 'Xóa ảnh photo-0.png', exact: true }).click();
  await expect(page.getByRole('img', { name: /Ảnh đã chọn:/ })).toHaveCount(4);
  await expect(page.locator('.reporter-evidence-uploader').getByRole('alert')).toHaveCount(0);
});

test('restores a deliberately saved draft after reload and requests GPS on demand', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 10.76, longitude: 106.66 });
  await page.goto('/new');
  await page.getByLabel('Tiêu đề sự cố', { exact: false }).fill('Bản nháp kiểm tra rò rỉ nước');
  await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await page.reload();
  await expect(page.getByLabel('Tiêu đề sự cố', { exact: false })).toHaveValue('');
  await page.getByRole('button', { name: 'Khôi phục nháp', exact: true }).click();
  await expect(page.getByLabel('Tiêu đề sự cố', { exact: false })).toHaveValue(
    'Bản nháp kiểm tra rò rỉ nước',
  );
  await page.getByRole('button', { name: 'Lấy vị trí hiện tại của tôi', exact: true }).click();
  await expect(page.locator('.reporter-gps-message')).toContainText('Đã lấy tọa độ GPS');
  await expect(page.locator('.reporter-map-coordinates')).toContainText('10.76000, 106.66000');
});

test('details support lightbox and supplemental validation without exposing phone numbers', async ({
  page,
}) => {
  await page.goto(firstReport);
  await expect(
    page.getByRole('heading', { name: 'Khói bốc lên từ hộp kỹ thuật tầng 12', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Số điện thoại', { exact: false })).toHaveCount(0);
  const image = page.getByRole('button', { name: 'Mở ảnh minh họa 1', exact: true });
  await image.click();
  await expect(page.getByRole('dialog')).toContainText('không phải ảnh hiện trường thật');
  await page.keyboard.press('Escape');
  await expect(image).toBeFocused();
  await page.getByRole('button', { name: 'Gửi thông tin bổ sung', exact: true }).click();
  await expect(page.locator('.reporter-supplement-panel').getByRole('alert')).toContainText(
    'ít nhất 10 ký tự',
  );
  await page
    .getByLabel('Nội dung mô tả tình hình bổ sung')
    .fill('Khói đã giảm, tôi bổ sung thông tin từ vị trí an toàn.');
  await page.getByRole('button', { name: 'Gửi thông tin bổ sung', exact: true }).click();
  await expect(page.locator('.reporter-form-result')).toContainText('Chưa gửi bổ sung');
  await expect(page.getByRole('button', { name: 'Đánh giá 5 sao', exact: true })).toBeDisabled();
  await page.goto('/RPT-20261108-003');
  await expect(page.getByRole('button', { name: 'Gửi thông tin bổ sung' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Đánh giá 5 sao', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đánh giá 5 sao', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('unknown report IDs return not found', async ({ page }) => {
  const response = await page.goto('/unknown-report');
  expect(response?.status()).toBe(404);
});

test('Reporter pages fit mobile and the sidebar navigates to the create form', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/new', firstReport]) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}px`,
      ).toBe(true);
      if (route === '/') {
        for (const label of ['Từ ngày', 'Đến ngày']) {
          const bounds = await page.getByLabel(label, { exact: true }).boundingBox();
          expect(bounds!.width).toBeGreaterThanOrEqual(100);
        }
      }
    }
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Mở điều hướng', exact: true }).click();
  await page.getByRole('link', { name: 'Báo cáo sự cố mới', exact: true }).click();
  await expect(page).toHaveURL(/\/new$/);
  await expect(
    page.getByRole('heading', { name: 'Gửi phản ánh, cùng giữ gìn an toàn' }),
  ).toBeVisible();
});
