'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PaginationBar } from '@/components/pagination-bar';
import { PaymentDialog } from '@/components/payment/payment-dialog';
import { Order } from '@/lib/types';
import { cn } from '@/lib/utils';
import { orderStatusConfig, paymentChannels } from '@/lib/types/payment';
import { useOrders } from '../hooks/use-orders';
import { OrderCard } from './order-card';
import { OrderActions } from './order-actions';

export function OrdersTable() {
  const {
    orderPage,
    setOrderPage,
    ordersData,
    isOrdersLoading,
    plans,
    deleteOrderMutation,
    handlePayment,
    selectedPlan,
    paymentDialogOpen,
    setPaymentDialogOpen,
    onPaymentSuccess,
    PAGE_SIZE,
  } = useOrders();

  // 渲染桌面端表格行
  const renderTableRow = (order: Order) => {
    const plan = plans?.find(p => p.name === order.product_id);
    
    return (
      <TableRow key={order.id}>
        <TableCell>
          <div className="font-medium truncate">{order.product_id}</div>
          {plan && (
            <div className="text-xs text-muted-foreground mt-1">
              每日限额: {plan.daily_limit}次
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="text-sm truncate" title={order.out_trade_no}>
            {order.out_trade_no}
          </div>
          {order.transaction_id && (
            <div
              className="text-xs text-muted-foreground truncate"
              title={order.transaction_id}
            >
              交易号: {order.transaction_id}
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="font-medium">
            ￥{(order.total_fee_cents / 100).toFixed(2)}
          </div>
          {order.refund_amount_cents && (
            <div className="text-xs text-red-500">
              已退款: ￥{(order.refund_amount_cents / 100).toFixed(2)}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge
            className={cn(
              'font-medium',
              orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.className
            )}
          >
            {orderStatusConfig[order.status as keyof typeof orderStatusConfig]?.label ||
              '未知状态'}
          </Badge>
          {order.pay_channel && (
            <div className="text-xs text-muted-foreground mt-1">
              支付渠道:{' '}
              {paymentChannels[order.pay_channel as keyof typeof paymentChannels] ||
                '其他'}
            </div>
          )}
        </TableCell>
        <TableCell>
          <div>{new Date(order.created_at).toLocaleString()}</div>
          {order.pay_time && (
            <div className="text-xs text-muted-foreground">
              支付时间: {new Date(order.pay_time).toLocaleString()}
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <OrderActions
              order={order}
              onPayment={handlePayment}
              onDelete={deleteOrderMutation.mutate}
              isDeleting={deleteOrderMutation.isPending}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // 渲染移动端订单卡片
  const renderMobileOrder = (order: Order) => {
    const plan = plans?.find(p => p.name === order.product_id);
    return (
      <OrderCard
        key={order.id}
        order={order}
        plan={plan}
        onPayment={handlePayment}
        onDelete={deleteOrderMutation.mutate}
        isDeleting={deleteOrderMutation.isPending}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 py-4 border-b">
        <h2 className="text-lg sm:text-xl font-semibold">我的订单</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {/* 桌面视图 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品信息</TableHead>
                <TableHead>订单号</TableHead>
                <TableHead>付款金额</TableHead>
                <TableHead>订单状态</TableHead>
                <TableHead>下单时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isOrdersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : ordersData?.orders?.length ? (
                ordersData.orders.map(renderTableRow)
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    暂无订单
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 移动视图 */}
        <div className="md:hidden px-4">
          {isOrdersLoading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : ordersData?.orders.length ? (
            ordersData.orders.map(renderMobileOrder)
          ) : (
            <div className="text-center py-8 text-muted-foreground">暂无订单</div>
          )}
        </div>

        {/* 分页组件 */}
        {ordersData?.total ? (
          <div className="px-4 sm:px-6 py-4 border-t">
            <PaginationBar
              currentPage={orderPage}
              total={ordersData.total}
              pageSize={PAGE_SIZE}
              onPageChange={setOrderPage}
            />
          </div>
        ) : null}
      </div>

      {/* 支付对话框 */}
      {selectedPlan && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={selectedPlan}
          onSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
}
