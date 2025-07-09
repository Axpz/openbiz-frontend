"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';

interface PaginationBarProps {
  currentPage: number;
  total: number; // total items count
  pageSize: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number; // 默认10
  maxPageLimit?: number; // 最大可访问页数限制
}

export function PaginationBar({
  currentPage,
  total,
  pageSize,
  onPageChange,
  maxPagesToShow = 10,
  maxPageLimit,
}: PaginationBarProps) {
  
  // 计算总页数，确保至少为1
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // 如果只有一页，不显示分页
  if (totalPages <= 1) return null;

  // 应用页数限制
  const effectiveTotalPages = maxPageLimit ? Math.min(totalPages, maxPageLimit) : totalPages;

  // 确保当前页在有效范围内
  const safeCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages);

  let start = 1;
  let end = effectiveTotalPages;

  // 计算要显示的页码范围
  if (effectiveTotalPages > maxPagesToShow) {
    const halfMax = Math.floor(maxPagesToShow / 2);
    if (safeCurrentPage <= halfMax + 1) {
      // 当前页靠近开始
      start = 1;
      end = maxPagesToShow;
    } else if (safeCurrentPage >= effectiveTotalPages - halfMax) {
      // 当前页靠近结束
      start = effectiveTotalPages - maxPagesToShow + 1;
      end = effectiveTotalPages;
    } else {
      // 当前页在中间
      start = safeCurrentPage - halfMax;
      end = start + maxPagesToShow - 1;
    }
  }

  const handlePageChange = (page: number) => {
    // 检查是否超出页数限制
    if (maxPageLimit && page > maxPageLimit) {
      toast.warning('您已达到当前权限的最大页数限制，请升级会员以查看更多结果');
      return;
    }
    
    // 确保页码在有效范围内
    const validPage = Math.min(Math.max(1, page), effectiveTotalPages);
    if (validPage !== safeCurrentPage) {
      onPageChange(validPage);
    }
  };

  return (
    <div className="flex items-center w-full">
      <Pagination className="flex-1">
        <PaginationContent className="gap-[2px]">
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(safeCurrentPage - 1);
              }}
              className={`text-blue-600 hover:underline ${safeCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              aria-disabled={safeCurrentPage === 1}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePageChange(safeCurrentPage - 1);
                }
              }}
            />
          </PaginationItem>
          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
            <PaginationItem key={page}>
              <span
                role="button"
                tabIndex={safeCurrentPage === page ? -1 : 0}
                aria-current={safeCurrentPage === page ? 'page' : undefined}
                onClick={() => safeCurrentPage !== page && handlePageChange(page)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && safeCurrentPage !== page) {
                    e.preventDefault();
                    handlePageChange(page);
                  }
                }}
                className={
                  (safeCurrentPage === page
                    ? 'text-black font-bold cursor-default'
                    : 'text-blue-600 hover:underline cursor-pointer') +
                  ' px-2 select-none transition-colors'
                }
              >
                {page}
              </span>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(safeCurrentPage + 1);
              }}
              className={`text-blue-600 hover:underline ${safeCurrentPage === effectiveTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              aria-disabled={safeCurrentPage === effectiveTotalPages}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePageChange(safeCurrentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {/* {maxPageLimit && totalPages > maxPageLimit && (
        <div className="text-sm text-gray-500 ml-4 whitespace-nowrap">
          显示前 {maxPageLimit} 页，共 {totalPages} 页
        </div>
      )} */}
    </div>
  );
} 