"use client";

export const POSTS_SYNC_CHANNEL = "smc2027_posts_sync";

export interface PostVersionSnapshot {
  id: string;
  version: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  status: string;
  updatedAt: string;
  savedBy: string;
}

export interface PostSyncMessage {
  type: "POST_UPDATED" | "POST_DELETED";
  id?: string;
  slug?: string;
  version?: number;
  updatedAt?: string;
}

export function broadcastPostSync(message: PostSyncMessage): void {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    // BroadcastChannel unavailable
  }
}
