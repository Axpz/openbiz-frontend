'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { UserProvider } from '@/contexts/user-context'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AxiosError } from 'axios'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: unknown) => {
          // 如果是 4xx 错误，不重试
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
              return false;
            }
          }
          // 最多重试 2 次
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5分钟
        gcTime: 10 * 60 * 1000, // 10分钟
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false, // 不重试 mutations
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  )
} 