'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';
import { PageHeader } from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

export interface ConfigVariable {
  key: string;
  label: string;
  placeholder: string;
  showDelete?: boolean;
}

export interface ConfigGroup {
  title: string;
  description: string;
  variables: ConfigVariable[];
}

const defaultValues = {
  WECHAT_APP_ID: '',
  WECHAT_APP_SECRET: '',
  WECHAT_REDIRECT_URI: '',
  WECHAT_PAY_APP_ID: '',
  WECHAT_PAY_APP_SECRET: '',
  WECHAT_PAY_MCH_ID: '',
  WECHAT_PAY_SERIAL_NO: '',
  WECHAT_PAY_API_V2_KEY: '',
  WECHAT_PAY_PRIVATE_KEY_PATH: '',
  WECHAT_PAY_NOTIFY_URL: '',
  WECHAT_PAY_SITE_URL: '',
};

const variableGroups: ConfigGroup[] = [
  {
    title: 'WeChat 开放平台配置',
    description: '用于微信第三方登录等功能',
    variables: [
      { key: 'WECHAT_APP_ID', label: 'APP_ID', placeholder: '请输入AppID' },
      { key: 'WECHAT_APP_SECRET', label: 'APP_SECRET', placeholder: '请输入AppSecret' },
      { key: 'WECHAT_REDIRECT_URI', label: 'REDIRECT_URI', placeholder: '请输入回调地址' },
    ],
  },
  {
    title: 'WeChatPay 配置',
    description: '用于微信支付相关功能',
    variables: [
      { key: 'WECHAT_PAY_APP_ID', label: 'APP_ID', placeholder: '请输入AppID' },
      { key: 'WECHAT_PAY_APP_SECRET', label: 'APP_SECRET', placeholder: '请输入AppSecret' },
      { key: 'WECHAT_PAY_MCH_ID', label: 'MCH_ID', placeholder: '请输入商户号' },
      { key: 'WECHAT_PAY_SERIAL_NO', label: 'SERIAL_NO', placeholder: '请输入商户证书序列号' },
      { key: 'WECHAT_PAY_API_V2_KEY', label: 'API_V2_KEY', placeholder: '请输入APIv2密钥' },
      { key: 'WECHAT_PAY_PRIVATE_KEY_PATH', label: 'PRIVATE_KEY_PATH', placeholder: '请输入商户私钥路径' },
      { key: 'WECHAT_PAY_NOTIFY_URL', label: 'NOTIFY_URL', placeholder: '请输入回调地址' },
      { key: 'WECHAT_PAY_SITE_URL', label: 'SITE_URL', placeholder: '请输入站点地址' },
    ],
  },
];

const getConfig = async () => {
  const res = await axios.get('/api/config');
  return {
    WECHAT_APP_ID: res.data.wechat.app_id,
    WECHAT_APP_SECRET: res.data.wechat.app_secret,
    WECHAT_REDIRECT_URI: res.data.wechat.redirect_uri,
    WECHAT_PAY_APP_ID: res.data.wechatpay.app_id,
    WECHAT_PAY_APP_SECRET: res.data.wechatpay.app_secret,
    WECHAT_PAY_MCH_ID: res.data.wechatpay.mch_id,
    WECHAT_PAY_SERIAL_NO: res.data.wechatpay.serial_no,
    WECHAT_PAY_API_V2_KEY: res.data.wechatpay.api_v2_key,
    WECHAT_PAY_PRIVATE_KEY_PATH: res.data.wechatpay.private_key_path,
    WECHAT_PAY_NOTIFY_URL: res.data.wechatpay.notify_url,
    WECHAT_PAY_SITE_URL: res.data.wechatpay.site_url,
  };
};

export default function WechatConfigPage() {
  const [values, setValues] = useState<Record<string, string>>({ ...defaultValues });
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({ ...defaultValues });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cfg = await getConfig();
        setValues({ ...cfg });
        setOriginalValues({ ...cfg });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGroupSave = async (group: ConfigGroup) => {
    const groupVars = group.variables.map(v => v.key);
    const postData = Object.fromEntries(
      Object.entries(values).filter(([k]) => groupVars.includes(k))
    );
    // 检查是否有变化
    const hasChanges = groupVars.some(key => values[key] !== originalValues[key]);
    if (!hasChanges) {
      toast.info('当前数据未修改');
      return;
    }
    try {
      await axios.post('/api/config', postData);
      toast.success('保存成功');
      setOriginalValues(prev => ({ ...prev, ...postData }));
    } catch {
      toast.error('保存失败');
    }
  };

  return (
    <>
      <PageHeader title="微信支付配置" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto py-10 px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          {variableGroups.map(group => ( 
            <div
              key={group.title}
              className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
            >
              <div className="px-8 pb-4">
                <div className="font-bold text-lg">{group.title}</div>
                <div className="text-gray-500 text-sm mt-1">{group.description}</div>
              </div>
              <div className="px-4 flex-1 flex flex-col">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-1/4 text-gray-700">变量名</TableHead>
                      <TableHead className="w-1/2 text-gray-700">变量值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.variables.map((v, idx) => (
                      <TableRow
                        key={v.key}
                        className={
                          idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                        }
                      >
                        <TableCell className="font-medium text-gray-700 align-middle">
                          {v.label}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Input
                            className="w-full min-w-0"
                            name={v.key}
                            value={values[v.key] || ''}
                            onChange={handleInputChange}
                            placeholder={v.placeholder}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end px-8 pt-6 mt-auto">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  variant="default"
                  onClick={() => handleGroupSave(group)}
                  disabled={loading}
                >
                  确认
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
