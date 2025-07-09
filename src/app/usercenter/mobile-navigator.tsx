"use client";

import { Download, ShoppingCart, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileNavigatorProps {
  activeTab: 'exports' | 'orders' | 'plans';
}

export function MobileNavigator({ activeTab }: MobileNavigatorProps) {
  const router = useRouter();

  // 用户中心导航项
  const navItems = [
    {
      label: '导出记录',
      href: '/usercenter',
      icon: Download,
      tab: 'exports' as const,
    },
    {
      label: '我的订单',
      href: '/usercenter/orders',
      icon: ShoppingCart,
      tab: 'orders' as const,
    },
    {
      label: '购买套餐',
      href: '/usercenter/plans',
      icon: Ticket,
      tab: 'plans' as const,
    },
  ];

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex justify-around items-center bg-white border-b shadow-sm">
      {navItems.map(({ label, href, icon: Icon, tab }) => {
        const active = activeTab === tab;
        return (
          <button
            key={href}
            onClick={() => handleTabClick(href)}
            className={`flex flex-col items-center flex-1 py-3 px-2 transition-all duration-200 ease-in-out ${
              active 
                ? 'text-blue-600 bg-blue-50 border-b-1' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 transition-colors duration-200 ${
              active ? 'text-blue-600 bg-blue-50 border-b-1' : 'text-gray-500'
            }`} />
            <span className={`text-xs font-medium transition-colors duration-200 ${
              active ? 'text-blue-600 bg-blue-50 border-b-1' : 'text-gray-600'
            }`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
} 