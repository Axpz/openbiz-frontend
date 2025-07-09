'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import axios from '@/lib/api/axios';
import isEqual from 'lodash/isEqual';

// Define the interfaces for better type safety and readability
interface SiteConfig {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  siteLogo: string;
  icpNumber: string;
  copyright: string;
  analyticsCode: string;
}

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, '请输入站点名称'),
  url: z.string().url('请输入有效的站点地址').min(1, '请输入站点地址'),
  description: z.string().optional(),
  logo: z.string().optional(), // This will store the URL of the logo
  record: z.string().optional(),
  copyright: z.string().optional(),
  analytics: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 定义一个默认的 Logo URL，当后端没有提供 Logo 时使用
const DEFAULT_FALLBACK_LOGO_URL = '/favicon0.ico'; //'https://picsum.photos/128/128'; // 您可以更换为其他可用的默认图片URL

export default function AdminSettingsPage() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // 新增状态：保存最初加载的默认Logo URL (可能是来自后端，也可能是预设的备用URL)
  const [defaultLogoUrl, setDefaultLogoUrl] = useState<string | undefined>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      logo: '',
      record: '',
      copyright: '',
      analytics: '',
    },
  });

  // Memoized function to initialize the form
  const initializeForm = useCallback(
    (data: SiteConfig) => {
      form.reset({
        name: data.siteName || '',
        url: data.siteUrl || '',
        description: data.siteDescription || '',
        logo: data.siteLogo || '', // 表单的logo字段仍使用后端数据
        record: data.icpNumber || '',
        copyright: data.copyright || '',
        analytics: data.analyticsCode || '',
      });

      // 确定初始显示的Logo URL
      const initialLogo = data.siteLogo || DEFAULT_FALLBACK_LOGO_URL;
      setLogoPreview(initialLogo); // 设置当前预览
      setDefaultLogoUrl(initialLogo); // 保存为默认/原始Logo，用于取消操作时回退
    },
    [form]
  );

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<SiteConfig>('/api/config/site');
        const data = response.data;
        setSiteConfig(data);
        initializeForm(data);
      } catch (error) {
        console.error('Failed to fetch config:', error);
        toast.error('获取配置失败，请稍后重试');
        // 如果获取失败，也尝试设置默认Logo
        setLogoPreview(DEFAULT_FALLBACK_LOGO_URL);
        setDefaultLogoUrl(DEFAULT_FALLBACK_LOGO_URL);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [initializeForm]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('图片大小不能超过50MB');
      return;
    }

    // Revoke any existing blob URL before creating a new one to prevent memory leaks
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setTempLogoFile(file);
  };

  const handleLogoConfirm = async () => {
    if (!tempLogoFile) {
      toast.error('请先选择图片');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', tempLogoFile);

      const response = await axios.post('/api/config/logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url } = response.data;

      // Revoke the temporary blob URL now that we have the permanent URL
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoPreview(url); // 更新预览为实际上传的URL
      form.setValue('logo', url, { shouldValidate: true }); // 更新表单的logo字段为实际URL
      setTempLogoFile(null); // 清除临时文件
      setDefaultLogoUrl(url); // 成功上传后，新的URL成为新的"默认/原始"URL
      toast.success('LOGO上传成功');
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error('LOGO上传失败，请重试');
      // 上传失败时，回退到原来的默认Logo
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(defaultLogoUrl); // 回退到默认Logo
      form.setValue('logo', defaultLogoUrl || '', { shouldValidate: true }); // 表单值也回退
      setTempLogoFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoCancel = useCallback(() => {
    // 如果当前的预览是一个本地的 blob URL，则释放它
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    // 回退 logo 预览到最初加载的默认 Logo
    setLogoPreview(defaultLogoUrl);
    setTempLogoFile(null); // 清除临时文件
    // 表单的logo字段也回退到默认Logo的URL
    form.setValue('logo', defaultLogoUrl || '', { shouldValidate: true });
  }, [logoPreview, defaultLogoUrl, form]);

  const handleLogoRemove = () => {
    // 释放任何现有的 blob URL
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(undefined); // 清除预览，显示"点击选择图片"区域
    setTempLogoFile(null); // 清除任何待处理的文件
    form.setValue('logo', '', { shouldValidate: true }); // 清除表单中的logo URL
    setDefaultLogoUrl(undefined); // 移除后，默认Logo也应清除
    toast.success('LOGO已移除，请点击保存更新');
  };

  const onSubmit = async (data: FormValues) => {
    if (!siteConfig) {
      toast.error('配置数据未加载，请稍后重试');
      return;
    }

    const currentData: SiteConfig = {
      siteName: data.name,
      siteUrl: data.url,
      siteDescription: data.description || '',
      siteLogo: data.logo || '',
      icpNumber: data.record || '',
      copyright: data.copyright || '',
      analyticsCode: data.analytics || '',
    };

    // Deep comparison to check for changes
    if (isEqual(currentData, siteConfig)) {
      toast.warning('当前数据未修改');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/config/site', currentData);
      setSiteConfig(currentData); // Update local state with the new config
      // 如果保存成功，确保 defaultLogoUrl 也更新为最新的已保存的logo
      setDefaultLogoUrl(currentData.siteLogo || undefined);
      toast.success('配置已更新');
    } catch (error) {
      console.error('Failed to update config:', error);
      toast.error('更新失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="网站设置" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
            >
              <Card className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none">
                <CardContent className="space-y-4 pt-4 w-full">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点名称</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入站点名称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点地址</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入站点地址" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点描述</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入站点描述" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Site Logo Upload Section */}
                  <FormItem>
                    <FormLabel>站点LOGO</FormLabel>
                    <div className="mt-2 flex flex-col gap-3">
                      {/* 如果有预览Logo，则显示Image组件 */}
                      {logoPreview ? (
                        <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group">
                          <Image
                            src={logoPreview}
                            alt="LOGO预览"
                            width={128}
                            height={128}
                            className="object-contain"
                            // 图片加载失败处理
                            onError={(e) => {
                                console.error("Error loading image:", e.currentTarget.src);
                                // 如果加载失败，将预览设置回默认Logo (如果存在) 或 清空
                                setLogoPreview(defaultLogoUrl || undefined);
                                toast.error("图片加载失败，请检查URL或重新上传");
                            }}
                          />
                          {/* 悬停时的操作按钮 */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <label
                              htmlFor="logo-upload"
                              className="p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                              title="重新选择图片"
                            >
                              <UploadCloud className="w-5 h-5 text-gray-700" />
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                                onClick={(event) => (event.currentTarget.value = '')}
                              />
                            </label>
                            {/* 只有当没有临时文件（即当前显示的是已上传或默认Logo）时，才显示"移除"按钮 */}
                            {!tempLogoFile && (
                              <Button
                                type="button"
                                onClick={handleLogoRemove}
                                variant="ghost"
                                size="icon"
                                className="p-2 bg-white rounded-full hover:bg-red-100 text-red-500"
                                title="移除LOGO"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // 如果没有预览Logo，则显示上传区域
                        <label
                          htmlFor="logo-upload"
                          className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50 text-gray-500"
                        >
                          <UploadCloud className="w-8 h-8 mb-2" />
                          <span className="text-sm">点击选择图片</span>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                            onClick={(event) => (event.currentTarget.value = '')}
                          />
                        </label>
                      )}

                      {/* 只有当选择了临时文件（新图片）时，才显示"确认上传"和"取消"按钮 */}
                      {tempLogoFile && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleLogoConfirm}
                            disabled={isUploading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            {isUploading ? '上传中...' : '确认上传'}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleLogoCancel}
                            variant="outline"
                            disabled={isUploading}
                          >
                            取消
                          </Button>
                        </div>
                      )}
                    </div>
                    {form.formState.errors.logo && (
                      <FormMessage>{form.formState.errors.logo.message}</FormMessage>
                    )}
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="record"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>网站备案号</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入网站备案号" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copyright"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>版权信息</FormLabel>
                        <FormControl>
                          <Input placeholder="版权所有..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="analytics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>站点统计</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="可粘贴统计脚本"
                            rows={6}
                            className="mt-2 font-mono w-full border rounded p-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="px-8 bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isSubmitting || isUploading}
                    >
                      {isSubmitting ? '保存中...' : '保存设置'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}