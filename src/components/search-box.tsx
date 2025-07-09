import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBoxProps {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: (searchQuery?: string) => void;
  compact?: boolean;
}

export function SearchBox({ query, loading, onQueryChange, onSearch}: SearchBoxProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-white text-5xl font-bold mb-8 text-center">
          查企业 就用企天天
      </div>
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden ">
        <Input
          type="search"
          placeholder="请输入企业名、老板名、品牌、地址、经营范围等关键词"
          className="flex-1 border-0 focus:ring-0 h-16 px-6 !text-xl placeholder:!text-xl appearance-none"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch(query)}
          disabled={loading}
        />
        <Button
          className="rounded-none rounded-r-lg bg-[#ff6600] hover:bg-[#ff8800] text-white px-8 text-xl h-16"
          onClick={() => onSearch(query)}
          disabled={loading}
        >
          {loading ? '查询中...' : '查一下'}
        </Button>
      </div>
    </div>
  );
} 