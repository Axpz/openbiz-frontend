'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBox } from '@/components/search-box';
import { CompanyList } from '@/components/company-list';
import axios from '@/lib/api/axios';
import { EnterpriseHit, EnterpriseInfo, SearchResult } from '@/lib/types';
import Link from 'next/link';
import { UserLogin } from '@/components/user-login';
import { MobileHome } from '@/components/mobile-home';
import { useIsMobile } from '@/hooks/use-mobile';
import { WechatLogin } from '@/components/wechat-login';
import { useUser } from '@/contexts/user-context';
import { searchStorage } from '@/lib/utils/search-storage';
import { toast } from 'react-toastify';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<EnterpriseInfo[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user } = useUser();

  // 监听用户登录状态变化
  useEffect(() => {
    // 如果用户已登录且有保存的查询，自动执行搜索
    if (user && searchStorage.hasQuery()) {
      const savedQuery = searchStorage.getQuery();
      setQuery(savedQuery);
      router.push(`/search?q=${encodeURIComponent(savedQuery.slice(0, 100))}`);
      searchStorage.clearQuery();
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get<SearchResult>("/api/search/latestcreated")
        const companies = data.hits?.hits?.map((hit: EnterpriseHit) => hit._source as EnterpriseInfo) || []
        setCompanies(companies)
      } catch (error) {
        console.error("Error in fetchData:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    
    if (!queryToSearch.trim()) {
      toast.error('请输入查询内容');
      return;
    }

    setLoading(true);
    setTimeout(() => setLoading(false), 2000);

    // 保存搜索查询到localStorage
    searchStorage.saveQuery(queryToSearch);

    // 如果用户已登录，直接搜索
    if (user) {
      router.push(`/search?q=${encodeURIComponent(queryToSearch.slice(0, 100))}`);
      return;
    }

    // 如果用户未登录，保存查询并打开登录对话框
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    // 登录成功后，执行保存的搜索查询
    const savedQuery = searchStorage.getQuery();
    if (savedQuery) {
      setQuery(savedQuery);
      router.push(`/search?q=${encodeURIComponent(savedQuery.slice(0, 100))}`);
      searchStorage.clearQuery(); // 清除已使用的查询
    }
  };

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
    // 如果用户取消登录，可以选择是否清除保存的查询
    // searchStorage.clearQuery(); // 可选：清除保存的查询
  };

  if (isMobile) {
    return (
      <>
        <MobileHome
          companies={companies}
          loading={loading}
          onSearch={handleSearch}
        />
        <WechatLogin
          isOpen={isLoginModalOpen}
          onClose={handleLoginClose}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* 顶部蓝色渐变 */}
        <div className="w-full h-[50vh] bg-gradient-to-b from-[#1677ff] to-[#4bb0ff] relative">
          {/* 顶部导航 */}
          <div className="absolute top-10 right-10 flex items-center gap-2 z-10">
            <Link href="/pricing" className="text-white hover:text-white text-lg">
              会员中心
            </Link>
            <div className=" text-white">|</div>
            <UserLogin className='text-white hover:text-white text-lg'/>
          </div>
          
          {/* 搜索框容器 - 完全居中 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] px-4 w-full max-w-3xl">
            <div className="w-full max-w-3xl">
              <SearchBox
                query={query}
                loading={loading}
                onQueryChange={setQuery}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* 最新注册企业 */}
        <section className="flex-1 -mt-8 relative z-10">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800"></h2>
            <CompanyList companies={companies} columns={3} />
          </div>
        </section>
      </div>

      {/* 登录对话框 */}
      <WechatLogin
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
