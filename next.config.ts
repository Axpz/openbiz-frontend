import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // generate minimum running files for container deployment
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 表示允许所有 https 主机
      },
      {
        protocol: 'http',
        hostname: '**', // 可选：也允许 http 图片，但不推荐
      },
    ],
  },
};

export default nextConfig;
