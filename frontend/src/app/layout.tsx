import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafeOps — Quản trị & Điều phối An ninh',
  description: 'Hệ thống quản lý sự cố và chỉ huy an ninh thực tế SafeOps',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
