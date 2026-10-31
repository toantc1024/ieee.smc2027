import { NextResponse } from "next/server";
import { cmsService } from "@/services";
import {
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
      title: "Welcome Message from the General Chairs",
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

export async function GET() {
  try {
    const pages = await cmsService.getAllPages();

    if (pages.length === 0) {
      const seededHome = await cmsService.upsertPage({
        id: "home",
        slug: "home",
        title: "Home",
        blocks: DEFAULT_HOME_BLOCKS,
        isPublished: true,
        metaTitle: "IEEE SMC 2027 | Home",
        metaDescription: "Official Conference Website",
      });
      return NextResponse.json({ pages: [seededHome] });
    }

    return NextResponse.json({ pages });
  } catch (error: unknown) {
    console.error("Error fetching website pages:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const id = body.id || `page_${Date.now()}`;
    const slug = normalizeSlugPath(body.slug || `page-${Date.now()}`);
    const title = body.title || "New Page";
    const blocks = body.blocks || [];

    const page = await cmsService.upsertPage({
      id,
      slug,
      title,
      blocks,
      isPublished: true,
      metaTitle: body.meta_title || title,
      metaDescription: body.meta_description || "",
    });

    return apiSuccess({ page });
  } catch (error: unknown) {
    console.error("Error creating page:", error);
    return apiError(error, 500);
  }
}
