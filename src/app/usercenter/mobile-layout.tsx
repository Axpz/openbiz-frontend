"use client";

import { MobileHeader } from './mobile-header';
import { MobileNavigator } from './mobile-navigator';
import { User } from '@/types/user';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { MobileFooter } from '@/components/mobile-footer';

interface MobileLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function MobileLayout({ children, user }: MobileLayoutProps) {
  const pathname = usePathname();
  
  // 根据当前路径确定activeTab
  const activeTab = useMemo(() => {
    if (pathname.includes('/orders')) return 'orders' as const;
    if (pathname.includes('/plans')) return 'plans' as const;
    return 'exports' as const;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader user={user} />
      <MobileNavigator activeTab={activeTab} />
      {children}
      <MobileFooter />
    </div>
  );
} 