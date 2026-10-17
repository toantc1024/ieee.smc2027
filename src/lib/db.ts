import { neon } from "@neondatabase/serverless";
import env from "@/config/env";

export const sql = neon(env.database.url);

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface WebsitePageRecord {
  id: string;
  slug: string;
  title: string;
  blocks: unknown;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSettingRecord {
  key: string;
  data: unknown;
  updated_at: string;
}
