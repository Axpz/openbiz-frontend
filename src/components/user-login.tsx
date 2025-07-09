'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { WechatLogin } from "./wechat-login";
import { useUser } from '@/contexts/user-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

interface UserLoginProps {
  className?: string;
}

export function UserLogin({ className = '' }: UserLoginProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, isLoading, logout } = useUser();
  const router = useRouter();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150); // 150ms延迟，避免闪烁
  };

  const handleAvatarClick = () => {
    router.push('/usercenter');
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className={`flex items-center gap-2 ${className} px-2`}>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleAvatarClick}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} alt={user.nickname || ''} />
                <AvatarFallback>
                  {user.nickname ? user.nickname.slice(0, 2) : '用户'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56" 
            align="end" 
            forceMount
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.nickname || '用户'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.province} {user.city}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAvatarClick} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>个人中心</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span 
        className={`cursor-pointer transition-colors whitespace-nowrap hover:text-blue-500 ${className}`} 
        style={{ fontSize: 'inherit' }}
        onClick={() => setIsLoginModalOpen(true)}
      >
        登录
      </span>
      
      <WechatLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
} 