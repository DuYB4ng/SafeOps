import type { Metadata } from 'next';
import { ReportDetailScreen } from '@/features/reports/components/ReportDetailScreen';

export const metadata: Metadata = { title: 'Chi tiết phản ánh — SafeOps' };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailScreen reportId={id} />;
}
