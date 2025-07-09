"use client";

import { useUser } from '@/contexts/user-context';
import { User } from '@/types/user';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '../mobile-layout';
import MobilePlansPage from './mobile-page';

export default function PlansPage() {
  const { user } = useUser();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout user={user as User}>
        <MobilePlansPage />
      </MobileLayout>
    );
  }

  // PC端重定向到定价页面
  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">购买套餐</h1>
        <p className="text-gray-600">请前往 <a href="/pricing" className="text-blue-600 hover:underline">定价页面</a> 查看和购买套餐。</p>
      </div>
    </div>
  );
} 