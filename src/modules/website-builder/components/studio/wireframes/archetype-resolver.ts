import type { WireframeArchetype } from "./types";

const EXACT_TYPE_MAP: Record<string, WireframeArchetype> = {
  HeroCarousel: "hero-carousel",
  RichTextBlock: "rich-text",
  ImageBlock: "image-banner",
  DataSheetBlock: "faculty-documents",
  TwoColumnBlock: "media-split",
  CardGridBlock: "layout-grid",
  StatsRowBlock: "stats-counters",
  KeynoteSpeakersSection: "faculty-lecturers",
  CommitteesSection: "leadership",
  ConferenceTracksSection: "faculty-programs",
  ImportantDatesSection: "timeline",
  RegistrationFeesSection: "admissions",
  VenueLocationSection: "media-split",
  SponsorshipSection: "partners-grid",
  // ── Hero & Carousels
  "Home/HeroCarousel": "hero-carousel",
  "Hero": "hero-banner",
  "HeroBanner": "hero-banner",

  // ── About & Leadership
  "Home/About": "about-overview",
  "Home/Leadership": "leadership",
  "Page/RectorMessage": "leadership",
  "Page/VisionMission": "about-overview",
  "Page/History": "timeline",
  "Page/OrgChart": "leadership",
  "OrgChart": "leadership",
  "Page/OrgChartTree": "leadership",
  "Home/CampusLife": "campus-life",
  "Home/AudienceQuiz": "faq-accordion",
  "Home/Contact": "media-split",

  // ── News & Posts
  "Home/News": "news-bento",
  "Content/ArticlesShowcase": "news-bento",
  "NewsArchive": "news-archive",
  "PostDetail": "post-detail",
  "PostDetail/ActionCards": "post-actions",
  "PostDetail/FooterSections": "post-footer",
  "PostDetail/Newsletter": "newsletter",
  "Home/NotificationBanner": "notification-banner",

  // ── Faculty & Academic
  "Faculty/Header": "faculty-header",
  "Faculty/Programs": "faculty-programs",
  "Faculty/Lecturers": "faculty-lecturers",
  "Faculty/Procedures": "faculty-procedures",
  "Documents": "faculty-documents",
  "Faculty/Documents": "faculty-documents",
  "Faculty/Support": "faculty-support",
  "Faculty/Schedule": "faculty-schedule",
  "Faculty/SystemLinks": "faculty-links",
  "Home/Admissions": "admissions",

  // ── Research & Conferences
  "Home/Research": "research-papers",
  "Research/Papers": "research-papers",
  "Research/Projects": "faculty-programs",
  "Research/Labs": "faculty-lecturers",
  "Conference/Schedule": "faculty-schedule",
  "Conference/CallForPapers": "post-detail",
  "Conference/Speakers": "faculty-lecturers",
  "Conference/Pricing": "admissions",
  "Home/Partners": "partners-grid",

  // ── Data & Statistics
  "Data/Timeline": "timeline",
  "Data/StatsChart": "stats-chart",
  "Stats": "stats-counters",
  "Home/Stats": "stats-counters",

  // ── Utilities
  "Utilities/ExtensionShowcase": "utilities",

  // ── Layout & Slots
  "GridLayout": "layout-grid",
  "Grid": "layout-grid",
  "CardGrid": "layout-grid",
  "ColumnsSlot": "layout-grid",
  "FlexLayout": "layout-grid",
  "Container": "layout-container",
  "Spacer": "layout-container",
  "Divider": "layout-container",

  // ── Content & Media
  "Home/MediaText": "media-split",
  "Home/TwoColumns": "media-split",
  "FormattedText": "rich-text",
  "RichText": "rich-text",
  "Text": "rich-text",
  "CustomHTML": "rich-text",
  "Image": "image-banner",
  "ImageBanner": "image-banner",
  "Carousel": "image-banner",
  "FAQ": "faq-accordion",
  "CTA": "cta-banner",
  "Testimonials": "testimonials",
  "Features": "faculty-programs",
  "Pricing": "admissions",
};

/**
 * Resolves the appropriate wireframe archetype dynamically from component type,
 * category, or label.
 */
export function resolveArchetype(type: string, category?: string): WireframeArchetype {
  if (EXACT_TYPE_MAP[type]) {
    return EXACT_TYPE_MAP[type];
  }

  const lower = type.toLowerCase();
  if (lower.includes("hero") || lower.includes("banner")) return "hero-banner";
  if (lower.includes("news") || lower.includes("article") || lower.includes("tin-tuc") || lower.includes("bai-viet")) return "news-bento";
  if (lower.includes("document") || lower.includes("van-ban") || lower.includes("pdf")) return "faculty-documents";
  if (lower.includes("program") || lower.includes("dao-tao") || lower.includes("course")) return "faculty-programs";
  if (lower.includes("leader") || lower.includes("lanh-dao") || lower.includes("rector")) return "leadership";
  if (lower.includes("lecturer") || lower.includes("teacher") || lower.includes("giang-vien") || lower.includes("user") || lower.includes("people")) return "faculty-lecturers";
  if (lower.includes("stat") || lower.includes("number") || lower.includes("count")) return "stats-counters";
  if (lower.includes("chart") || lower.includes("graph")) return "stats-chart";
  if (lower.includes("timeline") || lower.includes("history") || lower.includes("lich-su")) return "timeline";
  if (lower.includes("faq") || lower.includes("question") || lower.includes("hoi-dap")) return "faq-accordion";
  if (lower.includes("schedule") || lower.includes("calendar") || lower.includes("lich")) return "faculty-schedule";
  if (lower.includes("partner") || lower.includes("doi-tac") || lower.includes("sponsor")) return "partners-grid";
  if (lower.includes("grid") || lower.includes("column") || lower.includes("slot")) return "layout-grid";
  if (lower.includes("container") || lower.includes("section") || lower.includes("wrapper")) return "layout-container";
  if (lower.includes("cta") || lower.includes("action")) return "cta-banner";
  if (lower.includes("image") || lower.includes("photo") || lower.includes("gallery")) return "image-banner";

  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes("tin tức") || catLower.includes("news")) return "news-bento";
    if (catLower.includes("khoa") || catLower.includes("faculty")) return "faculty-programs";
    if (catLower.includes("đào tạo") || catLower.includes("tuyển sinh")) return "admissions";
    if (catLower.includes("bố cục") || catLower.includes("layout")) return "layout-grid";
  }

  return "fallback-generic";
}
