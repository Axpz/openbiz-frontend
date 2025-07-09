"use client";

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { PaginationBar } from '@/components/pagination-bar';
import { PaymentDialog } from '@/components/payment/payment-dialog';
import { useOrders } from '../hooks/use-orders';
import { OrderCard } from './order-card';

export default function MobileOrdersPage() {
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

  // 渲染加载状态
  const renderLoadingSkeletons = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="p-4">
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </Card>
    ))
  );

  // 渲染订单列表
  const renderOrders = () => {
    if (!ordersData?.orders?.length) {
      return <div className="text-center text-gray-400 py-12">暂无订单</div>;
    }

    return ordersData.orders.map((order) => {
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
    });
  };

  return (
    <div className="px-2 space-y-3 mt-2">
      {isOrdersLoading ? renderLoadingSkeletons() : renderOrders()}
      
      {/* 分页组件 */}
      {ordersData && ordersData.total > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t">
          <PaginationBar
            currentPage={orderPage}
            total={ordersData.total}
            pageSize={PAGE_SIZE}
            onPageChange={setOrderPage}
          />
        </div>
      )}
      
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