import { useState, useEffect, useRef, useCallback } from "react";
// import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plan } from "@/lib/types";
import { PaymentResponse, PAYMENT_STATUS, PaymentStatus, WechatJSAPIParams } from "@/lib/types/payment";
import axios from "@/lib/api/axios";
import { isMobileBrowser, isWeChatBrowser } from "@/lib/utils";

declare global {
  interface Window {
    WeixinJSBridge: {
      invoke(
        api: string,
        config: {
          appId: string;
          timeStamp: string;
          nonceStr: string;
          package: string;
          signType: string;
          paySign: string;
        },
        callback: (res: { err_msg: string }) => void
      ): void;
    };
  }
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  paymentMethod?: 'alipay' | 'wechat';
  onSuccess?: () => void;
}

export function PaymentDialog({ open, onOpenChange, plan, paymentMethod = 'wechat', onSuccess }: PaymentDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [status, setStatus] = useState<PaymentStatus>(PAYMENT_STATUS.PENDING);
  const isProcessingRef = useRef(false);
  const pollingRef = useRef<{ interval: NodeJS.Timeout; timeout: NodeJS.Timeout } | null>(null);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current.interval);
      clearTimeout(pollingRef.current.timeout);
      pollingRef.current = null;
    }
  };

  const startPolling = useCallback((orderId: string) => {
    clearPolling();

    const poll = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`);
        if (!data?.success) throw new Error("获取订单状态失败");

        const orderStatus = data.order.status as PaymentStatus;
        setStatus(orderStatus);

        switch (orderStatus) {
          case PAYMENT_STATUS.PAID:
            // toast.success("支付成功");
            onSuccess?.();
            onOpenChange(false);
            return true;
          case PAYMENT_STATUS.FAILED:
            // toast.error("支付失败");
            onOpenChange(false);
            return true;
          case PAYMENT_STATUS.REFUNDED:
            // toast.error("订单已退款");
            return true;
          case PAYMENT_STATUS.CANCELLED:
            // toast.error("订单已取消");
            onOpenChange(false);
            return true;
        }
        return false;
      } catch (error) {
        console.error("轮询失败:", error);
        // toast.error("获取支付状态失败");
        return true;
      }
    };

    const interval = setInterval(async () => {
      const stop = await poll();
      if (stop) clearPolling();
    }, 3000);

    const timeout = setTimeout(() => {
      clearPolling();
      // toast.error("支付超时，请重新发起支付");
    }, 5 * 60 * 1000);

    pollingRef.current = { interval, timeout };
  }, [onSuccess, onOpenChange]);

  const handleJSAPIPayment = useCallback((wxPayResp: WechatJSAPIParams) => {
    const pay = () => {
      window.WeixinJSBridge.invoke(
        "getBrandWCPayRequest",
        {
          appId: wxPayResp.appId,
          timeStamp: wxPayResp.timeStamp,
          nonceStr: wxPayResp.nonceStr,
          package: wxPayResp.package,
          signType: wxPayResp.signType,
          paySign: wxPayResp.paySign,
        },
        (res) => {
          if (res.err_msg === "get_brand_wcpay_request:ok") {
            // toast.success("支付成功");
            onSuccess?.();
            onOpenChange(false);
          } else {
            // toast.error("微信支付失败：" + res.err_msg);
          }
        }
      );
    };
  
    // 兼容部分微信浏览器环境延迟注入 WeixinJSBridge 的情况
    if (typeof window.WeixinJSBridge === "undefined") {
      document.addEventListener("WeixinJSBridgeReady", pay, false);
    } else {
      pay();
    }
  }, [onSuccess, onOpenChange]);

  const handlePurchase = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
  
    try {
      const { data: purchaseResp } = await axios.post("/api/membership/purchases", {
        plan_id: plan.id,
        payment_method: paymentMethod,
      });
  
      if (!purchaseResp.success) throw new Error("创建购买记录失败");
  
      const { data: orderResp } = await axios.post("/api/orders/create", {
        plan_id: plan.id,
        payment_method: paymentMethod,
        out_trade_no: purchaseResp.out_trade_no,
      });
  
      if (!orderResp.success) throw new Error("创建订单失败");
  
      // 根据支付方式调用不同的支付接口
      let paymentEndpoint = "";
      if (paymentMethod === 'wechat') {
        paymentEndpoint = "/api/pay/wechat/create";
      } else if (paymentMethod === 'alipay') {
        paymentEndpoint = "/api/pay/alipay/create";
      } else {
        throw new Error("不支持的支付方式");
      }
  
      const { data } = await axios.post<PaymentResponse>(paymentEndpoint, {
        out_trade_no: purchaseResp.out_trade_no,
      });
  
      if (!data.success) throw new Error("创建支付订单失败");
      const payResp = data.result;
  
      if (paymentMethod === 'wechat') {
        if (isWeChatBrowser()) {
          if (
            payResp.appId &&
            payResp.timeStamp &&
            payResp.nonceStr &&
            payResp.package &&
            payResp.signType &&
            payResp.paySign
          ) {
            handleJSAPIPayment(payResp as WechatJSAPIParams);
          } else {
            throw new Error("支付参数不完整");
          }
        } else if (isMobileBrowser()) {
          if (payResp.mweb_url) {
            window.location.href = payResp.mweb_url;
          } else {
            throw new Error("获取 H5 支付链接失败");
          }
        } else {
          if (payResp.code_url) {
            setQrCodeUrl(payResp.code_url);
          } else {
            throw new Error("获取二维码失败");
          }
        }
      } else if (paymentMethod === 'alipay') {
        // 支付宝支付逻辑
        if (payResp.qr_code) {
          setQrCodeUrl(payResp.qr_code);
        } else if (payResp.pay_url) {
          window.location.href = payResp.pay_url;
        } else {
          throw new Error("获取支付宝支付链接失败");
        }
      }
  
      startPolling(purchaseResp.out_trade_no);
    } catch (err) {
      console.error("购买失败:", err);
      // toast.error("支付失败，请重试" + (err as Error).message);
      setStatus(PAYMENT_STATUS.FAILED);
    } finally {
      isProcessingRef.current = false;
    }
  }, [startPolling, handleJSAPIPayment, plan, paymentMethod]); 

  useEffect(() => {
    if (open && !isProcessingRef.current) {
      // 重置状态
      setStatus(PAYMENT_STATUS.PENDING);
      setQrCodeUrl("");
      // 自动开始支付流程
      handlePurchase();
    }
  }, [open, handlePurchase]);

  useEffect(() => {
    // 当对话框关闭时，停止轮询
    if (!open) clearPolling();
  
    // 当组件卸载时，停止轮询
    return () => clearPolling();
  }, [open]);
  

  const renderStatusMessage = () => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return (
          <div className="text-center">
            <p className="text-green-500 font-medium">支付成功！</p>
            <p className="text-sm text-muted-foreground">正在跳转...</p>
          </div>
        );
      case PAYMENT_STATUS.FAILED:
        return (
          <div className="text-center">
            <p className="text-red-500 font-medium">支付失败</p>
            <p className="text-sm text-muted-foreground">请重试或联系客服</p>
          </div>
        );
      case PAYMENT_STATUS.REFUNDED:
        return (
          <div className="text-center">
            <p className="text-orange-500 font-medium">订单已退款</p>
            <p className="text-sm text-muted-foreground">如有疑问请联系客服</p>
          </div>
        );
      case PAYMENT_STATUS.CANCELLED:
        return (
          <div className="text-center">
            <p className="text-gray-500 font-medium">订单已取消</p>
            <p className="text-sm text-muted-foreground">如有疑问请联系客服</p>
          </div>
        );
      default:
        const paymentText = paymentMethod === 'wechat' ? '微信' : '支付宝';
        return (
          <>
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={qrCodeUrl} size={200} />
            </div>
            <p className="text-sm text-muted-foreground">
              请使用{paymentText}扫描二维码完成支付
            </p>
            <p className="text-sm text-muted-foreground">
              支付金额：¥{(plan.price_cents / 100).toFixed(2)}
            </p>
          </>
        );
    }
  };

  const getDialogTitle = () => {
    return paymentMethod === 'wechat' ? '微信支付' : '支付宝支付';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {renderStatusMessage()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
