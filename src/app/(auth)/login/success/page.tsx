'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from '@/lib/api/axios';
import { useUser } from '@/contexts/user-context';
import { searchStorage } from '@/lib/utils/search-storage';

function LoginSuccessContent() {
  const searchParams = useSearchParams();
  // const router = useRouter();
  const { updateUser } = useUser();
  const hasRedirected = useRef(false);

  // 跳转工具函数，避免重复代码
  const safeRedirect = (url: string) => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    if (window.parent !== window) {
      window.parent.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        console.error('Missing code or state parameter');
        // safeRedirect('/login');
        return;
      }

      try {
        // 调用后端API验证code和state
        const response = await axios.get('/api/auth/wechat/status', {
          params: { code, state },
        });
        const data = response.data;
        if (data.status === 'success' && data.user) {
          updateUser(data.user);
          // toast.success('登录成功');
          const query = searchStorage.getQuery();
          if (query) {
            safeRedirect(`/search?q=${encodeURIComponent(query.slice(0, 100))}`);
          } else {
            safeRedirect('/');
          }
        } else {
          console.error('Login failed:', data.message || data);
          // safeRedirect('/login');
        }
      } catch (error) {
        console.error('Error during login callback:', error);
        // safeRedirect('/login');
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, updateUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">处理登录中...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

export default function LoginSuccess() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">处理登录中...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    }>
      <LoginSuccessContent />
    </Suspense>
  );
}
