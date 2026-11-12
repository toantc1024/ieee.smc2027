import type { FieldDefinition } from "../types";
import { DEFAULT_CAROUSEL_SLIDES } from "@/components/sections/HeroCarousel";
import { CHAIR_MEMBERS } from "@/components/sections/WelcomeLetter";
import { CHAIR_PHOTO_MAP } from "@/components/sections/CommitteesSection";
import { OFFICIAL_2027_DATES } from "@/components/sections/ImportantDates";
import { DEFAULT_DAYS } from "@/components/sections/ScheduleTimelineSection";
import { SPONSORS } from "@/components/sections/Sponsors";
import { PAST_CONFERENCES } from "@/components/sections/PastConferencesSection";
import { AFFILIATED_PUBLICATIONS } from "@/components/sections/About";
import { REGISTRATION_RATES } from "@/components/sections/PaymentMethods";
import { AWARDS_LIST } from "@/components/sections/AwardsSection";
import { PAPER_TEMPLATE_ITEMS, PAPER_GUIDELINES } from "@/components/sections/PaperTemplates";
import { COMMITTEE_GROUPS, CONFERENCE_STATS, FAQS, MUST_VISIT_ATTRACTIONS, CONFERENCE_INFO, TECHNICAL_TRACKS } from "@/data/conference";

const text = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({ type: "text", label, ...extra });
const paragraph = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({ type: "textarea", label, ...extra });
const image = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({ type: "image", label, ...extra });
const action = (label: string): FieldDefinition => ({ type: "object", label, fields: { label: text("Button label"), href: text("Destination URL", { placeholder: "/page, #section, or https://…" }) } });

/** Fields correspond to real section props, including their existing fallback content. */
export const CONFERENCE_CONTENT_FIELDS: Record<string, Record<string, FieldDefinition>> = {
  HeroCarousel: {
    slides: {
      type: "array", label: "Slides", itemLabel: "slide", group: "Media", defaultValue: DEFAULT_CAROUSEL_SLIDES,
      defaultItem: { title: "New slide", image: "", mobileImage: "", subtitle: "", highlight: "", badge: "", primaryAction: { label: "", href: "" }, secondaryAction: { label: "", href: "" } },
      itemFields: {
        id: text("Slide ID"),
        image: image("Desktop image"),
        mobileImage: image("Mobile image"),
        title: text("Slide title"), highlight: text("Highlighted text"), subtitle: paragraph("Slide description"), badge: text("Badge text"),
        primaryAction: action("Primary button"), secondaryAction: action("Secondary button"),
      },
    },
    showOverlayText: { type: "switch", label: "Show text and buttons" },
  },
  KeynoteSpeakersSection: {
    speakers: {
      type: "array", label: "Speakers", itemLabel: "speaker", defaultValue: [], itemLabelKey: "name",
      itemFields: { photo: image("Speaker photo"), name: text("Full name"), affiliation: text("Affiliation"), topic: paragraph("Presentation topic") },
    },
  },
  RegistrationFeesSection: {
    rates: { type: "array", label: "Registration fee categories", itemLabel: "category", itemLabelKey: "category", defaultValue: REGISTRATION_RATES, itemFields: {
      category: text("Category"), earlyBird: text("Early bird price"), standard: text("Standard price"), late: text("Late registration price"), note: paragraph("What’s included"), popular: { type: "switch", label: "Highlight category" },
    } },
  },
  AwardsSection: {
    awards: { type: "array", label: "Awards", itemLabel: "award", defaultValue: AWARDS_LIST.map(({ title, description, prize }) => ({ title, description, prize })), itemFields: { title: text("Award title"), description: paragraph("Description"), prize: text("Prize") } },
  },
  PaperSubmissionGuidelinesSection: {
    templates: { type: "array", label: "Downloadable templates", itemLabel: "template", itemLabelKey: "name", defaultValue: PAPER_TEMPLATE_ITEMS.map(({ name, format, description, fileSize, downloadUrl, instructions }) => ({ name, format, description, fileSize, downloadUrl, instructions })), itemFields: { name: text("Template name"), format: text("File format"), description: paragraph("Description"), fileSize: text("File size"), downloadUrl: text("Download URL"), instructions: paragraph("Instructions") } },
    guidelines: { type: "array", label: "Submission guidelines", itemLabel: "guideline", itemLabelKey: "label", defaultValue: PAPER_GUIDELINES, itemFields: { label: text("Submission category"), limit: text("Page limit"), detail: paragraph("Details") } },
  },
  ConferenceTracksSection: {
    pillars: { type: "array", label: "Technical tracks", itemLabel: "track", defaultValue: TECHNICAL_TRACKS, itemFields: {
      id: text("Track ID"), title: text("Track title"), subtitle: text("Subtitle"), code: text("Track code"), description: paragraph("Description"),
      topics: { type: "array", label: "Topics", itemLabel: "topic", itemLabelKey: "name", itemFields: { name: text("Topic name"), code: text("Topic code"), category: text("Category") } },
    } },
  },
  CommitteesSection: {
    groups: {
      type: "array", label: "Committee groups", itemLabel: "group", itemLabelKey: "groupName",
      defaultValue: COMMITTEE_GROUPS.map((group) => ({ ...group, members: group.members.map((member) => ({ ...member, photo: member.photo ?? CHAIR_PHOTO_MAP[member.name] ?? "" })) })),
      defaultItem: {
        groupName: "New Committee Group",
        members: [
          {
            name: "New Member",
            role: "Committee Member",
            affiliation: "Ho Chi Minh City University of Technology and Education",
            country: "Vietnam",
            photo: "",
          },
        ],
      },
      itemFields: {
        groupName: text("Group name"),
        members: {
          type: "array",
          label: "Members",
          itemLabel: "member",
          itemLabelKey: "name",
          defaultItem: {
            name: "New Member",
            role: "Committee Member",
            affiliation: "Ho Chi Minh City University of Technology and Education",
            country: "Vietnam",
            photo: "",
          },
          itemFields: {
            photo: image("Portrait"),
            name: text("Full name"),
            role: text("Role"),
            affiliation: text("Affiliation"),
            country: text("Country"),
          },
        },
      },
    },
  },
  ImportantDatesSection: {
    dates: { type: "array", label: "Deadlines & milestones", itemLabel: "milestone", defaultValue: OFFICIAL_2027_DATES, itemFields: {
      id: text("Milestone ID"), title: paragraph("Milestone title"), date: text("Date", { placeholder: "April 08, 2027" }), originalDeadline: text("Original deadline"), extendedDeadline: text("Extended deadline"), category: text("Category"), status: text("Status label"), highlight: { type: "switch", label: "Highlight milestone" },
    } },
    viewDetailsUrl: text("View details link", { group: "Links", defaultValue: "#cfp" }),
  },
  ScheduleTimelineSection: {
    days: { type: "array", label: "Schedule days", itemLabel: "day", itemLabelKey: "dateStr", defaultValue: DEFAULT_DAYS, itemFields: {
      dayNumber: { type: "number", label: "Day number", min: 1, defaultValue: 1 }, dateStr: text("Date label"), theme: text("Day theme"),
      events: { type: "array", label: "Events", itemLabel: "event", itemFields: { time: text("Time", { placeholder: "09:00 – 10:15" }), title: text("Event title"), room: text("Location"), speakers: text("Speakers"), track: text("Track") } },
    } },
  },
  SponsorshipSection: {
    sponsors: { type: "array", label: "Sponsors & partners", itemLabel: "sponsor", itemLabelKey: "shortName", defaultValue: SPONSORS, itemFields: {
      logo: image("Sponsor logo"), name: text("Organization name"), shortName: text("Display name"), type: text("Sponsorship level"),
      logoType: { type: "select", label: "Built-in emblem", options: [{ label: "IEEE", value: "ieee" }, { label: "HCM-UTE", value: "hcmute" }, { label: "IEEE SMC", value: "ieee-smc" }, { label: "IEEE CIS", value: "ieee-cis" }, { label: "IEEE RAS", value: "ieee-ras" }, { label: "Institution", value: "most" }] },
    } },
  },
  VenueLocationSection: {
    image: image("Venue photo", { defaultValue: "/images/sheraton-saigon-card.jpg" }),
    attractions: { type: "array", label: "Nearby attractions", itemLabel: "attraction", itemLabelKey: "name", defaultValue: MUST_VISIT_ATTRACTIONS, itemFields: {
      id: text("Attraction ID"), image: image("Attraction photo"), name: text("Name"), vietnameseName: text("Vietnamese name"), description: paragraph("Description"), location: text("Location"), openingHours: text("Opening hours"), distanceFromVenue: text("Distance from venue"), badge: text("Badge"), mapsQuery: text("Google Maps search query"),
    } },
  },
  FaqAccordionSection: {
    subtitle: paragraph("Section description", { defaultValue: "Author & Attendee Assistance • Conference Policies & Guidance" }),
    items: { type: "array", label: "Questions & answers", itemLabel: "question", itemLabelKey: "question", defaultValue: FAQS, itemFields: {
      question: paragraph("Question"), answer: paragraph("Answer"), category: { type: "select", label: "Category", options: ["Submission", "Registration", "Venue", "Visa"].map((value) => ({ label: value, value })) },
    } },
  },
  WelcomeLetter: {
    heading: text("Intro heading", { defaultValue: "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam" }),
    subtitle: paragraph("Section description"),
    body: { type: "richtext", label: "Letter content" },
    showSignatures: { type: "switch", label: "Show chair signatures", defaultValue: true },
    chairs: { type: "array", label: "Chairs & signatures", itemLabel: "chair", itemLabelKey: "name", defaultValue: CHAIR_MEMBERS, itemFields: {
      image: image("Chair portrait"), name: text("Full name"), role: { type: "select", label: "Chair role", options: [{ label: "General Chair", value: "General Chair" }, { label: "Honorary Chair", value: "Honorary Chair" }] }, affiliation: text("Affiliation"), country: text("Country"),
    } },
  },
  ConferenceHighlights: {
    items: { type: "array", label: "Conference statistics", itemLabel: "statistic", itemLabelKey: "label", defaultValue: CONFERENCE_STATS, itemFields: { value: text("Value", { placeholder: "1,200+" }), label: text("Label"), sub: paragraph("Description") } },
  },
  PastConferencesSection: {
    conferences: { type: "array", label: "Past conferences", itemLabel: "conference", itemLabelKey: "city", defaultValue: PAST_CONFERENCES, itemFields: { year: text("Year"), city: text("Location"), dates: text("Dates"), theme: paragraph("Conference theme") } },
  },
  About: {
    theme: paragraph("Conference theme", { defaultValue: CONFERENCE_INFO.theme }),
    publicationsTitle: text("Publications heading", { defaultValue: "Affiliated IEEE SMC Publications" }),
    publications: { type: "array", label: "Affiliated publications", itemLabel: "publication", itemLabelKey: "name", defaultValue: AFFILIATED_PUBLICATIONS, itemFields: { name: text("Publication name"), href: text("Website URL") } },
  },
  CallForPapers: {
    cfpPdfUrl: { type: "file", label: "Call for Papers PDF", defaultValue: CONFERENCE_INFO.cfpPdfUrl, group: "Media" },
  },
  MediaGallerySection: {
    viewDetailsUrl: text("Venue details link", { group: "Links", defaultValue: "#venue" }),
    qqVideoVid: text("QQ Video ID", { group: "Media", defaultValue: "x3508h1k2m9" }),
  },
  ContactSupportSection: {
    subtitle: paragraph("Section description", { defaultValue: "Have questions regarding paper submissions, proposals, or conference participation? We are here to assist you." }),
  },
};
