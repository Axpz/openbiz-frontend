'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { UserLogin } from "./user-login";
import { getEnv } from '@/lib/config';

interface HeaderProps<T = unknown> {
  onSearch?: (query: string) => Promise<T>;
  onResult?: (result: T) => void;
  hideSearch?: boolean;
  initialQuery?: string;
}

export function Header<T>({ onSearch, onResult, hideSearch = false, initialQuery = ''}: HeaderProps<T>) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const siteLogo = getEnv().SITE_LOGO;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!onSearch) return;

    if (!query.trim()) {
      toast.error('请输入搜索内容');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const result = await onSearch(query);
      onResult?.(result);
    } catch (err) {
      toast.error('搜索失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b pb-4 pt-4 relative border-b border-gray-200 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-3xl font-bold text-white flex items-center">
          {siteLogo && (
          <Link href="/">
            <Image
              src={siteLogo}
              alt="Logo"
              width={32}
              height={32}
              className="mr-2"
            />
          </Link>
          )}
        </div>
        <div className="w-full flex justify-center">
          {!hideSearch && (
            <SimpleSearchBox
              query={query}
              loading={loading}
              onQueryChange={setQuery}
              onSearch={handleSearch}
            />
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 px-4">
          <Link href="/pricing" className="hover:text-blue-500 text-black whitespace-nowrap">
              会员中心
          </Link>
          <UserLogin />
        </div>
      </div>
    </div>
  );
} 

interface SimpleSearchBoxProps {
  query: string;
  loading: boolean; 
  onQueryChange: (value: string) => void; 
  onSearch: () => void; 
}

export function SimpleSearchBox({
  query,
  loading,
  onQueryChange,
  onSearch,
}: SimpleSearchBoxProps) {
  return (
    <div className="flex w-full justify-center px-4">
      <div className="flex w-full max-w-2xl items-center rounded-lg border border-gray-300 bg-white overflow-hidden">
        <Input
          type="text"
          placeholder="输入关键词..."
          className="flex-1 border-none outline-none ring-0 shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 text-base h-10 px-4"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="ghost"
          className="h-10 w-12 text-gray-500 rounded-none"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}