import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const pages = await sql`
      SELECT id, slug, title, is_published, meta_title, meta_description, created_at, updated_at,
             jsonb_array_length(blocks) as block_count
      FROM website_pages
      ORDER BY created_at ASC
    `;

    // If no pages exist yet, seed a default "home" page
    if (pages.length === 0) {
      const defaultBlocks = [
        {
          id: "hero-carousel-1",
          type: "HeroCarousel",
          props: {
            autoplayDuration: 7,
          },
          hidden: false,
        },
        {
          id: "welcome-1",
          type: "WelcomeLetter",
          props: {
            title: "Welcome Message from the General Chairs",
            salutation: "Dear Colleagues & Honored Participants,",
            theme: "Human-Centric Intelligence: Shaping the Digital Future",
            datesLocation: "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
          },
          hidden: false,
        },
        {
          id: "highlights-1",
          type: "ConferenceHighlights",
          props: {},
          hidden: false,
        },
        {
          id: "dates-1",
          type: "ImportantDates",
          props: {},
          hidden: false,
        },
        {
          id: "cfp-1",
          type: "CallForPapers",
          props: {},
          hidden: false,
        },
        {
          id: "templates-1",
          type: "PaperTemplates",
          props: {
            title: "Author Submission Templates & Guidelines",
            subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
          },
          hidden: false,
        },
        {
          id: "tracks-1",
          type: "TracksExplorer",
          props: {},
          hidden: false,
        },
        {
          id: "keynotes-1",
          type: "Keynotes",
          props: {},
          hidden: false,
        },
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
            subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
            videoUrl: "https://www.youtube.com/embed/I1UGApHrQKo?si=pJEHr9cVC0WN1JFF",
            venueName: "Sheraton Saigon Grand Opera Hotel",
          },
          hidden: false,
        },
        {
          id: "about-1",
          type: "About",
          props: {},
          hidden: false,
        },
        {
          id: "committee-1",
          type: "Committee",
          props: {},
          hidden: false,
        },
        {
          id: "venue-1",
          type: "Venue",
          props: {},
          hidden: false,
        },
        {
          id: "sponsors-1",
          type: "Sponsors",
          props: {},
          hidden: false,
        },
        {
          id: "contact-1",
          type: "ContactCards",
          props: {
            title: "Contact the Organizing Secretariat",
            email: "smc2027@hcmute.edu.vn",
            location: "Ho Chi Minh City, Vietnam",
            venue: "Sheraton Saigon Grand Opera Hotel",
            website: "ieeesmc2027.hcmute.edu.vn",
          },
          hidden: false,
        },
        {
          id: "faq-1",
          type: "FAQ",
          props: {},
          hidden: false,
        },
        {
          id: "subscribe-1",
          type: "CfpSubscribe",
          props: {},
          hidden: false,
        },
      ];

      const initial = await sql`
        INSERT INTO website_pages (id, slug, title, blocks, is_published, meta_title, meta_description)
        VALUES ('home', 'home', 'Trang chủ (Home Page)', ${JSON.stringify(defaultBlocks)}, true, 'IEEE SMC 2027 | Home', 'Official Conference Website')
        RETURNING id, slug, title, is_published, meta_title, meta_description, created_at, updated_at;
      `;
      return NextResponse.json({ pages: initial });
    }

    return NextResponse.json({ pages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching website pages:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id || `page_${Date.now()}`;
    const slug = (body.slug || `page-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const title = body.title || "Trang mới";
    const blocks = body.blocks || [];

    const rows = await sql`
      INSERT INTO website_pages (id, slug, title, blocks, is_published, meta_title, meta_description, updated_at)
      VALUES (${id}, ${slug}, ${title}, ${JSON.stringify(blocks)}, true, ${body.meta_title || title}, ${body.meta_description || ""}, CURRENT_TIMESTAMP)
      RETURNING id, slug, title, blocks, is_published, created_at, updated_at;
    `;

    return NextResponse.json({ success: true, page: rows[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error creating page:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
