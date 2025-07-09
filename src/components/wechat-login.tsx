'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "@/lib/api/axios";
// import { toast } from 'react-toastify';
import { useUser } from '@/contexts/user-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isWeChatBrowser } from "@/lib/utils"; // Assuming you have this utility
import Link from "next/link";

// Declare global WxLogin type
declare global {
  interface Window {
    WxLogin: new (config: {
      self_redirect: boolean;
      id: string;
      appid: string;
      scope: string;
      redirect_uri: string;
      state?: string;
      style?: string;
      href?: string;
      onReady?: (isReady: boolean) => void;
      onQRcodeReady?: () => void;
    }) => void;
  }
}


type ConfigStatus = 'loading' | 'ready' | 'error';

interface WechatLoginProps { // Renamed from WechatQRModalProps
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Added onSuccess prop
}

interface WechatLoginConfig {
  app_id: string;
  redirect_uri: string;
  state: string;
  scope: string;
}

export function WechatLogin({ isOpen, onClose, onSuccess }: WechatLoginProps) {
  const { updateUser } = useUser();

  // State and refs for QR code login
  const [cfgStatus, setCfgStatus] = useState<ConfigStatus>('loading');
  const [wxLoginConfig, setWxLoginConfig] = useState<WechatLoginConfig>();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Common Logic for QR Code Login ---

  // Load WeChat login JS SDK
  useEffect(() => {
    // Only load the script if not in WeChat environment and the dialog is open
    if (!isWeChatBrowser() && isOpen) {
      const script = document.createElement('script');
      script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  const getLoginConfig = useCallback(async () => {
    try {
      setCfgStatus('loading');
      let loginApi = '/api/auth/wechat/login?type=qrcode';
      if (isWeChatBrowser()) {
        loginApi = '/api/auth/wechat/login';
      }
      const { data } = await axios.get<WechatLoginConfig>(loginApi);
      if (data.app_id && data.redirect_uri) {
        setWxLoginConfig(data);
        setCfgStatus('ready');
      } else {
        throw new Error('Failed to get login config');
      }
    } catch (error) {
      console.error('Failed to fetch login config:', error);
      setCfgStatus('error');
      // toast.error("获取登录配置失败");
    }
  }, []);

  // Initialize WeChat login (QR code)
  useEffect(() => {
    if (!isWeChatBrowser() && isOpen && cfgStatus === 'ready' && qrContainerRef.current && wxLoginConfig) {
      try {
        new window.WxLogin({
          self_redirect: true,
          id: "wx_login_container",
          appid: wxLoginConfig.app_id,
          scope: wxLoginConfig.scope,
          redirect_uri: wxLoginConfig.redirect_uri,
          state: wxLoginConfig.state,
          style: "black",
          href: "",
          onReady: () => {
            // 这里无需处理二维码图片，SDK会自动渲染iframe到wx_login_container
          },
          onQRcodeReady: () => {}
        });
      } catch (error) {
        console.error('Failed to initialize WxLogin:', error);
        setCfgStatus('error');
      }
    }
  }, [isOpen, cfgStatus, wxLoginConfig]);

  const checkScanStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/wechat/status');
      const data = response.data;

      if (data.status === 'success') {
        if (data.user) {
          updateUser(data.user);
          // toast.success('登录成功');
          onSuccess?.();
          onClose(); // Close the modal
          // router.push('/');
        }
      } else if (data.status === 'error') {
        // toast.error(data.message || '登录失败');
        setCfgStatus('error');
      }
    } catch (error) {
      console.error('Failed to check scan status:', error);
    }
  }, [updateUser, onSuccess, onClose]);

  // QR code login: fetch config and start polling
  useEffect(() => {
    if (isOpen) {
      getLoginConfig();
      // Start polling status
      // pollingIntervalRef.current = setInterval(checkScanStatus, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isOpen, getLoginConfig, checkScanStatus]);

  // --- Gongzhonghao Login Logic ---

  useEffect(() => {
    if (isWeChatBrowser() && isOpen && wxLoginConfig && cfgStatus === 'ready') {
      const appid = wxLoginConfig?.app_id; // Your Official Account AppID
      const redirect_uri = encodeURIComponent(wxLoginConfig?.redirect_uri || '');
      const state = wxLoginConfig?.state;
      const scope = wxLoginConfig?.scope || 'snsapi_userinfo'; // or snsapi_base

      // Redirect to WeChat authorization URL
      window.location.href =
        `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    }
  }, [isOpen, wxLoginConfig, cfgStatus]); // Depend on isOpen to trigger only when modal is open

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-4 w-full h-full min-h-[300px]">
          {isWeChatBrowser() ? (
            // 微信内，显示跳转提示
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              加载中...正在跳转到微信授权页面
            </div>
          ) : (
            // 普通浏览器，显示二维码
            <div className="relative w-[300px] h-[360px] bg-white rounded-lg border-none overflow-hidden flex items-center justify-center">
              <iframe
                src={`https://open.weixin.qq.com/connect/qrconnect?appid=${wxLoginConfig?.app_id}&scope=snsapi_login&redirect_uri=${wxLoginConfig?.redirect_uri}&state=${wxLoginConfig?.state}#wechat_redirect`}
                style={{ 
                  border: "none",
                  overflow: "hidden",
                  width: "100%",
                  height: "100%"
                }}
                className="w-full h-full"
                title="微信登录二维码"
                scrolling="no"
                frameBorder="0"
              ></iframe>
              {/* 底部遮罩层，覆盖"翱奔科技" */}
              <div className="absolute bottom-0 left-0 w-full h-[40px] bg-white" />
              {/* 自定义提示文案 */}
              <div className="absolute bottom-0 left-0 w-full text-center text-xs leading-[40px] px-2 bg-white">
                <span className="text-muted-foreground">登录即已阅读并同意</span>
                <Link href="/user-agreement" className="text-blue-500 hover:underline mx-1" target="_blank">
                  《用户协议》
                </Link>
                和
                <Link href="/privacy-policy" className="text-blue-500 hover:underline mx-1" target="_blank">
                  《隐私政策》
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}