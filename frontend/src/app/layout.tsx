import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'SafeOps — Trung tâm điều hành an ninh',
  description: 'Dashboard điều hành và bộ giao diện dùng chung SafeOps.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster theme="light" position="top-right" closeButton />
      </body>
    </html>
  );
}
