'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { PaymentDialog } from '@/components/payment/payment-dialog';
import { Plan } from '@/lib/types';
import { usePlans } from '../hooks/use-plans';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const payMethods = [
  {
    key: 'alipay',
    label: '支付宝支付',
    icon: (
      <Image src="/alipay.jpg" alt="支付宝" width={28} height={28} style={{ borderRadius: 6 }} />
    ),
  },
  {
    key: 'wechat',
    label: '微信支付',
    icon: (
      <Image src="/wechat.jpg" alt="微信" width={28} height={28} style={{ borderRadius: 6 }} />
    ),
  },
];

export default function MobilePlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentPayMethod, setCurrentPayMethod] = useState<'alipay' | 'wechat' | null>(null);
  const { plans, invalidateOrders, isLoading, error } = usePlans();

  // 改进默认选中逻辑：当套餐加载完成且没有选中套餐时，默认选中第一个套餐
  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlan) {
      // 按价格排序，选择中等价格的套餐作为默认
      const sortedPlans = [...plans].sort((a, b) => a.price_cents - b.price_cents);
      const defaultIndex = Math.floor(sortedPlans.length / 2); // 选择中间位置的套餐
      setSelectedPlan(sortedPlans[defaultIndex]);
    }
  }, [plans, selectedPlan]);

  const handlePayment = (method: 'alipay' | 'wechat') => {
    setCurrentPayMethod(method);
    setPaymentDialogOpen(true);
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="px-2 py-3">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="px-2 py-3">
        <div className="text-center text-red-500 py-12">
          加载套餐失败，请刷新页面重试
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      {/* 套餐卡片横向排列 */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 w-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {plans?.length ? (
          plans
            .slice()
            .sort((a, b) => b.price_cents - a.price_cents)
            .map((plan, idx) => {
              const selected = selectedPlan?.id === plan.id || (!selectedPlan && idx === 1); // 默认选中金额第二高的
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'min-w-[110px] flex-1 rounded-xl shadow border-2 transition-all duration-150 cursor-pointer px-3 py-4 flex flex-col items-center justify-between relative',
                    selected ? 'border-[#e6b470] bg-orange-100' : 'bg-white border border-gray-200'
                  )}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="text-base font-semibold mb-1">{plan.name}</div>
                  <div className="text-2xl font-bold text-red-500 mb-1">
                    ¥{(plan.price_cents / 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{plan.features[0]}</div>
                  <div className="text-xs text-gray-400">{plan.features[1]}</div>
                  {selected && (
                    <Check
                      className="absolute top-2 right-2 text-[#E6B97A] bg-white rounded-full"
                      size={14}
                    />
                  )}
                </div>
              );
            })
        ) : (
          <div className="text-center text-gray-400 py-12 w-full">暂无可购买套餐</div>
        )}
      </div>

      {/* 支付方式选择 - 点击直接支付 */}
      <div className="flex flex-row-reverse items-center justify-between py-5 mb-4 gap-[20px]">
        {payMethods.map(m => (
          <Button
            key={m.key}
            size="lg"
            className="flex-1 justify-center py-6 transition-all duration-150 border bg-blue-500 hover:bg-blue-500 cursor-pointer text-white shadow-sm border-gray-200"
            onClick={() => handlePayment(m.key as 'alipay' | 'wechat')}
            disabled={!selectedPlan}
          >
            {m.icon}
            <span className="text-base font-medium ml-2">{m.label}</span>
          </Button>
        ))}
      </div>

      {/* 支付弹窗 */}
      {selectedPlan && currentPayMethod && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={selectedPlan}
          paymentMethod={currentPayMethod}
          onSuccess={() => {
            setPaymentDialogOpen(false);
            setCurrentPayMethod(null);
            invalidateOrders();
          }}
        />
      )}
    </div>
  );
}
