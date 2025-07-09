export type UserRole = 'admin' | 'member' | 'user';

export interface User {
  id: number;
  open_id: string;
  union_id: string;
  nickname: string;
  avatar_url: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  language: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
} 