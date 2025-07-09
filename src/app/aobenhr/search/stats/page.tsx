'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { PaginationBar } from '@/components/pagination-bar';
import { SearchFilterBar } from '@/components/search-filter-bar';

const PAGE_SIZE = 20;

interface SearchLog {
  keyword: string;
  count: number;
  latest_time: string;
}

export default function SearchStatsPage() {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'count' | 'latest_time'>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/search/stats/keywords');
        setLogs(res.data.logs || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    getLogs();
  }, []);

  // 排序后的数据
  const sortedLogs = [...logs].sort((a, b) => {
    if (sortField === 'count') {
      return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
    } else {
      // 时间字符串比较
      return sortOrder === 'asc'
        ? new Date(a.latest_time).getTime() - new Date(b.latest_time).getTime()
        : new Date(b.latest_time).getTime() - new Date(a.latest_time).getTime();
    }
  });

  // 根据搜索关键词和日期过滤
  const filteredLogs = sortedLogs.filter(log => {
    const matchKeyword = log.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const logTime = new Date(log.latest_time);
    const matchStart = !startDate || logTime >= startDate;
    const matchEnd = !endDate || logTime <= endDate;
    return matchKeyword && matchStart && matchEnd;
  });

  // 分页处理
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalFiltered = filteredLogs.length;

  const handleSort = (field: 'count' | 'latest_time') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc'); // 默认新字段为降序
    }
    setCurrentPage(1); // 重置到第一页
  };

  const handleSearch = () => {
    setSearchQuery(searchText);
    setCurrentPage(1); // 重置到第一页
  };

  const handleReset = () => {
    setSearchText('');
    setSearchQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1); // 重置到第一页
  };

  return (
    <>
    <PageHeader title="搜索统计" parentPath="/aobenhr" parentTitle="后台管理" />
    <Separator />
    <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
      <div className="flex flex-col gap-8">
        <div
          key="搜索统计"
          className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
        >
          <div className="overflow-x-auto">
            {/* 搜索栏 */}
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
                searchPlaceholder="请输入关键词"
              />
              <div></div>
            </div>
            {/* 表格 */}
            <div className="flex-1 flex flex-col">
              <div className="relative min-h-[200px]">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-200">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}
                <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="min-w-[120px] md:w-1/3">关键词</TableHead>
                        <TableHead className="min-w-[120px] md:w-1/3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 flex items-center gap-1 font-medium text-gray-700 hover:bg-transparent"
                            onClick={() => handleSort('count')}
                          >
                            搜索次数
                            <span className="flex flex-col ml-1">
                              <ChevronUp className={`w-4 h-4 ${sortField === 'count' && sortOrder === 'asc' ? 'text-blue-500' : 'text-gray-300'}`} />
                              <ChevronDown className={`w-4 h-4 -mt-2 ${sortField === 'count' && sortOrder === 'desc' ? 'text-blue-500' : 'text-gray-300'}`} />
                            </span>
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[120px] md:w-1/3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 flex items-center gap-1 font-medium text-gray-700 hover:bg-transparent"
                            onClick={() => handleSort('latest_time')}
                          >
                            最新搜索时间
                            <span className="flex flex-col ml-1">
                              <ChevronUp className={`w-4 h-4 ${sortField === 'latest_time' && sortOrder === 'asc' ? 'text-blue-500' : 'text-gray-300'}`} />
                              <ChevronDown className={`w-4 h-4 -mt-2 ${sortField === 'latest_time' && sortOrder === 'desc' ? 'text-blue-500' : 'text-gray-300'}`} />
                            </span>
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((v, idx) => (
                        <TableRow
                          key={v.keyword}
                          className={
                            idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                          }
                        >
                          <TableCell className="min-w-[120px] md:w-1/3 font-medium text-gray-700 align-middle">
                            <div className="flex items-center gap-2">
                              <span>
                                {v.keyword}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[120px] md:w-1/3 align-middle">{v.count}</TableCell>
                          <TableCell className="min-w-[120px] md:w-1/3 align-middle">{formatTime(v.latest_time)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* 分页 */}
              {Math.ceil(totalFiltered / PAGE_SIZE) > 1 && (
                <div className="mt-4">
                  <PaginationBar
                    currentPage={currentPage}
                    total={totalFiltered}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
