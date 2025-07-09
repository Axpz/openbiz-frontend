'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';

export function AnalyticsScript() {
  const [analyticsCode, setAnalyticsCode] = useState<string>('');

  useEffect(() => {
    const fetchAnalyticsCode = async () => {
      try {
        const res = await axios.get('/api/config/site');
        if (res.data.analyticsCode) {
          console.log('Analytics code loaded:', res.data.analyticsCode);
          setAnalyticsCode(res.data.analyticsCode);
        }
      } catch (error) {
        console.error('Failed to fetch analytics code:', error);
      }
    };

    fetchAnalyticsCode();
  }, []);

  if (!analyticsCode) return null;

  return (
    <div dangerouslySetInnerHTML={{ __html: analyticsCode }} />
  );
} 