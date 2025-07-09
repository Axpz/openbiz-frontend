import { ExportRecord } from '@/lib/types/export';
import { getStatusText } from '@/lib/utils/export';

interface ExportRecordsListProps {
  records: ExportRecord[];
  isLoading: boolean;
  onDownload: (record: ExportRecord) => void;
  onDelete: (id: string) => void;
  variant: 'desktop' | 'mobile';
}

export function ExportRecordsList({ 
  records, 
  isLoading, 
  onDownload, 
  onDelete, 
  variant 
}: ExportRecordsListProps) {
  if (variant === 'desktop') {
    return <DesktopExportRecordsList 
      records={records} 
      isLoading={isLoading} 
      onDownload={onDownload} 
      onDelete={onDelete} 
    />;
  }

  return <MobileExportRecordsList 
    records={records} 
    isLoading={isLoading} 
    onDownload={onDownload} 
    onDelete={onDelete} 
  />;
}

// 桌面端列表组件
function DesktopExportRecordsList({ 
  records, 
  isLoading, 
  onDownload, 
  onDelete 
}: Omit<ExportRecordsListProps, 'variant'>) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left px-4 py-2">导出记录</th>
            <th className="text-left px-4 py-2">关键词</th>
            <th className="text-left px-4 py-2">数量</th>
            <th className="text-left px-4 py-2">状态</th>
            <th className="text-left px-4 py-2">创建时间</th>
            <th className="text-left px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <tr key={index}>
                <td colSpan={6} className="px-4 py-2">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-[100px] bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-[200px] bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-[100px] bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-[120px] bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-[120px] bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-[120px] bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </td>
              </tr>
            ))
          ) : records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id} className="border-b last:border-0">
                <td className="px-4 py-2">
                  <div className="font-medium truncate">{record.id}</div>
                  <div className="text-xs text-muted-foreground mt-1">{record.title}</div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-sm truncate" title={record.keyword}>
                    {record.keyword}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium">{record.export_count}</div>
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'complete'
                      ? 'bg-green-100 text-green-800'
                      : record.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusText(record.status)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div>{new Date(record.created_at).toLocaleString()}</div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-[#1677ff] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onDownload(record)}
                      disabled={record.status !== 'complete'}
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      下载
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onDelete(record.id)}
                      disabled={record.status === 'complete'}
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                暂无导出记录
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 移动端列表组件
function MobileExportRecordsList({ 
  records, 
  isLoading, 
  onDownload, 
  onDelete 
}: Omit<ExportRecordsListProps, 'variant'>) {
  return (
    <div className="px-2 space-y-3 mt-2">
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))
        : records.length > 0
        ? records.map((record) => (
            <div key={record.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-base">企业查询数据导出</span>
                <span className={
                  record.status === 'complete'
                    ? 'text-green-600 text-sm'
                    : record.status === 'failed'
                    ? 'text-red-500 text-sm'
                    : 'text-gray-400 text-sm'
                }>
                  {getStatusText(record.status)}
                </span>
              </div>
              <div className="grid grid-cols-[70px_1fr] gap-y-1">
                <div className="text-sm text-black">记录ID</div>
                <div className="text-sm text-black">{record.id}</div>
                <div className="text-sm text-black">关键词</div>
                <div className="text-sm text-black">{record.keyword}</div>
                <div className="text-sm text-black">数量</div>
                <div className="text-sm text-black">{record.export_count}</div>
                <div className="text-sm text-black">时间</div>
                <div className="text-sm text-black">{new Date(record.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onDownload(record)}
                  disabled={record.status !== 'complete'}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  下载
                </button>
                <button
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onDelete(record.id)}
                  disabled={record.status === 'complete'}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除
                </button>
              </div>
            </div>
          ))
        : (
          <div className="text-center text-gray-400 py-12">暂无导出记录</div>
        )
      }
    </div>
  );
} 