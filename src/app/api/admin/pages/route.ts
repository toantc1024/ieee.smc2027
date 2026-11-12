import { NextResponse } from "next/server";
import { cmsService } from "@/services";
import {
  prisma,
  normalizeSlugPath,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

const DEFAULT_HOME_BLOCKS = [
  {
    id: "hero-carousel-1",
    type: "HeroCarousel",
    props: { autoplayDuration: 7 },
    hidden: false,
  },
  {
    id: "welcome-1",
    type: "WelcomeLetter",
    props: {
      title: "Welcome Message from the General Chairs & Honorary Chairs",
      salutation: "Dear Colleagues & Honored Participants,",
      theme: "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
      datesLocation: "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
    },
    hidden: false,
  },
  { id: "highlights-1", type: "ConferenceHighlights", props: {}, hidden: false },
  { id: "dates-1", type: "ImportantDates", props: {}, hidden: false },
  { id: "cfp-1", type: "CallForPapers", props: {}, hidden: false },
  {
    id: "templates-1",
    type: "PaperTemplates",
    props: {
      title: "Author Submission Templates & Guidelines",
      subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
    },
    hidden: false,
  },
  { id: "tracks-1", type: "TracksExplorer", props: {}, hidden: false },
  { id: "keynotes-1", type: "Keynotes", props: {}, hidden: false },
  {
    id: "news-1",
    type: "NewsList",
    props: {
      title: "Conference News & Announcements",
      subtitle: "Stay updated with the latest milestones, partnership alerts, and program schedules",
    },
    hidden: false,
  },
  {
    id: "video-1",
    type: "ConferenceVideo",
    props: {
      title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
      subtitle:
        "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
      videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
      venueName: "Sheraton Saigon Grand Opera Hotel",
    },
    hidden: false,
  },
  { id: "about-1", type: "About", props: {}, hidden: false },
  { id: "committee-1", type: "Committee", props: {}, hidden: false },
  {
    id: "committees-section-1",
    type: "CommitteesSection",
    props: {
      title: "Organizing & Technical Committees",
      subtitle: "Distinguished leadership and academic committee chairs driving IEEE SMC 2027",
      badge: "Leadership & Organization",
      autoplayDelay: 3500,
    },
    hidden: false,
  },
  {
    id: "payment-methods-1",
    type: "PaymentMethods",
    props: {
      title: "Registration & Payment Methods",
      subtitle:
        "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
      badge: "Registration Guide",
    },
    hidden: false,
  },
  { id: "venue-1", type: "Venue", props: {}, hidden: false },
  { id: "sponsors-1", type: "Sponsors", props: {}, hidden: false },
  {
    id: "contact-1",
    type: "ContactCards",
    props: {
      title: "Contact the Organizing Secretariat",
      email: "smc2027@hcmute.edu.vn",
      location: "Ho Chi Minh City, Vietnam",
      venue: "Sheraton Saigon Grand Opera Hotel",
      website: "https://ieee-smc2027.org",
    },
    hidden: false,
  },
  { id: "faq-1", type: "FAQ", props: {}, hidden: false },
  { id: "subscribe-1", type: "CfpSubscribe", props: {}, hidden: false },
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
      {
        id: "committees-section-1",
        type: "CommitteesSection",
        props: {
          title: "Organizing & Technical Committees",
          subtitle: "Distinguished leadership and academic committee chairs driving IEEE SMC 2027",
          badge: "Leadership & Organization",
          autoplayDelay: 3500,
        },
        hidden: false,
      },
      { id: "committee-1", type: "Committee", props: {}, hidden: false },
      {
        id: "contact-1",
        type: "ContactCards",
        props: {
          title: "Contact the Organizing Secretariat",
          email: "smc2027@hcmute.edu.vn",
          location: "Ho Chi Minh City, Vietnam",
          venue: "Sheraton Saigon Grand Opera Hotel",
          website: "https://ieee-smc2027.org",
        },
        hidden: false,
      },
    ],
  },
  {
    id: "submissions",
    slug: "submissions",
    title: "Submissions & CFP",
    metaTitle: "Call for Papers & Submissions | IEEE SMC 2027",
    metaDescription: "Author submission guidelines, templates, and key paper submission deadlines",
    blocks: [
      { id: "cfp-1", type: "CallForPapers", props: {}, hidden: false },
      { id: "dates-1", type: "ImportantDates", props: {}, hidden: false },
      { id: "countdown-1", type: "SubmissionCountdown", props: {}, hidden: false },
      { id: "tracks-1", type: "TracksExplorer", props: {}, hidden: false },
      {
        id: "templates-1",
        type: "PaperTemplates",
        props: {
          title: "Author Submission Templates & Guidelines",
          subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
        },
        hidden: false,
      },
      { id: "faq-1", type: "FAQ", props: {}, hidden: false },
    ],
  },
  {
    id: "registration",
    slug: "registration",
    title: "Registration & Payments",
    metaTitle: "Registration & Payments | IEEE SMC 2027",
    metaDescription: "Registration fee schedule, bank transfer details, and payment options",
    blocks: [
      {
        id: "payment-methods-1",
        type: "PaymentMethods",
        props: {
          title: "Registration & Payment Methods",
          subtitle: "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
          badge: "Registration Guide",
        },
        hidden: false,
      },
      { id: "dates-1", type: "ImportantDates", props: {}, hidden: false },
      { id: "faq-1", type: "FAQ", props: {}, hidden: false },
      {
        id: "contact-1",
        type: "ContactCards",
        props: {
          title: "Contact Registration Desk",
          email: "smc2027@hcmute.edu.vn",
          location: "Ho Chi Minh City, Vietnam",
          venue: "Sheraton Saigon Grand Opera Hotel",
          website: "https://ieee-smc2027.org",
        },
        hidden: false,
      },
    ],
  },
  {
    id: "program",
    slug: "program",
    title: "Technical Program",
    metaTitle: "Technical Program & Keynotes | IEEE SMC 2027",
    metaDescription: "Keynotes, technical tracks, workshops, and conference agenda",
    blocks: [
      { id: "keynotes-1", type: "Keynotes", props: {}, hidden: false },
      { id: "tracks-1", type: "TracksExplorer", props: {}, hidden: false },
      {
        id: "video-1",
        type: "ConferenceVideo",
        props: {
          title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
          subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
          videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
          venueName: "Sheraton Saigon Grand Opera Hotel",
        },
        hidden: false,
      },
      { id: "dates-1", type: "ImportantDates", props: {}, hidden: false },
    ],
  },
  {
    id: "travel",
    slug: "travel",
    title: "Venue & Travel",
    metaTitle: "Venue & Hospitality Guide | IEEE SMC 2027",
    metaDescription: "Sheraton Saigon Grand Opera Hotel, travel guidance, and e-Visa instructions",
    blocks: [
      { id: "venue-1", type: "Venue", props: {}, hidden: false },
      {
        id: "video-1",
        type: "ConferenceVideo",
        props: {
          title: "Ho Chi Minh City Welcomes You",
          subtitle: "Discover the vibrant culture and landmarks of District 1 Saigon",
          videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
          venueName: "Sheraton Saigon Grand Opera Hotel",
        },
        hidden: false,
      },
      {
        id: "contact-1",
        type: "ContactCards",
        props: {
          title: "Hospitality & Travel Inquiries",
          email: "smc2027@hcmute.edu.vn",
          location: "Ho Chi Minh City, Vietnam",
          venue: "Sheraton Saigon Grand Opera Hotel",
          website: "https://ieee-smc2027.org",
        },
        hidden: false,
      },
    ],
  },
  {
    id: "news",
    slug: "news",
    title: "News & Announcements",
    metaTitle: "News & Announcements | IEEE SMC 2027",
    metaDescription: "Latest announcements, call for papers, and news updates",
    blocks: [
      {
        id: "news-1",
        type: "NewsList",
        props: {
          title: "Conference News & Announcements",
          subtitle: "Stay updated with the latest milestones, partnership alerts, and program schedules",
        },
        hidden: false,
      },
      { id: "subscribe-1", type: "CfpSubscribe", props: {}, hidden: false },
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

    const blocks = Array.isArray(body.blocks) ? body.blocks : [];
    const content = body.content ?? { root: { title, slug }, content: blocks };
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
          blocks,
          content,
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
