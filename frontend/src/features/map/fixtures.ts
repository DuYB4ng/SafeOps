import type { MapIncident, MapUnit } from '@/types/map';

export const mapCenter = { latitude: 10.7625, longitude: 106.66 };
export const mapCategories = [
  { code: 'FIRE', name: 'Cháy nổ' },
  { code: 'SECURITY', name: 'An ninh' },
  { code: 'INFRASTRUCTURE', name: 'Hạ tầng' },
  { code: 'MEDICAL', name: 'Y tế' },
  { code: 'OTHER', name: 'Khác' },
] as const;

export const mapUnits: readonly MapUnit[] = [
  {
    id: 'map-unit-long',
    code: 'AN-01',
    name: 'Nguyễn Văn Long',
    assignment: 'Tuần tra phân khu H3',
    status: 'AVAILABLE',
    latitude: 10.7632,
    longitude: 106.6593,
  },
  {
    id: 'map-unit-quan',
    code: 'AN-02',
    name: 'Trần Minh Quân',
    assignment: 'Ứng trực sảnh H1',
    status: 'AVAILABLE',
    latitude: 10.7613,
    longitude: 106.6615,
  },
  {
    id: 'map-unit-alpha',
    code: 'PCCC-01',
    name: 'Đội PCCC cơ sở',
    assignment: 'Đang thực hiện nhiệm vụ',
    status: 'BUSY',
    latitude: 10.7593,
    longitude: 106.6622,
  },
  {
    id: 'map-unit-bravo',
    code: 'KT-03',
    name: 'Tổ Kỹ thuật số 3',
    assignment: 'Ngoài ca trực',
    status: 'OFFLINE',
    latitude: 10.765,
    longitude: 106.6568,
  },
];

const coreIncidents: readonly MapIncident[] = [
  {
    id: 'map-8921',
    code: 'SC-8921',
    title: 'Khói bốc lên từ phòng máy chủ tầng 4',
    description:
      'Phát hiện khói mỏng tại phòng máy chủ tòa H. Trực ban đã xác minh và đang chờ điều phối lực lượng.',
    location: 'Tòa H · Tầng 4, phòng máy chủ',
    category: 'FIRE',
    priority: 'CRITICAL',
    status: 'CONFIRMED',
    receivedAt: '2026-11-09T03:45:00Z',
    latitude: 10.7625,
    longitude: 106.66,
    clusterable: false,
    allowedActions: ['DISPATCH', 'CANCEL'],
    suggestions: [
      { unitId: 'map-unit-long', distanceLabel: '120m · Phân khu H3' },
      { unitId: 'map-unit-quan', distanceLabel: '250m · Sảnh H1' },
    ],
  },
  {
    id: 'map-8918',
    code: 'SC-8918',
    title: 'Cảnh báo xâm nhập rào chắn ngoại vi',
    description:
      'Camera phát hiện chuyển động bất thường tại cổng phía Nam. Lực lượng đã được phân công kiểm tra.',
    location: 'Cổng số 3 · Sảnh Nam',
    category: 'SECURITY',
    priority: 'HIGH',
    status: 'DISPATCHED',
    receivedAt: '2026-11-09T03:42:00Z',
    latitude: 10.7587,
    longitude: 106.6607,
    clusterable: false,
    allowedActions: ['DISPATCH', 'CANCEL'],
    suggestions: [{ unitId: 'map-unit-quan', distanceLabel: 'Theo gợi ý mẫu' }],
  },
  {
    id: 'map-8914',
    code: 'SC-8914',
    title: 'Cửa thoát hiểm B1 kẹt không đóng',
    description: 'Đội kỹ thuật đang kiểm tra cơ cấu cửa thoát hiểm tại tầng hầm B1.',
    location: 'Tầng hầm B1 · Khu đỗ xe',
    category: 'INFRASTRUCTURE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    receivedAt: '2026-11-09T03:37:00Z',
    latitude: 10.761,
    longitude: 106.664,
    clusterable: false,
    allowedActions: ['DISPATCH', 'CANCEL'],
    suggestions: [{ unitId: 'map-unit-long', distanceLabel: 'Theo gợi ý mẫu' }],
  },
  {
    id: 'map-8902',
    code: 'SC-8902',
    title: 'Đèn chớp báo cháy lỗi nhấp nháy',
    description: 'Đội kỹ thuật đã thay bộ đèn và kiểm tra vận hành. Sự cố đang chờ đóng.',
    location: 'Tòa H2 · Hành lang tầng 2',
    category: 'INFRASTRUCTURE',
    priority: 'LOW',
    status: 'RESOLVED',
    receivedAt: '2026-11-09T03:15:00Z',
    latitude: 10.7642,
    longitude: 106.658,
    clusterable: false,
    allowedActions: [],
    suggestions: [],
  },
];

const clusterIncidents: MapIncident[] = Array.from({ length: 17 }, (_, index) => {
  const north = index < 5;
  const offset = north ? index : index - 5;
  return {
    id: `map-cluster-${index}`,
    code: `SC-${8800 + index}`,
    title: `${north ? 'Cảnh báo khu H' : 'Phản ánh phân khu Tây'} · Điểm ${offset + 1}`,
    description: 'Dữ liệu mẫu để kiểm tra marker và gom cụm theo mức zoom.',
    location: north ? 'Cụm tòa H · Phía Bắc' : 'Phân khu Tây · Khuôn viên',
    category: north ? 'FIRE' : 'INFRASTRUCTURE',
    priority: north ? (offset % 2 ? 'HIGH' : 'CRITICAL') : offset % 3 ? 'LOW' : 'MEDIUM',
    status: 'CONFIRMED',
    receivedAt: '2026-11-09T03:30:00Z',
    latitude: (north ? 10.766 : 10.7586) + Math.floor(offset / 4) * 0.00008,
    longitude: (north ? 106.6636 : 106.654) + (offset % 4) * 0.00008,
    clusterable: true,
    allowedActions: ['DISPATCH', 'CANCEL'],
    suggestions: [{ unitId: 'map-unit-long', distanceLabel: 'Gợi ý lực lượng mẫu' }],
  };
});

export const mapIncidents: readonly MapIncident[] = [...coreIncidents, ...clusterIncidents];
