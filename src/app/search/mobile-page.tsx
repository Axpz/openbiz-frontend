import { CompanyLogo } from '@/components/company-logo';
import { parseUTCDateToLocalDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { EnterpriseInfo } from '@/lib/types';
import { PaginationBar } from '@/components/pagination-bar';
import { SimpleSearchBox } from '@/components/header';
import { ArrowLeft, ChevronDown, Filter } from 'lucide-react';
import { searchStorage } from '@/lib/utils/search-storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MobileFilterDialog } from '@/components/mobile-filter-dialog';
import type { FilterState } from '@/components/filter-bar';
import { AvailableSearcherOptions } from '@/lib/types';
import { WechatLogin } from '@/components/wechat-login';
import { Separator } from '@/components/ui/separator';
import { MobileFooter } from '@/components/mobile-footer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type MobileSearchPageProps = {
  onSearch?: (q: string) => void | Promise<void>;
  // 从 page.tsx 传入的数据和状态
  loading?: boolean;
  companies?: EnterpriseInfo[];
  total?: number;
  currentPage?: number;
  maxPageLimit?: number;
  // 从 page.tsx 传入的函数
  onPageChange?: (page: number) => void;
  onExport?: () => void;
  doExport?: () => void;
  // 从 page.tsx 传入的对话框状态
  exportDialogOpen?: boolean;
  setExportDialogOpen?: (open: boolean) => void;
  alertDialogOpen?: boolean;
  setAlertDialogOpen?: (open: boolean) => void;
  alertAction?: () => void;
  alertTitle?: string;
  alertMessage?: string;
  exportLimit?: number;
  exportBatchSize?: number;
  // 新增的筛选相关 props
  availableSearcherOptions?: AvailableSearcherOptions;
  onFilterChange?: (filterState: FilterState) => void;
  provinceCityMap?: Record<string, string[]>;
  initialFilterState?: FilterState;
  // 新增的登录对话框相关 props
  isLoginModalOpen?: boolean;
  setIsLoginModalOpen?: (open: boolean) => void;
};

export default function MobileSearchPage({
  onSearch,
  loading = false,
  companies = [],
  total = 0,
  currentPage = 1,
  maxPageLimit = 10,
  onPageChange,
  onExport,
  doExport,
  exportDialogOpen = false,
  setExportDialogOpen,
  alertDialogOpen = false,
  setAlertDialogOpen,
  alertAction,
  alertTitle = '',
  alertMessage = '',
  exportLimit = 10,
  exportBatchSize = 10000,
  availableSearcherOptions,
  onFilterChange,
  provinceCityMap = {},
  initialFilterState,
  isLoginModalOpen = false,
  setIsLoginModalOpen,
}: MobileSearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q')?.slice(0, 100) || searchStorage.getQuery() || '');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  const pageSize = 10;
  // const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // 处理搜索框输入
  const handleSearchBox = () => {
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}&page=${page}`);
    }
  };

  // 处理导出
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  // 处理导出确认
  const handleDoExport = () => {
    if (doExport) {
      doExport();
    }
  };

  // 处理筛选变化
  const handleFilterChange = (filterState: FilterState) => {
    if (onFilterChange) {
      onFilterChange(filterState);
    }
  };

  // 返回按钮
  const onBack = () => {
    router.back();
  };

  // 占位：后续可接入真实筛选逻辑
  // const selectedRegion = '全国';
  // const selectedIndustry = '国标行业';

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      {/* 顶部搜索栏区域 */}
      <div className="sticky top-0 z-20 bg-white px-2 pt-2 pb-1 shadow-sm border-b">
        <div className="flex items-center gap-2">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="返回"
            className="h-8 w-8 rounded-full"
          >
            <ArrowLeft size={18} strokeWidth={4} />
          </Button>
          {/* 搜索输入框 */}
          <SimpleSearchBox
            query={query}
            loading={loading}
            onQueryChange={setQuery}
            onSearch={handleSearchBox}
          />
          <Popover open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <PopoverTrigger asChild>
            <span
              className="flex items-center cursor-pointer select-none text-sm font-medium text-gray-500 whitespace-nowrap"
              style={{ height: 40, padding: '0 12px' }}
            >
              <Filter size={13} strokeWidth={2} className="mr-1" />
              筛选
              <ChevronDown size={13} strokeWidth={2} className="ml-1" />
            </span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              className="w-screen max-w-none left-0 top-full rounded-b-2xl p-0 border-0"
              style={{ padding: 0 }}
            >
              <MobileFilterDialog
                onOpenChange={setFilterDialogOpen}
                availableSearcherOptions={availableSearcherOptions}
                onFilterChange={handleFilterChange}
                provinceCityMap={provinceCityMap}
                initialFilterState={initialFilterState}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* 结果统计栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b text-sm">
        <div className="flex items-center gap-2">
          <span>搜索到 <span className="text-red-500 font-bold">{total}</span> 条结果</span>
          <Button
            variant="link"
            size="sm"
            onClick={handleExport}
            className="h-auto p-0 text-blue-600 hover:text-blue-700"
          >
            导出数据
          </Button>
        </div>
        {/* <div className="text-xs">
          第 {currentPage}/{totalPages} 页
        </div> */}
      </div>
      
      {/* 企业列表 */}
      <div className="flex-1 py-0 overflow-y-auto max-w-screen-sm mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {companies.map((c, idx) => (
              <>
                <div
                  key={c.id || c.company_name || idx}
                  className="bg-white shadow p-3 w-full overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <CompanyLogo companyName={c.company_name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-gray-900 mb-1 truncate">{c.company_name}</div>
                      {/* 第一行：法人、注册资本、成立日期 */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                        <span>法定代表人：<span className="font-medium">{c.legal_representative || '-'}</span></span>
                        <span>注册资本：<span>{c.registered_capital || '-'}</span></span>
                        <span>成立日期：<span>{parseUTCDateToLocalDate(c.establishment_date || '')}</span></span>
                      </div>
                      {/* 第二行：电话、官网、邮箱 */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                        <span>电话：<span>{c.phone || '-'}</span></span>
                        <span>官网：<span>{c.website || '-'}</span></span>
                        <span>邮箱：<span>{c.email || '-'}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">统一社会信用代码：{c.credit_code || '-'}</div>
                      {/* 第三行：地址 */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                        <span>地址：<span>{c.address || '-'}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            ))}
            {/* 分页 */}
            <div className="py-2">
              <PaginationBar
                currentPage={currentPage}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                maxPageLimit={maxPageLimit}
              />
            </div>
          </>
        )}
      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-[320px] mx-auto rounded-2xl border-0 shadow-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">导出数据</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 mb-6 text-center space-y-2">
            <p>今日还可导出 <span className="text-blue-600 font-bold">{exportLimit}</span> 次</p>
            <p>每次可导出数据 <span className="text-blue-600 font-bold">{exportBatchSize}</span> 条</p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleDoExport}
              disabled={exportLimit <= 0}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              立即导出
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-[320px] mx-auto rounded-2xl border-0 shadow-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">{alertTitle}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 mb-6 text-center">
            {alertMessage}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setAlertDialogOpen?.(false);
                if (alertAction) {
                  alertAction();
                }
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <WechatLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen?.(false)}
        onSuccess={() => {
          setIsLoginModalOpen?.(false);
          // 登录成功后可以重新执行之前的操作
        }}
      />

      {/* 底部导航栏 */}
      <MobileFooter />
    </div>
  );
}