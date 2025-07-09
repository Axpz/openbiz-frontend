'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, Trash2, ArrowLeftRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Order } from '@/lib/types';

interface OrderActionsProps {
  order: Order;
  onPayment: (order: Order) => void;
  onDelete: (orderId: string) => void;
  isDeleting?: boolean;
  size?: 'sm' | 'default';
}

export function OrderActions({ 
  order, 
  onPayment, 
  onDelete, 
  isDeleting = false,
  size = 'sm' 
}: OrderActionsProps) {
  if (order.status === 'PENDING') {
    return (
      <>
        <Button 
          variant="outline" 
          size={size} 
          className="text-[#1677ff]"
          onClick={() => onPayment(order)}
        >
          <CreditCard className="h-4 w-4 mr-1" />
          去支付
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size={size}
              className="text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? '删除中...' : '删除'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>确定要删除该订单吗？</AlertDialogTitle>
              <AlertDialogDescription>删除后将无法恢复，请谨慎操作。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-white border border-gray-300 text-black rounded-md px-6 py-2 hover:bg-gray-100"
                disabled={isDeleting}
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 text-white rounded-md px-6 py-2 hover:bg-red-600"
                disabled={isDeleting}
                onClick={() => onDelete(order.out_trade_no)}
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (order.status === 'PAID') {
    return (
      <>
        <Button 
          variant="outline" 
          size={size} 
          className="text-[#1677ff]"
          onClick={() => onPayment(order)}
        >
          <CreditCard className="h-4 w-4 mr-1" />
          续费
        </Button>
        {order.refund_status === 'NONE' && (
          <Button variant="outline" size={size} className="text-[#1677ff]">
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            申请退款
          </Button>
        )}
      </>
    );
  }

  return null;
} 