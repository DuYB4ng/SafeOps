import type { Metadata } from 'next';
import { OperatorMapScreen } from '@/features/map/components/OperatorMapScreen';
import 'leaflet/dist/leaflet.css';
import '@/features/map/operator-map.css';

export const metadata: Metadata = { title: 'Bản đồ điều hành OPERATOR — SafeOps' };

export default function MapPage() {
  return <OperatorMapScreen />;
}
