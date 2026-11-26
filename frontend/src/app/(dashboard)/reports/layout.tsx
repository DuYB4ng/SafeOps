import { ReporterShell } from '@/features/reports/components/ReporterShell';
import '@/features/reports/reporter.css';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <ReporterShell>{children}</ReporterShell>;
}
