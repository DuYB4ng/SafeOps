import { expect, test } from '@playwright/test';
import { clusterMapIncidents, distanceMeters } from '../src/lib/map/geometry';
import { mapIncidents } from '../src/features/map/fixtures';

test('map geometry preserves filtered cluster membership and metre distances', () => {
  expect(distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 })).toBe(0);
  expect(
    distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0.001 }),
  ).toBeCloseTo(111.195, 1);
  const inputs = mapIncidents.slice(4, 9);
  const groups = clusterMapIncidents(
    inputs,
    (item) => ({ x: item.longitude * 100, y: item.latitude * 100 }),
    inputs[0].id,
    true,
  );
  expect(groups.map((group) => group.incidents.length).sort()).toEqual([1, 4]);
  expect(groups.flatMap((group) => group.incidents.map((item) => item.id)).sort()).toEqual(
    inputs.map((item) => item.id).sort(),
  );
});

test.beforeEach(async ({ page }) => {
  await page.goto('/map');
  await expect(page.locator('.operator-map-leaflet .leaflet-image-layer')).toBeVisible();
});

test('renders real Leaflet with source geometry and selects list cards and markers', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 1024 });
  await expect(page.locator('.operator-map-sidebar')).toHaveCSS('width', '240px');
  await expect(page.locator('.operator-map-list-panel')).toHaveCSS('width', '370px');
  await expect(page.getByRole('region', { name: 'Bản đồ Leaflet điều hành' })).toBeVisible();
  await page.getByRole('button', { name: 'Định vị SC-8918', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Tóm tắt SC-8918', exact: true })).toContainText(
    'Cảnh báo xâm nhập',
  );
  await page.getByRole('button', { name: 'Đóng tóm tắt sự cố' }).click();
  await page.getByRole('button', { name: 'Sự cố SC-8914', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Tóm tắt SC-8914', exact: true })).toContainText(
    'Cửa thoát hiểm',
  );
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('filters without accents, by radius and status, and handles empty results', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: 'Tìm sự cố hoặc lực lượng' }).fill('khoi boc');
  await expect(page.locator('.operator-map-incident-card')).toHaveCount(1);
  await expect(page.locator('.operator-map-list-scroll')).toContainText('SC-8921');
  await page.getByRole('button', { name: 'Đặt lại bộ lọc bản đồ' }).click();
  await page.getByRole('combobox', { name: 'Bán kính quanh tâm khu vực' }).click();
  await page.getByRole('option', { name: 'Trong 500m', exact: true }).click();
  await expect(page.locator('.operator-map-list-panel > footer')).toContainText('4 sự cố');
  await page.getByRole('combobox', { name: 'Lọc trạng thái bản đồ' }).click();
  await page.getByRole('option', { name: 'RESOLVED · RESOLVED', exact: true }).click();
  await page.getByRole('button', { name: 'Định vị SC-8902', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Tóm tắt SC-8902' })
      .getByRole('button', { name: 'Xác minh & điều phối' }),
  ).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Lọc loại sự cố bản đồ' }).click();
  await page.getByRole('option', { name: 'Y tế', exact: true }).click();
  await expect(page.getByText('Không tìm thấy sự cố phù hợp.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại bộ lọc', exact: true }).click();
  await expect(page.locator('.operator-map-list-panel > footer')).toContainText('21 sự cố');
});

test('expands real clusters, zooms and fits all visible incidents', async ({ page }) => {
  await page.getByRole('button', { name: 'Đóng tóm tắt sự cố' }).click();
  await page.getByRole('button', { name: 'Đóng cảnh báo mẫu' }).click();
  await expect(page.getByRole('button', { name: 'Mở cụm 5 sự cố', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mở cụm 5 sự cố', exact: true }).click();
  await expect(page.getByTestId('map-zoom-level')).toHaveText('Zoom 19');
  await expect(page.getByRole('button', { name: /^Mở cụm / })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Sự cố SC-/ })).toHaveCount(21);
  await page.getByRole('button', { name: 'Xem toàn bộ sự cố', exact: true }).click();
  await expect(page.getByTestId('map-zoom-level')).not.toHaveText('Zoom 19');
  await page.getByRole('button', { name: 'Về tâm khu vực', exact: true }).click();
  await expect(page.getByTestId('map-zoom-level')).toHaveText('Zoom 16');
  await page.getByRole('button', { name: 'Phóng to bản đồ', exact: true }).click();
  await expect(page.getByTestId('map-zoom-level')).toHaveText('Zoom 17');
});

test('toggles units and inspects unit details', async ({ page }) => {
  const markers = page
    .getByRole('region', { name: 'Bản đồ Leaflet điều hành' })
    .getByRole('button', { name: /^Lực lượng / });
  await expect(markers).toHaveCount(4);
  await page.getByRole('button', { name: 'Lực lượng', exact: true }).click();
  await expect(markers).toHaveCount(0);
  await page.getByRole('button', { name: 'Lực lượng (4)', exact: true }).click();
  await page
    .locator('.operator-map-list-scroll')
    .getByRole('button', { name: /Nguyễn Văn Long/ })
    .click();
  await expect(page.getByRole('dialog')).toContainText('Tuần tra phân khu H3');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Lực lượng', exact: true }).click();
  await expect(markers).toHaveCount(4);
});

test('opens shared dispatch modal and requires a cancellation reason', async ({ page }) => {
  const trigger = page
    .getByRole('region', { name: 'Tóm tắt SC-8921' })
    .getByRole('button', { name: 'Xác minh & điều phối', exact: true });
  await trigger.click();
  await expect(
    page.getByRole('dialog').getByRole('radio', { name: 'CRITICAL', exact: true }),
  ).toBeChecked();
  await page
    .getByRole('dialog')
    .getByRole('radio', { name: /Trần Minh Quân/ })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận & Điều phối ngay' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('[data-sonner-toast]')).toContainText(
    'SC-8921 · CRITICAL · Trần Minh Quân',
  );
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hủy / Báo cáo giả' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận hủy (mẫu)' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toHaveText('Vui lòng nhập lý do.');
  await page
    .getByRole('dialog')
    .getByLabel('Lý do bắt buộc')
    .fill('Sự cố trùng với bản đã xác minh.');
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận hủy (mẫu)' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('switches basemaps and provides a useful fallback when street tiles fail', async ({
  page,
}) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.getByRole('button', { name: 'Tối giản', exact: true }).click();
  await expect(page.locator('.operator-map-leaflet-wrapper')).toHaveAttribute(
    'data-basemap',
    'minimal',
  );
  await page.getByRole('button', { name: 'Đường phố', exact: true }).click();
  await expect(page.locator('.operator-map-tile-error')).toContainText(
    'Chưa tải được nền đường phố',
  );
  await expect(page.getByRole('link', { name: 'OpenStreetMap', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Dùng sơ đồ chiến thuật', exact: true }).click();
  await expect(page.locator('.operator-map-leaflet .leaflet-image-layer')).toBeVisible();
  await expect(page.locator('.operator-map-tile-error')).toHaveCount(0);
});

test('mobile toggles list/map, resizes Leaflet and keeps dispatch within viewport', async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole('region', { name: 'Bản đồ Leaflet điều hành' })).toBeVisible();
    await page.getByRole('button', { name: /Danh sách \(/ }).click();
    await expect(page.locator('.operator-map-list-panel')).toBeVisible();
    await page.getByRole('button', { name: 'Định vị SC-8918', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Bản đồ Leaflet điều hành' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Tóm tắt SC-8918' })).toBeVisible();
    await expect
      .poll(async () => {
        const marker = await page
          .getByRole('button', { name: 'Sự cố SC-8918', exact: true })
          .boundingBox();
        const summary = await page.getByRole('region', { name: 'Tóm tắt SC-8918' }).boundingBox();
        return (
          !!marker &&
          !!summary &&
          marker.x >= 0 &&
          marker.x + marker.width <= width &&
          marker.y + marker.height < summary.y
        );
      })
      .toBe(true);
  }
  await page
    .getByRole('region', { name: 'Tóm tắt SC-8918' })
    .getByRole('button', { name: 'Xác minh & điều phối' })
    .click();
  const bounds = await page.getByRole('dialog').boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
});
