import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { getEnv } from '@/lib/config';

function getApiBaseUrl(): string {
  try {
    return getEnv().NEXT_PUBLIC_API_BASE_URL;
  } catch {
    // Fallback to process.env during server-side rendering
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 51000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && window.ENV?.NEXT_PUBLIC_API_BASE_URL) {
      config.baseURL = window.ENV.NEXT_PUBLIC_API_BASE_URL;
    }
    
    // 从 localStorage 获取 token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // 如果有 token，添加到请求头
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // 处理 HTTP 错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          // if (typeof window !== 'undefined') {
          //   localStorage.removeItem('token');
          //   window.location.href = '/login';
          // }
          console.error('Unauthorized');
          // toast.error('用户未授权，请重新登录');
          break;
        case 403:
          // 权限不足
          console.error('Permission denied');
          toast.error('权限不足');
          break;
        case 404:
          // 资源不存在
          console.error('Resource not found');
          // toast.error('资源不存在');
          break;
        case 429:
          // 请求过多
          console.error('Request too many');
          toast.warning('请求过多，请稍后再试');
          break;
        case 500:
          // 服务器错误
          console.error('Server error');
          toast.error('服务器错误，请稍后再试');
          break;

        default:
          console.error('Unknown error');
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('No response received');
    } else {
      // 请求配置出错
      console.error('Request configuration error');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 