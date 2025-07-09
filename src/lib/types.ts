export interface EnterpriseInfo {
  id?: number
  company_name: string
  legal_representative?: string
  registered_capital?: string
  establishment_date?: string // ISO 日期字符串
  operating_status?: string
  province?: string
  city?: string
  district?: string
  company_type?: string
  credit_code: string
  tax_number?: string
  registration_number?: string
  organization_code?: string
  phone?: string
  industry?: string
  address?: string
  website?: string
  email?: string
  business_scope?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  // 额外添加的字段
  self_risk_count?: number
  related_risk_count?: number
}

// 包含 Elasticsearch hit 元数据的结构
export interface EnterpriseHit {
  _score: number;
  _id: string;
  _index: string;
  _source: EnterpriseInfo;
  _type: string;
}

  export interface AggrBucket {
  key: string;
  doc_count: number;
}

export interface Aggr {
  buckets: AggrBucket[];
}

export interface AggrData {
  by_industry: Aggr;
  by_province: Aggr;
}

// 包含多个企业数据的结构（Elasticsearch响应的封装）
export interface SearchResult {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: EnterpriseHit[];
  };
  aggregations: AggrData;
}

export interface AvailableSearcherOptions {
  keyword?: string;
  searchScope?: string[];
  provinces?: string[];
  industries?: string[];
  yearRanges?: string[];
  orgStructureType?: string[];
  orgEconomicType?: string[];
  phoneEmailWebsite?: string[];
}

export const SearchFieldsMap: { [key: string]: string } = {
  '企业名称': 'company_name',
  '法定代表人': 'legal_representative',
  '注册资本': 'registered_capital',
  '成立日期': 'establishment_date',
  '经营状态': 'operating_status',
  '所属省份': 'province',
  '所属城市': 'city',
  '所属市区': 'city',
  '所属区县': 'district',
  '企业类型': 'company_type',
  '公司类型': 'company_type',
  '统一社会信用代码': 'credit_code',
  '纳税人识别号': 'tax_number',
  '工商注册号': 'registration_number',
  '组织机构代码': 'organization_code',
  '电话': 'phone',
  '联系电话': 'phone',
  '所属行业': 'industry',
  '注册地址': 'address',
  '地址': 'address',
  '网址': 'website',
  '邮箱': 'email',
  '经营范围': 'business_scope'
};

export const EnterpriseFieldsMap: { [key: string]: string } = {
  'company_name': '企业名称',
  'legal_representative': '法定代表人',
  'registered_capital': '注册资本',
  'establishment_date': '成立日期',
  'operating_status': '经营状态',
  'province': '所属省份',
  'city': '所属城市',
  'district': '所属区县',
  'company_type': '企业类型',
  'credit_code': '统一社会信用代码',
  'tax_number': '纳税人识别号',
  'registration_number': '工商注册号',
  'organization_code': '组织机构代码',
  'phone': '电话',
  'industry': '所属行业',
  'address': '注册地址',
  'website': '网址',
  'email': '邮箱',
  'business_scope': '经营范围'
};

// 定义字段过滤器（与后端的 SearchFieldFilter 一致）
export interface SearchFieldFilter {
  field_filter: Record<string, string[]>;
  weight: number;
}

// 定义主请求体（对应 SearchMultiRequest）
export interface SearchMultiRequest {
  keyword: string;
  page_index?: number;
  page_size?: number;
  index?: string;
  field_filters: SearchFieldFilter[];
}

export interface Order {
  id: number;
  out_trade_no: string;
  transaction_id?: string;
  user_id: number;
  product_id: string;
  body: string;
  total_fee_cents: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
  pay_time?: string;
  pay_channel: 'wechat' | 'alipay' | 'other';
  pay_method?: 'JSAPI' | 'NATIVE' | 'APP' | 'H5';
  refund_time?: string;
  refund_amount_cents?: number;
  refund_status?: 'NONE' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  client_ip?: string;
  extra?: {
    [key: string]: string | number | boolean | null | undefined;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  duration_days: number;
  daily_limit: number;
  max_export_count: number;
  currency: 'CNY' | 'USD';
  features: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 会员信息类型定义
export interface MembershipInfo {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipResponse {
  is_member: boolean;
  membership?: MembershipInfo;
}
