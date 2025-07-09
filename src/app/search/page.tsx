'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { CompanyList } from '@/components/company-list';
import { FilterBar, defaultFilterState } from '@/components/filter-bar';
import type { FilterState } from '@/components/filter-bar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import axios from '@/lib/api/axios';
import {
  EnterpriseHit,
  EnterpriseInfo,
  SearchResult,
  AvailableSearcherOptions,
  SearchFieldsMap,
  SearchMultiRequest,
  SearchFieldFilter,
} from '@/lib/types';
import { SortExportMenubar } from '@/components/sort-export-menubar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PaginationBar } from '@/components/pagination-bar';
import { useUser } from '@/contexts/user-context';
import { searchStorage } from '@/lib/utils/search-storage';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSearchPage from './mobile-page';
import { WechatLogin } from '@/components/wechat-login';

const timeRangeMap: Record<string, string> = {
  '3个月内': '{ "gte": "now-3M/d", "lte": "now/d" }',
  半年内: '{ "gte": "now-6M/d", "lte": "now/d" }',
  '1年内': '{ "gte": "now-1y/d", "lte": "now/d" }',
  '1-3年': '{ "gte": "now-3y/d", "lte": "now-1y/d" }',
  '3-5年': '{ "gte": "now-5y/d", "lte": "now-3y/d" }',
  '5-10年': '{ "gte": "now-10y/d", "lte": "now-5y/d" }',
  '10年以上': '{ "lte": "now-10y/d" }',
};

function SearchPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult>();
  const [availableSearcherOptions, setAvailableSearcherOptions] =
    useState<AvailableSearcherOptions>();
  const [companies, setCompanies] = useState<EnterpriseInfo[]>([]);
  const [searchMultiRequest, setSearchMultiRequest] = useState<SearchMultiRequest>();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLimit, setExportLimit] = useState(10);
  const exportBatchSize = 10000;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertAction, setAlertAction] = useState<(() => void) | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [provinceCityMap, setProvinceCityMap] = useState<Record<string, string[]>>({});
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>(defaultFilterState);
  
  const { data: userData } = useQuery({
    queryKey: ['membership'],
    queryFn: () =>
      axios.get<{
        is_member: boolean;
        membership?: {
          id: number;
          user_id: number;
          plan_id: number;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
        };
      }>('/api/membership'),
  });

  // 根据用户会员状态设置分页限制
  const maxPageLimit = userData?.data?.is_member ? 10 : 3; // 会员可看前10页，非会员只能看前3页

  const handleSearchResult = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setAlertTitle('输入错误');
      setAlertMessage('请输入查询内容');
      setAlertAction(null);
      setAlertDialogOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.get<SearchResult>('/api/search', {
        params: {
          q: query,
          page_index: page - 1,
          page_size: pageSize,
        },
      });
      setSearchResult(data);
      const companies =
        data.hits?.hits?.map((hit: EnterpriseHit) => hit._source as EnterpriseInfo) ?? [];
      setCompanies(companies);
      
      // 搜索完成后清理已使用的查询
      searchStorage.clearQuery();
      const industryBuckets = data.aggregations?.by_industry?.buckets ?? [];

      // get province city map
      const provinceBuckets = data.aggregations?.by_province?.buckets ?? [];
      const provinceCityMap: Record<string, string[]> = {};
      type CityBucket = { key: string };
      type ProvinceBucket = { key: string; by_city?: { buckets: CityBucket[] } };
      (provinceBuckets as ProvinceBucket[]).forEach((prov) => {
        provinceCityMap[prov.key] = (prov.by_city?.buckets ?? []).filter((city: CityBucket) => city.key !== "-").map((city: CityBucket) => city.key);
      });
      setProvinceCityMap(provinceCityMap);
      console.log('--------provinceCityMap', provinceCityMap);

      const industryOptions = industryBuckets
        .map(bucket => bucket.key)
        .filter(key => key !== '-' && key !== 'null' && key !== '');
      const provinceOptions = provinceBuckets
        .map(bucket => bucket.key)
        .filter(key => key !== '-' && key !== 'null' && key !== '');
      setAvailableSearcherOptions({
        keyword: query,
        provinces: provinceOptions,
        industries: industryOptions,
      });
      setCurrentPage(page);
    } catch (error) {
      setAlertTitle('搜索失败');
      setAlertMessage('搜索失败，请重试');
      setAlertAction(null);
      setAlertDialogOpen(true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q')?.slice(0, 100);
    const page = Number(searchParams.get('page')) || 1;
    if (query) {
      handleSearchResult(query, page);
      // 如果有URL参数，清理localStorage中的查询
      searchStorage.clearQuery();
    } else if (searchStorage.hasQuery()) {
      // 如果没有URL参数但有保存的查询，自动执行搜索
      const savedQuery = searchStorage.getQuery();
      router.push(`/search?q=${encodeURIComponent(savedQuery)}&page=1`);
    }
  }, [searchParams, router]);

  const handleHeaderSearch = async (q: string) => {
    // 如果用户未登录，保存查询并打开登录对话框
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}&page=1`);
  };

  const handleFilterChange = async (filterState: FilterState): Promise<void> => {
    console.log('filterState', filterState);
    setCurrentFilterState(filterState);

    let selectedScopes = ['企业名称', '法定代表人', '所属行业', '地址', '经营范围', '公司类型'];
    if (filterState.selectedScopes.length > 0) {
      selectedScopes = filterState.selectedScopes;
    }

    // 1. 处理所有选中的搜索范围
    const fieldFilters: SearchFieldFilter[] = selectedScopes
      .map(scope => {
        const field = SearchFieldsMap[scope as keyof typeof SearchFieldsMap];
        if (!field) {
          return null;
        }
        return {
          field_filter: {
            [field]: [],
          },
          weight: 1,
        } as SearchFieldFilter;
      })
      .filter((field): field is SearchFieldFilter => field !== null);

    // 2. 添加省份过滤
    if (filterState.selectedProvinces?.length) {
      fieldFilters.push({
        field_filter: {
          province: filterState.selectedProvinces,
        },
        weight: 1,
      } as SearchFieldFilter);
    }

    // 2.1 添加城市过滤
    if (filterState.selectedCities?.length) {
      fieldFilters.push({
        field_filter: {
          city: filterState.selectedCities,
        },
        weight: 1,
      } as SearchFieldFilter);
    }

    // 3. 添加行业过滤
    if (filterState.selectedIndustries?.length) {
      fieldFilters.push({
        field_filter: {
          industry: filterState.selectedIndustries,
        },
        weight: 1,
      } as SearchFieldFilter);
    }

    // 4. 添加时间范围过滤
    const timeRangeList = (filterState.selectedYearRanges ?? [])
      .map(range => timeRangeMap[range])
      .filter((timeRange): timeRange is string => Boolean(timeRange));

    console.log('timeRangeList', timeRangeList);

    if (timeRangeList.length > 0) {
      fieldFilters.push({
        field_filter: {
          establishment_date: timeRangeList,
        },
        weight: 1,
      } as SearchFieldFilter);
    }

    // 5. 添加电话邮箱网址过滤
    if (filterState.selectedPhoneEmailWebsite?.length) {
      const phoneEmailWebsiteList: string[] = [];
      if (filterState.selectedPhoneEmailWebsite.includes('电话')) {
        phoneEmailWebsiteList.push('phone');
      }
      if (filterState.selectedPhoneEmailWebsite.includes('邮箱')) {
        phoneEmailWebsiteList.push('email');
      }
      if (filterState.selectedPhoneEmailWebsite.includes('网址')) {
        phoneEmailWebsiteList.push('website');
      }
      if (phoneEmailWebsiteList.length > 0) {
        fieldFilters.push({
          field_filter: {
            exists: phoneEmailWebsiteList,
          },
          weight: 1,
        } as SearchFieldFilter);
      }
    }

    const requestData: SearchMultiRequest = {
      keyword: availableSearcherOptions?.keyword || '',
      field_filters: fieldFilters,
      page_index: currentPage - 1,
      page_size: pageSize,
    };

    const { data } = await axios.post<SearchResult>('/api/search/multi', requestData);
    console.log('d------------------------------twice?--ata', data);
    setSearchResult(data);
    const companies = data.hits?.hits?.map(hit => hit._source as EnterpriseInfo) ?? [];
    setCompanies(companies);
    setSearchMultiRequest(requestData);
  };

  const onSort = (type: 'establishment_date' | 'registered_capital', order: 'asc' | 'desc') => {
    console.log('handleSort', type, order);
    const sortedCompanies = [...companies].sort((a, b) => {
      if (type === 'establishment_date') {
        const dateA = new Date(a.establishment_date || '').getTime();
        const dateB = new Date(b.establishment_date || '').getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const capitalA = parseFloat(a.registered_capital || '0');
        const capitalB = parseFloat(b.registered_capital || '0');
        return order === 'asc' ? capitalA - capitalB : capitalB - capitalA;
      }
    });
    setCompanies(sortedCompanies);
  };

  const onExport = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const totalResults = searchResult?.hits?.total?.value ?? 0;
    if (totalResults <= 0) {
      setAlertTitle('无数据');
      setAlertMessage('没有可导出数据');
      setAlertAction(null);
      setAlertDialogOpen(true);
      return;
    }

    try {
      const { data } = await axios.get<{ available_limit: number }>(`/api/export/limit/today`);

      setExportLimit(data.available_limit);

      if (data.available_limit < 0) {
        setAlertTitle('升级会员');
        setAlertMessage('您不是会员，请升级为会员以获取导出权限');
        setAlertAction(() => () => router.push('/pricing'));
        setAlertDialogOpen(true);
        return;
      }

      if (data.available_limit == 0) {
        setAlertTitle('导出限制');
        setAlertMessage('今日导出次数已用完');
        setAlertAction(null);
        setAlertDialogOpen(true);
        return;
      }
      setExportDialogOpen(true);
    } catch {
      setAlertTitle('导出失败');
      setAlertMessage('导出请求失败，请重试');
      setAlertAction(null);
      setAlertDialogOpen(true);
    }
  };

  const doExport = async () => {
    setExportDialogOpen(false);
    
    try {
      await axios.post('/api/search/multi/export', {
        keyword: availableSearcherOptions?.keyword || '',
        field_filters: searchMultiRequest?.field_filters,
      });
      
      router.push('/usercenter');
      
    } catch {
      setAlertTitle('导出失败');
      setAlertMessage('导出请求失败，请重试');
      setAlertAction(null);
      setAlertDialogOpen(true);
    }
  };

  const handlePageChange = async (page: number) => {
    if (page < 1) return;

    // 检查页数限制
    if (page > maxPageLimit) {
      if (!user) {
        setIsLoginModalOpen(true);
        return;
      } else {
        setAlertTitle('页数限制');
        setAlertMessage('您已达到当前权限的最大页数限制（10页），请升级会员以查看更多结果');
        setAlertAction(null);
        setAlertDialogOpen(true);
        return;
      }
    }

    if (searchMultiRequest) {
      searchMultiRequest.page_index = page - 1;
      const { data } = await axios.post<SearchResult>('/api/search/multi', searchMultiRequest);
      console.log('data', data);
      setSearchResult(data);
      const companies = data.hits?.hits?.map(hit => hit._source as EnterpriseInfo) ?? [];
      setCompanies(companies);
      setCurrentPage(page);
    } else {
      handleSearchResult(searchParams.get('q')?.slice(0, 100) || '', page);
    }
  };

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <>
        <MobileSearchPage 
          onSearch={q => handleHeaderSearch(q)}
          loading={loading}
          companies={companies}
          total={searchResult?.hits?.total?.value ?? 0}
          currentPage={currentPage}
          maxPageLimit={maxPageLimit}
          onPageChange={handlePageChange}
          onExport={onExport}
          doExport={doExport}
          exportDialogOpen={exportDialogOpen}
          setExportDialogOpen={setExportDialogOpen}
          alertDialogOpen={alertDialogOpen}
          setAlertDialogOpen={setAlertDialogOpen}
          alertAction={alertAction ?? undefined}
          alertTitle={alertTitle}
          alertMessage={alertMessage}
          exportLimit={exportLimit}
          exportBatchSize={exportBatchSize}
          availableSearcherOptions={availableSearcherOptions}
          onFilterChange={handleFilterChange}
          provinceCityMap={provinceCityMap}
          initialFilterState={currentFilterState}
          isLoginModalOpen={isLoginModalOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
        <WechatLogin
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Header
        onSearch={q => handleHeaderSearch(q)}
        initialQuery={searchParams.get('q')?.slice(0, 100) || searchStorage.getQuery() || ''}
      />
      <Card className="mb-4 max-w-7xl mx-auto p-0">
        <CardHeader className="text-lg font-bold mt-4">筛选条件</CardHeader>
        <CardContent>
          <FilterBar
            availableSearcherOptions={availableSearcherOptions}
            provinceCityMap={provinceCityMap}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
      <Card className="max-w-7xl mx-auto mb-4 p-4">
        <CardHeader className="text-lg font-bold whitespace-nowrap flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              为您找到
              <em className="text-red-500 mx-1 not-italic">{searchResult?.hits.total.value}</em>
              条结果，耗时
              <em className="text-red-500 mx-1 not-italic">{(searchResult?.took ?? 0) / 1000}</em>秒
            </div>
            <div className="flex items-center gap-2">
              <SortExportMenubar onSort={onSort} onExport={onExport} />
            </div>
          </div>
        </CardHeader>
        <Separator className="my-0" />
        <div className="flex flex-col gap-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <CompanyList companies={companies} displayMode="search" />
              <PaginationBar
                currentPage={currentPage}
                total={searchResult?.hits?.total?.value ?? 0}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                maxPageLimit={maxPageLimit}
              />
            </>
          )}
        </div>
      </Card>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle>导出数据</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="text-base text-gray-700 mb-4 text-center">
            今日还可导出 <span className="text-blue-600 font-bold">{exportLimit}</span>{' '}
            次，每次可导出数据 <span className="text-blue-600 font-bold">{exportBatchSize}</span> 条
          </div>
          <div className="flex justify-center mt-4">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={doExport}
              disabled={exportLimit <= 0}
            >
              立即导出
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="sm:max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle>{alertTitle}</DialogTitle>
          </DialogHeader>
          <div className="text-base text-gray-700 mb-4 text-center">
            {alertMessage}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setAlertDialogOpen(false);
                if (alertAction) {
                  alertAction();
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <WechatLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
