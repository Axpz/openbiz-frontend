'use client';

import { WechatLogin } from '@/components/wechat-login';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center space-y-6">
          <WechatLogin isOpen={true} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
} 