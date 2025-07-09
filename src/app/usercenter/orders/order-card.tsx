'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, Plan } from '@/lib/types';
import { orderStatusConfig, paymentChannels } from '@/lib/types/payment';
import { cn } from '@/lib/utils';
import { OrderActions } from './order-actions';

interface OrderCardProps {
  order: Order;
  plan?: Plan;
  onPayment: (order: Order) => void;
  onDelete: (orderId: string) => void;
  isDeleting?: boolean;
}

export function OrderCard({ 
  order, 
  plan, 
  onPayment, 
  onDelete, 
  isDeleting = false 
}: OrderCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 min-w-0 mr-4">
            <p className="font-medium truncate">{order.product_id}</p>
            {/* <p className="text-sm text-muted-foreground line-clamp-2">{order.body}</p>
            {plan && (
              <p className="text-xs text-muted-foreground">每日限额: {plan.daily_limit}次</p>
            )} */}
          </div>
          <Badge
            className={cn(
              'font-medium',
              orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.className
            )}
          >
            {orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.label || '未知状态'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="min-w-0">
            <p className="text-muted-foreground mb-1">订单号</p>
            <p className="truncate font-medium">{order.out_trade_no}</p>
            {order.transaction_id && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                交易号: {order.transaction_id}
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground mb-1">付款金额</p>
            <p className="font-medium">￥{(order.total_fee_cents / 100).toFixed(2)}</p>
            {order.refund_amount_cents && (
              <p className="text-xs text-red-500 mt-1">
                已退款: ￥{(order.refund_amount_cents / 100).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">下单时间</p>
          <p>{new Date(order.created_at).toLocaleString()}</p>
          {order.pay_time && (
            <p className="text-xs text-muted-foreground mt-1">
              支付时间: {new Date(order.pay_time).toLocaleString()}
            </p>
          )}
          {order.pay_channel && (
            <p className="text-xs text-muted-foreground mt-1">
              支付渠道:{' '}
              {paymentChannels[order.pay_channel as keyof typeof paymentChannels] || '其他'}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <OrderActions
            order={order}
            onPayment={onPayment}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
      </CardContent>
    </Card>
  );
} 