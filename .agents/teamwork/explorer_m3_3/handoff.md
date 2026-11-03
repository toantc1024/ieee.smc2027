# Handoff Report — Explorer M3-3: 21 Conference Section Registry & Public Dynamic Page Renderer

**Date**: 2026-11-02T15:50:00Z  
**Author**: Explorer M3-3 (`teamwork_explorer`)  
**Target Milestone**: M3 (Page Editor & Website Builder)  
**Parent Orchestrator**: `e417c152-55b4-4ecc-ad3e-6ec5f3ea6688`

---

## 1. Observation

### 1.1 Existing Target Section Components & Landing Structure
- **Current Home Page (`src/app/page.tsx:33-87`)**:
  Renders blocks dynamically using `renderBlock(block)` mapping `HeroCarousel`, `WelcomeLetter`, `NewsList`, `ConferenceVideo`, `PaperTemplates`, `ContactCards`, `CfpSubscribe`, `SubmissionCountdown`, `ConferenceHighlights`, `CallForPapers`, `TracksExplorer`, `ImportantDates`, `About`, `Committee`, `Venue`, `CommitteesSection`, `FAQ`, `Keynotes`, `Sponsors`, and `CustomHTML`.
- **Database & CMS Service (`src/services/cms.service.ts:31-50`)**:
  Fetches pages via `getPageByIdOrSlug(identifier: string)` using `prisma.page.findFirst({ where: { OR: [{ id: identifier }, { slug: identifier }] } })`.
- **Prisma Schema (`prisma/schema.prisma:66-90`)**:
  `model Page` has fields: `id`, `slug` (@unique), `title`, `blocks` (Json default "[]"), `content` (Json?), `parentId`, `orderIndex`, `version`, `isPublished` (Boolean default true), `metaTitle`, `metaDescription`, `templateId`, `histories` (PageHistory[]), `createdAt`, `updatedAt`.
- **Standard Pages Route (`src/app/api/admin/pages/route.ts:106-279`)**:
  Defines `STANDARD_CONFERENCE_PAGES` for `home`, `committees`, `submissions`, `registration`, `program`, `travel`, and `news`.
- **E2E Contract (`tests/e2e/tier1-feature-coverage/page-builder.test.ts:45-77`)**:
  - `T1.1.1` verifies `GET /api/admin/pages` returns standard conference pages with array of blocks.
  - `T1.1.2` verifies `GET /api/admin/pages/home` returns complete block structure and metadata.
  - `T1.1.3`–`T1.1.4` test page creation and block updates (`hero`, `cfp`, `dates`, `committees`).

### 1.2 Reference HCMUTE Website Builder Architecture
- **Component Registry (`modules/cms/core/registry.tsx:250-320, 3538-3600`)**:
  Maintains typed `BuilderRegistry` with `categories` (title, icon, components) and `components` (label, category, icon, fields, defaultProps, render).
- **Core Types (`modules/cms/core/types.ts:43-56, 218-245`)**:
  Defines `PageBlock<P>`, `PageBuilderData` (`{ root: PageRootData, content: PageBlock[] }`), `FieldDefinition`, and `ComponentDefinition`.
- **Seam Dropzones & DnD (`modules/cms/editor/canvas/sortable-block.tsx:149-171, 240-300`)**:
  - Each block registers two `@dnd-kit/core` droppables: `drop-before-${blockId}` (top 50%) and `drop-after-${blockId}` (bottom 50%).
  - Active drop indicator line: full width `h-1 bg-blue-600 rounded-full` at seam with terminal beads (`w-3 h-3 rounded-full bg-blue-600 border-2 border-white`) and a center counter-scaled badge (`Plus` icon + "Insert before/after: {label}").
  - Counter-scale factor: `counterScale = 100 / effectiveZoom` ensuring 1:1 crisp display at all canvas zoom levels.
  - Z-index priority: active drop target `9999`, dragged element `100`, action pill `50`, selected block `45`, hovered `40`, idle `2`.
- **Public Dynamic Page Resolution (`modules/website-builder/lib/load-website-page.ts`, `app/(public)/[lang]/[...slug]/page.tsx:35-86`)**:
  SSR server component resolves page by path/slug, extracts SEO metadata via `generateMetadata()`, handles published status, and renders via `PageRenderer` and `BlockRenderer` with `BlockErrorBoundary`.

---

## 2. Logic Chain

1. **Section Nomenclature & Backward Compatibility**:
   - The user specification mandates 21 conference section block definitions: `HeroCarousel`, `CallForPapers`, `KeynoteSpeakersSection`, `CommitteesSection`, `ConferenceTracksSection`, `ImportantDatesSection`, `RegistrationFeesSection`, `VenueLocationSection`, `ScheduleTimelineSection`, `SponsorshipSection`, `WorkshopTutorialSection`, `PaperSubmissionGuidelinesSection`, `AwardsSection`, `TravelAccommodationSection`, `ContactSupportSection`, `FaqAccordionSection`, `PastConferencesSection`, `MediaGallerySection`, `VisaInformationSection`, `HeaderSection`, `FooterSection`.
   - Existing seeded data in `src/app/api/admin/pages/route.ts` and `src/app/page.tsx` uses shorthand names (`Keynotes`, `TracksExplorer`, `ImportantDates`, `PaymentMethods`, `Venue`, `Sponsors`, `PaperTemplates`, `ContactCards`, `FAQ`, `ConferenceVideo`).
   - *Logic*: The registry must register all 21 canonical definitions, and the renderer must resolve both canonical and alias names transparently to avoid breaking existing pages or tests.
2. **Property Inspector Form Schema**:
   - Each block must specify an editable fields map in `registry.ts` allowing the right panel property inspector (Content tab) to generate interactive controls: text inputs, multiline textareas, numbers, dropdown selects, switches, image pickers, and repeatable arrays.
3. **Seam Dropzone Mechanics**:
   - Visual page building requires drag-and-drop insertion between any two existing blocks.
   - Splitting each block into two droppable halves (`before` and `after`) provides zero-latency collision detection without needing an artificial placeholder item in the DOM tree during drag.
   - Rendering full-width horizontal indicator lines with counter-scaled center pills prevents UI layout shifts during drag interactions.
4. **Public Dynamic Page Renderer (`src/app/(public)/[slug]/page.tsx`)**:
   - Must be a Next.js 16 Server Component (`async` function with `params: Promise<{ slug: string }>`).
   - Fetches page from Prisma by slug.
   - Enforces draft security: if `!page.isPublished`, unauthorized visitors receive 404 (`notFound()`), while authorized admins can preview with `?preview=true`.
   - Normalizes both AST schemas (`page.content.content` vs `page.blocks`).
   - Wraps individual block renders in `BlockErrorBoundary` so an invalid prop or component failure never crashes the public website.
5. **User Rules Compliance**:
   - Zero sparkle icons: All block icons in the registry and canvas toolbar use clean Lucide icons (`Sliders`, `FileText`, `Mic`, `Users`, `Layers`, `Calendar`, `CreditCard`, `MapPin`, `Clock`, `Building2`, `BookOpen`, `FileCode`, `Award`, `Compass`, `Mail`, `HelpCircle`, `History`, `Video`, `Plane`, `Layout`, `PanelBottom`).
   - Clean English copy without bracketed subtitles or superfluous Vietnamese text.

---

## 3. Caveats

1. **Static App Router Routes Precedence**:
   Next.js App Router prioritizes explicit route directories (`src/app/committees/page.tsx`, `src/app/submissions/page.tsx`, `src/app/registration/page.tsx`, `src/app/travel/page.tsx`, `src/app/news/page.tsx`) over dynamic catch-all or slug routes `src/app/(public)/[slug]/page.tsx`.
   - Custom pages created in the builder with new slugs (e.g. `/workshops`, `/awards`, `/past-conferences`, `/e2e-test-page`) will be routed to `[slug]`.
   - If administrators want the standard pages (`/committees`, etc.) to reflect changes made in the page builder, the static route pages should either delegate to the dynamic page renderer or be redirected.
2. **Client vs Server Components in Block Renderer**:
   Interactive components (e.g. `HeroCarousel` with GSAP, `CommitteesSection` with Embla Carousel, `FAQ` with stateful accordion) require client runtime (`"use client"`). The `PageRenderer` client component should safely mount these.
3. **Prisma JSON Types**:
   Prisma returns `JsonValue` for `blocks` and `content`. Runtime type validation and normalization are necessary to prevent runtime exceptions if a payload is null or malformed.

---

## 4. Conclusion & Detailed Technical Specification

### 4.1 The 21 Conference Section Block Registry

The Block Registry will be implemented in `src/modules/website-builder/registry/conference-blocks.tsx` and exported via `src/modules/website-builder/registry/index.ts`.

#### Summary Table of All 21 Blocks

| # | Type String (Canonical) | Shorthand Alias | Category | Lucide Icon | Default Summary / Key Props |
|---|-------------------------|-----------------|----------|-------------|-----------------------------|
| 1 | `HeroCarousel` | — | `hero` | `Sliders` | Autoplay hero banner, slides array, CFP CTA links |
| 2 | `CallForPapers` | — | `academic` | `FileText` | Official CFP, deadline badge, PDF download link |
| 3 | `KeynoteSpeakersSection` | `Keynotes` | `conference` | `Mic` | Plenary speakers grid, photos, affiliations, topics |
| 4 | `CommitteesSection` | `Committee` | `organization` | `Users` | Organizing & steering committees carousel, photo cards |
| 5 | `ConferenceTracksSection` | `TracksExplorer` | `academic` | `Layers` | Systems, Cybernetics, Human-AI track topic browser |
| 6 | `ImportantDatesSection` | `ImportantDates` | `conference` | `Calendar` | Milestones table, submission deadline, status badges |
| 7 | `RegistrationFeesSection` | `PaymentMethods` | `registration` | `CreditCard` | Fee tiers (Author, Member, Student), Payoo info |
| 8 | `VenueLocationSection` | `Venue` | `venue` | `MapPin` | Sheraton Saigon Opera Hotel, map link, address |
| 9 | `ScheduleTimelineSection` | — | `program` | `Clock` | 5-day conference timeline (Oct 6–10, 2027) |
| 10 | `SponsorshipSection` | `Sponsors` | `partners` | `Building2` | IEEE SMC Society, HCM-UTE, tier partner logos |
| 11 | `WorkshopTutorialSection` | — | `academic` | `BookOpen` | Workshops, hands-on tutorials, proposal submissions |
| 12 | `PaperSubmissionGuidelinesSection` | `PaperTemplates` | `academic` | `FileCode` | IEEE 2-column LaTeX & Word templates, page limits |
| 13 | `AwardsSection` | — | `conference` | `Award` | Best Paper, Best Student Paper, Memorial awards |
| 14 | `TravelAccommodationSection` | — | `hospitality` | `Compass` | Hotel reservations, transit, airport proximity |
| 15 | `ContactSupportSection` | `ContactCards` | `contact` | `Mail` | Organizing secretariat cards, email, location |
| 16 | `FaqAccordionSection` | `FAQ` | `support` | `HelpCircle` | Category filterable author & attendee FAQ accordion |
| 17 | `PastConferencesSection` | — | `history` | `History` | SMC 2026 Bellevue, SMC 2025 Sarawak, SMC 2024 |
| 18 | `MediaGallerySection` | `ConferenceVideo` | `media` | `Video` | Promotional video embed & photo gallery |
| 19 | `VisaInformationSection` | — | `hospitality` | `Plane` | 90-day Vietnam e-Visa portal, visa support letters |
| 20 | `HeaderSection` | — | `layout` | `Layout` | Conference portal navigation header, sticky mode |
| 21 | `FooterSection` | — | `layout` | `PanelBottom` | Official IEEE & HCM-UTE copyright footer, links |

---

#### Detailed Specification of Each Block Definition

```typescript
// src/modules/website-builder/registry/conference-blocks.ts
import type { ComponentDefinition } from "../types";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CallForPapers } from "@/components/sections/CallForPapers";
import { CommitteesSection } from "@/components/sections/CommitteesSection";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { Keynotes } from "@/components/sections/Keynotes";
import { TracksExplorer } from "@/components/sections/TracksExplorer";
import { Venue } from "@/components/sections/Venue";
import { Sponsors } from "@/components/sections/Sponsors";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { PaperTemplates } from "@/components/sections/PaperTemplates";
import { ContactCards } from "@/components/sections/ContactCards";
import { FAQ } from "@/components/sections/FAQ";
import { ConferenceVideo } from "@/components/sections/ConferenceVideo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScheduleTimelineSection } from "@/components/sections/ScheduleTimelineSection";
import { WorkshopTutorialSection } from "@/components/sections/WorkshopTutorialSection";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { TravelAccommodationSection } from "@/components/sections/TravelAccommodationSection";
import { PastConferencesSection } from "@/components/sections/PastConferencesSection";
import { VisaInformationSection } from "@/components/sections/VisaInformationSection";
import { KeynoteSpeakersSection } from "@/components/sections/KeynoteSpeakersSection";

export const CONFERENCE_BLOCK_DEFINITIONS: Record<string, ComponentDefinition<any>> = {
  // 1. HeroCarousel
  HeroCarousel: {
    label: "Hero Carousel",
    category: "hero",
    icon: "Sliders",
    fields: {
      autoplayDuration: { type: "number", label: "Autoplay Duration (seconds)", min: 3, max: 20 },
      showOverlayText: { type: "switch", label: "Show Overlay Text" },
      showIndicators: { type: "switch", label: "Show Slide Indicators" },
      slides: {
        type: "array",
        label: "Carousel Slides",
        arrayFields: {
          title: { type: "text", label: "Slide Title" },
          subtitle: { type: "textarea", label: "Slide Subtitle" },
          highlight: { type: "text", label: "Highlighted Phrase" },
          badge: { type: "text", label: "Top Badge" },
          image: { type: "image", label: "Desktop Image URL" },
          mobileImage: { type: "image", label: "Mobile Image URL" },
        },
      },
    },
    defaultProps: {
      autoplayDuration: 7,
      showOverlayText: true,
      showIndicators: true,
    },
    render: (props) => <HeroCarousel {...props} />,
  },

  // 2. CallForPapers
  CallForPapers: {
    label: "Call for Papers",
    category: "academic",
    icon: "FileText",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      cfpPdfUrl: { type: "text", label: "CFP PDF URL" },
      submissionUrl: { type: "text", label: "Submission Portal URL" },
      submissionDeadline: { type: "text", label: "Paper Deadline" },
    },
    defaultProps: {
      title: "Call For Papers & Submission Guidelines",
      subtitle: "Submission Categories & Technical Topics • IEEE SMC 2027",
      cfpPdfUrl: "/CFP - IEEE SMC 2027.pdf",
      submissionUrl: "https://ras.papercept.net",
      submissionDeadline: "April 08, 2027",
    },
    render: (props) => <CallForPapers {...props} />,
  },

  // 3. KeynoteSpeakersSection (Aliases: Keynotes)
  KeynoteSpeakersSection: {
    label: "Keynote Speakers",
    category: "conference",
    icon: "Mic",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      speakers: {
        type: "array",
        label: "Keynote Speakers",
        arrayFields: {
          name: { type: "text", label: "Speaker Name" },
          affiliation: { type: "text", label: "Affiliation" },
          topic: { type: "text", label: "Keynote Topic" },
          photo: { type: "image", label: "Portrait Photo URL" },
        },
      },
    },
    defaultProps: {
      title: "Keynote Speakers & Plenary Sessions",
      subtitle: "Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics",
    },
    render: (props) => <KeynoteSpeakersSection {...props} />,
  },

  // 4. CommitteesSection (Aliases: Committee)
  CommitteesSection: {
    label: "Organizing Committees",
    category: "organization",
    icon: "Users",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      badge: { type: "text", label: "Badge Label" },
      autoplayDuration: { type: "number", label: "Autoplay Interval (sec)", min: 2, max: 10 },
      showAllGroups: { type: "switch", label: "Show All Committee Groups" },
    },
    defaultProps: {
      title: "Organizing & Technical Committees",
      subtitle: "Distinguished leadership and academic committee chairs driving IEEE SMC 2027",
      badge: "Leadership & Organization",
      autoplayDuration: 4,
      showAllGroups: true,
    },
    render: (props) => <CommitteesSection {...props} />,
  },

  // 5. ConferenceTracksSection (Aliases: TracksExplorer)
  ConferenceTracksSection: {
    label: "Conference Tracks",
    category: "academic",
    icon: "Layers",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      defaultPillar: {
        type: "select",
        label: "Default Active Pillar",
        options: [
          { label: "Systems Science", value: "systems" },
          { label: "Cybernetics", value: "cybernetics" },
          { label: "Human-Machine Systems", value: "humans" },
        ],
      },
      enableSearch: { type: "switch", label: "Enable Topic Search Bar" },
    },
    defaultProps: {
      title: "Technical Tracks & Scientific Scope",
      subtitle: "Explore research topics across Systems Science, Human-Machine Systems, and Cybernetics",
      defaultPillar: "systems",
      enableSearch: true,
    },
    render: (props) => <TracksExplorer {...props} />,
  },

  // 6. ImportantDatesSection (Aliases: ImportantDates)
  ImportantDatesSection: {
    label: "Important Dates",
    category: "conference",
    icon: "Calendar",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      dates: {
        type: "array",
        label: "Deadlines & Milestones",
        arrayFields: {
          title: { type: "text", label: "Milestone Name" },
          date: { type: "text", label: "Date" },
          category: { type: "text", label: "Category" },
          highlight: { type: "switch", label: "Highlight Critical Date" },
        },
      },
    },
    defaultProps: {
      title: "Important Deadlines & Milestones",
      subtitle: "Critical dates for paper submissions, notifications, camera-ready papers, and registrations",
    },
    render: (props) => <ImportantDates {...props} />,
  },

  // 7. RegistrationFeesSection (Aliases: PaymentMethods)
  RegistrationFeesSection: {
    label: "Registration Fees & Rates",
    category: "registration",
    icon: "CreditCard",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      earlyBirdDeadline: { type: "text", label: "Early Bird Cut-off Date" },
      currency: {
        type: "select",
        label: "Default Currency",
        options: [
          { label: "USD ($)", value: "USD" },
          { label: "VND (₫)", value: "VND" },
        ],
      },
    },
    defaultProps: {
      title: "Registration & Payment Methods",
      subtitle: "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
      earlyBirdDeadline: "August 05, 2027",
      currency: "USD",
    },
    render: (props) => <PaymentMethods {...props} />,
  },

  // 8. VenueLocationSection (Aliases: Venue)
  VenueLocationSection: {
    label: "Venue & Location",
    category: "venue",
    icon: "MapPin",
    fields: {
      venueName: { type: "text", label: "Venue Name" },
      address: { type: "textarea", label: "Address" },
      googleMapsUrl: { type: "text", label: "Google Maps URL" },
      showAttractions: { type: "switch", label: "Show Nearby Tourist Attractions" },
    },
    defaultProps: {
      venueName: "Sheraton Saigon Grand Opera Hotel",
      address: "88 Dong Khoi Street, District 1, Ho Chi Minh City, Vietnam",
      googleMapsUrl: "https://maps.google.com/?q=Sheraton+Saigon+Grand+Opera+Hotel",
      showAttractions: true,
    },
    render: (props) => <Venue {...props} />,
  },

  // 9. ScheduleTimelineSection
  ScheduleTimelineSection: {
    label: "Schedule Timeline",
    category: "program",
    icon: "Clock",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Conference Schedule & Daily Program",
      subtitle: "October 6–10, 2027 • Daily technical sessions, workshops, keynotes, and social banquet",
    },
    render: (props) => <ScheduleTimelineSection {...props} />,
  },

  // 10. SponsorshipSection (Aliases: Sponsors)
  SponsorshipSection: {
    label: "Sponsors & Partners",
    category: "partners",
    icon: "Building2",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      showPackages: { type: "switch", label: "Show Sponsorship Package Download Link" },
    },
    defaultProps: {
      title: "Conference Sponsors & Technical Partners",
      subtitle: "Generously supported by IEEE SMC Society, HCM-UTE, and international academic partners",
      showPackages: false,
    },
    render: (props) => <Sponsors {...props} />,
  },

  // 11. WorkshopTutorialSection
  WorkshopTutorialSection: {
    label: "Workshops & Tutorials",
    category: "academic",
    icon: "BookOpen",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      proposalDeadline: { type: "text", label: "Proposal Deadline" },
      contactEmail: { type: "text", label: "Workshops Chair Contact" },
    },
    defaultProps: {
      title: "Workshops & Tutorial Proposals",
      subtitle: "Hands-on tutorials and specialized workshops preceding the main technical program",
      proposalDeadline: "February 15, 2027",
      contactEmail: "smc2027@hcmute.edu.vn",
    },
    render: (props) => <WorkshopTutorialSection {...props} />,
  },

  // 12. PaperSubmissionGuidelinesSection (Aliases: PaperTemplates)
  PaperSubmissionGuidelinesSection: {
    label: "Submission Guidelines & Templates",
    category: "academic",
    icon: "FileCode",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      maxPages: { type: "number", label: "Standard Page Limit", min: 4, max: 10 },
      extraPagesLimit: { type: "number", label: "Allowed Extra Pages", min: 0, max: 4 },
      paperceptUrl: { type: "text", label: "PaperCept URL" },
    },
    defaultProps: {
      title: "Author Submission Templates & Guidelines",
      subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
      maxPages: 6,
      extraPagesLimit: 2,
      paperceptUrl: "https://ras.papercept.net",
    },
    render: (props) => <PaperTemplates {...props} />,
  },

  // 13. AwardsSection
  AwardsSection: {
    label: "Conference Awards",
    category: "conference",
    icon: "Award",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "IEEE SMC 2027 Paper Awards",
      subtitle: "Celebrating academic rigor, research novelty, and student contribution excellence",
    },
    render: (props) => <AwardsSection {...props} />,
  },

  // 14. TravelAccommodationSection
  TravelAccommodationSection: {
    label: "Travel & Accommodation",
    category: "hospitality",
    icon: "Compass",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      hotelBookingUrl: { type: "text", label: "Hotel Reservation Link" },
      airportDistance: { type: "text", label: "Airport Distance" },
    },
    defaultProps: {
      title: "Travel & Accommodation Guide",
      subtitle: "Essential guide to the conference venue at Sheraton Saigon Grand Opera Hotel and international arrivals",
      hotelBookingUrl: "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
      airportDistance: "7 km (~20–30 mins from Tan Son Nhat Airport)",
    },
    render: (props) => <TravelAccommodationSection {...props} />,
  },

  // 15. ContactSupportSection (Aliases: ContactCards)
  ContactSupportSection: {
    label: "Contact & Support",
    category: "contact",
    icon: "Mail",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      email: { type: "text", label: "Secretariat Email" },
      location: { type: "text", label: "Location" },
      venue: { type: "text", label: "Venue Name" },
      website: { type: "text", label: "Website URL" },
    },
    defaultProps: {
      title: "Contact the Organizing Secretariat",
      subtitle: "Have questions regarding paper submissions, proposals, or conference participation?",
      email: "smc2027@hcmute.edu.vn",
      location: "Ho Chi Minh City, Vietnam",
      venue: "Sheraton Saigon Grand Opera Hotel",
      website: "https://ieee-smc2027.org",
    },
    render: (props) => <ContactCards {...props} />,
  },

  // 16. FaqAccordionSection (Aliases: FAQ)
  FaqAccordionSection: {
    label: "FAQ Accordion",
    category: "support",
    icon: "HelpCircle",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      defaultCategory: {
        type: "select",
        label: "Initial Active Category",
        options: [
          { label: "All", value: "All" },
          { label: "Submission", value: "Submission" },
          { label: "Registration", value: "Registration" },
          { label: "Venue", value: "Venue" },
          { label: "Visa", value: "Visa" },
        ],
      },
    },
    defaultProps: {
      title: "Frequently Asked Questions & Help",
      subtitle: "Author & Attendee Assistance • Conference Policies & Guidance",
      defaultCategory: "All",
    },
    render: (props) => <FAQ {...props} />,
  },

  // 17. PastConferencesSection
  PastConferencesSection: {
    label: "Past SMC Conferences",
    category: "history",
    icon: "History",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Past IEEE SMC Conferences",
      subtitle: "Discover the long-standing international heritage of the IEEE SMC Society flagship conference",
    },
    render: (props) => <PastConferencesSection {...props} />,
  },

  // 18. MediaGallerySection (Aliases: ConferenceVideo)
  MediaGallerySection: {
    label: "Media & Video Gallery",
    category: "media",
    icon: "Video",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      videoUrl: { type: "text", label: "YouTube Embed URL" },
      venueName: { type: "text", label: "Venue Caption" },
    },
    defaultProps: {
      title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
      subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy",
      videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
      venueName: "Sheraton Saigon Grand Opera Hotel",
    },
    render: (props) => <ConferenceVideo {...props} />,
  },

  // 19. VisaInformationSection
  VisaInformationSection: {
    label: "Vietnam Visa & Entry Guide",
    category: "hospitality",
    icon: "Plane",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      evisaUrl: { type: "text", label: "Government e-Visa Link" },
      visaLetterEmail: { type: "text", label: "Visa Support Email" },
    },
    defaultProps: {
      title: "Vietnam e-Visa & Entry Requirements",
      subtitle: "Citizens of all countries can apply for a 90-day multiple-entry electronic visa (e-Visa)",
      evisaUrl: "https://evisa.xuatnhapcanh.gov.vn",
      visaLetterEmail: "smc2027@hcmute.edu.vn",
    },
    render: (props) => <VisaInformationSection {...props} />,
  },

  // 20. HeaderSection
  HeaderSection: {
    label: "Site Header",
    category: "layout",
    icon: "Layout",
    fields: {
      sticky: { type: "switch", label: "Sticky on Scroll" },
    },
    defaultProps: {
      sticky: true,
    },
    render: (props) => <Header {...props} />,
  },

  // 21. FooterSection
  FooterSection: {
    label: "Site Footer",
    category: "layout",
    icon: "PanelBottom",
    fields: {
      showSocialLinks: { type: "switch", label: "Show Social Media Icons" },
    },
    defaultProps: {
      showSocialLinks: true,
    },
    render: (props) => <Footer {...props} />,
  },
};

// Aliases lookup map mapping legacy or shorthand names to canonical definitions
export const BLOCK_ALIASES: Record<string, string> = {
  Keynotes: "KeynoteSpeakersSection",
  TracksExplorer: "ConferenceTracksSection",
  ImportantDates: "ImportantDatesSection",
  PaymentMethods: "RegistrationFeesSection",
  Venue: "VenueLocationSection",
  Sponsors: "SponsorshipSection",
  PaperTemplates: "PaperSubmissionGuidelinesSection",
  ContactCards: "ContactSupportSection",
  FAQ: "FaqAccordionSection",
  ConferenceVideo: "MediaGallerySection",
  Committee: "CommitteesSection",
};

export function getBlockDefinition(type: string): ComponentDefinition<any> | undefined {
  const canonicalType = BLOCK_ALIASES[type] || type;
  return CONFERENCE_BLOCK_DEFINITIONS[canonicalType];
}
```

---

### 4.2 Public Dynamic Page Renderer Architecture

#### Route Path: `src/app/(public)/[slug]/page.tsx`

```tsx
import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PublicPageRenderer } from "@/modules/website-builder/renderer/PublicPageRenderer";
import type { PageBlock } from "@/modules/website-builder/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!page) {
    return { title: "Page Not Found | IEEE SMC 2027" };
  }

  return {
    title: page.metaTitle || `${page.title} | IEEE SMC 2027`,
    description: page.metaDescription || "IEEE SMC 2027 Official Conference Page",
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
    },
  };
}

export default async function PublicDynamicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  // 1. Fetch Page AST from Prisma
  const page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!page) {
    notFound();
  }

  // 2. Published vs Draft Guard
  const isPreview = preview === "true" || preview === "1";
  if (!page.isPublished && !isPreview) {
    notFound();
  }

  // 3. Normalize blocks from content AST or legacy blocks array
  let blocks: PageBlock[] = [];
  if (page.content && typeof page.content === "object") {
    const ast = page.content as Record<string, any>;
    if (Array.isArray(ast.content)) {
      blocks = ast.content;
    }
  }
  if (blocks.length === 0 && Array.isArray(page.blocks)) {
    blocks = page.blocks as unknown as PageBlock[];
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Draft indicator banner when viewing in preview mode */}
      {!page.isPublished && (
        <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold shadow-md">
          Draft Preview Mode — This page is currently unpublished
        </div>
      )}

      {/* Render dynamic block sequence */}
      <PublicPageRenderer blocks={blocks} isEditing={false} />
    </div>
  );
}
```

#### Safe Block Renderer with Error Boundary: `src/modules/website-builder/renderer/PublicPageRenderer.tsx`

```tsx
"use client";

import React from "react";
import { getBlockDefinition } from "../registry/conference-blocks";
import type { PageBlock } from "../types";

class BlockErrorBoundary extends React.Component<
  { blockType: string; isEditing?: boolean; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[BlockErrorBoundary] Error in block "${this.props.blockType}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.isEditing) {
        return (
          <div className="p-4 my-2 border border-red-500 bg-red-50 text-red-700 text-xs rounded-lg">
            Failed to render block: <strong>{this.props.blockType}</strong>
          </div>
        );
      }
      return null; // Gracefully suppress broken block in public production
    }
    return this.props.children;
  }
}

export function PublicPageRenderer({
  blocks,
  isEditing = false,
}: {
  blocks: PageBlock[];
  isEditing?: boolean;
}) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        This conference page has no content blocks yet.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {blocks.map((block, index) => {
        // Skip hidden blocks on public render
        if (block.hidden && !isEditing) return null;

        const def = getBlockDefinition(block.type);
        const blockKey = block.id || `block-${block.type}-${index}`;

        if (!def) {
          if (isEditing) {
            return (
              <div
                key={blockKey}
                className="p-4 my-2 border border-dashed border-amber-400 bg-amber-50 text-amber-800 text-xs rounded-lg flex items-center justify-between"
              >
                <span>Unknown Block Type: <strong>{block.type}</strong></span>
                <span className="font-mono text-[10px] opacity-70">id: {block.id}</span>
              </div>
            );
          }
          return null;
        }

        const mergedProps = {
          ...(def.defaultProps || {}),
          ...(block.props || {}),
          id: block.id,
          styles: block.styles,
        };

        return (
          <BlockErrorBoundary key={blockKey} blockType={block.type} isEditing={isEditing}>
            <div id={block.id} className="w-full relative">
              {def.render(mergedProps)}
            </div>
          </BlockErrorBoundary>
        );
      })}
    </div>
  );
}
```

---

### 4.3 Seam Dropzones & Canvas Drag-and-Drop Interaction Mechanics

#### Droppable Seam Zones Layout

In the builder artboard, each canvas block is rendered inside a `SortableBlock` container that exposes two independent dropzones:
1. **Top Seam Dropzone (`drop-before-${block.id}`)**:
   - Covers top 50% of the block height (`absolute top-0 left-0 right-0 h-1/2`).
   - Attached to `@dnd-kit/core` via `useDroppable({ id: 'drop-before-' + block.id, data: { type: 'canvas-dropzone', position: 'before', targetId: block.id, index } })`.
2. **Bottom Seam Dropzone (`drop-after-${block.id}`)**:
   - Covers bottom 50% of the block height (`absolute bottom-0 left-0 right-0 h-1/2`).
   - Attached via `useDroppable({ id: 'drop-after-' + block.id, data: { type: 'canvas-dropzone', position: 'after', targetId: block.id, index } })`.
3. **Canvas End Dropzone (`drop-after-end`)**:
   - Positioned below the last block (`min-h-[140px]`) allowing drop at the very end of the page.

#### Active Indicator & Counter-Scaling Mathematics

When an item is dragged over a seam dropzone:
- A horizontal insertion line (`h-1 bg-blue-600 rounded-full shadow-xs`) appears at the exact boundary (`top-0 -translate-y-1/2` or `bottom-0 translate-y-1/2`).
- Terminal beads (`w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs`) snap to the left (`-left-1.5`) and right (`-right-1.5`) ends.
- A center indicator badge displays: `<Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Insert before: {blockLabel}`.
- **Counter-Scaling Formula**:
  ```typescript
  const counterScale = effectiveZoom && effectiveZoom > 0 && effectiveZoom < 100
    ? 100 / effectiveZoom
    : 1;
  ```
  Applied to the center badge and block action pills:
  ```css
  style={{ transform: counterScale !== 1 ? `scale(${counterScale})` : undefined }}
  ```
  This guarantees that even when the user views the desktop artboard scaled down to 50% on a laptop screen, insertion lines, badge text, and grip controls remain crisp, sharp, and readable at natural 12px/14px sizing.

#### Collision Detection & Z-Index Hierarchy

- **Collision Detection**: Custom algorithm filtering candidate droppables by `type === "canvas-dropzone"` first, calculating pointer intersection before falling back to container drop.
- **Z-Index Layering**:
  - Active Drop Target: `z-index: 9999`
  - Dragging Block Ghost: `z-index: 100`
  - Floating Action Pill: `z-index: 50`
  - Selected Block: `z-index: 45`
  - Hovered Block: `z-index: 40`
  - Idle Canvas Block: `z-index: 2`

---

## 5. Verification Method

### 5.1 Static Verification
1. Verify no sparkle icons are imported in the block registry or renderer:
   ```bash
   rg -i "sparkle" src/modules/website-builder/
   ```
   Must return 0 results.
2. Verify all 21 block types are registered:
   Check `CONFERENCE_BLOCK_DEFINITIONS` has exactly 21 keys:
   `HeroCarousel`, `CallForPapers`, `KeynoteSpeakersSection`, `CommitteesSection`, `ConferenceTracksSection`, `ImportantDatesSection`, `RegistrationFeesSection`, `VenueLocationSection`, `ScheduleTimelineSection`, `SponsorshipSection`, `WorkshopTutorialSection`, `PaperSubmissionGuidelinesSection`, `AwardsSection`, `TravelAccommodationSection`, `ContactSupportSection`, `FaqAccordionSection`, `PastConferencesSection`, `MediaGallerySection`, `VisaInformationSection`, `HeaderSection`, `FooterSection`.

### 5.2 Build & Type-Check Verification
```bash
pnpm run build
```
Must compile with zero TypeScript errors and zero ESLint errors.

### 5.3 Automated E2E Verification
Run the page builder test suite:
```bash
pnpm test tests/e2e/tier1-feature-coverage/page-builder.test.ts
pnpm test tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts
```
Expected: All tests pass (HTTP 200/201 on create, read, update, delete).

### 5.4 Dynamic Page Route Verification
1. Access `http://localhost:3000/home`: Renders the conference landing blocks.
2. Create custom page with slug `test-section` via `POST /api/admin/pages`:
   ```bash
   curl -X POST http://localhost:3000/api/admin/pages \
     -H "Content-Type: application/json" \
     -d '{"id":"test-section","slug":"test-section","title":"Test Conference Section","blocks":[{"id":"b1","type":"CallForPapers","props":{}}],"is_published":true}'
   ```
3. Access `http://localhost:3000/test-section`:
   Must return HTTP 200 with CallForPapers section rendered.
4. Set `is_published: false`:
   Must return HTTP 404 for unauthenticated requests, and render draft banner when requested with `?preview=true` by admin.
