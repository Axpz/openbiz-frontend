const SEARCH_QUERY_KEY = 'openbiz_last_search_query';

export const searchStorage = {
  // 保存搜索查询
  saveQuery: (query: string) => {
    if (query.trim()) {
      localStorage.setItem(SEARCH_QUERY_KEY, query);
    }
  },

  // 获取保存的搜索查询
  getQuery: (): string => {
    return localStorage.getItem(SEARCH_QUERY_KEY) || '';
  },

  // 清除保存的搜索查询
  clearQuery: () => {
    localStorage.removeItem(SEARCH_QUERY_KEY);
  },

  // 检查是否有保存的查询
  hasQuery: (): boolean => {
    return !!localStorage.getItem(SEARCH_QUERY_KEY);
  }
}; 