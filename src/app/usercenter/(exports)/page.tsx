'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PaginationBar } from '@/components/pagination-bar';
import { getStatusBadgeClassNames, getStatusText } from '@/lib/utils/export';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/user-context';
import { User } from '@/types/user';
import { useExportRecords } from '@/app/usercenter/use-export-records';
import { MobileLayout } from '../mobile-layout';
import MobileExportsPage from '../exports/mobile-page';

export default function ExportsPage() {
  const isMobile = useIsMobile();
  const { user } = useUser();
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

  if (isMobile) {
    return (
      <MobileLayout user={user as User}>
        <MobileExportsPage />
      </MobileLayout>
    );
  }

  return (
    <>
      <PageHeader title="导出下载" parentPath="/usercenter" parentTitle="个人中心" />
      <div className="h-full w-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between w-full px-4 sm:px-6 py-4 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">导出下载</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>导出记录</TableHead>
                  <TableHead>关键词</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[120px]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedExportRecords.length > 0 ? (
                  paginatedExportRecords.map((record) => (
                    <TableRow key={record.id} className="border-b last:border-0">
                      <TableCell className="px-4 py-2">
                        <div className="font-medium truncate">{record.id}</div>
                        <div className="text-xs text-muted-foreground mt-1">{record.title}</div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="text-sm truncate" title={record.keyword}>
                          {record.keyword}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="font-medium">{record.export_count}</div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClassNames(record.status)}
                        >
                          {getStatusText(record.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div>{new Date(record.created_at).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex gap-2">
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                // disabled={record.status === 'complete'}
                              >
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
                                <AlertDialogCancel className="bg-white border border-gray-300 text-black rounded-md px-6 py-2 hover:bg-gray-100">取消</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-500 text-white rounded-md px-6 py-2 hover:bg-red-600" onClick={() => handleDelete(record.id)}>
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
                    <TableCell colSpan={6} className="text-center py-4">
                      暂无导出记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
        </div>
      </div>
    </>
  );
}

