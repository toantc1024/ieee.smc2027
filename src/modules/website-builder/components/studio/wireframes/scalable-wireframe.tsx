import React from "react";
import type { WireframeProps } from "./types";
import { resolveArchetype } from "./archetype-resolver";
import {
  HeroCarouselBlueprint,
  HeroBannerBlueprint,
  CtaBannerBlueprint,
} from "./blueprints/hero-blueprints";
import {
  LeadershipBlueprint,
  AboutOverviewBlueprint,
  NewsBentoBlueprint,
  NewsArchiveBlueprint,
  PostDetailBlueprint,
  PostActionsBlueprint,
  NewsletterBlueprint,
  RichTextBlueprint,
} from "./blueprints/content-blueprints";
import {
  FacultyHeaderBlueprint,
  FacultyDocumentsBlueprint,
  FacultyProgramsBlueprint,
  FacultyLecturersBlueprint,
  FacultyScheduleBlueprint,
  FaqAccordionBlueprint,
} from "./blueprints/faculty-blueprints";
import {
  StatsCountersBlueprint,
  StatsChartBlueprint,
  TimelineBlueprint,
  PartnersGridBlueprint,
  CampusLifeBlueprint,
  MediaSplitBlueprint,
  UtilitiesBlueprint,
  LayoutGridBlueprint,
  LayoutContainerBlueprint,
  FallbackGenericBlueprint,
} from "./blueprints/data-blueprints";

export function ScalableWireframe({ type, label, category }: WireframeProps) {
  const archetype = resolveArchetype(type, category);

  const renderBlueprint = () => {
    switch (archetype) {
      // ── Hero & Banners
      case "hero-carousel":
        return <HeroCarouselBlueprint />;
      case "hero-banner":
        return <HeroBannerBlueprint />;
      case "cta-banner":
        return <CtaBannerBlueprint />;

      // ── Content & Articles
      case "leadership":
        return <LeadershipBlueprint />;
      case "about-overview":
        return <AboutOverviewBlueprint />;
      case "news-bento":
        return <NewsBentoBlueprint />;
      case "news-archive":
        return <NewsArchiveBlueprint />;
      case "post-detail":
        return <PostDetailBlueprint />;
      case "post-actions":
        return <PostActionsBlueprint />;
      case "post-footer":
        return <NewsBentoBlueprint />;
      case "newsletter":
        return <NewsletterBlueprint />;
      case "rich-text":
        return <RichTextBlueprint />;

      // ── Faculty & Academic
      case "faculty-header":
        return <FacultyHeaderBlueprint />;
      case "faculty-documents":
        return <FacultyDocumentsBlueprint />;
      case "faculty-programs":
      case "admissions":
        return <FacultyProgramsBlueprint />;
      case "faculty-lecturers":
        return <FacultyLecturersBlueprint />;
      case "faculty-schedule":
        return <FacultyScheduleBlueprint />;
      case "faculty-procedures":
      case "faq-accordion":
        return <FaqAccordionBlueprint />;
      case "faculty-links":
      case "faculty-support":
        return <PartnersGridBlueprint />;

      // ── Data & Media
      case "stats-counters":
        return <StatsCountersBlueprint />;
      case "stats-chart":
        return <StatsChartBlueprint />;
      case "timeline":
        return <TimelineBlueprint />;
      case "partners-grid":
        return <PartnersGridBlueprint />;
      case "campus-life":
      case "image-banner":
        return <CampusLifeBlueprint />;
      case "media-split":
        return <MediaSplitBlueprint />;
      case "utilities":
        return <UtilitiesBlueprint />;
      case "layout-grid":
        return <LayoutGridBlueprint />;
      case "layout-container":
        return <LayoutContainerBlueprint />;
      case "testimonials":
        return <AboutOverviewBlueprint />;

      default:
        return <FallbackGenericBlueprint label={label} />;
    }
  };

  return (
    <svg
      viewBox="0 0 100 65"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block select-none pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderBlueprint()}
    </svg>
  );
}
