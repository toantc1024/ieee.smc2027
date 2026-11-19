import type { FieldDefinition } from "../types";
import { DEFAULT_CAROUSEL_SLIDES } from "@/components/sections/HeroCarousel";
import { CHAIR_MEMBERS, DEFAULT_WELCOME_LETTER_HTML } from "@/components/sections/WelcomeLetter";
import { CHAIR_PHOTO_MAP } from "@/components/sections/CommitteesSection";
import { OFFICIAL_2027_DATES } from "@/components/sections/ImportantDates";
import { DEFAULT_DAYS } from "@/components/sections/ScheduleTimelineSection";
import { SPONSORS } from "@/components/sections/Sponsors";
import { PAST_CONFERENCES } from "@/components/sections/PastConferencesSection";
import { AFFILIATED_PUBLICATIONS } from "@/components/sections/About";
import { REGISTRATION_RATES } from "@/components/sections/PaymentMethods";
import { AWARDS_LIST } from "@/components/sections/AwardsSection";
import {
  PAPER_TEMPLATE_ITEMS,
  PAPER_GUIDELINES,
  DEFAULT_PRE_SUBMISSION_CHECKLIST,
} from "@/components/sections/PaperTemplates";
import { DEFAULT_INDEXING_BADGES } from "@/components/sections/ConferenceHighlights";
import { buildDefaultWorkshopCards } from "@/components/sections/WorkshopTutorialSection";
import { buildDefaultTravelCards } from "@/components/sections/TravelAccommodationSection";
import { buildDefaultVisaCards } from "@/components/sections/VisaInformationSection";
import { buildDefaultContactCards } from "@/components/sections/ContactCards";
import { DEFAULT_SUBMISSION_PORTALS } from "@/components/sections/SubmissionPortalsBlock";
import { DEFAULT_CFP_POLICIES } from "@/components/sections/CfpPoliciesBlock";
import { DEFAULT_SUBMISSION_CATEGORIES } from "@/components/sections/SubmissionCategoriesBlock";
import { DEFAULT_TRANSIT_CARDS } from "@/components/sections/TransitLogisticsBlock";
import { DEFAULT_EDITABLE_ATTRACTIONS } from "@/components/sections/CityAttractionsBlock";
import { DEFAULT_VISITOR_INFO_ITEMS } from "@/components/sections/VisitorInfoBlock";
import { DEFAULT_PAYMENT_CHANNELS } from "@/components/sections/PaymentChannelsBlock";
import { DEFAULT_EDITABLE_REGISTRATION_TIERS } from "@/components/sections/RegistrationWizardBlock";
import { DEFAULT_TECHNICAL_SESSIONS } from "@/components/sections/TechnicalSessionsBlock";
import { DEFAULT_FOOTER_CONFIG } from "@/components/layout/Footer";
import {
  COMMITTEE_GROUPS,
  CONFERENCE_STATS,
  FAQS,
  CONFERENCE_INFO,
  TECHNICAL_TRACKS,
} from "@/data/conference";

const text = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({
  type: "text",
  label,
  ...extra,
});
const paragraph = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({
  type: "textarea",
  label,
  ...extra,
});
const image = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({
  type: "image",
  label,
  ...extra,
});
const file = (label: string, extra: Partial<FieldDefinition> = {}): FieldDefinition => ({
  type: "file",
  label,
  ...extra,
});
const action = (label: string): FieldDefinition => ({
  type: "object",
  label,
  fields: {
    label: text("Button label"),
    href: text("Destination URL", { placeholder: "/page, #section, or https://…" }),
  },
});

const cfpCategoryItemFields: Record<string, FieldDefinition> = {
  image: image("Card illustration"),
  badge: text("Badge"),
  deadline: text("Deadline label"),
  title: text("Card title"),
  description: paragraph("Description"),
  checklist: {
    type: "array",
    label: "Checklist items",
    itemLabel: "item",
    itemLabelKey: "text",
    defaultItem: { text: "New requirement", url: "" },
    itemFields: {
      text: text("Requirement text"),
      url: text("Optional link URL"),
    },
  },
};

const cfpPolicyItemFields: Record<string, FieldDefinition> = {
  iconImage: image("Card icon"),
  eyebrow: text("Top label"),
  title: text("Policy title"),
  description: paragraph("Description"),
  footerText: text("Footer highlight"),
  footerIcon: {
    type: "select",
    label: "Footer icon",
    options: [
      { label: "Clock", value: "clock" },
      { label: "Database", value: "database" },
      { label: "Shield", value: "shield" },
    ],
  },
};

const paymentChannelItemFields: Record<string, FieldDefinition> = {
  iconType: {
    type: "select",
    label: "Channel icon",
    options: [
      { label: "Bank Transfer", value: "bank" },
      { label: "International Wire", value: "globe" },
      { label: "Online Card Portal", value: "card" },
    ],
  },
  badge: text("Badge"),
  title: text("Channel title"),
  description: paragraph("Description"),
  details: {
    type: "array",
    label: "Account details",
    itemLabel: "detail",
    itemLabelKey: "label",
    defaultItem: { label: "Field label", value: "Value", copyValue: "" },
    itemFields: {
      label: text("Label"),
      value: text("Value"),
      copyValue: text("Copyable text"),
    },
  },
  tags: {
    type: "array",
    label: "Supported method badges",
    itemLabel: "badge",
    itemLabelKey: "label",
    defaultItem: { label: "Visa / Mastercard" },
    itemFields: { label: text("Badge label") },
  },
  footerLeft: text("Footer left label"),
  footerRight: text("Footer right label"),
  ctaLabel: text("Action button label"),
  ctaUrl: text("Action button URL"),
};

const attractionItemFields: Record<string, FieldDefinition> = {
  id: text("Attraction ID"),
  image: image("Attraction photo"),
  name: text("Name"),
  vietnameseName: text("Local name"),
  description: paragraph("Description"),
  location: text("Location"),
  openingHours: text("Opening hours"),
  distanceFromVenue: text("Distance from venue"),
  badge: text("Badge"),
  filterCategory: {
    type: "select",
    label: "Filter group",
    options: [
      { label: "Walkable Distance", value: "walk" },
      { label: "Museums & Culture", value: "culture" },
      { label: "Both Walkable & Culture", value: "both" },
    ],
  },
  mapsQuery: text("Google Maps query"),
};

const registrationRateItemFields: Record<string, FieldDefinition> = {
  category: text("Category"),
  earlyBird: text("Early bird price"),
  standard: text("Standard price"),
  late: text("Late registration price"),
  note: paragraph("Entitlements"),
  popular: { type: "switch", label: "Highlight category" },
};

const workshopCardDefaultItem = {
  iconType: "workshop",
  title: "New Workshop Track",
  description: "Outline objectives, scope, and organizer guidelines.",
  bullets: [{ text: "Half-day or full-day format" }],
  footerLabel: "Proposal Deadline",
  footerValue: "February 15, 2027",
  footerHref: "",
};

/** Fields correspond to real section props, including hydrated default values. */
export const CONFERENCE_CONTENT_FIELDS: Record<string, Record<string, FieldDefinition>> = {
  HeroCarousel: {
    slides: {
      type: "array",
      label: "Slides",
      itemLabel: "slide",
      itemLabelKey: "title",
      group: "Media",
      defaultValue: DEFAULT_CAROUSEL_SLIDES,
      defaultItem: {
        id: "new-slide",
        title: "New slide",
        image: "/carousel/hero-desktop-smc2027.png",
        mobileImage: "",
        subtitle: "",
        highlight: "",
        badge: "",
        primaryAction: { label: "", href: "" },
        secondaryAction: { label: "", href: "" },
      },
      itemFields: {
        id: text("Slide ID"),
        image: image("Desktop image"),
        mobileImage: image("Mobile image"),
        title: text("Slide title"),
        highlight: text("Highlighted text"),
        subtitle: paragraph("Slide description"),
        badge: text("Badge text"),
        primaryAction: action("Primary button"),
        secondaryAction: action("Secondary button"),
      },
    },
    showOverlayText: { type: "switch", label: "Show text and buttons" },
  },

  KeynoteSpeakersSection: {
    emptyTitle: text("Placeholder title", {
      defaultValue: "Plenary Keynote Speakers Announcement Coming Soon",
    }),
    emptyDescription: paragraph("Placeholder description", {
      defaultValue:
        "The Program Committee is currently finalizing invitations with distinguished IEEE Fellows and world-renowned pioneers in Cybernetics, AI, and Systems Science.",
    }),
    themeLabel: text("Theme badge label", { defaultValue: "Theme Focus:" }),
    themeText: text("Theme focus text", {
      defaultValue: "Human–Machine Symbiosis & Intelligent Futures",
    }),
    ctaLabel: text("Placeholder button label", {
      defaultValue: "Explore Call For Papers & Tracks",
    }),
    ctaUrl: text("Placeholder button URL", { defaultValue: "#cfp" }),
    speakers: {
      type: "array",
      label: "Speakers",
      itemLabel: "speaker",
      defaultValue: [],
      itemLabelKey: "name",
      defaultItem: {
        photo: "",
        name: "Distinguished Speaker",
        role: "Plenary Keynote",
        affiliation: "University / Research Institute",
        topic: "Keynote Presentation Topic",
        bio: "",
      },
      itemFields: {
        photo: image("Speaker photo"),
        name: text("Full name"),
        role: text("Role label"),
        affiliation: text("Affiliation"),
        topic: paragraph("Presentation topic"),
        bio: paragraph("Speaker biography"),
      },
    },
  },

  RegistrationFeesSection: {
    scheduleHeading: text("Schedule heading", { defaultValue: "Registration Fee Schedule" }),
    earlyBirdNote: text("Early bird notice", {
      defaultValue: "All prices in USD. Early bird registration deadline: July 05, 2027",
    }),
    includedBadge: text("Included notice", {
      defaultValue: "IEEE Scopus & Xplore Proceedings Included",
    }),
    showFeeTable: { type: "switch", label: "Show fee table", defaultValue: true },
    rates: {
      type: "array",
      label: "Registration fee categories",
      itemLabel: "category",
      itemLabelKey: "category",
      defaultValue: REGISTRATION_RATES,
      defaultItem: {
        category: "New Fee Tier",
        earlyBird: "$650",
        standard: "$750",
        late: "$850",
        note: "Technical sessions, digital proceedings, meals",
        popular: false,
      },
      itemFields: registrationRateItemFields,
    },
    showPaymentChannels: {
      type: "switch",
      label: "Show payment channels",
      defaultValue: true,
    },
    channelsHeading: text("Payment channels heading", {
      defaultValue: "Accepted Payment Channels & Wire Instructions",
    }),
    paymentChannels: {
      type: "array",
      label: "Payment channels",
      itemLabel: "channel",
      itemLabelKey: "title",
      defaultValue: DEFAULT_PAYMENT_CHANNELS,
      defaultItem: {
        iconType: "bank",
        badge: "Payment Option",
        title: "New Payment Channel",
        description: "Payment instructions for authors and attendees.",
        details: [{ label: "Reference", value: "IEEE SMC 2027" }],
        tags: [],
        footerLeft: "Official Receipt",
        footerRight: "Verified",
      },
      itemFields: paymentChannelItemFields,
    },
    showVatInvoice: {
      type: "switch",
      label: "Show invoice notice",
      defaultValue: true,
    },
    vatInvoice: {
      type: "object",
      label: "Invoice notice card",
      defaultValue: {
        title: "Electronic Financial Invoice & Tax Receipt Issuance",
        description:
          "Authors needing official financial invoices for institutional reimbursement should provide institution tax identification and billing details to the secretariat with payment proof.",
        email: CONFERENCE_INFO.contactEmail,
        buttonLabel: "Request Invoice Receipt",
        emailSubject: "IEEE SMC 2027 VAT Invoice Request",
      },
      fields: {
        title: text("Notice title"),
        description: paragraph("Notice description"),
        email: text("Secretariat email"),
        buttonLabel: text("Button label"),
        emailSubject: text("Email subject"),
      },
    },
  },

  AwardsSection: {
    awards: {
      type: "array",
      label: "Awards",
      itemLabel: "award",
      itemLabelKey: "title",
      defaultValue: AWARDS_LIST.map(({ title, description, prize, iconType, recognitionLabel }) => ({
        title,
        description,
        prize,
        iconType: iconType || "award",
        recognitionLabel: recognitionLabel || "Recognition",
      })),
      defaultItem: {
        title: "New Conference Award",
        description: "Award eligibility criteria and selection overview.",
        prize: "Certificate & Monetary Prize",
        iconType: "award",
        recognitionLabel: "Recognition",
      },
      itemFields: {
        iconType: {
          type: "select",
          label: "Badge icon",
          options: [
            { label: "Auto by position", value: "auto" },
            { label: "Trophy", value: "trophy" },
            { label: "Medal", value: "medal" },
            { label: "Award Ribbon", value: "award" },
            { label: "Star", value: "star" },
          ],
        },
        title: text("Award title"),
        description: paragraph("Description"),
        recognitionLabel: text("Recognition label"),
        prize: text("Prize"),
      },
    },
  },

  PaperSubmissionGuidelinesSection: {
    templatesHeading: text("Templates heading", { defaultValue: "Download Official Conference Templates" }),
    officialBadgeLabel: text("Default badge label", { defaultValue: "Official IEEE" }),
    usageNoteLabel: text("Usage note label", { defaultValue: "Usage Note" }),
    downloadButtonLabel: text("Download button label", { defaultValue: "Download Template" }),
    unavailableButtonLabel: text("Pending file button label", { defaultValue: "File Pending Upload" }),
    showCopyLink: {
      type: "switch",
      label: "Show copy link button",
      defaultValue: true,
    },
    copyLinkLabel: text("Copy link label", { defaultValue: "Copy Link" }),
    copiedLinkLabel: text("Copied state label", { defaultValue: "Copied" }),
    templates: {
      type: "array",
      label: "Downloadable templates",
      itemLabel: "template",
      itemLabelKey: "name",
      defaultValue: PAPER_TEMPLATE_ITEMS.map(
        ({ name, format, description, fileSize, downloadUrl, fileName, instructions }) => ({
          name,
          format,
          description,
          fileSize: fileSize || "",
          downloadUrl,
          fileName: fileName || "",
          badgeLabel: "",
          buttonLabel: "",
          instructions: instructions || "",
        })
      ),
      defaultItem: {
        name: "New Manuscript Template",
        format: "LaTeX ZIP",
        description: "Official IEEE formatting template package.",
        fileSize: "",
        downloadUrl: "",
        fileName: "",
        badgeLabel: "",
        buttonLabel: "",
        instructions: "Follow IEEE two-column margins.",
      },
      itemFields: {
        name: text("Template name"),
        format: text("File format"),
        badgeLabel: text("Item badge override"),
        description: paragraph("Description"),
        fileSize: text("File size"),
        downloadUrl: file("Template file"),
        fileName: text("Download filename"),
        buttonLabel: text("Button label override"),
        instructions: paragraph("Usage instructions"),
      },
    },
    emptyTemplatesText: text("Empty templates text", { defaultValue: "No templates added yet." }),
    showComplianceNotice: {
      type: "switch",
      label: "Show compliance notice",
      defaultValue: true,
    },
    complianceTitle: text("Compliance heading", {
      defaultValue: "IEEE PDF eXpress Compliance",
    }),
    complianceMessage: paragraph("Compliance message", {
      defaultValue:
        "All final camera-ready papers must be validated through IEEE PDF eXpress before final submission to ensure compatibility with the IEEE Xplore Digital Library. Detailed PDF eXpress conference credentials will be provided upon paper acceptance.",
    }),
    guidelinesHeading: text("Guidelines heading", {
      defaultValue: "Page Length & Type Limits",
    }),
    emptyGuidelinesText: text("Empty guidelines text", { defaultValue: "No page limits added yet." }),
    guidelines: {
      type: "array",
      label: "Submission guidelines",
      itemLabel: "guideline",
      itemLabelKey: "label",
      defaultValue: PAPER_GUIDELINES,
      defaultItem: {
        label: "New Submission Category",
        limit: "6 pages standard",
        detail: "Formatting requirements and page rules.",
      },
      itemFields: {
        label: text("Submission category"),
        limit: text("Page limit"),
        detail: paragraph("Details"),
      },
    },
    checklistHeading: text("Checklist heading", {
      defaultValue: "Pre-Submission Checklist",
    }),
    checklistItems: {
      type: "array",
      label: "Verification checklist",
      itemLabel: "item",
      itemLabelKey: "text",
      defaultValue: DEFAULT_PRE_SUBMISSION_CHECKLIST,
      defaultItem: { text: "Verify IEEE PDF compliance before upload" },
      itemFields: {
        text: paragraph("Checklist point"),
      },
    },
    showAuthorCenter: {
      type: "switch",
      label: "Show author center link",
      defaultValue: true,
    },
    authorCenterLabel: text("Author center link label", {
      defaultValue: "Visit IEEE Official Author Center",
    }),
    authorCenterUrl: text("Author center URL", {
      defaultValue: "https://www.ieee.org/conferences/publishing/templates.html",
    }),
  },

  ConferenceTracksSection: {
    searchPlaceholder: text("Search placeholder", {
      defaultValue: "Search tracks, topics, or keywords...",
    }),
    pillars: {
      type: "array",
      label: "Technical tracks",
      itemLabel: "track",
      itemLabelKey: "title",
      defaultValue: TECHNICAL_TRACKS,
      defaultItem: {
        id: "new-track",
        iconType: "cpu",
        title: "New Technical Pillar",
        subtitle: "Multidisciplinary Research Area",
        code: "NEW",
        description: "Summary of topics covered by this track.",
        topics: [{ name: "New Research Topic", code: "NEW-01", category: "General" }],
      },
      itemFields: {
        id: text("Track ID"),
        iconType: {
          type: "select",
          label: "Pillar icon",
          options: [
            { label: "CPU / Systems", value: "cpu" },
            { label: "Shield / Cybernetics", value: "shield" },
            { label: "Brain / Human-Machine", value: "brain" },
          ],
        },
        title: text("Track title"),
        subtitle: text("Subtitle"),
        code: text("Track code"),
        description: paragraph("Description"),
        topics: {
          type: "array",
          label: "Topics",
          itemLabel: "topic",
          itemLabelKey: "name",
          defaultItem: {
            name: "New Research Topic",
            code: "SMC-01",
            category: "General",
          },
          itemFields: {
            name: text("Topic name"),
            code: text("Topic code"),
            category: text("Category"),
          },
        },
      },
    },
  },

  CommitteesSection: {
    titleAccent: text("Second-line accent heading", { defaultValue: "& Leadership" }),
    groups: {
      type: "array",
      label: "Committee groups",
      itemLabel: "group",
      itemLabelKey: "groupName",
      defaultValue: COMMITTEE_GROUPS.map((group) => ({
        ...group,
        members: group.members.map((member) => ({
          ...member,
          photo: member.photo ?? CHAIR_PHOTO_MAP[member.name] ?? "",
        })),
      })),
      defaultItem: {
        groupName: "New Committee Group",
        members: [
          {
            name: "New Member",
            role: "Committee Member",
            affiliation: "Ho Chi Minh City University of Technology and Education",
            country: "Vietnam",
            photo: "",
            gender: "auto",
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
            gender: "auto",
          },
          itemFields: {
            photo: image("Portrait"),
            name: text("Full name"),
            role: text("Role"),
            affiliation: text("Affiliation"),
            country: text("Country"),
            gender: {
              type: "select",
              label: "Fallback avatar style",
              options: [
                { label: "Auto detect", value: "auto" },
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ],
            },
          },
        },
      },
    },
  },

  ImportantDatesSection: {
    colMilestoneLabel: text("Milestone column label", {
      defaultValue: "Milestone Event",
    }),
    colDeadlineLabel: text("Deadline column label", {
      defaultValue: "Submission Deadline",
    }),
    timezoneNotice: text("Timezone footer note", {
      defaultValue: "All deadlines are 23:59 GMT-12 — Anywhere on Earth",
    }),
    ctaLabel: text("Bottom button label", { defaultValue: "View Submission Details" }),
    viewDetailsUrl: text("View details link", { group: "Links", defaultValue: "#cfp" }),
    dates: {
      type: "array",
      label: "Deadlines & milestones",
      itemLabel: "milestone",
      itemLabelKey: "title",
      defaultValue: OFFICIAL_2027_DATES,
      defaultItem: {
        id: "new-milestone",
        title: "New Conference Milestone",
        date: "June 15, 2027",
        originalDeadline: "",
        extendedDeadline: "",
        category: "Papers",
        status: "Upcoming",
        highlight: false,
      },
      itemFields: {
        id: text("Milestone ID"),
        title: paragraph("Milestone title"),
        date: text("Date", { placeholder: "April 08, 2027" }),
        originalDeadline: text("Original deadline"),
        extendedDeadline: text("Extended deadline"),
        category: text("Category"),
        status: text("Status label"),
        highlight: { type: "switch", label: "Highlight milestone" },
      },
    },
  },

  ScheduleTimelineSection: {
    venueBadge: text("Venue badge", {
      defaultValue: "Sheraton Saigon Grand Opera Hotel",
    }),
    days: {
      type: "array",
      label: "Schedule days",
      itemLabel: "day",
      itemLabelKey: "dateStr",
      defaultValue: DEFAULT_DAYS,
      defaultItem: {
        dayNumber: 1,
        dateStr: "Wednesday, Oct 6, 2027",
        shortDate: "Oct 6",
        theme: "Technical Sessions & Keynotes",
        events: [
          {
            time: "09:00 - 10:30",
            title: "Morning Session",
            room: "Grand Hall",
            speakers: "",
            track: "Technical",
          },
        ],
      },
      itemFields: {
        dayNumber: { type: "number", label: "Day number", min: 1, defaultValue: 1 },
        dateStr: text("Date label"),
        shortDate: text("Tab short date"),
        theme: text("Day theme"),
        events: {
          type: "array",
          label: "Events",
          itemLabel: "event",
          itemLabelKey: "title",
          defaultItem: {
            time: "09:00 - 10:30",
            title: "New Schedule Event",
            room: "Grand Ballroom",
            speakers: "",
            track: "Technical",
          },
          itemFields: {
            time: text("Time", { placeholder: "09:00 – 10:15" }),
            title: text("Event title"),
            room: text("Location"),
            speakers: text("Speakers"),
            track: text("Track"),
          },
        },
      },
    },
  },

  SponsorshipSection: {
    prospectusLabel: text("Prospectus button label", {
      defaultValue: "Download Sponsorship Prospectus",
    }),
    prospectusUrl: text("Prospectus URL", {
      defaultValue: `mailto:${CONFERENCE_INFO.contactEmail}`,
    }),
    showSocietyBanner: {
      type: "switch",
      label: "Show affiliation banner",
      defaultValue: true,
    },
    societyBannerLabel: text("Affiliation banner caption", {
      defaultValue: "Official Technical Co-Sponsorship & Society Affiliation",
    }),
    sponsors: {
      type: "array",
      label: "Sponsors & partners",
      itemLabel: "sponsor",
      itemLabelKey: "shortName",
      defaultValue: SPONSORS,
      defaultItem: {
        logo: "",
        name: "New Partner Institution",
        shortName: "Partner",
        type: "Technical Partner",
        logoType: "ieee",
        url: "",
      },
      itemFields: {
        logo: image("Sponsor logo"),
        name: text("Organization name"),
        shortName: text("Display name"),
        type: text("Sponsorship level"),
        url: text("Website URL"),
        logoType: {
          type: "select",
          label: "Built-in emblem",
          options: [
            { label: "IEEE", value: "ieee" },
            { label: "HCM-UTE", value: "hcmute" },
            { label: "IEEE SMC", value: "ieee-smc" },
            { label: "IEEE CIS", value: "ieee-cis" },
            { label: "IEEE RAS", value: "ieee-ras" },
            { label: "Institution", value: "most" },
          ],
        },
      },
    },
  },

  VenueLocationSection: {
    subtitle: paragraph("Section description", {
      defaultValue:
        "Official Hotel & Destination Guide for Delegates Attending IEEE SMC 2027",
    }),
    description: paragraph("Primary venue overview", {
      defaultValue:
        "Experience 5-star international hospitality at Sheraton Saigon Grand Opera Hotel, nestled along iconic Dong Khoi Street in the dynamic downtown heart of District 1.",
    }),
    secondaryDescription: paragraph("Secondary venue note", {
      defaultValue:
        "Equipped with grand plenary halls, high-speed networking lounges, and immediate proximity to historic cultural landmarks and gourmet Vietnamese dining.",
    }),
    hostInstitution: text("Host institution", { defaultValue: CONFERENCE_INFO.host }),
    contactEmail: text("Contact email", { defaultValue: CONFERENCE_INFO.contactEmail }),
    hotline: text("Hotline", { defaultValue: CONFERENCE_INFO.hotline }),
    image: image("Venue photo", { defaultValue: "/images/sheraton-saigon-card.jpg" }),
    imageBadge: text("Image badge", { defaultValue: "Official Host Hotel" }),
    imageCaptionLabel: text("Image caption", { defaultValue: "District 1" }),
    hotelBookingUrl: text("Hotel booking URL", {
      defaultValue:
        "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
    }),
    visaUrl: text("Visa guide URL", { defaultValue: CONFERENCE_INFO.visaUrl }),
    travelGuideUrl: text("Travel portal URL", { defaultValue: "/travel" }),
    showTransitCards: { type: "switch", label: "Show transit cards", defaultValue: true },
    transitCards: {
      type: "array",
      label: "Transit & logistics cards",
      itemLabel: "card",
      itemLabelKey: "title",
      defaultValue: DEFAULT_TRANSIT_CARDS,
      defaultItem: {
        image: "/assets/3d/airport-plane-3d.png",
        title: "New Transit Guide",
        description: "Airport or city transport guidance.",
        footerText: "District 1",
        linkLabel: "",
        linkUrl: "",
      },
      itemFields: {
        image: image("Illustration"),
        title: text("Card title"),
        description: paragraph("Description"),
        footerText: text("Footer highlight"),
        linkLabel: text("Link label"),
        linkUrl: text("Link URL"),
      },
    },
    showAttractions: { type: "switch", label: "Show attractions directory", defaultValue: true },
    attractionsHeading: text("Attractions heading", {
      defaultValue: "Must-Visit Heritage & Cultural Places in Ho Chi Minh City",
    }),
    attractionsSubtitle: paragraph("Attractions subtitle", {
      defaultValue:
        "Explore iconic Saigon architecture, museums, and dining around District 1",
    }),
    attractions: {
      type: "array",
      label: "Nearby attractions",
      itemLabel: "attraction",
      itemLabelKey: "name",
      defaultValue: DEFAULT_EDITABLE_ATTRACTIONS,
      defaultItem: {
        id: "new-place",
        image: "/images/saigon/opera-house.jpg",
        name: "New Landmark",
        vietnameseName: "",
        description: "Short overview of this landmark near District 1.",
        location: "District 1, Ho Chi Minh City",
        openingHours: "Daily, 08:00 – 17:00",
        distanceFromVenue: "5 min walk from Sheraton Saigon",
        badge: "City Landmark",
        filterCategory: "walk",
        mapsQuery: "Ho Chi Minh City District 1",
      },
      itemFields: attractionItemFields,
    },
    showCallout: { type: "switch", label: "Show bottom travel callout", defaultValue: true },
    calloutText: paragraph("Bottom callout notice", {
      defaultValue:
        "Need travel planning assistance or visa invitation letters? Our local organizing committee in Ho Chi Minh City is happy to help.",
    }),
    calloutButtonLabel: text("Callout button label", {
      defaultValue: "Explore HCM-UTE City Portal",
    }),
    calloutButtonUrl: text("Callout button URL", {
      defaultValue: "/travel",
    }),
  },

  FaqAccordionSection: {
    subtitle: paragraph("Section description", {
      defaultValue: "Author & Attendee Assistance • Conference Policies & Guidance",
    }),
    showFooterPrompt: { type: "switch", label: "Show contact footer bar", defaultValue: true },
    footerPrompt: paragraph("Contact footer message", {
      defaultValue:
        "Have an inquiry not answered above regarding registration, visas, or special sessions?",
    }),
    contactButtonLabel: text("Contact button label", {
      defaultValue: "Contact Conference Secretariat",
    }),
    contactEmail: text("Secretariat email", { defaultValue: CONFERENCE_INFO.contactEmail }),
    items: {
      type: "array",
      label: "Questions & answers",
      itemLabel: "question",
      itemLabelKey: "question",
      defaultValue: FAQS,
      defaultItem: {
        category: "Submission",
        question: "New Frequently Asked Question?",
        answer: "Provide clear instructions for conference participants.",
      },
      itemFields: {
        question: paragraph("Question"),
        answer: paragraph("Answer"),
        category: text("Category"),
      },
    },
  },

  WelcomeLetter: {
    heading: text("Intro heading", {
      defaultValue: "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
    }),
    subtitle: paragraph("Section description", {
      defaultValue: "Invitation from the IEEE SMC 2027 General Chairs & Organizing Leadership",
    }),
    body: {
      type: "richtext",
      label: "Letter content",
      defaultValue: DEFAULT_WELCOME_LETTER_HTML,
    },
    closingText: text("Closing phrase", { defaultValue: "Warm regards," }),
    showSignatures: { type: "switch", label: "Show chair signatures", defaultValue: true },
    chairs: {
      type: "array",
      label: "Chairs & signatures",
      itemLabel: "chair",
      itemLabelKey: "name",
      defaultValue: CHAIR_MEMBERS,
      defaultItem: {
        image: "",
        name: "New Conference Chair",
        role: "General Chair",
        affiliation: "Ho Chi Minh City University of Technology and Education",
        country: "Vietnam",
        gender: "auto",
      },
      itemFields: {
        image: image("Chair portrait"),
        name: text("Full name"),
        role: text("Chair role"),
        affiliation: text("Affiliation"),
        country: text("Country"),
        gender: {
          type: "select",
          label: "Avatar style",
          options: [
            { label: "Auto detect", value: "auto" },
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
      },
    },
  },

  ConferenceHighlights: {
    items: {
      type: "array",
      label: "Conference statistics",
      itemLabel: "statistic",
      itemLabelKey: "label",
      defaultValue: CONFERENCE_STATS,
      defaultItem: {
        value: "100+",
        label: "New Metric",
        sub: "Brief statistic detail",
      },
      itemFields: {
        value: text("Value", { placeholder: "1,200+" }),
        label: text("Label"),
        sub: paragraph("Description"),
      },
    },
    showIndexingBanner: {
      type: "switch",
      label: "Show indexing banner",
      defaultValue: true,
    },
    indexingTitle: text("Indexing banner heading", {
      defaultValue: "Global Indexing & Publication",
    }),
    indexingDescription: paragraph("Indexing banner description", {
      defaultValue:
        "All accepted and presented conference papers are submitted to IEEE Xplore and indexed in major global scientific databases.",
    }),
    indexingBadges: {
      type: "array",
      label: "Indexing badges",
      itemLabel: "badge",
      itemLabelKey: "label",
      defaultValue: DEFAULT_INDEXING_BADGES,
      defaultItem: { label: "IEEE Xplore" },
      itemFields: {
        label: text("Badge label"),
      },
    },
  },

  PastConferencesSection: {
    conferences: {
      type: "array",
      label: "Past conferences",
      itemLabel: "conference",
      itemLabelKey: "city",
      defaultValue: PAST_CONFERENCES,
      defaultItem: {
        year: "2026",
        city: "Bellevue, Washington, USA",
        dates: "October 2026",
        theme: "Conference theme description",
        proceedingsLabel: "IEEE Xplore Proceedings",
        proceedingsUrl: "",
      },
      itemFields: {
        year: text("Year"),
        city: text("Location"),
        dates: text("Dates"),
        theme: paragraph("Conference theme"),
        proceedingsLabel: text("Proceedings label"),
        proceedingsUrl: text("Proceedings URL"),
      },
    },
  },

  About: {
    theme: paragraph("Conference theme", { defaultValue: CONFERENCE_INFO.theme }),
    publicationsTitle: text("Publications heading", {
      defaultValue: "Affiliated IEEE SMC Publications",
    }),
    publications: {
      type: "array",
      label: "Affiliated publications",
      itemLabel: "publication",
      itemLabelKey: "name",
      defaultValue: AFFILIATED_PUBLICATIONS,
      defaultItem: { name: "IEEE SMC Publication", href: "https://www.ieeesmc.org" },
      itemFields: { name: text("Publication name"), href: text("Website URL") },
    },
  },

  CallForPapers: {
    introText: paragraph("Call for Papers introduction", {
      defaultValue:
        "The IEEE International Conference on Systems, Man, and Cybernetics is the flagship annual conference of the IEEE SMC Society. SMC 2027 invites high-quality research and application submissions spanning our three interconnected technical pillars.",
    }),
    downloadButtonLabel: text("Download button label", {
      defaultValue: "Download Official CFP Brochure",
    }),
    cfpPdfUrl: file("Call for Papers PDF", {
      defaultValue: CONFERENCE_INFO.cfpPdfUrl,
      group: "Media",
    }),
    showPolicyCards: { type: "switch", label: "Show submission policies", defaultValue: true },
    policyCards: {
      type: "array",
      label: "Submission policy cards",
      itemLabel: "policy",
      itemLabelKey: "title",
      defaultValue: DEFAULT_CFP_POLICIES,
      defaultItem: {
        iconImage: "/assets/3d/paper-submission-3d.png",
        eyebrow: "Submission Policy",
        title: "New Policy Rule",
        description: "Author compliance requirement.",
        footerText: "Mandatory Compliance",
        footerIcon: "shield",
      },
      itemFields: cfpPolicyItemFields,
    },
    showTrackCards: {
      type: "switch",
      label: "Show submission category cards",
      defaultValue: true,
    },
    trackCards: {
      type: "array",
      label: "Submission category cards",
      itemLabel: "category",
      itemLabelKey: "title",
      defaultValue: DEFAULT_SUBMISSION_CATEGORIES,
      defaultItem: {
        image: "/assets/3d/paper-submission-3d.png",
        badge: "Track",
        deadline: "April 08, 2027",
        title: "New Submission Category",
        description: "Overview of papers eligible for this category.",
        checklist: [{ text: "Standard IEEE format", url: "" }],
      },
      itemFields: cfpCategoryItemFields,
    },
    showBrochureBanner: {
      type: "switch",
      label: "Show CFP PDF viewer banner",
      defaultValue: true,
    },
    brochureBanner: {
      type: "object",
      label: "CFP brochure banner",
      defaultValue: {
        title: "Complete IEEE SMC 2027 Call for Papers Brochure",
        description:
          "Download the authoritative specification for paper templates, special session guidelines, committees, and topics.",
        previewButtonLabel: "Preview PDF Specification",
        hidePreviewButtonLabel: "Hide PDF Preview",
        openButtonLabel: "Open PDF Document",
      },
      fields: {
        title: text("Banner heading"),
        description: paragraph("Banner description"),
        previewButtonLabel: text("Preview button label"),
        hidePreviewButtonLabel: text("Hide preview label"),
        openButtonLabel: text("Open PDF button label"),
      },
    },
  },

  MediaGallerySection: {
    viewDetailsUrl: text("Venue details link", { group: "Links", defaultValue: "#venue" }),
    qqVideoVid: text("QQ Video ID", { group: "Media", defaultValue: "x3508h1k2m9" }),
    youtubeTabLabel: text("YouTube switcher label", { defaultValue: "International Stream" }),
    qqTabLabel: text("QQ Video switcher label", { defaultValue: "QQ Video · China Access" }),
    cardTitle: text("Side card heading", {
      defaultValue: "Experience IEEE SMC in Ho Chi Minh City",
    }),
    cardDescription: paragraph("Side card description", {
      defaultValue:
        "Hosted by Ho Chi Minh City University of Technology and Education in Vietnam's vibrant technological hub — where systems science, human-machine interaction, and cybernetics converge for global research collaboration.",
    }),
    buttonLabel: text("Side card button label", {
      defaultValue: "Explore Venue & City Details",
    }),
  },

  ContactSupportSection: {
    titleAccent: text("Second-line accent heading", { defaultValue: "& Get in Touch" }),
    subtitle: paragraph("Section description", {
      defaultValue:
        "Have questions regarding paper submissions, proposals, or conference participation? We are here to assist you.",
    }),
    cards: {
      type: "array",
      label: "Contact & action cards",
      itemLabel: "card",
      itemLabelKey: "title",
      defaultValue: buildDefaultContactCards({}),
      defaultItem: {
        iconImage: "/assets/3d/mail-contact-3d.png",
        eyebrow: "Secretariat Support",
        title: "New Support Contact",
        description: "Contact channel details for participants.",
        primaryValue: "ieeesmc2027@hcmute.edu.vn",
        secondaryValue: "",
        copyValue: "ieeesmc2027@hcmute.edu.vn",
        actionLabel: "Send Email",
        actionUrl: "mailto:ieeesmc2027@hcmute.edu.vn",
        copyButtonLabel: "Copy",
      },
      itemFields: {
        iconImage: image("Card illustration"),
        eyebrow: text("Top label"),
        title: text("Card title"),
        description: paragraph("Description"),
        primaryValue: text("Primary contact text"),
        secondaryValue: text("Secondary note"),
        actionLabel: text("Action button label"),
        actionUrl: text("Action URL"),
        copyValue: text("Copyable text"),
        copyButtonLabel: text("Copy button label"),
      },
    },
  },

  WorkshopTutorialSection: {
    cards: {
      type: "array",
      label: "Workshop & tutorial cards",
      itemLabel: "card",
      itemLabelKey: "title",
      defaultValue: buildDefaultWorkshopCards("February 15, 2027", "smc2027@hcmute.edu.vn"),
      defaultItem: workshopCardDefaultItem,
      itemFields: {
        iconType: {
          type: "select",
          label: "Card icon",
          options: [
            { label: "Workshops", value: "workshop" },
            { label: "Tutorials", value: "tutorial" },
          ],
        },
        title: text("Card title"),
        description: paragraph("Description"),
        bullets: {
          type: "array",
          label: "Bullet points",
          itemLabel: "point",
          itemLabelKey: "text",
          defaultItem: { text: "Key guideline" },
          itemFields: { text: text("Point") },
        },
        footerLabel: text("Footer label"),
        footerValue: text("Footer value"),
        footerHref: text("Optional footer link"),
      },
    },
  },

  TravelAccommodationSection: {
    cards: {
      type: "array",
      label: "Travel & lodging cards",
      itemLabel: "card",
      itemLabelKey: "title",
      defaultValue: buildDefaultTravelCards(
        "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
        "7 km (~20–30 mins from Tan Son Nhat Airport)"
      ),
      defaultItem: {
        iconType: "hotel",
        title: "New Travel Info",
        subtitle: "District 1",
        description: "Travel and hotel details for conference guests.",
        buttonLabel: "View Details",
        buttonUrl: "#",
        footerNote: "",
      },
      itemFields: {
        iconType: {
          type: "select",
          label: "Card icon",
          options: [
            { label: "Hotel", value: "hotel" },
            { label: "Airport / Plane", value: "plane" },
            { label: "Compass", value: "compass" },
            { label: "Navigation", value: "navigation" },
          ],
        },
        title: text("Card title"),
        subtitle: text("Subtitle"),
        description: paragraph("Description"),
        buttonLabel: text("Button label"),
        buttonUrl: text("Button URL"),
        footerNote: text("Footer note"),
      },
    },
  },

  VisaInformationSection: {
    cards: {
      type: "array",
      label: "Visa guidance cards",
      itemLabel: "card",
      itemLabelKey: "title",
      defaultValue: buildDefaultVisaCards(
        "https://evisa.xuatnhapcanh.gov.vn",
        "smc2027@hcmute.edu.vn"
      ),
      defaultItem: {
        iconType: "evisa",
        title: "New Visa Rule",
        description: "Requirements for international attendees.",
        bulletsHeading: "",
        bullets: [{ text: "Requirement item" }],
        buttonLabel: "Open Portal",
        buttonUrl: "https://evisa.xuatnhapcanh.gov.vn",
        contactLabel: "",
        contactEmail: "",
      },
      itemFields: {
        iconType: {
          type: "select",
          label: "Card icon",
          options: [
            { label: "e-Visa Guide", value: "evisa" },
            { label: "Invitation Letter", value: "letter" },
          ],
        },
        title: text("Card title"),
        description: paragraph("Description"),
        bulletsHeading: text("Checklist heading"),
        bullets: {
          type: "array",
          label: "Bullet list",
          itemLabel: "bullet",
          itemLabelKey: "text",
          defaultItem: { text: "Checklist detail" },
          itemFields: { text: text("Item") },
        },
        buttonLabel: text("External button label"),
        buttonUrl: text("External URL"),
        contactLabel: text("Contact label"),
        contactEmail: text("Contact email"),
      },
    },
  },

  SubmissionCountdown: {
    iconImage: image("Calendar icon graphic", {
      defaultValue: "/assets/3d/calendar-dates-3d.png",
    }),
    calendarEventTitle: text("Calendar event title", {
      defaultValue: "IEEE SMC 2027 Paper Submission Deadline",
    }),
    calendarDates: text("Google Calendar UTC dates", {
      defaultValue: "20270408T165959Z/20270408T165959Z",
    }),
    calendarLocation: text("Calendar event location", {
      defaultValue: "Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam",
    }),
    showCalendarActions: {
      type: "switch",
      label: "Show calendar & copy links",
      defaultValue: true,
    },
    primaryButtonLabel: text("Primary button label", {
      defaultValue: "Author Guidelines",
    }),
    primaryButtonUrl: text("Primary button URL", { defaultValue: "#cfp" }),
    secondaryButtonLabel: text("Secondary button label", { defaultValue: "CFP PDF" }),
    cfpPdfUrl: file("CFP PDF file", { defaultValue: CONFERENCE_INFO.cfpPdfUrl }),
  },

  CfpSubscribe: {
    buttonLabel: text("Submit button label", { defaultValue: "Subscribe" }),
    successMessage: text("Confirmation notice", {
      defaultValue: "Subscribed to IEEE SMC 2027 milestone notifications.",
    }),
  },

  FooterSection: {
    badgeText: text("Top badge", { defaultValue: DEFAULT_FOOTER_CONFIG.badgeText }),
    datesText: text("Dates badge", { defaultValue: DEFAULT_FOOTER_CONFIG.datesText }),
    heading: text("Footer heading", { defaultValue: DEFAULT_FOOTER_CONFIG.heading }),
    description: paragraph("Top description", {
      defaultValue: DEFAULT_FOOTER_CONFIG.description,
    }),
    cfpButtonLabel: text("CFP button label", {
      defaultValue: DEFAULT_FOOTER_CONFIG.cfpButtonLabel,
    }),
    cfpPdfUrl: file("CFP PDF document", { defaultValue: DEFAULT_FOOTER_CONFIG.cfpPdfUrl }),
    portalButtonLabel: text("Portal button label", {
      defaultValue: DEFAULT_FOOTER_CONFIG.portalButtonLabel,
    }),
    websiteUrl: text("Conference portal URL", {
      defaultValue: DEFAULT_FOOTER_CONFIG.websiteUrl,
    }),
    universityNote: paragraph("Host university tagline", {
      defaultValue: DEFAULT_FOOTER_CONFIG.universityNote,
    }),
    secondaryDescription: paragraph("About conference copy", {
      defaultValue: DEFAULT_FOOTER_CONFIG.secondaryDescription,
    }),
    venueName: text("Venue name", { defaultValue: DEFAULT_FOOTER_CONFIG.venueName }),
    address: text("Venue address", { defaultValue: DEFAULT_FOOTER_CONFIG.address }),
    hotline: text("Display phone", { defaultValue: DEFAULT_FOOTER_CONFIG.hotline }),
    hotlineRaw: text("Tel link number", { defaultValue: DEFAULT_FOOTER_CONFIG.hotlineRaw }),
    contactEmail: text("Secretariat email", {
      defaultValue: DEFAULT_FOOTER_CONFIG.contactEmail,
    }),
    socialLinks: {
      type: "array",
      label: "Social & official portals",
      itemLabel: "social",
      itemLabelKey: "name",
      defaultValue: DEFAULT_FOOTER_CONFIG.socialLinks,
      defaultItem: {
        name: "Official Portal",
        href: "https://hcmute.edu.vn",
        platform: "globe",
      },
      itemFields: {
        name: text("Label"),
        href: text("Destination URL"),
        platform: {
          type: "select",
          label: "Icon",
          options: [
            { label: "Website Globe", value: "globe" },
            { label: "Facebook", value: "facebook" },
            { label: "YouTube", value: "youtube" },
            { label: "IEEE SMC", value: "smc" },
          ],
        },
      },
    },
    linkGroups: {
      type: "array",
      label: "Footer navigation columns",
      itemLabel: "column",
      itemLabelKey: "heading",
      defaultValue: DEFAULT_FOOTER_CONFIG.linkGroups,
      defaultItem: {
        heading: "New Column",
        links: [{ label: "New Link", href: "/" }],
      },
      itemFields: {
        heading: text("Column heading"),
        links: {
          type: "array",
          label: "Links",
          itemLabel: "link",
          itemLabelKey: "label",
          defaultItem: { label: "Link Label", href: "/" },
          itemFields: {
            label: text("Link label"),
            href: text("Destination URL"),
          },
        },
      },
    },
    copyrightText: text("Copyright notice", {
      defaultValue: DEFAULT_FOOTER_CONFIG.copyrightText,
    }),
    footerRightText: text("Bottom bar right note", {
      defaultValue: DEFAULT_FOOTER_CONFIG.footerRightText,
    }),
  },

  // ── 13 Modular Decomposed Conference Blocks ────────────────────────────────
  SubmissionPortalsBlock: {
    title: text("Section title", {
      defaultValue: "Submission Portals & Electronic Tools",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Submit manuscripts, validate PDF Xplore compliance, and sign copyright agreements",
    }),
    portals: {
      type: "array",
      label: "Submission portals",
      itemLabel: "portal",
      itemLabelKey: "name",
      defaultValue: DEFAULT_SUBMISSION_PORTALS,
      defaultItem: {
        name: "New Electronic System",
        system: "Portal",
        badge: "Tool",
        description: "Description of how authors use this portal.",
        url: "https://ras.papercept.net",
        buttonLabel: "Open Portal",
        primary: false,
      },
      itemFields: {
        name: text("Portal name"),
        system: text("Short system name"),
        badge: text("Top badge"),
        description: paragraph("Description"),
        url: text("Portal URL"),
        buttonLabel: text("Button label"),
        primary: { type: "switch", label: "Primary portal button" },
      },
    },
  },

  CfpPoliciesBlock: {
    title: text("Section title", {
      defaultValue: "Call For Papers & Submission Policies",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "IEEE Systems, Man, and Cybernetics Society Review & Publication Standards",
    }),
    introText: paragraph("Introduction text", {
      defaultValue:
        "All submitted papers undergo rigorous single-blind peer review by technical experts. Accepted and presented papers will be submitted for inclusion in IEEE Xplore subject to IEEE quality scope.",
    }),
    cfpPdfUrl: file("Call for Papers PDF", { defaultValue: CONFERENCE_INFO.cfpPdfUrl }),
    downloadButtonLabel: text("Download button label", {
      defaultValue: "Download Official CFP Brochure",
    }),
    policies: {
      type: "array",
      label: "Policy cards",
      itemLabel: "policy",
      itemLabelKey: "title",
      defaultValue: DEFAULT_CFP_POLICIES,
      defaultItem: {
        iconImage: "/assets/3d/paper-submission-3d.png",
        eyebrow: "Submission Policy",
        title: "New CFP Policy",
        description: "Submission policy description.",
        footerText: "IEEE SMC 2027 Standard",
        footerIcon: "shield",
      },
      itemFields: cfpPolicyItemFields,
    },
  },

  SubmissionCategoriesBlock: {
    title: text("Section title", {
      defaultValue: "Submission Categories & Paper Types",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Regular papers, special sessions, workshops, and tutorials across core conference tracks",
    }),
    categories: {
      type: "array",
      label: "Submission categories",
      itemLabel: "category",
      itemLabelKey: "title",
      defaultValue: DEFAULT_SUBMISSION_CATEGORIES,
      defaultItem: {
        image: "/assets/3d/paper-submission-3d.png",
        badge: "Track",
        deadline: "April 08, 2027",
        title: "New Paper Category",
        description: "Description of manuscripts accepted under this category.",
        checklist: [{ text: "Standard IEEE 2-column format", url: "" }],
      },
      itemFields: cfpCategoryItemFields,
    },
  },

  CfpBrochureBannerBlock: {
    title: text("Banner title", {
      defaultValue: "Complete IEEE SMC 2027 Call for Papers Brochure",
    }),
    description: paragraph("Banner description", {
      defaultValue:
        "Download the authoritative specification for paper templates, special session guidelines, committees, and topics.",
    }),
    cfpPdfUrl: file("Brochure PDF document", {
      defaultValue: CONFERENCE_INFO.cfpPdfUrl,
    }),
    previewButtonLabel: text("Preview button label", {
      defaultValue: "Preview PDF Specification",
    }),
    hidePreviewButtonLabel: text("Hide preview label", {
      defaultValue: "Hide PDF Preview",
    }),
    openButtonLabel: text("Open PDF button label", {
      defaultValue: "Open PDF Document",
    }),
    viewerHeading: text("Embedded viewer header", {
      defaultValue: "Embedded CFP Specification Reader",
    }),
    defaultExpanded: {
      type: "switch",
      label: "Expand PDF preview initially",
      defaultValue: false,
    },
  },

  VenueOverviewBlock: {
    title: text("Section title", {
      defaultValue: "Conference Venue & Host City",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Official Hotel & Destination Guide for Delegates Attending IEEE SMC 2027",
    }),
    venueName: text("Venue name", { defaultValue: CONFERENCE_INFO.venue }),
    description: paragraph("Primary description", {
      defaultValue:
        "Experience 5-star international hospitality at Sheraton Saigon Grand Opera Hotel, nestled along iconic Dong Khoi Street in the dynamic downtown heart of District 1.",
    }),
    secondaryDescription: paragraph("Secondary description", {
      defaultValue:
        "Equipped with grand plenary halls, high-speed networking lounges, and immediate proximity to historic cultural landmarks and gourmet Vietnamese dining.",
    }),
    address: text("Venue address", { defaultValue: CONFERENCE_INFO.address }),
    hostInstitution: text("Host institution", { defaultValue: CONFERENCE_INFO.host }),
    contactEmail: text("Secretariat email", { defaultValue: CONFERENCE_INFO.contactEmail }),
    hotline: text("Hotline", { defaultValue: CONFERENCE_INFO.hotline }),
    image: image("Venue photo", { defaultValue: "/images/sheraton-saigon-card.jpg" }),
    imageBadge: text("Photo top badge", { defaultValue: "Official Host Hotel" }),
    imageCaptionLabel: text("Photo location tag", { defaultValue: "District 1" }),
    googleMapsUrl: text("Google Maps URL", { defaultValue: CONFERENCE_INFO.googleMapsUrl }),
    hotelBookingUrl: text("Hotel booking URL", {
      defaultValue:
        "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
    }),
    visaUrl: text("e-Visa portal URL", { defaultValue: CONFERENCE_INFO.visaUrl }),
    travelGuideUrl: text("City portal URL", {
      defaultValue: "/travel",
    }),
    showHeaderButtons: {
      type: "switch",
      label: "Show header action buttons",
      defaultValue: true,
    },
  },

  TransitLogisticsBlock: {
    title: text("Section title", { defaultValue: "Transit & Arrival Logistics" }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Visa entry guidance, airport transfers, and downtown District 1 connectivity",
    }),
    cards: {
      type: "array",
      label: "Transit cards",
      itemLabel: "card",
      itemLabelKey: "title",
      defaultValue: DEFAULT_TRANSIT_CARDS,
      defaultItem: {
        image: "/assets/3d/airport-plane-3d.png",
        title: "New Transit Tip",
        description: "Helpful arrival instructions for attendees.",
        footerText: "Ho Chi Minh City",
        linkLabel: "",
        linkUrl: "",
      },
      itemFields: {
        image: image("Illustration"),
        title: text("Title"),
        description: paragraph("Description"),
        footerText: text("Highlight caption"),
        linkLabel: text("Optional link label"),
        linkUrl: text("Optional link URL"),
      },
    },
  },

  CityAttractionsBlock: {
    title: text("Section title", {
      defaultValue: "Must-Visit Heritage & Cultural Places in Ho Chi Minh City",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Explore iconic Saigon architecture, museums, and dining around District 1",
    }),
    attractions: {
      type: "array",
      label: "City attractions",
      itemLabel: "attraction",
      itemLabelKey: "name",
      defaultValue: DEFAULT_EDITABLE_ATTRACTIONS,
      defaultItem: {
        id: "new-place",
        image: "/images/saigon/opera-house.jpg",
        name: "New City Attraction",
        vietnameseName: "",
        description: "Summary of this landmark near the venue.",
        location: "District 1, Ho Chi Minh City",
        openingHours: "Daily, 08:00 – 17:00",
        distanceFromVenue: "5 min walk from Sheraton Saigon",
        badge: "City Landmark",
        filterCategory: "walk",
        mapsQuery: "Ho Chi Minh City District 1",
      },
      itemFields: attractionItemFields,
    },
    showCallout: { type: "switch", label: "Show help callout bar", defaultValue: true },
    calloutText: paragraph("Callout message", {
      defaultValue:
        "Need travel planning assistance or visa invitation letters? Our local organizing committee in Ho Chi Minh City is happy to help.",
    }),
    calloutButtonLabel: text("Callout button label", {
      defaultValue: "Explore HCM-UTE City Portal",
    }),
    calloutButtonUrl: text("Callout button URL", {
      defaultValue: "/travel",
    }),
  },

  VisitorInfoBlock: {
    title: text("Section title", {
      defaultValue: "Local Weather, Transport & Practicalities",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Practical information for international visitors arriving in Ho Chi Minh City",
    }),
    items: {
      type: "array",
      label: "Visitor tips",
      itemLabel: "item",
      itemLabelKey: "title",
      defaultValue: DEFAULT_VISITOR_INFO_ITEMS,
      defaultItem: {
        title: "New Practical Tip",
        description: "Local tip for visiting Ho Chi Minh City.",
        linkLabel: "",
        linkUrl: "",
      },
      itemFields: {
        title: text("Heading"),
        description: paragraph("Description"),
        linkLabel: text("Optional link label"),
        linkUrl: text("Optional link URL"),
      },
    },
  },

  RegistrationFeeTableBlock: {
    title: text("Section title", { defaultValue: "Registration & Fee Schedule" }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Official registration fee schedule and entitlements for IEEE SMC 2027 participants and authors",
    }),
    scheduleHeading: text("Schedule heading", { defaultValue: "Registration Fee Schedule" }),
    earlyBirdNote: text("Early bird note", {
      defaultValue: "All prices in USD. Early bird registration deadline: July 05, 2027",
    }),
    includedBadge: text("Included highlight", {
      defaultValue: "IEEE Scopus & Xplore Proceedings Included",
    }),
    colCategory: text("Column 1 header", { defaultValue: "Registration Category" }),
    colEarlyBird: text("Column 2 header", { defaultValue: "Early Bird" }),
    colStandard: text("Column 3 header", { defaultValue: "Standard" }),
    colLate: text("Column 4 header", { defaultValue: "Late / On-Site" }),
    colEntitlements: text("Column 5 header", { defaultValue: "Entitlements" }),
    rates: {
      type: "array",
      label: "Fee table rows",
      itemLabel: "tier",
      itemLabelKey: "category",
      defaultValue: REGISTRATION_RATES,
      defaultItem: {
        category: "New Fee Tier",
        earlyBird: "$650",
        standard: "$750",
        late: "$850",
        note: "Technical sessions and digital proceedings",
        popular: false,
      },
      itemFields: registrationRateItemFields,
    },
  },

  PaymentChannelsBlock: {
    title: text("Section title", {
      defaultValue: "Accepted Payment Channels & Wire Instructions",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Secure bank transfer, SWIFT international wire, and online card settlement",
    }),
    channels: {
      type: "array",
      label: "Payment channels",
      itemLabel: "channel",
      itemLabelKey: "title",
      defaultValue: DEFAULT_PAYMENT_CHANNELS,
      defaultItem: {
        iconType: "bank",
        badge: "Channel",
        title: "New Payment Channel",
        description: "Payment instructions.",
        details: [{ label: "Account", value: "Value" }],
        tags: [],
        footerLeft: "Invoice Available",
        footerRight: "Verified",
      },
      itemFields: paymentChannelItemFields,
    },
  },

  VatInvoiceNoticeBlock: {
    title: text("Notice title", {
      defaultValue: "Electronic Financial Invoice & Tax Receipt Issuance",
    }),
    description: paragraph("Notice description", {
      defaultValue:
        "Authors needing official financial invoices for institutional reimbursement should provide institution tax identification and billing details to the secretariat with payment proof.",
    }),
    email: text("Secretariat email", { defaultValue: CONFERENCE_INFO.contactEmail }),
    buttonLabel: text("Button label", { defaultValue: "Request Invoice Receipt" }),
    emailSubject: text("Email subject", {
      defaultValue: "IEEE SMC 2027 VAT Invoice Request",
    }),
  },

  RegistrationWizardBlock: {
    title: text("Step 1 heading", { defaultValue: "Conference Registration Portal" }),
    subtitle: paragraph("Step 1 subheading", {
      defaultValue: "Select delegate fee tier and complete participant registration",
    }),
    continueLabel: text("Continue button label", {
      defaultValue: "Continue to Participant Details",
    }),
    defaultCurrency: {
      type: "select",
      label: "Default display currency",
      defaultValue: "VND",
      options: [
        { label: "VND", value: "VND" },
        { label: "USD", value: "USD" },
      ],
    },
    extraPageVnd: {
      type: "number",
      label: "Extra page fee VND",
      min: 0,
      defaultValue: 3750000,
    },
    extraPageUsd: {
      type: "number",
      label: "Extra page fee USD",
      min: 0,
      defaultValue: 150,
    },
    extraBanquetVnd: {
      type: "number",
      label: "Extra banquet ticket VND",
      min: 0,
      defaultValue: 2250000,
    },
    extraBanquetUsd: {
      type: "number",
      label: "Extra banquet ticket USD",
      min: 0,
      defaultValue: 90,
    },
    tiers: {
      type: "array",
      label: "Registration tiers",
      itemLabel: "tier",
      itemLabelKey: "label",
      defaultValue: DEFAULT_EDITABLE_REGISTRATION_TIERS,
      defaultItem: {
        id: "REGULAR",
        label: "New Registration Tier",
        badge: "Standard",
        vnd: 13750000,
        usd: 550,
        description: "Conference pass with proceedings access.",
        requiresPaper: false,
        features: [{ text: "Technical sessions access" }],
      },
      itemFields: {
        id: {
          type: "select",
          label: "Billing category code",
          options: [
            { label: "Author Delegate", value: "AUTHOR" },
            { label: "IEEE Member", value: "IEEE_MEMBER" },
            { label: "Student Delegate", value: "STUDENT" },
            { label: "Regular Delegate", value: "REGULAR" },
          ],
        },
        label: text("Display title"),
        badge: text("Top badge"),
        vnd: { type: "number", label: "Amount VND", min: 0 },
        usd: { type: "number", label: "Amount USD", min: 0 },
        description: paragraph("Short description"),
        requiresPaper: { type: "switch", label: "Require PaperCept Paper ID" },
        features: {
          type: "array",
          label: "Included features",
          itemLabel: "feature",
          itemLabelKey: "text",
          defaultItem: { text: "Access to technical sessions" },
          itemFields: { text: text("Feature label") },
        },
      },
    },
  },

  TechnicalSessionsBlock: {
    title: text("Section title", {
      defaultValue: "Technical Sessions & Symposium Schedule",
    }),
    subtitle: paragraph("Subtitle", {
      defaultValue:
        "Browse the daily agenda for plenary keynotes, paper tracks, and industry panels",
    }),
    syncFromDatabase: {
      type: "switch",
      label: "Hydrate from saved sessions database",
      defaultValue: true,
    },
    sessions: {
      type: "array",
      label: "Program sessions",
      itemLabel: "session",
      itemLabelKey: "title",
      defaultValue: DEFAULT_TECHNICAL_SESSIONS,
      defaultItem: {
        id: "new-session",
        code: "ThA03",
        title: "New Technical Session",
        track: "SSE",
        trackName: "Systems Science & Engineering",
        day: "2027-10-07",
        dayLabel: "Day 1 · Oct 7, 2027",
        timeSlot: "14:00 – 15:30",
        room: "Grand Ballroom A",
        chair: "Prof. Session Chair",
        coChair: "",
        papers: [
          {
            id: "SMC27-901",
            title: "Sample Contributed Paper Title",
            authors: "Author Name, Co-Author Name",
            time: "14:00 – 14:20",
          },
        ],
      },
      itemFields: {
        id: text("Session ID"),
        code: text("Session code"),
        title: text("Session title"),
        track: {
          type: "select",
          label: "Track code",
          options: [
            { label: "SSE — Systems Science & Engineering", value: "SSE" },
            { label: "CYB — Cybernetics", value: "CYB" },
            { label: "HMS — Human-Machine Systems", value: "HMS" },
            { label: "SS — Special Sessions", value: "SS" },
            { label: "WS — Workshops", value: "WS" },
          ],
        },
        trackName: text("Track label"),
        day: text("ISO date"),
        dayLabel: text("Day label"),
        timeSlot: text("Time slot"),
        room: text("Room location"),
        chair: text("Session chair"),
        coChair: text("Co-chair"),
        papers: {
          type: "array",
          label: "Scheduled papers",
          itemLabel: "paper",
          itemLabelKey: "title",
          defaultItem: {
            id: "SMC27-NEW",
            title: "New Contributed Paper",
            authors: "Author Names",
            time: "14:00 – 14:20",
          },
          itemFields: {
            id: text("Paper ID"),
            title: paragraph("Paper title"),
            authors: text("Authors"),
            time: text("Time slot"),
          },
        },
      },
    },
    showCta: {
      type: "switch",
      label: "Show author schedule inquiry card",
      defaultValue: true,
    },
    ctaTitle: text("Bottom card heading", {
      defaultValue: "Authors & Presenters Scheduling Notice",
    }),
    ctaDescription: paragraph("Bottom card description", {
      defaultValue:
        "Authors of accepted papers can contact the Program Chair to request time-slot adjustments due to international travel schedules.",
    }),
    ctaButtonLabel: text("Bottom button label", {
      defaultValue: "Contact Program Chair",
    }),
    ctaButtonUrl: text("Bottom button URL", {
      defaultValue: `mailto:${CONFERENCE_INFO.contactEmail}`,
    }),
  },
};
