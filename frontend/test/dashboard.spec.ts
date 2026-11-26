import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('filters and searches incidents, exports the selected results and resets empty results', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Luồng sự cố điều hành' });
  await expect(table.locator('tbody tr')).toHaveCount(4);
  await page.keyboard.press('Control+k');
  const search = page.getByRole('textbox', { name: 'Tìm sự cố, vị trí, đơn vị' });
  await expect(search).toBeFocused();
  await search.fill('B4');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table).toContainText('INC-1023');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất báo cáo' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('safeops-su-co-mau.csv');
  const csv = await readFile((await download.path())!, 'utf8');
  expect(csv).toContain('INC-1023');
  expect(csv).not.toContain('INC-1024');
  await page.getByRole('combobox', { name: 'Lọc mức độ sự cố' }).click();
  await page.getByRole('option', { name: 'MEDIUM', exact: true }).click();
  await expect(table).toContainText('Không tìm thấy sự cố phù hợp.');
  await page
    .getByRole('button', { name: 'Xuất báo cáo' })
    .isDisabled()
    .then((disabled) => expect(disabled).toBe(true));
  await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();
  await expect(table.locator('tbody tr')).toHaveCount(4);
  await expect(search).toHaveValue('');
});

test('dispatches a selected preview row and returns keyboard focus to its trigger', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Điều phối INC-1023' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('#INC-1023');
  await expect(dialog.getByRole('radio', { name: 'HIGH', exact: true })).toBeChecked();
  await dialog.getByText('LOW', { exact: true }).click();
  await dialog.getByRole('button', { name: 'Xác nhận & Điều phối ngay' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('[data-sonner-toast]')).toContainText('INC-1023 · LOW');
  await expect(page.getByRole('button', { name: 'Điều phối INC-1021' })).toHaveCount(0);
});

test('shows incident details from a map pin and toggles independent map layers', async ({
  page,
}) => {
  const map = page.getByRole('region', { name: 'Bản đồ điều hành trực tuyến' });
  await map.getByRole('button', { name: 'Lực lượng', exact: true }).click();
  await expect(map.getByRole('button', { name: 'Alpha 1', exact: true })).toHaveCount(0);
  await expect(map.getByRole('button', { name: 'Drone 02', exact: true })).toBeVisible();
  await map.getByRole('button', { name: 'Lực lượng', exact: true }).click();
  await map.getByRole('button', { name: 'Alpha 1', exact: true }).click();
  await expect(map.getByRole('status')).toContainText('Nguyễn Văn A');
  await map.getByRole('button', { name: 'Đặt lại sơ đồ' }).click();
  await expect(map.getByRole('status')).toHaveCount(0);
  await map.getByRole('button', { name: 'Xem sự cố INC-1024 trên sơ đồ' }).click();
  await expect(page.getByRole('dialog')).toContainText('Cảnh báo xâm nhập trái phép');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('requires a cancellation reason for the selected incident preview', async ({ page }) => {
  await page.getByRole('button', { name: 'Điều phối INC-1023' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hủy / Báo cáo giả' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('#INC-1023');
  await dialog.getByRole('button', { name: 'Xác nhận hủy (mẫu)' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Vui lòng nhập lý do.');
  await dialog.getByLabel('Lý do bắt buộc').fill('Cảnh báo trùng lặp.');
  await dialog.getByRole('button', { name: 'Xác nhận hủy (mẫu)' }).click();
  await expect(dialog).toHaveCount(0);
});

test('keeps mobile overflow inside the table and navigates to the operator map', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scroller = page.locator('.incident-feed [data-slot="table-container"]');
  expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Mở điều hướng' }).click();
  await expect(page.getByRole('navigation', { name: 'Điều hướng SafeOps' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Điều hướng SafeOps' })).toBeHidden();
  await page.getByRole('button', { name: 'Mở điều hướng' }).click();
  await page.getByRole('link', { name: 'Bản đồ trực tuyến', exact: true }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(page.getByRole('navigation', { name: 'Điều hướng SafeOps' })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Bản đồ Leaflet điều hành' })).toBeVisible();
});
