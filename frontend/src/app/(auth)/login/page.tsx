import { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Đăng nhập — SafeOps',
  description: 'Đăng nhập hệ thống điều phối an ninh SafeOps',
};

export default function LoginPage() {
  return <LoginForm />;
}
