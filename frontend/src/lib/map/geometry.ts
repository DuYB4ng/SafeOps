import type { GeoPoint } from '@/types/geo';
import type { MapIncident, MarkerCluster } from '@/types/map';

// Khoảng cách dùng cho bộ lọc hiển thị, không phải thuật toán giao lực lượng.
export function distanceMeters(from: GeoPoint, to: GeoPoint) {
  const radians = Math.PI / 180;
  const latitudeDelta = (to.latitude - from.latitude) * radians;
  const longitudeDelta = (to.longitude - from.longitude) * radians;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(from.latitude * radians) *
      Math.cos(to.latitude * radians) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)));
}

export function clusterMapIncidents(
  items: readonly MapIncident[],
  project: (item: MapIncident) => { x: number; y: number },
  selectedId: string | null,
  enabled: boolean,
  threshold = 56,
): MarkerCluster[] {
  const clusters: MarkerCluster[] = [];
  for (const incident of items) {
    const point = project(incident);
    const existing =
      enabled && incident.clusterable && incident.id !== selectedId
        ? clusters.find(
            (cluster) =>
              cluster.incidents.every((item) => item.clusterable && item.id !== selectedId) &&
              Math.hypot(cluster.x - point.x, cluster.y - point.y) < threshold,
          )
        : undefined;
    if (existing) {
      const count = existing.incidents.length;
      existing.x = (existing.x * count + point.x) / (count + 1);
      existing.y = (existing.y * count + point.y) / (count + 1);
      existing.incidents.push(incident);
    } else clusters.push({ incidents: [incident], x: point.x, y: point.y });
  }
  return clusters;
}
