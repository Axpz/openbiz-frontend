"use client";

import { UserInfo } from './user-info';
import { NetworkStatusIndicator } from '@/components/network-status-indicator';
import { User } from '@/types/user';

interface MobileHeaderProps {
  user: User;
}

export function MobileHeader({ user }: MobileHeaderProps) {
  return (
    <>
      {/* 顶部栏 */}
      <div className="sticky top-0 z-10 bg-white px-4 py-0 border-b bg-gradient-to-b from-[#1677ff] to-[#4bb0ff]">
        {/* 用户头像和昵称 */}
        <UserInfo user={user} />
      </div>

      {/* 网络状态指示器 */}
      <NetworkStatusIndicator showText={true} className="mx-2 mt-2" />
    </>
  );
} 