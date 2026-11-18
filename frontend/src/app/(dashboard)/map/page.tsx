import { Metadata } from 'next';
import { MapPlaceholder } from '@/features/map';

export const metadata: Metadata = {
  title: 'Bản đồ trực chiến — SafeOps',
  description: 'Giám sát vị trí cảm biến và lực lượng an ninh',
};

export default function MapPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Bản đồ Trực chiến An ninh
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Theo dõi phân bố vị trí sự cố, camera giám sát và đội phản ứng nhanh
        </p>
      </div>

      <MapPlaceholder />
    </div>
  );
}
