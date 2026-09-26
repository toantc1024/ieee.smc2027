import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_FL0MulNRm6xJ@ep-noisy-fog-b3e9u0a7-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const sql = neon(databaseUrl);

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
