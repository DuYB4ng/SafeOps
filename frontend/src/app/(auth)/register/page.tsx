import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Đăng ký — SafeOps',
  description: 'Đăng ký tài khoản hệ thống SafeOps',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
