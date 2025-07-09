'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import * as React from 'react';
import { FileOutput, ShoppingCart } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { useUser } from '@/contexts/user-context';
import { UserRole } from '@/types/user';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WechatLogin } from '@/components/wechat-login';
import { UserInfo, UserInfoSkeleton } from './user-info';

// 用户类型定义
interface User {
  nickname: string;
  avatar_url: string;
  role: UserRole;
}

const data = {
  user: {
    name: 'Admin',
    email: 'admin@example.com',
    avatar: '/favicon.ico',
  },
  navMain: [
    {
      title: '导出记录',
      url: '/usercenter',
      icon: FileOutput,
    },
    {
      title: '我的订单',
      url: '/usercenter/orders',
      icon: ShoppingCart,
    },
  ],
};

function UserCenterSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setIsLoginModalOpen(true);
    }
  }, [user, isLoading]);

  return (
    <>
      <Sidebar collapsible="offcanvas" className="flex flex-col bg-white" {...props}>
        <SidebarHeader className="flex flex-col items-center py-6">
          {isLoading ? (
            <UserInfoSkeleton />
          ) : user ? (
            <UserInfo user={user as User} />
          ) : null}
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} activePath={pathname} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      
      <WechatLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default function UserCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserCenterSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
