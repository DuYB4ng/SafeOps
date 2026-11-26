import { AuthShell } from '@/features/auth/components/AuthShell';
import '@/features/auth/auth.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
