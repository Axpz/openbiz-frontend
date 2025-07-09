'use client';

import React from 'react';
import { ConfigTable, ConfigGroup } from '@/components/config-table';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';

const defaultValues = {
  ALI_PAY_APP_ID: '',
  ALI_PAY_APP_SECRET: '',
  ALI_PAY_MCH_ID: '',
  ALI_PAY_SERIAL_NO: '',
  ALI_PAY_API_V2_KEY: '',
  ALI_PAY_PRIVATE_KEY_PATH: '',
  ALI_PAY_NOTIFY_URL: '',
  ALI_PAY_SITE_URL: '',
};

const variableGroups: ConfigGroup[] = [
  {
    title: 'AliPay 配置',
    description: '用于支付宝支付相关功能',
    variables: [
      { key: 'ALI_PAY_APP_ID', label: 'APP_ID', placeholder: '请输入AppID' },
      { key: 'ALI_PAY_APP_SECRET', label: 'APP_SECRET', placeholder: '请输入AppSecret' },
      { key: 'ALI_PAY_MCH_ID', label: 'MCH_ID', placeholder: '请输入商户号' },
      { key: 'ALI_PAY_SERIAL_NO', label: 'SERIAL_NO', placeholder: '请输入商户证书序列号' },
      { key: 'ALI_PAY_API_V2_KEY', label: 'API_V2_KEY', placeholder: '请输入APIv2密钥' },
      { key: 'ALI_PAY_PRIVATE_KEY_PATH', label: 'PRIVATE_KEY_PATH', placeholder: '请输入商户私钥路径' },
      { key: 'ALI_PAY_NOTIFY_URL', label: 'NOTIFY_URL', placeholder: '请输入回调地址' },
      { key: 'ALI_PAY_SITE_URL', label: 'SITE_URL', placeholder: '请输入站点地址' },
    ],
  },
];

const getConfig = async () => {
  const res = await axios.get('/api/config');
  return {
    ALI_PAY_APP_ID: res.data.alipay?.app_id,
    ALI_PAY_APP_SECRET: res.data.alipay?.app_secret,
    ALI_PAY_MCH_ID: res.data.alipay?.mch_id,
    ALI_PAY_SERIAL_NO: res.data.alipay?.serial_no,
    ALI_PAY_API_V2_KEY: res.data.alipay?.api_v2_key,
    ALI_PAY_PRIVATE_KEY_PATH: res.data.alipay?.private_key_path,
    ALI_PAY_NOTIFY_URL: res.data.alipay?.notify_url,
    ALI_PAY_SITE_URL: res.data.alipay?.site_url,
  };
};

export default function AliPayConfigPage() {
  const handleSave = async (groupTitle: string, values: Record<string, string>) => {
    try {
      const res = await axios.post('/api/config', values);
      console.log('保存成功', res.data);
    } catch (e) {
      console.error('保存失败', e);
    }
  };

  return (
    <>
    <PageHeader title="支付宝支付配置" parentPath="/aobenhr" parentTitle="后台管理" />
    <Separator />
    <ConfigTable
      groups={variableGroups}
      defaultValues={defaultValues}
      fetchConfig={getConfig}
      onSave={handleSave}
    />
    </>
  );
}
