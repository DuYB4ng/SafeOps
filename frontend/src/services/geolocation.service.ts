import type { GeoPoint } from '@/types/reports';

export function locateReporter(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt chưa hỗ trợ định vị. Bạn có thể chọn vị trí trên sơ đồ.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () =>
        reject(
          new Error('Chưa lấy được vị trí. Hãy cấp quyền định vị hoặc chọn vị trí trên sơ đồ.'),
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}
