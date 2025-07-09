'use client';

import { useState } from 'react';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { PaginationBar } from '@/components/pagination-bar';
import { formatTime } from '@/lib/utils';
import Image from 'next/image';
import { ExportRecord, ExportListResponse } from '@/lib/types/export';
import { getStatusBadgeClassNames, getStatusText, handleDownload } from '@/lib/utils/export';
import { toast } from 'sonner';
import { Download, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SearchFilterBar } from '@/components/search-filter-bar';

const PAGE_SIZE = 20;

const getExports = async (
  currentPage: number, 
  searchText: string, 
  startDate: Date | undefined, 
  endDate: Date | undefined
): Promise<ExportListResponse> => {
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
  
  const res = await axios.get<ExportListResponse>('/api/export/list/admin', { params });
  return res.data;
};

export default function AdminExportsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [activeSearchText, setActiveSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['exports', currentPage, activeSearchText, 
      startDate?.toISOString().split('T')[0], 
      endDate?.toISOString().split('T')[0]
    ],
    queryFn: () => getExports(currentPage, activeSearchText, startDate, endDate),
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/export/${id}`);
    },
    onSuccess: () => {
      toast.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
    onError: error => {
      console.error('删除导出记录失败:', error);
      toast.error('删除失败');
    },
  });

  const onDownload = async (record: ExportRecord) => {
    try {
      await handleDownload(record);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '下载失败');
    }
  };

  const exportRecords = data?.export_logs || [];
  const users = data?.users || {};
  const totalExports = data?.total || 0;

  return (
    <>
      <PageHeader title="导出记录" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          <div
            key="导出记录"
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
                searchPlaceholder="搜索用户名或关键词"
              />
              <div className="text-sm text-gray-500">
                共 {totalExports} 条记录
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>用户</TableHead>
                    <TableHead>导出记录</TableHead>
                    <TableHead>关键词</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>地址</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : exportRecords.length > 0 ? (
                    exportRecords.map((record, idx) => (
                      <TableRow
                        key={record.id}
                        className={
                          idx % 2 === 0
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }
                      >
                        <TableCell className="font-medium text-gray-700 align-middle">
                          <div className="flex items-center gap-2">
                            {users[record.user_id!]?.avatar_url && (
                              <Image
                                src={users[record.user_id!].avatar_url}
                                alt={users[record.user_id!]?.nickname || ''}
                                className="rounded-full w-6 h-6"
                                width={20}
                                height={20}
                                unoptimized
                              />
                            )}
                            <span>{users[record.user_id!]?.nickname}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">{record.id}</TableCell>
                        <TableCell className="align-middle">{record.keyword}</TableCell>
                        <TableCell className="align-middle">{record.export_count}</TableCell>
                        <TableCell className="align-middle">{record.export_url}</TableCell>
                        <TableCell className="align-middle">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClassNames(record.status)}
                          >
                            {getStatusText(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-middle">
                          {formatTime(record.created_at)}
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex gap-2 items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#1677ff]"
                              onClick={() => onDownload(record)}
                              disabled={record.status !== 'complete'}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    删除后将无法恢复，确定要删除该导出记录吗？
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white border border-gray-300 text-black rounded-md px-6 py-2 hover:bg-gray-100">
                                    取消
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 text-white rounded-md px-6 py-2 hover:bg-red-600"
                                    onClick={() => deleteMutation.mutate(record.id)}
                                  >
                                    确认删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {totalExports > 0 && (
                <div className="mt-4 flex justify-center">
                  <PaginationBar
                    currentPage={currentPage}
                    total={totalExports}
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
