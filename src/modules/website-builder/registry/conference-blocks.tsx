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
import { Keynotes } from "@/components/sections/Keynotes";
import { KeynoteSpeakersSection } from "@/components/sections/KeynoteSpeakersSection";
import { CommitteesSection } from "@/components/sections/CommitteesSection";
import { Committee } from "@/components/sections/Committee";
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
import { Hero } from "@/components/sections/Hero";
import { MODULAR_BLOCK_DEFINITIONS } from "./modular-blocks";

export const CONFERENCE_BLOCK_DEFINITIONS: Record<string, ComponentDefinition<any>> = {
  ...MODULAR_BLOCK_DEFINITIONS,

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
      showOverlayText: true,
      showIndicators: true,
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
      cfpPdfUrl: "/CFP - IEEE SMC 2027.pdf",
      submissionUrl: "https://ras.papercept.net",
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
      autoplayDelay: { type: "number", label: "Autoplay Interval (ms)", min: 1000, max: 8000 },
    },
    defaultProps: {
      title: "Organizing & Technical Committees",
      subtitle: "Distinguished leadership and academic committee chairs driving IEEE SMC 2027",
      autoplayDelay: 3500,
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
      title: "Important Deadlines & Milestones",
      subtitle: "Critical dates for paper submissions, notifications, camera-ready papers, and registrations",
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
      title: "Conference Sponsors & Technical Partners",
      subtitle: "Generously supported by IEEE SMC Society, HCM-UTE, and international academic partners",
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
      title: "Frequently Asked Questions",
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
      venueName: { type: "text", label: "Venue Caption" },
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

// BLOCK_ALIASES mapping legacy or shorthand names to canonical component types
export const BLOCK_ALIASES: Record<string, string> = {
  Hero: "HeroCarousel",
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
