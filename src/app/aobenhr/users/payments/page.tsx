'use client';

import React, { useState } from 'react';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { Order } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { User } from '@/types/user';
import Image from 'next/image';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { orderStatusConfig, paymentChannels } from '@/lib/types/payment';
import { PaginationBar } from '@/components/pagination-bar';
import { useQuery } from '@tanstack/react-query';
import { SearchFilterBar } from '@/components/search-filter-bar';

const PAGE_SIZE = 20;

interface OrdersResponse {
  orders: Order[];
  users: Record<number, User>;
  total: number;
}

const getOrders = async (
  currentPage: number, 
  searchText: string, 
  startDate: Date | undefined, 
  endDate: Date | undefined
): Promise<OrdersResponse> => {
  const params: Record<string, string | number> = { 
    page_index: currentPage - 1, 
    page_size: PAGE_SIZE 
  };
  
  if (searchText) {
    params.q = searchText;
  }
  
  if (startDate) {
    params.start_date = startDate.toISOString().split('T')[0];
  }
  
  if (endDate) {
    params.end_date = endDate.toISOString().split('T')[0];
  }
  
  const res = await axios.get('/api/orders/admin', { params });
  return {
    orders: res.data.orders || [],
    users: res.data.users || {},
    total: res.data.total,
  };
};

export default function UserPaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [activeSearchText, setActiveSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', currentPage, activeSearchText, 
      startDate?.toISOString().split('T')[0], 
      endDate?.toISOString().split('T')[0]
    ],
    queryFn: () => getOrders(currentPage, activeSearchText, startDate, endDate),
    staleTime: 30 * 1000, // 30秒
    refetchOnWindowFocus: false,
  });

  const handleReset = () => {
    setSearchText('');
    setActiveSearchText('');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setActiveSearchText(searchText);
    setCurrentPage(1);
  };

  const orders = data?.orders || [];
  const users = data?.users || {};
  const total = data?.total || 0;

  return (
    <>
      <PageHeader title="付款记录" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          <div
            key="付款记录"
            className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
          >
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <SearchFilterBar
                searchText={searchText}
                onSearchTextChange={setSearchText}
                onSearch={handleSearch}
                onReset={handleReset}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                searchPlaceholder="搜索用户名或订单号"
              />
              <div className="text-sm text-gray-500">
                共 {total} 条记录
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>用户</TableHead>
                    <TableHead>订单号</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>支付时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <TableRow
                        key={order.id}
                        className={
                          idx % 2 === 0
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }
                      >
                        <TableCell className="font-medium text-gray-700 align-middle">
                          <div className="flex items-center gap-2">
                            {users[order.user_id]?.avatar_url && (
                              <Image
                                src={users[order.user_id].avatar_url}
                                alt={users[order.user_id]?.nickname || ''}
                                className="rounded-full w-6 h-6"
                                width={20}
                                height={20}
                                unoptimized
                              />
                            )}
                            <span>{users[order.user_id]?.nickname}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">{order.out_trade_no}</TableCell>
                        <TableCell className="align-middle">
                          ¥{(order.total_fee_cents / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="align-middle">
                          {paymentChannels[order.pay_channel as keyof typeof paymentChannels] || order.pay_channel}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              orderStatusConfig[order.status]?.className || 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {orderStatusConfig[order.status]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-middle">
                          {formatTime(order.created_at)}
                        </TableCell>
                        <TableCell className="align-middle">
                          {order.pay_time ? formatTime(order.pay_time) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {total > 0 && (
                <div className="mt-4 flex justify-center">
                  <PaginationBar
                    currentPage={currentPage}
                    total={total}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
