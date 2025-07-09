'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnterpriseInfo } from '@/lib/types';
import { parseUTCDateToLocalDate } from '@/lib/utils';
import { CompanyLogo } from '@/components/company-logo';


export function CompanyList({
  companies,
  columns = 1,
  displayMode = 'homepage',
}: {
  companies: EnterpriseInfo[];
  columns?: 1 | 2 | 3 | 4;
  displayMode?: 'homepage' | 'search';
}) {
  // 类型颜色映射
  // const typeColor: Record<string, string> = {
  //   投资: 'bg-blue-500',
  //   科技: 'bg-purple-500',
  //   城市: 'bg-green-500',
  //   基金: 'bg-yellow-500',
  //   资产: 'bg-teal-500',
  //   // ...可扩展
  // };

  // 对 establishment_date 进行本地化转换
  const companiesWithLocalDate = companies.map(company => ({
    ...company,
    establishment_date: company.establishment_date ? parseUTCDateToLocalDate(company.establishment_date) : company.establishment_date,
  }));

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  const cardStyle =
    displayMode === 'search'
      ? 'flex items-start gap-2 p-0 hover:shadow-lg transition-all overflow-hidden border-0 shadow-none'
      : 'flex items-start gap-2 p-2 hover:shadow transition overflow-hidden border-0 shadow-none';

  return (
    <div className={`grid ${gridCols} gap-0`}>
      {companiesWithLocalDate.map(c => {
        return (
        <div key={c.id} className="space-y-0">
          {displayMode === 'search' ? (
            <Card className="overflow-hidden transition-colors hover:bg-blue-50/50 border-0 shadow-none">
              <div className="grid grid-cols-[1fr_9fr] gap-6 p-0">
                {/* 左侧 Logo 部分 */}
                <CompanyLogo companyName={c.company_name} size="lg" />

                {/* 右侧内容部分 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl text-gray-900">
                      {c.company_name}
                    </h2>
                    <Badge variant="outline" className="text-green-600 border-green-600 text-base">
                      {c.operating_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base">
                      {c.company_type}
                    </Badge>
                    <Badge variant="secondary" className="text-base">
                      {c.registered_capital}
                    </Badge>
                  </div>

                  <div className="text-base text-gray-600 mt-1 flex items-center gap-8 flex-wrap">
                    <span>法定代表人：<span className="font-medium">{c.legal_representative}</span></span>
                    <span>注册资本：<span className="font-base">{c.registered_capital}</span></span>
                    <span>成立日期：<span className="font-base">{c.establishment_date}</span></span>
                    <span>统一社会信用代码：<span className="font-base">{c.credit_code}</span></span>
                  </div>
                  <div className="text-base text-gray-600 mt-1 flex items-center gap-8 flex-wrap">
                    <span>电话：<span className="font-base">{c.phone}</span></span>
                    <span>邮箱：<span className="font-base">{c.email}</span></span>
                    <span>
                      官网：
                      <span className="ml-1">{c.website || '-'}</span>
                    </span>
                    <span>所属行业：<span className="font-base">{c.industry}</span></span>
                  </div>
                  <div className="text-base text-gray-600 mt-1 flex items-center gap-8 flex-wrap">
                    <div>
                      经营范围：
                      <span className="font-base">{c.business_scope}</span>
                    </div>
                  </div>
                  <div className="text-base text-gray-600 mt-1 flex items-center gap-8 flex-wrap">
                    <div>
                      地址：
                      <span className="font-base">{c.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className={cardStyle}>
              <CardContent className="flex items-start gap-2 p-0 overflow-hidden">
                {/* 左侧 Logo 部分 */}
                <CompanyLogo companyName={c.company_name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div
                    className={`truncate w-full min-w-0 text-lg`}
                  >
                    {c.company_name}
                  </div>
                  <div className={`text-gray-500 mt-1 truncate w-full min-w-0 text-sm`}>
                    成立日期：{c.establishment_date}
                  </div>
                  <div className={`text-gray-500 truncate w-full min-w-0 text-sm`}>
                    法人代表：{c.legal_representative}
                  </div>
                  <div className={`text-gray-500 truncate w-full min-w-0 text-sm`}>
                    注册资本：{c.registered_capital}
                  </div>
                  <div className={`text-gray-500 truncate w-full min-w-0 text-sm`}>
                    地址：{c.address}
                  </div>
                  {(c.credit_code || c.tax_number) && (
                    <div className={`text-gray-400 truncate w-full min-w-0 text-xs`}>
                      统一社会信用代码：{c.credit_code || c.tax_number}
                    </div>
                  )}
                    
                  <div className={`text-gray-400 truncate w-full min-w-0 text-xs`}>
                    电话：{c.phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Separator className="my-0" />
        </div>
      )})}
    </div>
  );
}
