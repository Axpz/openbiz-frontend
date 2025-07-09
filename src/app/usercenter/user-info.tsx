'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { UserRole } from '@/types/user';
import { MembershipResponse } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/user-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 用户类型定义
interface User {
  nickname: string;
  avatar_url: string;
  role: UserRole;
}

// 角色徽章组件
export const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleConfig = {
    admin: {
      label: '管理员',
      className: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200',
      icon: Crown,
    },
    member: {
      label: '会员',
      className: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      icon: Crown,
    },
    nonmember: {
      label: '非会员',
      className: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      icon: Crown,
    },
    user: {
      label: '普通用户',
      className: 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200',
      icon: User,
    },
  };

  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`transition-colors text-xs sm:text-sm flex items-center gap-1 px-2 py-1 ${config.className}`}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      {config.label}
    </Badge>
  );
};

// 会员状态组件
const MembershipStatus = ({ className }: { className?: string }) => {
  const { data: membershipResponse, error: membershipError } = useQuery({
    queryKey: ['membership'],
    queryFn: () =>
      axios.get<MembershipResponse>('/api/membership'),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
  
  // 从axios响应中提取数据
  const membershipData = membershipResponse?.data;
  
  // 处理会员数据加载错误
  if (membershipError) {
    console.error('会员数据加载失败:', membershipError);
  }

  if (!membershipData?.is_member) {
    return null;
  }

  const getMembershipExpiryText = () => {
    if (!membershipData?.membership?.end_date) {
      return null;
    }

    try {
      const endDate = new Date(membershipData.membership.end_date);
      const now = new Date();
      
      // 检查是否已过期
      if (endDate < now) {
        return { text: '会员已过期', isExpired: true };
      }
      
      const timeLeft = formatDistanceToNow(endDate, {
        addSuffix: false,
        locale: zhCN,
      });
      
      return { text: `会员到期还剩 ${timeLeft}`, isExpired: false };
    } catch (error) {
      console.error('日期解析错误:', error);
      return { text: '日期格式错误', isExpired: false };
    }
  };

  const expiryInfo = getMembershipExpiryText();
  if (!expiryInfo) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {/* <Calendar className="w-3 h-3 flex-shrink-0" /> */}
      <span className={`${expiryInfo.isExpired ? 'text-red-500' : 'text-emerald-600'} ${className}`}>
        {expiryInfo.text}
      </span>
    </div>
  );
};

// 续费按钮组件
const RenewalButton = () => (
  <Button 
    asChild 
    variant="link" 
    size="sm" 
    className="text-blue-600 hover:text-blue-700 p-0 h-auto text-xs"
  >
    <Link href="/pricing">
      立即续费
    </Link>
  </Button>
);

// 加载状态组件
export const UserInfoSkeleton = () => (
  <div className="flex flex-col items-center py-4 sm:py-6 space-y-2 sm:space-y-3 px-2 sm:px-4">
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 animate-pulse" />
    <div className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 sm:h-5 w-16 bg-gray-200 rounded animate-pulse" />
    <div className="h-3 sm:h-4 w-28 sm:w-32 bg-gray-200 rounded animate-pulse" />
    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />
  </div>
);

// 主用户信息组件
export const UserInfo = ({ user }: { user: User }) => {
  const isMobile = useIsMobile();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  // 如果用户为空，显示加载状态
  if (!user) {
    return ;
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="flex flex-col items-center py-4 sm:py-0 space-y-0 sm:space-y-3 px-2 sm:px-4">
        {isMobile ? (
          // 移动端水平布局 - 左右两侧贴近边距
          <div className="flex-row items-center justify-between w-full space-y-2">
            {/* 左侧：Avatar + nickname 组 */}
            <div className="flex items-center gap-2 flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto">
                    <Avatar className="w-12 h-12 border-2 border-gray-100/50 cursor-pointer">
                      <AvatarImage 
                        src={user.avatar_url} 
                        alt={user.nickname}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-sm font-semibold">
                        {user.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex flex-col items-start gap-1">
                <h3 className="font-bold text-base text-white truncate">
                  {user.nickname}
                </h3>
                <MembershipStatus className="text-white" />
              </div>
            </div>
          </div>
        ) : (
          // 桌面端垂直布局
          <>
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-100/50">
              <AvatarImage 
                src={user.avatar_url} 
                alt={user.nickname}
                className="object-cover"
              />
              <AvatarFallback className="text-sm sm:text-lg font-semibold">
                {user.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center space-y-1 sm:space-y-2 w-full">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate max-w-full">
                {user.nickname}
              </h3>
            </div>
            <div className="flex justify-center">
              {/* <RoleBadge role={user.role} /> */}
            </div>
            
            <MembershipStatus />
            
            <RenewalButton />
          </>
        )}
      </CardContent>
    </Card>
  );
};

// 兼容旧版本的函数（为了向后兼容）
export const getRoleBadge = (role: UserRole) => <RoleBadge role={role} />;

export const getMembershipExpiryText = (membershipData: MembershipResponse | undefined) => {
  if (!membershipData?.is_member || !membershipData?.membership?.end_date) {
    return null;
  }

  try {
    const endDate = new Date(membershipData.membership.end_date);
    const now = new Date();
    
    if (endDate < now) {
      return '会员已过期';
    }
    
    return formatDistanceToNow(endDate, {
      addSuffix: false,
      locale: zhCN,
    });
  } catch (error) {
    console.error('日期解析错误:', error);
    return '日期格式错误';
  }
};

export const renderUserInfo = (user: User) => {
  return <UserInfo user={user} />;
};