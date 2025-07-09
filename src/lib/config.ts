// lib/config.ts

interface ENV {
  NEXT_PUBLIC_API_BASE_URL?: string;
  SITE_LOGO?: string;
}

declare global {
  interface Window {
    ENV?: ENV;
  }
}

export function getEnv(): Required<ENV> {
  // Server-side
  if (typeof window === 'undefined') {
    return {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost',
      SITE_LOGO: process.env.SITE_LOGO ?? '/favicon.ico',
    };
  }

  // Client-side
  const env = window.ENV || {};
  return {
    NEXT_PUBLIC_API_BASE_URL: env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost',
    SITE_LOGO: env.SITE_LOGO ?? process.env.SITE_LOGO ?? '/favicon.ico',
  };
}
