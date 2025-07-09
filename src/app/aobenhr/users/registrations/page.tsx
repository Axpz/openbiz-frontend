'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
// import { ConfigTable, ConfigGroup } from '@/components/config-table';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { User } from '@/types/user';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/components/ui/table';
import { formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
// import { PaginationBar } from '@/components/pagination-bar';
import { SearchFilterBar } from '@/components/search-filter-bar';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Check, X, Pencil, Trash2 } from 'lucide-react';

const PAGE_SIZE = 20;

const getGender = (gender: number) => {
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '未知';
};

interface UserRegistrationsResponse {
  registers: User[];
  total: number;
}

const getRegisters = async (
  currentPage: number, 
  searchText: string, 
  startDate: Date | undefined, 
  endDate: Date | undefined
): Promise<UserRegistrationsResponse> => {
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
  
  const res = await axios.get('/api/auth/wechat/registers', { params });
  return res.data;
};

export default function UserRegistrationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [activeSearchText, setActiveSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userRegistrations', currentPage, activeSearchText, 
      startDate?.toISOString().split('T')[0], 
      endDate?.toISOString().split('T')[0]
    ],
    queryFn: () => getRegisters(currentPage, activeSearchText, startDate, endDate),
    retry: (failureCount, error: unknown) => {
      // 如果是 4xx 错误，不重试
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          return false;
        }
      }
      // 最多重试 1 次
      return failureCount < 1;
    },
    retryDelay: 1000,
    staleTime: 30 * 1000, // 30秒
    refetchOnWindowFocus: false,
  });

  // 监听输入框焦点
  useEffect(() => {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
      const handleFocus = () => setShouldRestoreFocus(true);
      const handleBlur = () => setShouldRestoreFocus(false);
      
      searchInput.addEventListener('focus', handleFocus);
      searchInput.addEventListener('blur', handleBlur);
      
      return () => {
        searchInput.removeEventListener('focus', handleFocus);
        searchInput.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  // 恢复焦点
  useEffect(() => {
    if (shouldRestoreFocus && !isLoading) {
      const searchInput = document.getElementById('search-input') as HTMLInputElement;
      if (searchInput) {
        // 使用 setTimeout 确保 DOM 更新完成
        setTimeout(() => {
          searchInput.focus();
          // 将光标移到末尾
          const length = searchInput.value.length;
          searchInput.setSelectionRange(length, length);
        }, 0);
      }
    }
  }, [shouldRestoreFocus, isLoading, data]);

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

  // 显示加载状态
  if (isLoading) {
    return (
      <>
        <PageHeader title="用户注册" parentPath="/aobenhr" parentTitle="后台管理" />
        <Separator />
        <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <>
        <PageHeader title="用户注册" parentPath="/aobenhr" parentTitle="后台管理" />
        <Separator />
        <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
          <div className="flex justify-center items-center h-40">
            <div className="text-center text-red-500">
              <p>加载失败，请稍后重试</p>
              <p className="text-sm text-gray-500 mt-2">
                {error instanceof Error ? error.message : '未知错误'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="用户注册" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          <div
            key="用户注册"
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
                searchPlaceholder="搜索昵称、国家、省份、城市"
              />
              <div className="text-sm text-gray-500">
                共 {data?.total || 0} 条记录
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>昵称</TableHead>
                    <TableHead>性别</TableHead>
                    <TableHead>国家</TableHead>
                    <TableHead>省份</TableHead>
                    <TableHead>城市</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>最近登录时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.registers?.map((v: User, idx: number) => (
                    <TableRow
                      key={v.id}
                      className={
                        idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                      }
                    >
                      <TableCell className="font-medium text-gray-700 align-middle">
                        <div className="flex items-center gap-2">
                          {v.avatar_url && (
                            <Image
                              src={v.avatar_url}
                              alt={v.nickname}
                              width={20}
                              height={20}
                              className="rounded-full"
                              unoptimized
                            />
                          )}
                          <span>{v.nickname}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">{getGender(v.gender)}</TableCell>
                      <TableCell className="align-middle">{v.country}</TableCell>
                      <TableCell className="align-middle">{v.province}</TableCell>
                      <TableCell className="align-middle">{v.city}</TableCell>
                      <TableCell className="align-middle">{formatTime(v.created_at)}</TableCell>
                      <TableCell className="align-middle">{formatTime(v.updated_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!data?.registers || data.registers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  暂无数据
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
