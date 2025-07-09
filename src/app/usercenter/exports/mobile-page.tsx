'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Trash2 } from 'lucide-react';
import { getStatusText, getStatusBadgeClassNames } from '@/lib/utils/export';
import { useExportRecords } from '@/app/usercenter/use-export-records';
import { PaginationBar } from '@/components/pagination-bar';

export default function MobileExportsPage() {
  const {
    currentPage,
    setCurrentPage,
    isLoading,
    paginatedExportRecords,
    totalExportItems,
    handleDelete,
    onDownload,
    pageSize,
  } = useExportRecords();

  return (
    <div className="px-2 space-y-3 mt-2">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </Card>
        ))
      ) : paginatedExportRecords.length > 0 ? (
        paginatedExportRecords.map(record => (
          <Card key={record.id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-base">企业查询数据导出</span>
              <span className={`text-sm ${getStatusBadgeClassNames(record.status)}`}>
                {getStatusText(record.status)}
              </span>
            </div>
            <div className="grid grid-cols-[70px_1fr] gap-y-1">
              <div className="text-sm text-black">记录ID</div>
              <div className="text-sm text-black">{record.id}</div>
              <div className="text-sm text-black">关键词</div>
              <div className="text-sm text-black">{record.keyword}</div>
              <div className="text-sm text-black">数量</div>
              <div className="text-sm text-black">{record.export_count}</div>
              <div className="text-sm text-black">时间</div>
              <div className="text-sm text-black">
                {new Date(record.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onDownload(record)}
                disabled={record.status !== 'complete'}
              >
                <Download className="w-4 h-4 mr-1" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive"
                onClick={() => handleDelete(record.id)}
                // disabled={record.status === 'complete'}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </Button>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray-400 py-12">暂无导出记录</div>
      )}

      {/* 分页组件 */}
      {totalExportItems > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t">
          <PaginationBar
            currentPage={currentPage}
            total={totalExportItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
