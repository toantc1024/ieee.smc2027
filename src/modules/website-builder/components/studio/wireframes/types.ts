export type WireframeArchetype =
  | "hero-carousel"
  | "hero-banner"
  | "leadership"
  | "about-overview"
  | "news-bento"
  | "news-archive"
  | "post-detail"
  | "post-actions"
  | "post-footer"
  | "newsletter"
  | "faculty-header"
  | "faculty-programs"
  | "faculty-lecturers"
  | "faculty-documents"
  | "faculty-procedures"
  | "faculty-schedule"
  | "faculty-links"
  | "faculty-support"
  | "admissions"
  | "research-papers"
  | "stats-counters"
  | "stats-chart"
  | "notification-banner"
  | "partners-grid"
  | "campus-life"
  | "timeline"
  | "media-split"
  | "layout-grid"
  | "layout-container"
  | "rich-text"
  | "faq-accordion"
  | "cta-banner"
  | "testimonials"
  | "image-banner"
  | "utilities"
  | "fallback-generic";

export interface WireframeProps {
  type: string;
  label?: string;
  category?: string;
}
