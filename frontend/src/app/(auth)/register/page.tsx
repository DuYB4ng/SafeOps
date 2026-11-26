import type { Metadata } from 'next';
import { AuthForm } from '@/features/auth/components/AuthForm';

export const metadata: Metadata = { title: 'Đăng ký — SafeOps' };

export default function RegisterPage() {
  return <AuthForm mode="register" key="register" />;
}
