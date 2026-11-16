import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { cmsService } from "@/services";
import {
  prisma,
  normalizeSlugPath,
  requireAdminRequest,
  apiSuccess,
  apiError,
  revalidatePagePaths,
} from "@/lib";
import { hydrateBlockPropsServer, hydrateBlocksServer } from "@/lib/cms-block-defaults";

function makeBlock(
  id: string,
  type: string,
  props: Record<string, unknown> = {}
): { id: string; type: string; props: Prisma.InputJsonObject; hidden: boolean } {
  return {
    id,
    type,
    props: hydrateBlockPropsServer(type, props) as Prisma.InputJsonObject,
    hidden: false,
  };
}

const DEFAULT_HOME_BLOCKS = [
  makeBlock("hero-carousel-1", "HeroCarousel", { autoplayDuration: 7 }),
  makeBlock("countdown-1", "SubmissionCountdown"),
  makeBlock("highlights-1", "ConferenceHighlights"),
  makeBlock("welcome-1", "WelcomeLetter"),
  makeBlock("about-1", "About"),
  makeBlock("cfp-1", "CallForPapers"),
  makeBlock("tracks-1", "ConferenceTracksSection"),
  makeBlock("dates-1", "ImportantDatesSection"),
  makeBlock("committees-section-1", "CommitteesSection"),
  makeBlock("venue-1", "VenueLocationSection"),
  makeBlock("video-1", "MediaGallerySection"),
  makeBlock("news-1", "NewsList"),
  makeBlock("sponsors-1", "SponsorshipSection"),
  makeBlock("faq-1", "FaqAccordionSection"),
  makeBlock("contact-1", "ContactSupportSection"),
  makeBlock("subscribe-1", "CfpSubscribe"),
];

// Standard page configurations for the entire IEEE SMC 2027 website
export const STANDARD_CONFERENCE_PAGES = [
  {
    id: "home",
    slug: "home",
    title: "Home",
    metaTitle: "IEEE SMC 2027 | Home",
    metaDescription: "Official Conference Website for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
    blocks: DEFAULT_HOME_BLOCKS,
  },
  {
    id: "committees",
    slug: "committees",
    title: "Committees",
    metaTitle: "Committees | IEEE SMC 2027",
    metaDescription: "General Chairs, Program Chairs, and Organizing Committee for IEEE SMC 2027",
    blocks: [
      makeBlock("committees-section-1", "CommitteesSection"),
      makeBlock("contact-1", "ContactSupportSection"),
    ],
  },
  {
    id: "submissions",
    slug: "submissions",
    title: "Submissions & CFP",
    metaTitle: "Call for Papers & Submissions | IEEE SMC 2027",
    metaDescription: "Author submission guidelines, templates, and key paper submission deadlines",
    blocks: [
      makeBlock("countdown-1", "SubmissionCountdown"),
      makeBlock("portals-1", "SubmissionPortalsBlock"),
      makeBlock("policies-1", "CfpPoliciesBlock"),
      makeBlock("categories-1", "SubmissionCategoriesBlock"),
      makeBlock("brochure-1", "CfpBrochureBannerBlock"),
      makeBlock("tracks-1", "ConferenceTracksSection"),
      makeBlock("templates-1", "PaperSubmissionGuidelinesSection"),
      makeBlock("dates-1", "ImportantDatesSection"),
      makeBlock("faq-1", "FaqAccordionSection"),
      makeBlock("contact-1", "ContactSupportSection"),
    ],
  },
  {
    id: "registration",
    slug: "registration",
    title: "Registration & Payments",
    metaTitle: "Registration & Payments | IEEE SMC 2027",
    metaDescription: "Registration fee schedule, bank transfer details, and payment options",
    blocks: [
      makeBlock("wizard-1", "RegistrationWizardBlock"),
      makeBlock("fee-table-1", "RegistrationFeeTableBlock"),
      makeBlock("payment-channels-1", "PaymentChannelsBlock"),
      makeBlock("vat-invoice-1", "VatInvoiceNoticeBlock"),
      makeBlock("dates-1", "ImportantDatesSection"),
      makeBlock("faq-1", "FaqAccordionSection"),
      makeBlock("contact-1", "ContactSupportSection", {
        title: "Contact Registration Desk",
      }),
    ],
  },
  {
    id: "program",
    slug: "program",
    title: "Technical Program",
    metaTitle: "Technical Program & Keynotes | IEEE SMC 2027",
    metaDescription: "Keynotes, technical tracks, workshops, and conference agenda",
    blocks: [
      makeBlock("keynotes-1", "KeynoteSpeakersSection"),
      makeBlock("schedule-1", "ScheduleTimelineSection"),
      makeBlock("tracks-1", "ConferenceTracksSection"),
      makeBlock("workshops-1", "WorkshopTutorialSection"),
      makeBlock("awards-1", "AwardsSection"),
      makeBlock("past-1", "PastConferencesSection"),
    ],
  },
  {
    id: "program_sessions",
    slug: "program/sessions",
    title: "Technical Sessions & Tracks",
    metaTitle: "Technical Sessions & Tracks | IEEE SMC 2027",
    metaDescription: "Technical sessions schedule, rooms, chairs, and PaperCept papers",
    blocks: [
      makeBlock("sessions-1", "TechnicalSessionsBlock"),
      makeBlock("schedule-1", "ScheduleTimelineSection"),
      makeBlock("contact-1", "ContactSupportSection"),
    ],
  },
  {
    id: "travel",
    slug: "travel",
    title: "Venue & Travel",
    metaTitle: "Venue & Hospitality Guide | IEEE SMC 2027",
    metaDescription: "Sheraton Saigon Grand Opera Hotel, travel guidance, and e-Visa instructions",
    blocks: [
      makeBlock("venue-overview-1", "VenueOverviewBlock"),
      makeBlock("transit-1", "TransitLogisticsBlock"),
      makeBlock("accommodation-1", "TravelAccommodationSection"),
      makeBlock("visa-1", "VisaInformationSection"),
      makeBlock("visitor-info-1", "VisitorInfoBlock"),
      makeBlock("attractions-1", "CityAttractionsBlock"),
      makeBlock("contact-1", "ContactSupportSection", {
        title: "Hospitality & Travel Inquiries",
      }),
    ],
  },
  {
    id: "news",
    slug: "news",
    title: "News & Announcements",
    metaTitle: "News & Announcements | IEEE SMC 2027",
    metaDescription: "Latest announcements, call for papers, and news updates",
    blocks: [
      makeBlock("news-1", "NewsList"),
      makeBlock("subscribe-1", "CfpSubscribe"),
      makeBlock("contact-1", "ContactSupportSection"),
    ],
  },
];

export function normalizeSlug(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .split("/")
    .map((segment) => segment.replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/");
}

export function formatPageRecord(p: any) {
  const blocks = Array.isArray(p.blocks) ? p.blocks : [];
  const createdAtIso = p.createdAt instanceof Date ? p.createdAt.toISOString() : (p.createdAt || new Date().toISOString());
  const updatedAtIso = p.updatedAt instanceof Date ? p.updatedAt.toISOString() : (p.updatedAt || new Date().toISOString());

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    blocks,
    content: p.content ?? null,
    parentId: p.parentId ?? null,
    parent: p.parent ?? null,
    children: Array.isArray(p.children) ? p.children.map(formatPageRecord) : [],
    orderIndex: p.orderIndex ?? 0,
    version: p.version ?? 1,
    isPublished: p.isPublished ?? true,
    is_published: p.isPublished ?? true,
    metaTitle: p.metaTitle ?? p.title,
    meta_title: p.metaTitle ?? p.title,
    metaDescription: p.metaDescription ?? "",
    meta_description: p.metaDescription ?? "",
    templateId: p.templateId ?? null,
    block_count: blocks.length,
    histories: Array.isArray(p.histories) ? p.histories : [],
    createdAt: createdAtIso,
    created_at: createdAtIso,
    updatedAt: updatedAtIso,
    updated_at: updatedAtIso,
  };
}

export function buildPageTree(flatPages: any[]): any[] {
  const nodeMap = new Map<string, any>();
  const slugMap = new Map<string, any>();
  const rootNodes: any[] = [];

  flatPages.forEach((p) => {
    const formatted = { ...p, children: [] };
    nodeMap.set(p.id, formatted);
    slugMap.set(p.slug, formatted);
  });

  flatPages.forEach((p) => {
    const node = nodeMap.get(p.id)!;
    if (p.parentId && nodeMap.has(p.parentId)) {
      nodeMap.get(p.parentId)!.children.push(node);
    } else if (p.slug.includes("/")) {
      // Slug path fallback for virtual hierarchies
      const segments = p.slug.split("/");
      const parentSlug = segments.slice(0, -1).join("/");
      if (slugMap.has(parentSlug)) {
        slugMap.get(parentSlug)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  const sortNodes = (nodes: any[]) => {
    nodes.sort((a, b) => (a.orderIndex - b.orderIndex) || (a.title.localeCompare(b.title)));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(rootNodes);
  return rootNodes;
}

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("title") || "";
    const status = searchParams.get("status") || "all";
    const parentIdParam = searchParams.get("parentId");
    const view = searchParams.get("view") || "flat";

    // 1. Ensure all standard conference pages are seeded in database
    const existingDbPages = await prisma.page.findMany();
    const existingSlugs = new Set(existingDbPages.map((p) => p.slug));

    for (const stdPage of STANDARD_CONFERENCE_PAGES) {
      if (!existingSlugs.has(stdPage.slug)) {
        await prisma.page.create({
          data: {
            id: stdPage.id,
            slug: stdPage.slug,
            title: stdPage.title,
            blocks: stdPage.blocks,
            content: { root: { title: stdPage.title, slug: stdPage.slug }, content: stdPage.blocks },
            isPublished: true,
            metaTitle: stdPage.metaTitle,
            metaDescription: stdPage.metaDescription,
            version: 1,
            histories: {
              create: {
                version: 1,
                content: { root: { title: stdPage.title, slug: stdPage.slug }, content: stdPage.blocks },
                changeSummary: "Standard conference seed page",
              },
            },
          },
        }).catch((err) => {
          // Ignore unique collision if another concurrent seed ran
          console.warn(`Standard page seed ignored for ${stdPage.slug}:`, err?.message);
        });
      }
    }

    // 2. Build where filter
    const where: any = {};

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.isPublished = true;
    } else if (status === "draft") {
      where.isPublished = false;
    }

    if (parentIdParam !== null && parentIdParam !== undefined && parentIdParam !== "") {
      if (parentIdParam === "root" || parentIdParam === "null") {
        where.parentId = null;
      } else {
        where.parentId = parentIdParam;
      }
    }

    const pages = await prisma.page.findMany({
      where,
      include: {
        children: {
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
    });

    const formattedPages = pages.map(formatPageRecord);

    const responsePayload: Record<string, any> = {
      pages: formattedPages,
      total: formattedPages.length,
    };

    if (view === "tree") {
      responsePayload.tree = buildPageTree(formattedPages);
    }

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    console.error("Error fetching website pages:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiError("Invalid JSON body", 400);
    }

    const title = (body.title || "New Page").trim();
    const rawSlug = body.slug || body.id || `page-${Date.now()}`;
    const slug = normalizeSlug(rawSlug);

    if (!slug) {
      return apiError("Invalid page slug", 400);
    }

    // Check for duplicate slug
    const existing = await prisma.page.findUnique({
      where: { slug },
    });

    if (existing) {
      // If client supplied explicit matching id for upsert, proceed; otherwise conflict
      if (body.id && existing.id === body.id) {
        // Upsert update
        const updated = await prisma.page.update({
          where: { id: existing.id },
          data: {
            title,
            blocks: Array.isArray(body.blocks) ? body.blocks : [],
            content: body.content ?? { root: { title, slug }, content: Array.isArray(body.blocks) ? body.blocks : [] },
            isPublished: body.isPublished ?? body.is_published ?? existing.isPublished,
            metaTitle: body.metaTitle ?? body.meta_title ?? title,
            metaDescription: body.metaDescription ?? body.meta_description ?? "",
          },
        });
        return apiSuccess({ page: formatPageRecord(updated) }, 200);
      }
      return apiError(`A page with slug '${slug}' already exists`, 409);
    }

    const rawBlocks = Array.isArray(body.blocks) ? body.blocks : [];
    const blocks = hydrateBlocksServer(rawBlocks);
    const content =
      body.content && typeof body.content === "object"
        ? { ...body.content, content: blocks }
        : { root: { title, slug }, content: blocks };
    const pageId = body.id || crypto.randomUUID();
    const isPublished = body.isPublished ?? body.is_published ?? true;
    const metaTitle = body.metaTitle ?? body.meta_title ?? title;
    const metaDescription = body.metaDescription ?? body.meta_description ?? "";
    const parentId = body.parentId || null;
    const orderIndex = typeof body.orderIndex === "number" ? body.orderIndex : 0;
    const templateId = body.templateId || null;

    const [createdPage] = await prisma.$transaction([
      prisma.page.create({
        data: {
          id: pageId,
          slug,
          title,
          blocks: blocks as any,
          content: content as any,
          parentId,
          orderIndex,
          version: 1,
          isPublished,
          metaTitle,
          metaDescription,
          templateId,
        },
      }),
      prisma.pageHistory.create({
        data: {
          pageId,
          version: 1,
          content,
          changeSummary: "Initial page creation",
        },
      }),
    ]);

    revalidatePagePaths(slug);

    return apiSuccess({ page: formatPageRecord(createdPage) }, 201);
  } catch (error: unknown) {
    console.error("Error creating page:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return apiError("Conflict: Page slug already exists", 409);
    }
    return apiError(error, 500);
  }
}
