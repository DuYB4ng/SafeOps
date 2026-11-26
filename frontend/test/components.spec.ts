import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/components');
  await expect(page.getByRole('combobox', { name: 'Trạng thái kết nối mẫu' })).toHaveText(
    'Đã kết nối',
  );
});

test('preserves the measured Figma badge, sidebar and header geometry', async ({ page }) => {
  const badge = page.getByTestId('figma-badge-critical').locator('[data-slot="badge"]');
  await expect(badge).toHaveText('CRITICAL');
  await expect(badge).toHaveCSS('width', '100px');
  await expect(badge).toHaveCSS('height', '25px');
  await expect(badge).toHaveCSS('background-color', 'rgb(254, 226, 226)');
  await expect(badge).toHaveCSS('color', 'rgb(220, 38, 38)');
  await expect(page.locator('.safeops-sidebar')).toHaveCSS('width', '256px');
  await expect(page.locator('.safeops-header')).toHaveCSS('height', '64px');
});

test('switches connection feedback and dismisses the banner when reconnected', async ({ page }) => {
  const select = page.getByRole('combobox', { name: 'Trạng thái kết nối mẫu' });
  await select.click();
  await page.getByRole('option', { name: 'Đang kết nối lại', exact: true }).click();
  await expect(page.locator('.safeops-banner')).toHaveText('⚠️Đang mất kết nối, đang thử lại...');
  await expect(page.locator('.safeops-banner')).toHaveCSS('height', '40px');
  await select.click();
  await page.getByRole('option', { name: 'Mất kết nối', exact: true }).click();
  await expect(page.locator('.connection-badge')).toContainText('Mất kết nối');
  await select.click();
  await page.getByRole('option', { name: 'Đã kết nối', exact: true }).click();
  await expect(page.locator('.safeops-banner')).toHaveCount(0);
});

test('selects severity and unit before confirming the demo dispatch', async ({ page }) => {
  await page.getByRole('button', { name: 'Mở modal điều phối', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveCSS('width', '480px');
  await expect(dialog).toHaveCSS('height', '363px');
  await dialog.getByText('CRITICAL', { exact: true }).click();
  await expect(dialog.getByRole('radio', { name: 'CRITICAL', exact: true })).toBeChecked();
  await dialog.getByRole('radio', { name: /Trần Văn B/ }).click();
  await dialog.getByRole('button', { name: 'Xác nhận & Điều phối ngay' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('dispatch-result')).toContainText('CRITICAL · Trần Văn B');
});

test('honors allowedActions and restores focus after Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Xem modal chỉ đọc' });
  await trigger.click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Xác nhận & Điều phối ngay' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Hủy / Báo cáo giả' }),
  ).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('requires a reason before accepting the cancellation preview', async ({ page }) => {
  await page.getByRole('button', { name: 'Mở modal điều phối', exact: true }).click();
  await page.getByRole('button', { name: 'Hủy / Báo cáo giả' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Xác nhận hủy (mẫu)' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Vui lòng nhập lý do.');
  await dialog.getByLabel('Lý do bắt buộc').fill('Báo cáo trùng với sự cố đã xác nhận.');
  await dialog.getByRole('button', { name: 'Xác nhận hủy (mẫu)' }).click();
  await expect(dialog).toHaveCount(0);
});

test('supports empty search results and resetting filters', async ({ page }) => {
  await page.getByLabel('Tìm sự cố mẫu').fill('không có kết quả này');
  await expect(page.getByRole('cell', { name: 'Không tìm thấy sự cố phù hợp.' })).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click();
  await expect(page.getByRole('cell', { name: '#INC-001', exact: true }).first()).toBeVisible();
});

test('matches the supplied Table image and opens the selected row with keyboard', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Danh sách sự cố' });
  await expect(table).toHaveCSS('width', '1184px');
  await expect(table).toHaveCSS('height', '204px');
  await expect(table.locator('thead')).toHaveCSS('position', 'absolute');
  await expect(table.locator('tbody tr')).toHaveCount(4);
  const row = table.locator('tbody tr').first();
  await expect(row).toHaveCSS('height', '51px');
  await expect(row.getByRole('cell')).toHaveCount(6);
  await expect(row).toContainText('Báo cháy tầng hầm B2');
  await expect(row).toContainText('CRITICAL');
  await expect(row).toContainText('PENDING');
  await expect(row.locator('time')).toHaveText('10:45 - 09/11/2026');
  const trigger = row.getByRole('button', { name: 'Xác minh & Giao việc cho #INC-001' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('radio', { name: 'CRITICAL', exact: true }),
  ).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('keeps the page and modal within a 390px mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const tableScroller = page
    .getByTestId('incident-queue-table')
    .locator('[data-slot="table-container"]');
  expect(await tableScroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Mở modal điều phối', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await expect(dialog.getByRole('button', { name: 'Xác nhận & Điều phối ngay' })).toBeVisible();
});
