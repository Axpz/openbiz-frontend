"use client";

import { useUser } from '@/contexts/user-context';
import { User } from '@/types/user';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '../mobile-layout';
import MobileOrdersPage from './mobile-page';
import { OrdersTable } from './orders-table';
import { PageHeader } from '@/components/page-header';

export default function OrdersPage() {
  const { user } = useUser();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout user={user as User}>
        <MobileOrdersPage />
      </MobileLayout>
    );
  }

  return (
    <>
      <PageHeader title="订单管理" parentPath="/usercenter" parentTitle="个人中心" />
      <OrdersTable />
    </>
  );
}