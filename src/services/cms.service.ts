/**
 * CMS Content Management Service Template (Fullstack Prisma)
 * Manages Pages, News Posts, Site Settings, and Technical Sessions Schedule.
 */

import prisma from "@/lib/prisma";
import { DEFAULT_HEADER_DATA } from "@/lib/header-config";
import type { PostStatus } from "@/types";
import type { Prisma } from "@prisma/client";

export class CmsService {
  public async getAllPages() {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "asc" },
    });

    return pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      blocks: p.blocks,
      is_published: p.isPublished,
      meta_title: p.metaTitle,
      meta_description: p.metaDescription,
      block_count: Array.isArray(p.blocks) ? p.blocks.length : 0,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));
  }

  public async getPageByIdOrSlug(identifier: string) {
    const page = await prisma.page.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });
    if (!page) return null;

    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      blocks: page.blocks,
      is_published: page.isPublished,
      meta_title: page.metaTitle,
      meta_description: page.metaDescription,
      created_at: page.createdAt.toISOString(),
      updated_at: page.updatedAt.toISOString(),
    };
  }

  public async upsertPage(input: {
    id: string;
    slug: string;
    title: string;
    blocks: Prisma.InputJsonValue;
    isPublished?: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }) {
    const page = await prisma.page.upsert({
      where: { id: input.id },
      update: {
        slug: input.slug,
        title: input.title,
        blocks: input.blocks,
        isPublished: input.isPublished ?? true,
        metaTitle: input.metaTitle ?? input.title,
        metaDescription: input.metaDescription ?? "",
      },
      create: {
        id: input.id,
        slug: input.slug,
        title: input.title,
        blocks: input.blocks,
        isPublished: input.isPublished ?? true,
        metaTitle: input.metaTitle ?? input.title,
        metaDescription: input.metaDescription ?? "",
      },
    });

    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      blocks: page.blocks,
      is_published: page.isPublished,
      meta_title: page.metaTitle,
      meta_description: page.metaDescription,
      created_at: page.createdAt.toISOString(),
      updated_at: page.updatedAt.toISOString(),
    };
  }

  public async deletePage(id: string) {
    if (id === "home") {
      throw new Error("Cannot delete the default home page.");
    }
    return prisma.page.delete({ where: { id } });
  }

  public async getHeaderSetting() {
    const setting = await prisma.setting.findUnique({
      where: { key: "header" },
    });
    return setting?.data || DEFAULT_HEADER_DATA;
  }

  public async saveHeaderSetting(data: Prisma.InputJsonValue) {
    return prisma.setting.upsert({
      where: { key: "header" },
      update: { data },
      create: { key: "header", data },
    });
  }

  public async listPosts(status?: PostStatus) {
    return prisma.post.findMany({
      where: status ? { status } : undefined,
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const cmsService = new CmsService();
export default cmsService;
