'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnterpriseInfo } from "@/lib/types"
import { GlobeIcon, AlertTriangleIcon } from "lucide-react"


    
interface Props {
  data: EnterpriseInfo
}

export function EnterpriseCard({ data }: Props) {
  const highlightKeywords = ["科技", "机械", "股份", "有限", "公司"]
  const splitName = data.company_name.split(new RegExp(`(${highlightKeywords.join('|')})`))

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-md bg-orange-100">
          <span className="text-2xl font-extrabold text-orange-600 select-none">
            {data.company_name.slice(0, 4)}
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">
              {splitName.map((part, idx) =>
                highlightKeywords.includes(part) ? (
                  <span key={idx} className="text-red-500">{part}</span>
                ) : part
              )}
            </h2>
            <Badge variant="outline" className="text-green-600 border-green-600">{data.operating_status || '状态未知'}</Badge>
            <Badge variant="secondary">小微企业</Badge>
            <Badge variant="secondary">赴港上市（01810.HK）</Badge>
          </div>
        </div>
      </div>

      <CardContent className="space-y-2 text-sm text-gray-700 p-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>法定代表人：<span className="font-medium">{data.legal_representative}</span></div>
          <div>注册资本：<span className="font-medium">{data.registered_capital}</span></div>
          <div>电话：<span className="font-medium">{data.phone}</span></div>
          <div>成立日期：<span className="font-medium">{data.establishment_date}</span></div>
          <div>邮箱：<span className="font-medium">{data.email}</span></div>
          <div>统一社会信用代码：<span className="font-medium">{data.credit_code}</span></div>
        </div>
        <div>地址：
          <span className="font-medium">
            {data.province}{data.city}{data.district}{data.address}
          </span>
        </div>

        {data.website && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-green-50 text-blue-600 px-2 py-0.5">
              <GlobeIcon className="w-4 h-4 inline-block mr-1" />
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {new URL(data.website).hostname}
              </a>
            </Badge>
          </div>
        )}

        {(data.self_risk_count || data.related_risk_count) && (
          <div className="flex items-center text-red-600 mt-2">
            <AlertTriangleIcon className="w-4 h-4 mr-1" />
            <span className="font-semibold">风险扫描：</span>
            <span className="ml-1">
              {data.self_risk_count || 0} 条自身风险，{data.related_risk_count || 0} 条关联风险
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
