export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export interface PaymentResponse {
  success: boolean;
  result: {
    code_url?: string;
    mweb_url?: string;
    appId?: string;
    timeStamp?: string;
    nonceStr?: string;
    package?: string;
    signType?: string;
    paySign?: string;
    qr_code?: string;
    pay_url?: string;
  };
}

export interface WechatJSAPIParams {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

export interface PaymentError extends Error {
  code?: string;
  error?: string;
}

// 添加微信JSAPI类型定义
declare global {
  interface Window {
    WeixinJSBridge: {
      invoke(
        api: string,
        config: WechatJSAPIParams,
        callback: (res: { err_msg: string }) => void
      ): void;
    };
  }
} 

export const orderStatusConfig = {
  PAID: {
    label: '已付款',
    className:
      'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  CANCELLED: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-400',
  },
  REFUNDED: {
    label: '已退款',
    className:
      'bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-900/30 dark:text-amber-400',
  },
  FAILED: {
    label: '支付失败',
    className: 'bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400',
  },
  PENDING: {
    label: '待支付',
    className:
      'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400',
  },
} as const;

export const paymentChannels = {
  wechat: '微信支付',
  alipay: '支付宝',
} as const;

export type OrderStatus = keyof typeof orderStatusConfig;
export type PaymentChannel = keyof typeof paymentChannels; 