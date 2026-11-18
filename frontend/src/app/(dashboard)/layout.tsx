'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ConnectionBanner } from '@/components/feedback/connection-banner';
import { Header } from '@/components/layout/header';
import { NavItemKey, Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const activeNavKey = React.useMemo<NavItemKey>(() => {
    if (pathname.includes('/map')) return 'map';
    if (pathname.includes('/dispatch')) return 'dispatch';
    if (pathname.includes('/admin')) return 'admin';
    return 'dashboard';
  }, [pathname]);

  const handleSelectNav = (key: NavItemKey) => {
    switch (key) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'map':
        router.push('/map');
        break;
      case 'dispatch':
        router.push('/dispatch');
        break;
      case 'admin':
        router.push('/admin');
        break;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <ConnectionBanner isVisible={false} />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeItem={activeNavKey} onSelect={handleSelectNav} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-zinc-950">{children}</main>
      </div>
    </div>
  );
}
