"use client";

import React from "react";
import type { ComponentDefinition } from "../types";
import {
  Sliders,
  FileText,
  Mic,
  Users,
  Layers,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Building2,
  BookOpen,
  FileCode,
  Award,
  Compass,
  Mail,
  HelpCircle,
  History,
  Video,
  Plane,
  Layout,
  PanelBottom,
  Bell,
  Newspaper,
  Info,
  Timer,
  CheckCircle,
} from "lucide-react";

// Import Section Components
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CallForPapers } from "@/components/sections/CallForPapers";
import { KeynoteSpeakersSection } from "@/components/sections/KeynoteSpeakersSection";
import { CommitteesSection, CHAIR_PHOTO_MAP } from "@/components/sections/CommitteesSection";
import { TracksExplorer } from "@/components/sections/TracksExplorer";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { Venue } from "@/components/sections/Venue";
import { ScheduleTimelineSection } from "@/components/sections/ScheduleTimelineSection";
import { Sponsors } from "@/components/sections/Sponsors";
import { WorkshopTutorialSection } from "@/components/sections/WorkshopTutorialSection";
import { PaperTemplates } from "@/components/sections/PaperTemplates";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { TravelAccommodationSection } from "@/components/sections/TravelAccommodationSection";
import { ContactCards } from "@/components/sections/ContactCards";
import { FAQ } from "@/components/sections/FAQ";
import { PastConferencesSection } from "@/components/sections/PastConferencesSection";
import { ConferenceVideo } from "@/components/sections/ConferenceVideo";
import { VisaInformationSection } from "@/components/sections/VisaInformationSection";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Additional legacy / seed blocks
import { WelcomeLetter } from "@/components/sections/WelcomeLetter";
import { ConferenceHighlights } from "@/components/sections/ConferenceHighlights";
import { NewsList } from "@/components/sections/NewsList";
import { About } from "@/components/sections/About";
import { CfpSubscribe } from "@/components/sections/CfpSubscribe";
import { SubmissionCountdown } from "@/components/sections/SubmissionCountdown";
import { CONFERENCE_INFO, COMMITTEE_GROUPS } from "@/data/conference";
import { MODULAR_BLOCK_DEFINITIONS } from "./modular-blocks";
import { CONFERENCE_CONTENT_FIELDS } from "./conference-content-fields";
import { ColumnsSlot } from "../components/canvas/columns-slot";
import { HCMUTE_BLOCK_DEFINITIONS, HcmuteHero, HcmuteFaq } from "./hcmute-blocks";
import { HCMUTE_ACADEMIC_BLOCKS } from "./hcmute-academic-blocks";

function localized(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const text = value as { en?: unknown; vi?: unknown };
    return typeof text.en === "string" && text.en ? text.en : typeof text.vi === "string" ? text.vi : "";
  }
  return "";
}

const BASE_BLOCK_DEFINITIONS: Record<string, ComponentDefinition<any>> = {
  ...MODULAR_BLOCK_DEFINITIONS,
  ...HCMUTE_BLOCK_DEFINITIONS,
  ...HCMUTE_ACADEMIC_BLOCKS,

  ColumnsSlot: {
    type: "ColumnsSlot", label: "Columns & Grid Layout", category: "layout", icon: Layout,
    description: "Place and arrange other blocks in up to four responsive columns.",
    fields: {
      title: { type: "text", label: "Section title" },
      columnCount: { type: "select", label: "Columns & proportions", options: [
        { label: "1 column", value: 1 }, { label: "2 equal columns", value: 2 }, { label: "2 columns: wide left", value: "left-wide" }, { label: "2 columns: wide right", value: "right-wide" }, { label: "3 equal columns", value: 3 }, { label: "3 columns: wide center", value: "center-wide" }, { label: "4 equal columns", value: 4 },
      ] },
      mobileLayout: { type: "select", label: "Mobile layout", options: [{ label: "Stack", value: "stack" }, { label: "Two columns", value: "grid-2" }, { label: "Horizontal scroll", value: "scroll" }] },
      gap: { type: "select", label: "Spacing", options: [0, 2, 4, 6, 8, 12].map((value) => ({ label: `${value * 4}px`, value: `gap-${value}` })) },
      verticalAlign: { type: "select", label: "Vertical alignment", options: [{ label: "Top", value: "items-start" }, { label: "Center", value: "items-center" }, { label: "Stretch", value: "items-stretch" }] },
      containerWidth: { type: "select", label: "Container width", options: [{ label: "Standard", value: "max-w-7xl" }, { label: "Wide", value: "max-w-[1440px]" }, { label: "Full width", value: "max-w-full" }] },
    },
    defaultProps: { title: "", columnCount: 2, mobileLayout: "stack", gap: "gap-6", verticalAlign: "items-start", containerWidth: "max-w-7xl", slot1Blocks: [], slot2Blocks: [], slot3Blocks: [], slot4Blocks: [] },
    render: ColumnsSlot,
  },
  Text: {
    type: "Text", label: "Text", category: "basic", icon: FileText, description: "A simple text paragraph.",
    fields: { content: { type: "textarea", label: "Content" } },
    defaultProps: { content: { vi: "Nội dung văn bản mô tả...", en: "Text content description..." } },
    render: ({ content }) => <div className="mx-auto max-w-4xl px-4 py-6"><p className="whitespace-pre-line text-base leading-relaxed">{localized(content)}</p></div>,
  },
  Heading: {
    type: "Heading", label: "Heading", category: "basic", icon: FileText, description: "A heading for a column or section.",
    fields: { text: { type: "text", label: "Heading" } }, defaultProps: { text: "Section heading" },
    render: ({ text }) => <h2 className="px-4 py-3 text-2xl font-bold text-[#004776]">{localized(text)}</h2>,
  },
  Button: {
    type: "Button", label: "Button", category: "basic", icon: CheckCircle, description: "A link styled as a button.",
    fields: { text: { type: "text", label: "Button text" }, href: { type: "text", label: "Destination URL" } }, defaultProps: { text: "Learn more", href: "#" },
    render: ({ text, href }) => <div className="px-4 py-3"><a className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white" href={href || "#"}>{localized(text)}</a></div>,
  },
  Image: {
    type: "Image", label: "Image", category: "basic", icon: Video, description: "An image with an optional caption and link.",
    fields: { src: { type: "image", label: "Image" }, alt: { type: "text", label: "Alt text" }, caption: { type: "text", label: "Caption" }, href: { type: "text", label: "Link" }, openInNewTab: { type: "switch", label: "Open link in new tab" }, aspectRatio: { type: "select", label: "Aspect ratio", options: ["auto", "16/9", "4/3", "3/2", "1/1", "21/9"].map((value) => ({ label: value, value })) }, objectFit: { type: "select", label: "Fit", options: [{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }] } },
    defaultProps: { src: "", alt: "", caption: "", href: "", openInNewTab: false, aspectRatio: "auto", objectFit: "cover" },
    render: ({ src, alt, caption, href, openInNewTab, aspectRatio, objectFit }) => {
      const visual = src ? <img src={src} alt={alt || ""} className="w-full" style={{ aspectRatio: aspectRatio || "auto", objectFit: objectFit === "contain" ? "contain" : "cover" }} /> : null;
      return <figure className="mx-auto max-w-4xl px-4 py-6">{href ? <a href={href} target={openInNewTab ? "_blank" : undefined} rel={openInNewTab ? "noopener noreferrer" : undefined}>{visual}</a> : visual}{localized(caption) && <figcaption className="mt-2 text-center text-xs text-slate-500">{localized(caption)}</figcaption>}</figure>;
    },
  },

  // 1. HeroCarousel
  HeroCarousel: {
    type: "HeroCarousel",
    label: "Hero Carousel",
    category: "hero",
    icon: Sliders,
    description: "Full-width hero carousel with autoplay slides, conference theme, and CTA buttons.",
    fields: {
      autoplayDuration: { type: "number", label: "Autoplay Interval (sec)", min: 3, max: 20 },
      showOverlayText: { type: "switch", label: "Show Overlay Text" },
      showIndicators: { type: "switch", label: "Show Slide Indicators" },
    },
    defaultProps: {
      autoplayDuration: 7,
      showOverlayText: false,
      showIndicators: false,
    },
    render: (props) => <HeroCarousel {...props} />,
  },

  // 2. CallForPapers
  CallForPapers: {
    type: "CallForPapers",
    label: "Call for Papers",
    category: "academic",
    icon: FileText,
    description: "Official CFP notice, submission categories, track pillars, and PDF download.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      cfpPdfUrl: { type: "text", label: "CFP PDF Document URL" },
      submissionUrl: { type: "text", label: "Submission Portal URL" },
      submissionDeadline: { type: "text", label: "Submission Deadline" },
    },
    defaultProps: {
      title: "Call For Papers & Submission Guidelines",
      subtitle: "Submission Categories & Technical Topics • IEEE SMC 2027",
      cfpPdfUrl: CONFERENCE_INFO.cfpPdfUrl,
      submissionUrl: CONFERENCE_INFO.submissionPortal,
      submissionDeadline: "April 08, 2027",
    },
    render: (props) => <CallForPapers {...props} />,
  },

  // 3. KeynoteSpeakersSection
  KeynoteSpeakersSection: {
    type: "KeynoteSpeakersSection",
    label: "Keynote Speakers",
    category: "conference",
    icon: Mic,
    description: "Plenary keynote speakers cards with speaker photos, affiliations, and presentation topics.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Keynote Speakers & Plenary Sessions",
      subtitle: "Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics",
    },
    render: (props) => <KeynoteSpeakersSection {...props} />,
  },

  // 4. CommitteesSection
  CommitteesSection: {
    type: "CommitteesSection",
    label: "Committees Carousel",
    category: "organization",
    icon: Users,
    description: "Organizing & steering committees carousel with leadership cards and photo portraits.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Organizing Committee",
      subtitle: "International Steering & Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
      autoplayDelay: 3500,
      groups: COMMITTEE_GROUPS.map((group) => ({
        ...group,
        members: group.members.map((member) => ({
          ...member,
          photo: member.photo ?? CHAIR_PHOTO_MAP[member.name] ?? "",
        })),
      })),
    },
    render: (props) => <CommitteesSection {...props} />,
  },

  // 5. ConferenceTracksSection
  ConferenceTracksSection: {
    type: "ConferenceTracksSection",
    label: "Conference Tracks",
    category: "academic",
    icon: Layers,
    description: "Systems science, human-machine systems, and cybernetics tracks explorer.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Technical Tracks & 3 Core Pillars",
      subtitle: "Systems Science • Cybernetics • Human–Machine Systems",
    },
    render: (props) => <TracksExplorer {...props} />,
  },

  // 6. ImportantDatesSection
  ImportantDatesSection: {
    type: "ImportantDatesSection",
    label: "Important Dates",
    category: "conference",
    icon: Calendar,
    description: "Critical submission deadlines, review notifications, and registration milestones.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Important Dates",
      subtitle: "Key conference deadlines and milestone schedule for IEEE SMC 2027",
    },
    render: (props) => <ImportantDates {...props} />,
  },

  // 7. RegistrationFeesSection
  RegistrationFeesSection: {
    type: "RegistrationFeesSection",
    label: "Registration & Fees",
    category: "registration",
    icon: CreditCard,
    description: "Author, member, and student registration fee tiers, Payoo gateway, and bank wire info.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Registration & Payment Methods",
      subtitle: "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
    },
    render: (props) => <PaymentMethods {...props} />,
  },

  // 8. VenueLocationSection
  VenueLocationSection: {
    type: "VenueLocationSection",
    label: "Venue & Location",
    category: "venue",
    icon: MapPin,
    description: "Sheraton Saigon Grand Opera Hotel venue information, interactive map, and District 1 guide.",
    fields: {
      title: { type: "text", label: "Section Title" },
      venueName: { type: "text", label: "Venue Name" },
      address: { type: "textarea", label: "Venue Address" },
      googleMapsUrl: { type: "text", label: "Google Maps URL" },
    },
    defaultProps: {
      title: "Travel & Accommodation & Ho Chi Minh City Guide",
      venueName: "Sheraton Saigon Grand Opera Hotel",
      address: "88 Dong Khoi Street, District 1, Ho Chi Minh City, Vietnam",
      googleMapsUrl: "https://maps.google.com/?q=Sheraton+Saigon+Grand+Opera+Hotel",
    },
    render: (props) => <Venue {...props} />,
  },

  // 9. ScheduleTimelineSection
  ScheduleTimelineSection: {
    type: "ScheduleTimelineSection",
    label: "Schedule Timeline",
    category: "program",
    icon: Clock,
    description: "5-day conference schedule timeline with tabs for each day from Oct 6 to Oct 10.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Conference Schedule & Daily Timeline",
      subtitle: "October 6–10, 2027 • Five days of cutting-edge research, keynotes, workshops, and networking",
    },
    render: (props) => <ScheduleTimelineSection {...props} />,
  },

  // 10. SponsorshipSection
  SponsorshipSection: {
    type: "SponsorshipSection",
    label: "Sponsors & Partners",
    category: "partners",
    icon: Building2,
    description: "IEEE SMC Society, HCMUTE, academic co-sponsors, and industrial partner logos.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Sponsors & Partners & Supporting Societies",
      subtitle: "Partners & Organizing Institutions Supporting IEEE SMC 2027",
    },
    render: (props) => <Sponsors {...props} />,
  },

  // 11. WorkshopTutorialSection
  WorkshopTutorialSection: {
    type: "WorkshopTutorialSection",
    label: "Workshops & Tutorials",
    category: "academic",
    icon: BookOpen,
    description: "Specialized workshop guidelines, hands-on tutorials, and proposal deadlines.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      proposalDeadline: { type: "text", label: "Proposal Deadline" },
      contactEmail: { type: "text", label: "Workshops Contact Email" },
    },
    defaultProps: {
      title: "Workshops & Tutorial Proposals",
      subtitle: "Propose hands-on tutorials and specialized workshops preceding the main technical conference program",
      proposalDeadline: "February 15, 2027",
      contactEmail: "smc2027@hcmute.edu.vn",
    },
    render: (props) => <WorkshopTutorialSection {...props} />,
  },

  // 12. PaperSubmissionGuidelinesSection
  PaperSubmissionGuidelinesSection: {
    type: "PaperSubmissionGuidelinesSection",
    label: "Paper Guidelines & Templates",
    category: "academic",
    icon: FileCode,
    description: "IEEE 2-column LaTeX and Microsoft Word manuscript templates and formatting limits.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Author Submission Templates & Guidelines",
      subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
    },
    render: (props) => <PaperTemplates {...props} />,
  },

  // 13. AwardsSection
  AwardsSection: {
    type: "AwardsSection",
    label: "Conference Awards",
    category: "conference",
    icon: Award,
    description: "Best Paper Award, Best Student Paper Award, and Franklin V. Taylor Memorial Award.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "IEEE SMC 2027 Conference Awards",
      subtitle: "Recognizing excellence in research rigor, student innovation, and scientific novelty across systems, cybernetics, and human-machine interaction",
    },
    render: (props) => <AwardsSection {...props} />,
  },

  // 14. TravelAccommodationSection
  TravelAccommodationSection: {
    type: "TravelAccommodationSection",
    label: "Travel & Accommodation",
    category: "hospitality",
    icon: Compass,
    description: "Tan Son Nhat Airport transit directions, hotel rates, and city navigation.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      hotelBookingUrl: { type: "text", label: "Hotel Reservation Link" },
      airportDistance: { type: "text", label: "Airport Distance" },
    },
    defaultProps: {
      title: "Travel & Accommodation Guide",
      subtitle: "Information for attendees traveling to Ho Chi Minh City, airport transit, and hotel accommodations",
      hotelBookingUrl: "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
      airportDistance: "7 km (~20–30 mins from Tan Son Nhat Airport)",
    },
    render: (props) => <TravelAccommodationSection {...props} />,
  },

  // 15. ContactSupportSection
  ContactSupportSection: {
    type: "ContactSupportSection",
    label: "Contact & Secretariat",
    category: "contact",
    icon: Mail,
    description: "Organizing secretariat cards with email, phone, venue address, and official links.",
    fields: {
      title: { type: "text", label: "Section Title" },
      email: { type: "text", label: "Secretariat Email" },
      location: { type: "text", label: "Location" },
      venue: { type: "text", label: "Venue Name" },
      website: { type: "text", label: "Website URL" },
    },
    defaultProps: {
      title: "Contact the Organizing Secretariat",
      email: "smc2027@hcmute.edu.vn",
      location: "Ho Chi Minh City, Vietnam",
      venue: "Sheraton Saigon Grand Opera Hotel",
      website: "https://ieee-smc2027.org",
    },
    render: (props) => <ContactCards {...props} />,
  },

  // 16. FaqAccordionSection
  FaqAccordionSection: {
    type: "FaqAccordionSection",
    label: "FAQ Accordion",
    category: "support",
    icon: HelpCircle,
    description: "Frequently asked questions for authors, delegates, visa applicants, and reviewers.",
    fields: {
      title: { type: "text", label: "Section Title" },
    },
    defaultProps: {
      title: "Frequently Asked Questions & Help",
    },
    render: (props) => <FAQ {...props} />,
  },

  // 17. PastConferencesSection
  PastConferencesSection: {
    type: "PastConferencesSection",
    label: "Past Conferences",
    category: "history",
    icon: History,
    description: "Flagship archive of past IEEE SMC editions (Bellevue 2026, Sarawak 2025, Honolulu 2023).",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
    },
    defaultProps: {
      title: "Past IEEE SMC Conferences",
      subtitle: "Discover the international heritage of the IEEE Systems, Man, and Cybernetics Society flagship annual conference",
    },
    render: (props) => <PastConferencesSection {...props} />,
  },

  // 18. MediaGallerySection
  MediaGallerySection: {
    type: "MediaGallerySection",
    label: "Media & Video",
    category: "media",
    icon: Video,
    description: "Embedded conference promotional video, YouTube playback, and photo galleries.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      videoUrl: { type: "text", label: "YouTube Embed URL" },
    },
    defaultProps: {
      title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
      subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
      videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
      venueName: "Sheraton Saigon Grand Opera Hotel",
    },
    render: (props) => <ConferenceVideo {...props} />,
  },

  // 19. VisaInformationSection
  VisaInformationSection: {
    type: "VisaInformationSection",
    label: "Vietnam Visa Guide",
    category: "hospitality",
    icon: Plane,
    description: "90-day Vietnam e-Visa guidance, passport requirements, and invitation letter requests.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "textarea", label: "Subtitle Description" },
      evisaUrl: { type: "text", label: "E-Visa Portal URL" },
      visaLetterEmail: { type: "text", label: "Visa Letter Contact" },
    },
    defaultProps: {
      title: "Vietnam Visa & Entry Requirements",
      subtitle: "Complete travel and entry guidance for international delegates attending IEEE SMC 2027 in Ho Chi Minh City",
      evisaUrl: "https://evisa.xuatnhapcanh.gov.vn",
      visaLetterEmail: "smc2027@hcmute.edu.vn",
    },
    render: (props) => <VisaInformationSection {...props} />,
  },

  // 20. HeaderSection
  HeaderSection: {
    type: "HeaderSection",
    label: "Site Header",
    category: "layout",
    icon: Layout,
    description: "Official conference portal navigation header with sticky scrolling.",
    fields: {},
    defaultProps: {},
    render: () => <Header />,
  },

  // 21. FooterSection
  FooterSection: {
    type: "FooterSection",
    label: "Site Footer",
    category: "layout",
    icon: PanelBottom,
    description: "Official IEEE SMC 2027 & HCMUTE copyright footer and quick links.",
    fields: {},
    defaultProps: {},
    render: () => <Footer />,
  },

  // Additional registered sections
  WelcomeLetter: {
    type: "WelcomeLetter",
    label: "Welcome Letter",
    category: "conference",
    icon: FileText,
    description: "Official welcome message from General Chairs and Honorary Chairs.",
    fields: {
      title: { type: "text", label: "Title" },
      salutation: { type: "text", label: "Salutation" },
      theme: { type: "text", label: "Conference Theme" },
      datesLocation: { type: "text", label: "Dates & Location" },
    },
    defaultProps: {
      title: "Welcome Message from the General Chairs & Honorary Chairs",
      salutation: "Dear Colleagues & Honored Participants,",
      theme: "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
      datesLocation: "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
    },
    render: (props) => <WelcomeLetter {...props} />,
  },

  ConferenceHighlights: {
    type: "ConferenceHighlights",
    label: "Conference Highlights",
    category: "conference",
    icon: CheckCircle,
    description: "Key statistics, plenary speaker counts, and expected paper tracks.",
    fields: {},
    defaultProps: {},
    render: (props) => <ConferenceHighlights {...props} />,
  },

  NewsList: {
    type: "NewsList",
    label: "News & Announcements",
    category: "conference",
    icon: Newspaper,
    description: "Conference news list and announcements grid.",
    fields: {
      title: { type: "text", label: "Title" },
      subtitle: { type: "textarea", label: "Subtitle" },
    },
    defaultProps: {
      title: "Conference News & Announcements",
      subtitle: "Stay updated with the latest milestones, partnership alerts, and program schedules",
    },
    render: (props) => <NewsList {...props} />,
  },

  About: {
    type: "About",
    label: "About IEEE SMC",
    category: "conference",
    icon: Info,
    description: "Background on the IEEE Systems, Man, and Cybernetics Society.",
    fields: {},
    defaultProps: {},
    render: (props) => <About {...props} />,
  },

  CfpSubscribe: {
    type: "CfpSubscribe",
    label: "CFP Subscribe",
    category: "contact",
    icon: Bell,
    description: "Email notification sign-up for call for papers and registration alerts.",
    fields: {
      title: { type: "text", label: "Heading" },
      subtitle: { type: "textarea", label: "Description" },
      buttonLabel: { type: "text", label: "Button Label" },
    },
    defaultProps: {
      title: "Receive CFP Updates & Deadline Alerts",
      subtitle: "Subscribe for official alerts on submission deadlines, keynote announcements, and registration milestones.",
      buttonLabel: "Subscribe",
    },
    render: (props) => <CfpSubscribe {...props} />,
  },

  SubmissionCountdown: {
    type: "SubmissionCountdown",
    label: "Submission Countdown",
    category: "conference",
    icon: Timer,
    description: "Live countdown timer to the paper submission deadline.",
    fields: {
      title: { type: "text", label: "Headline Label" },
      deadlineText: { type: "text", label: "Deadline Date Text" },
    },
    defaultProps: {
      title: "Paper Submission Deadline:",
      deadlineText: "April 08, 2027",
    },
    render: (props) => <SubmissionCountdown {...props} />,
  },
};

export const CONFERENCE_BLOCK_DEFINITIONS: typeof BASE_BLOCK_DEFINITIONS = Object.fromEntries(
  Object.entries(BASE_BLOCK_DEFINITIONS).map(([type, definition]) => [type, {
    ...definition,
    fields: { ...definition.fields, ...CONFERENCE_CONTENT_FIELDS[type] },
  }])
);

// BLOCK_ALIASES mapping legacy or shorthand names to canonical component types
export const BLOCK_ALIASES: Record<string, string> = {
  Keynotes: "KeynoteSpeakersSection",
  TracksExplorer: "ConferenceTracksSection",
  ImportantDates: "ImportantDatesSection",
  PaymentMethods: "RegistrationFeesSection",
  Venue: "VenueLocationSection",
  Sponsors: "SponsorshipSection",
  PaperTemplates: "PaperSubmissionGuidelinesSection",
  ContactCards: "ContactSupportSection",
  ConferenceVideo: "MediaGallerySection",
  Committee: "CommitteesSection",
};

const HERO_COMPATIBILITY_DEFINITION: ComponentDefinition<any> = {
    ...CONFERENCE_BLOCK_DEFINITIONS.Hero,
    fields: { ...CONFERENCE_BLOCK_DEFINITIONS.HeroCarousel.fields, ...CONFERENCE_BLOCK_DEFINITIONS.Hero.fields },
    render: (props) => {
      const isCarousel = "slides" in props || "autoplayDuration" in props || "showOverlayText" in props || "showIndicators" in props || Object.keys(props).every((key) => key === "children");
      return isCarousel ? <HeroCarousel {...props} /> : <HcmuteHero {...props} />;
    },
  };
const FAQ_COMPATIBILITY_DEFINITION: ComponentDefinition<any> = {
    ...CONFERENCE_BLOCK_DEFINITIONS.FAQ,
    fields: { ...CONFERENCE_BLOCK_DEFINITIONS.FaqAccordionSection.fields, ...CONFERENCE_BLOCK_DEFINITIONS.FAQ.fields, items: CONFERENCE_BLOCK_DEFINITIONS.FaqAccordionSection.fields.items },
    render: (props) => {
      const hasCategorizedItems = Array.isArray(props.items) && props.items.some((item: { category?: string }) => Boolean(item.category));
      const isConference = hasCategorizedItems || (!Array.isArray(props.items) && !("badge" in props));
      return isConference ? <FAQ {...props} /> : <HcmuteFaq {...props} />;
    },
  };

export function getBlockDefinition(type: string): ComponentDefinition<any> | undefined {
  if (type === "Hero") return HERO_COMPATIBILITY_DEFINITION;
  if (type === "FAQ") return FAQ_COMPATIBILITY_DEFINITION;
  const canonicalType = BLOCK_ALIASES[type] || type;
  return CONFERENCE_BLOCK_DEFINITIONS[canonicalType];
}
