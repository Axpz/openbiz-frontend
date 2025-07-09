import { User } from "@/types/user";

export type ExportStatus = 'complete' | 'failed' | 'progress' | 'pending';

export interface ExportRecord {
  id: string;
  title: string;
  keyword: string;
  export_count: number;
  export_url: string;
  created_at: string;
  status: ExportStatus;
  user_id?: number;
  user?: {
    nickname: string;
    avatar_url: string;
  };
}

export interface ExportListResponse {
  export_logs: ExportRecord[];
  total: number;
  users?: Record<number, User>;
} 