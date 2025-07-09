import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

interface NetworkStatusIndicatorProps {
  className?: string;
  showText?: boolean;
}

export function NetworkStatusIndicator({ 
  className = '', 
  showText = false 
}: NetworkStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  if (isOnline) {
    return null; // 在线时不显示任何内容
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 ${className}`}>
      <WifiOff className="w-4 h-4" />
      {showText && (
        <span className="text-sm font-medium">
          网络连接失败，请检查网络后重试
        </span>
      )}
    </div>
  );
}

// 简化的网络状态hook，供其他组件使用
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return isOnline;
} 