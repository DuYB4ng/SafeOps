import { notFound } from 'next/navigation';
import { reporterReports } from '../fixtures';
import { ReportDetail } from './ReportDetail';

export function ReportDetailScreen({ reportId }: { reportId: string }) {
  const report = reporterReports.find((item) => item.id === reportId);
  if (!report) notFound();
  return <ReportDetail report={report} />;
}
