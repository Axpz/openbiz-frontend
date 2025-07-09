import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, Plan } from '@/lib/types';
import axios from '@/lib/api/axios';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export function useOrders() {
  const [orderPage, setOrderPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders', orderPage],
    queryFn: async () => {
      const res = await axios.get<{ orders: Order[]; total: number }>('/api/orders', {
        params: { page_index: orderPage - 1, page_size: PAGE_SIZE },
      });
      return {
        orders: res.data.orders ?? [],
        total: res.data.total ?? 0,
      };
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await axios.get<{ plans: Plan[] }>('/api/pricing/plans/all');
      return res.data.plans;
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await axios.delete(`/api/orders/${orderId}`);
    },
    onSuccess: () => {
      toast.success('订单删除成功');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast.error('订单删除失败');
    },
  });

  const handlePayment = (order: Order) => {
    const plan = plans?.find(p => p.name === order.product_id);
    if (plan) {
      setSelectedPlan(plan);
      setPaymentDialogOpen(true);
    } else {
      toast.error('未找到对应的会员套餐');
    }
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedPlan(null);
  };

  const onPaymentSuccess = () => {
    closePaymentDialog();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  return {
    orderPage,
    setOrderPage,
    ordersData,
    isOrdersLoading,
    plans,
    deleteOrderMutation,
    handlePayment,
    PAGE_SIZE,
    selectedPlan,
    paymentDialogOpen,
    setPaymentDialogOpen,
    closePaymentDialog,
    onPaymentSuccess,
  };
} 