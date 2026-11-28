import type { Metadata } from 'next';
import { ReporterHome } from '@/features/reports/components/ReporterHome';

export const metadata: Metadata = { title: 'Báo cáo của tôi — SafeOps' };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = await searchParams;
  const search = typeof query.q === 'string' ? query.q : '';
  return <ReporterHome key={search} initialSearch={search} />;
}
