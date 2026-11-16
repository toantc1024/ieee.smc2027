import type { WireframeArchetype } from "./types";

const EXACT_TYPE_MAP: Record<string, WireframeArchetype> = {
  // ── Core IEEE SMC 2027 Conference Sections & Modular Conference Blocks
  HeroCarousel: "hero-carousel",
  WelcomeLetter: "about-overview",
  ConferenceHighlights: "stats-counters",
  ImportantDatesSection: "timeline",
  ImportantDates: "timeline",
  CallForPapers: "post-detail",
  CfpPoliciesBlock: "layout-grid",
  SubmissionPortalsBlock: "faculty-links",
  SubmissionCategoriesBlock: "faculty-programs",
  CfpBrochureBannerBlock: "faculty-documents",
  PaperSubmissionGuidelinesSection: "faculty-documents",
  PaperTemplates: "faculty-documents",
  ConferenceTracksSection: "faculty-programs",
  TracksExplorer: "faculty-programs",
  KeynoteSpeakersSection: "faculty-lecturers",
  Keynotes: "faculty-lecturers",
  CommitteesSection: "leadership",
  Committee: "leadership",
  RegistrationFeesSection: "admissions",
  PaymentMethods: "admissions",
  RegistrationFeeTableBlock: "faculty-documents",
  PaymentChannelsBlock: "layout-grid",
  VatInvoiceNoticeBlock: "cta-banner",
  RegistrationWizardBlock: "admissions",
  ScheduleTimelineSection: "faculty-schedule",
  TechnicalSessionsBlock: "faculty-schedule",
  WorkshopTutorialSection: "faculty-programs",
  AwardsSection: "leadership",
  VenueLocationSection: "media-split",
  Venue: "media-split",
  VenueOverviewBlock: "media-split",
  TravelAccommodationSection: "layout-grid",
  TransitLogisticsBlock: "layout-grid",
  CityAttractionsBlock: "campus-life",
  VisitorInfoBlock: "layout-grid",
  VisaInformationSection: "faculty-procedures",
  SponsorshipSection: "partners-grid",
  Sponsors: "partners-grid",
  ContactSupportSection: "faculty-links",
  ContactCards: "faculty-links",
  FaqAccordionSection: "faq-accordion",
  PastConferencesSection: "timeline",
  MediaGallerySection: "image-banner",
  ConferenceVideo: "image-banner",
  NewsList: "news-bento",
  About: "about-overview",
  CfpSubscribe: "newsletter",
  SubmissionCountdown: "cta-banner",
  HeaderSection: "faculty-header",
  FooterSection: "post-footer",

  // ── Modular Elements & Basic Primitives
  RichTextBlock: "rich-text",
  ImageBlock: "image-banner",
  DataSheetBlock: "faculty-documents",
  CalloutBlock: "notification-banner",
  TwoColumnBlock: "media-split",
  CardGridBlock: "layout-grid",
  StatsRowBlock: "stats-counters",
  ButtonsBlock: "cta-banner",
  CompactFaqBlock: "faq-accordion",
  CompactTimelineBlock: "timeline",
  DividerSpacerBlock: "layout-container",
  Heading: "rich-text",
  Button: "cta-banner",
  Video: "image-banner",
  ImageVideo: "media-split",

  // ── Hero & Carousels
  "Home/HeroCarousel": "hero-carousel",
  Hero: "hero-banner",
  HeroBanner: "hero-banner",

  // ── About & Leadership
  "Home/About": "about-overview",
  "Home/Leadership": "leadership",
  "Page/RectorMessage": "leadership",
  "Page/VisionMission": "about-overview",
  "Page/History": "timeline",
  "Page/OrgChart": "leadership",
  OrgChart: "leadership",
  "Page/OrgChartTree": "leadership",
  "Home/CampusLife": "campus-life",
  "Home/AudienceQuiz": "faq-accordion",
  "Home/Contact": "media-split",

  // ── News & Posts
  "Home/News": "news-bento",
  "Content/ArticlesShowcase": "news-bento",
  NewsArchive: "news-archive",
  PostDetail: "post-detail",
  "PostDetail/ActionCards": "post-actions",
  "PostDetail/FooterSections": "post-footer",
  "PostDetail/Newsletter": "newsletter",
  "Home/NotificationBanner": "notification-banner",

  // ── Faculty & Academic
  "Faculty/Header": "faculty-header",
  "Faculty/Programs": "faculty-programs",
  "Faculty/Lecturers": "faculty-lecturers",
  "Faculty/Procedures": "faculty-procedures",
  Documents: "faculty-documents",
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
  Stats: "stats-counters",
  "Home/Stats": "stats-counters",

  // ── Utilities
  "Utilities/ExtensionShowcase": "utilities",

  // ── Layout & Slots
  GridLayout: "layout-grid",
  Grid: "layout-grid",
  CardGrid: "layout-grid",
  ColumnsSlot: "layout-grid",
  FlexLayout: "layout-grid",
  Container: "layout-container",
  Spacer: "layout-container",
  Divider: "layout-container",

  // ── Content & Media
  "Home/MediaText": "media-split",
  "Home/TwoColumns": "media-split",
  FormattedText: "rich-text",
  RichText: "rich-text",
  Text: "rich-text",
  CustomHTML: "rich-text",
  Image: "image-banner",
  ImageBanner: "image-banner",
  Carousel: "image-banner",
  FAQ: "faq-accordion",
  CTA: "cta-banner",
  Testimonials: "testimonials",
  Features: "faculty-programs",
  Pricing: "admissions",
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
  if (lower.includes("news") || lower.includes("article")) return "news-bento";
  if (lower.includes("document") || lower.includes("pdf") || lower.includes("guideline") || lower.includes("template")) return "faculty-documents";
  if (lower.includes("program") || lower.includes("track") || lower.includes("workshop")) return "faculty-programs";
  if (lower.includes("leader") || lower.includes("committee") || lower.includes("award")) return "leadership";
  if (lower.includes("lecturer") || lower.includes("speaker") || lower.includes("keynote")) return "faculty-lecturers";
  if (lower.includes("stat") || lower.includes("highlight")) return "stats-counters";
  if (lower.includes("chart") || lower.includes("graph")) return "stats-chart";
  if (lower.includes("timeline") || lower.includes("history") || lower.includes("date") || lower.includes("past")) return "timeline";
  if (lower.includes("faq") || lower.includes("question")) return "faq-accordion";
  if (lower.includes("schedule") || lower.includes("calendar") || lower.includes("session")) return "faculty-schedule";
  if (lower.includes("partner") || lower.includes("sponsor")) return "partners-grid";
  if (lower.includes("grid") || lower.includes("column") || lower.includes("slot")) return "layout-grid";
  if (lower.includes("container") || lower.includes("wrapper") || lower.includes("spacer") || lower.includes("divider")) return "layout-container";
  if (lower.includes("cta") || lower.includes("action") || lower.includes("countdown") || lower.includes("button")) return "cta-banner";
  if (lower.includes("image") || lower.includes("photo") || lower.includes("gallery") || lower.includes("video")) return "image-banner";
  if (lower.includes("subscribe") || lower.includes("newsletter")) return "newsletter";
  if (lower.includes("visa") || lower.includes("travel") || lower.includes("venue")) return "media-split";
  if (lower.includes("registration") || lower.includes("payment") || lower.includes("pricing") || lower.includes("fee")) return "admissions";

  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes("news")) return "news-bento";
    if (catLower.includes("program")) return "faculty-schedule";
    if (catLower.includes("academic")) return "faculty-programs";
    if (catLower.includes("registration")) return "admissions";
    if (catLower.includes("organization")) return "leadership";
    if (catLower.includes("layout")) return "layout-grid";
  }

  return "fallback-generic";
}
