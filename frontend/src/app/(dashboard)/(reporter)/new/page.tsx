import type { Metadata } from 'next';
import { ReportCreate } from '@/features/reports/components/ReportCreate';

export const metadata: Metadata = { title: 'Tạo báo cáo — SafeOps' };

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ urgency?: string }>;
}) {
  const query = await searchParams;
  return <ReportCreate key={query.urgency} initialUrgency={query.urgency} />;
}
