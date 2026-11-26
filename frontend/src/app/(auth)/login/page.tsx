import type { Metadata } from 'next';
import { AuthForm } from '@/features/auth/components/AuthForm';

export const metadata: Metadata = { title: 'Đăng nhập — SafeOps' };

export default function LoginPage() {
  return <AuthForm mode="login" key="login" />;
}
