import { ExportStatus } from '../types/export';
import { cn } from '../utils';

export const STATUS_STYLES: Record<ExportStatus, string> = {
  complete: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400',
  failed: 'bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400',
  progress: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400',
} as const;

export const STATUS_TEXT: Record<ExportStatus, string> = {
  complete: '生成成功',
  failed: '生成失败（不计次数）',
  progress: '正在生成文件...',
  pending: '等待生成...',
} as const;

export const getStatusBadgeClassNames = (status: ExportStatus) => {
  return cn('font-medium', STATUS_STYLES[status]);
};

export const getStatusText = (status: ExportStatus) => {
  return STATUS_TEXT[status];
};

export const handleDownload = async (record: { export_url: string; id: string; status: ExportStatus }) => {
  if (record.status !== 'complete') {
    throw new Error('文件尚未生成完成');
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    window.location.href = record.export_url;
  } else {
    const link = document.createElement('a');
    link.href = record.export_url;
    const fileName = record.export_url.split('/').pop() || `export-${record.id}.csv`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 