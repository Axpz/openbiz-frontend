import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportListResponse, ExportRecord } from '@/lib/types/export';
import { handleDownload } from '@/lib/utils/export';
import axios from '@/lib/api/axios';
import { AxiosError } from 'axios';
import { useNetworkStatus } from '@/components/network-status-indicator';
import { useIsMobile } from '@/hooks/use-mobile';

export function useExportRecords() {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const isOnline = useNetworkStatus();

  // 根据设备类型和网络状态自动选择最佳配置
  const pageSize = isMobile ? 10 : 20;
  const enableRefetch = !isMobile && isOnline; // 桌面端且在线时启用自动刷新

  const { data: exportData, isLoading } = useQuery<ExportListResponse, Error>({
    queryKey: ['exportRecords', currentPage, pageSize],
    queryFn: async () => {
        const res = await axios.get<ExportListResponse>('/api/export/list/user', {
          params: {
            page_index: currentPage - 1,
            page_size: pageSize,
          },
        });
        if (res.status !== 200) {
          throw new Error('获取导出记录失败');
        }
        return {
          export_logs: res.data?.export_logs || [],
          total: res.data?.total || 0
        };
    },
    retry: (failureCount, error: unknown) => {
      // 如果是网络错误且离线，不重试
      if (!isOnline) return false;
      
      // 如果是 4xx 错误，不重试
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          return false;
        }
      }
      
      // 移动端最多重试1次，桌面端最多重试2次
      return failureCount < (isMobile ? 1 : 2);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
    refetchInterval: enableRefetch ? (query) => {
      const data = query.state.data;
      const hasPendingRecords = data?.export_logs?.some(
        (record) => record.status === 'pending' || record.status === 'progress'
      );
      return hasPendingRecords ? 5000 : false;
    } : false,
    refetchIntervalInBackground: enableRefetch,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // 网络重连时自动刷新
    staleTime: isMobile ? 10000 : 0, // 移动端缓存10秒，桌面端不缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收时间
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await axios.delete(`/api/export/${id}`);
        if (res.status !== 200) {
          throw new Error('删除导出记录失败');
        }
        return res.data;
     
    },
    onSuccess: () => {
      toast.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['exportRecords'] });
    },
    onError: (error) => {
      console.error("删除导出记录失败:", error);
      const errorMessage = !isOnline ? '网络连接失败，请检查网络后重试' : '删除失败';
      toast.error(errorMessage);
    },
  });

  const handleDelete = (id: string) => {
    if (!isOnline) {
      toast.error('网络连接失败，请检查网络后重试');
      return;
    }
    deleteMutation.mutate(id);
  };

  const onDownload = async (record: ExportRecord) => {
    if (!isOnline) {
      toast.error('网络连接失败，请检查网络后重试');
      return;
    }
    
    try {
      await handleDownload(record);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '下载失败');
    }
  };

  const paginatedExportRecords = exportData?.export_logs || [];
  const totalExportItems = exportData?.total || 0;

  return {
    currentPage,
    setCurrentPage,
    isLoading,
    paginatedExportRecords,
    totalExportItems,
    handleDelete,
    onDownload,
    deleteMutation,
    pageSize,
    isMobile,
    isOnline,
  };
} 