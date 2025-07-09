import './globals.css';   
import { Metadata } from 'next';
import axios from '@/lib/api/axios';
import { AnalyticsScript } from '@/components/analytics-script';
import { Providers } from '@/components/providers'
import Script from 'next/script';
import { Footer } from '@/components/footer';

// export const metadata: Metadata = {
//   title: 'OpenBiz',
//   description: 'OpenBiz - Your Business Management Platform',
// };

export async function generateMetadata(): Promise<Metadata> {
  try {
    // 注意：本地开发时请确保 NEXT_PUBLIC_SITE_URL 正确
    const res = await axios.get('/api/config/site');

    const config = res.data;

    return {
      title: config.siteName || '企天天',
      description: config.siteDescription || '企天天为您提供全国企业信息查询，包括企业工商信息查询，经营状况查询等相关信息。查企业就上企业云。',
      openGraph: {
        title: config.siteName || '企天天',
        url: config.siteUrl,
        siteName: config.siteName || '企天天',
        description: config.siteDescription || '企天天为您提供全国企业信息查询，包括企业工商信息查询，经营状况查询等相关信息。查企业就上企业云。',
        type: 'website',
      },
      icons: {
        icon: config.siteLogo || '/favicon.ico',
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);

    // 返回兜底默认配置，避免页面失败
    return {
      title: '企天天-企业查询系统',
      description: '企天天为您提供全国企业信息查询，包括企业工商信息查询，经营状况查询等相关信息。查企业就上企业云。',
      openGraph: {
        title: '企天天',
        url: 'https://hr.58sms.com',
        siteName: '企天天',
        description: '企天天为您提供全国企业信息查询，包括企业工商信息查询，经营状况查询等相关信息。查企业就上企业云。',
        type: 'website',
      },
      icons: {
        icon: '/favicon.ico',
      },
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="antialiased">
      <head>
        <Script src="/public/env-config.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-background font-sans flex flex-col min-w-0">
        <Providers>
          <div className="flex-grow flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
        <AnalyticsScript />
      </body>
    </html>
  );
}
