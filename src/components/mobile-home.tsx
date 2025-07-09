import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { EnterpriseInfo } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { CompanyLogo } from './company-logo';
import { MobileFooter } from './mobile-footer';
import { Separator } from './ui/separator';
import { parseUTCDateToLocalDate } from '@/lib/utils';

interface MobileHomeProps {
  companies: EnterpriseInfo[];
  loading?: boolean;
  onSearch?: (query: string) => void;
}

export function MobileHome({ companies, loading, onSearch }: MobileHomeProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    if (onSearch) {
      console.log('------onSearch', query);
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query.slice(0, 100))}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      {/* 顶部蓝色渐变 */}
      <div className="w-full h-48 bg-gradient-to-b from-[#1677ff] to-[#4bb0ff] relative">
        {/* 搜索框容器 - 完全居中 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-sm">
          <div className="text-white text-3xl font-bold text-center mb-6">查企业 就用企天天</div>
          {/* 搜索框 */}
          <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
            <Input
              type="search"
              placeholder="请输入企业名、老板名、品牌、地址、经营范围等关键词"
              className="flex-1 border-none outline-none ring-0 shadow-none focus:ring-0 focus:outline-none h-12 px-4 !text-base placeholder:!text-base appearance-none"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <Button
              className="rounded-none rounded-r-lg bg-[#ff6600] hover:bg-[#ff8800] text-white px-6 text-base h-12"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? '查询中...' : '查一下'}
            </Button>
          </div>
        </div>
      </div>

      {/* 企业列表 */}
      <div className="flex-1 py-0 overflow-y-auto max-w-screen-sm mx-auto w-full">
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
      </div>

      {/* 底部导航栏 */}
      <MobileFooter />
    </div>
  );
} 