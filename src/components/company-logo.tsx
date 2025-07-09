'use client';

import { cn } from '@/lib/utils';
import { extractCompanyAbbreviation } from '@/lib/utils';

interface CompanyLogoProps {
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// 5种标准配色方案
const colorSchemes = [
  {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    text: 'text-blue-600',
  },
  {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    text: 'text-green-600',
  },
  {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    text: 'text-purple-600',
  },
  {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    text: 'text-orange-600',
  },
  {
    bg: 'bg-gradient-to-br from-teal-50 to-teal-100',
    text: 'text-teal-600',
  },
];

// 基于公司名称生成一致的配色方案
const getColorScheme = (companyName: string) => {
  const hash = companyName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return colorSchemes[Math.abs(hash) % colorSchemes.length];
};

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-20 h-20 text-2xl',
};

export function CompanyLogo({ companyName, size = 'lg', className }: CompanyLogoProps) {
  const abbreviation = extractCompanyAbbreviation(companyName);
  const colorScheme = getColorScheme(companyName);
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'flex items-center justify-center rounded-lg shadow-sm',
        colorScheme.bg,
        sizeClass
      )}>
        <div className="text-center">
          <div className={cn('font-extrabold select-none', colorScheme.text)}>
            {abbreviation.slice(0, 2)}
          </div>
          <div className={cn('font-extrabold select-none', colorScheme.text)}>
            {abbreviation.slice(2, 4)}
          </div>
        </div>
      </div>
    </div>
  );
} 