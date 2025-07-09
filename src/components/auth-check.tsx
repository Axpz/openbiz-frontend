'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Loader2 } from 'lucide-react';

interface AuthCheckProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthCheck({ children, requireAdmin = false }: AuthCheckProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && requireAdmin && user && user.role !== 'admin') {
      // Optionally, redirect to home or show a message
      // router.push('/');
    }
  }, [user, isLoading, router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-lg font-semibold">
        您的权限不足，请联系管理员
      </div>
    );
  }

  return <>{children}</>;
} 