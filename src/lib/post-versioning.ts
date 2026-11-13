import { prisma } from "./prisma";

export const POST_VERSION_KEY_PREFIX = "post_versions_";
const MAX_POST_VERSIONS = 30;

export interface PostVersionEntry {
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

interface StoredPostVersionData {
  version: number;
  histories: PostVersionEntry[];
}

export interface PostSnapshotInput {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  coverImage?: string | null;
  category: string;
  status: string;
  updatedAt?: Date | string;
}

function getVersionSettingKey(postId: string): string {
  return `${POST_VERSION_KEY_PREFIX}${postId}`;
}

function parseStoredVersionData(raw: unknown): StoredPostVersionData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const histories = Array.isArray(obj.histories)
    ? (obj.histories as PostVersionEntry[])
    : [];
  const version =
    typeof obj.version === "number" && obj.version >= 1
      ? obj.version
      : histories[0]?.version || 1;
  return { version, histories };
}

function buildEntryFromPost(
  post: PostSnapshotInput,
  version: number,
  savedBy: string
): PostVersionEntry {
  const updatedAtIso =
    post.updatedAt instanceof Date
      ? post.updatedAt.toISOString()
      : typeof post.updatedAt === "string" && post.updatedAt
        ? post.updatedAt
        : new Date().toISOString();

  return {
    id: `${post.id}-v${version}-${Date.now()}`,
    version,
    title: post.title,
    slug: post.slug,
    summary: post.summary ?? null,
    content: post.content,
    coverImage: post.coverImage ?? null,
    category: post.category,
    status: String(post.status),
    updatedAt: updatedAtIso,
    savedBy,
  };
}

/**
 * Retrieve version number and revision history for a post.
 * Initializes v1 from currentPost if no version record exists yet.
 */
export async function getPostVersionMeta(
  postId: string,
  currentPost?: PostSnapshotInput
): Promise<StoredPostVersionData> {
  try {
    const record = await prisma.setting.findUnique({
      where: { key: getVersionSettingKey(postId) },
    });
    const parsed = parseStoredVersionData(record?.data);
    if (parsed && parsed.histories.length > 0) {
      return parsed;
    }

    if (currentPost) {
      const initialEntry = buildEntryFromPost(currentPost, 1, "System");
      const initialData: StoredPostVersionData = {
        version: 1,
        histories: [initialEntry],
      };
      await prisma.setting.upsert({
        where: { key: getVersionSettingKey(postId) },
        create: {
          key: getVersionSettingKey(postId),
          data: initialData as unknown as object,
        },
        update: {
          data: initialData as unknown as object,
        },
      });
      return initialData;
    }

    return { version: 1, histories: [] };
  } catch (error) {
    console.warn(`[post-versioning] Failed to load version meta for ${postId}:`, error);
    return {
      version: 1,
      histories: currentPost ? [buildEntryFromPost(currentPost, 1, "System")] : [],
    };
  }
}

/**
 * Batch fetch current version numbers for a list of posts.
 */
export async function getBulkPostVersionNumbers(
  postIds: string[]
): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  if (postIds.length === 0) return map;

  try {
    const keys = postIds.map(getVersionSettingKey);
    const records = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    for (const rec of records) {
      const postId = rec.key.slice(POST_VERSION_KEY_PREFIX.length);
      const parsed = parseStoredVersionData(rec.data);
      if (parsed) {
        map[postId] = parsed.version;
      }
    }
  } catch (error) {
    console.warn("[post-versioning] Bulk version lookup failed:", error);
  }

  for (const id of postIds) {
    if (!map[id]) map[id] = 1;
  }
  return map;
}

/**
 * Append a new version snapshot for a post and persist up to MAX_POST_VERSIONS entries.
 */
export async function recordPostVersion(
  post: PostSnapshotInput,
  savedBy = "Admin"
): Promise<StoredPostVersionData> {
  try {
    const existing = await prisma.setting.findUnique({
      where: { key: getVersionSettingKey(post.id) },
    });
    const parsed = parseStoredVersionData(existing?.data);
    const nextVersion = parsed ? parsed.version + 1 : 1;
    const entry = buildEntryFromPost(post, nextVersion, savedBy);
    const histories = [entry, ...(parsed?.histories || [])].slice(0, MAX_POST_VERSIONS);
    const payload: StoredPostVersionData = {
      version: nextVersion,
      histories,
    };

    await prisma.setting.upsert({
      where: { key: getVersionSettingKey(post.id) },
      create: {
        key: getVersionSettingKey(post.id),
        data: payload as unknown as object,
      },
      update: {
        data: payload as unknown as object,
      },
    });

    return payload;
  } catch (error) {
    console.warn(`[post-versioning] Failed to record version for ${post.id}:`, error);
    return {
      version: 1,
      histories: [buildEntryFromPost(post, 1, savedBy)],
    };
  }
}

/**
 * Remove stored version history when a post is deleted.
 */
export async function deletePostVersionMeta(postId: string): Promise<void> {
  try {
    await prisma.setting.delete({
      where: { key: getVersionSettingKey(postId) },
    });
  } catch {
    // Record might not exist
  }
}
