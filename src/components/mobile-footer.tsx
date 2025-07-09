'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useState } from 'react';
import { WechatLogin } from './wechat-login';
import { cn } from '@/lib/utils';

export function MobileFooter() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleUserCenterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    router.push('/usercenter');
  };

  const isHomeActive = pathname === '/';
  const isUserCenterActive = pathname.startsWith('/usercenter');

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-background border-t flex justify-around items-center h-16 z-50">
        <Link 
          href="/" 
          className={cn(
            "flex flex-col items-center text-xs flex-1 py-1 transition-colors",
            "hover:text-primary/80"
          )}
          prefetch={false}
        >
          <Home 
            size={24} 
            className={cn(
              "transition-colors",
              isHomeActive ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span
            className={cn(
              "whitespace-pre-line leading-tight text-xs transition-colors",
              isHomeActive 
                ? "text-primary font-semibold" 
                : "text-muted-foreground"
            )}
          >
            首页
          </span>
        </Link>
        
        <Link 
          href="/usercenter" 
          className={cn(
            "flex flex-col items-center text-xs flex-1 py-1 transition-colors",
            "hover:text-primary/80"
          )}
          prefetch={false}
          onClick={handleUserCenterClick}
        >
          <User 
            size={24} 
            className={cn(
              "transition-colors",
              isUserCenterActive ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span
            className={cn(
              "whitespace-pre-line leading-tight text-xs transition-colors",
              isUserCenterActive 
                ? "text-primary font-semibold" 
                : "text-muted-foreground"
            )}
          >
            我的
          </span>
        </Link>
      </nav>
      
      <WechatLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
} 