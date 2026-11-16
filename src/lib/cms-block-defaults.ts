import {
  COMMITTEE_GROUPS,
  CONFERENCE_INFO,
  CONFERENCE_STATS,
  FAQS,
  IMPORTANT_DATES,
  MUST_VISIT_ATTRACTIONS,
  TECHNICAL_TRACKS,
} from "@/data/conference";
import { CONFERENCE_BANK_INFO, REGISTRATION_FEES, type FeeTier } from "@/lib/conference-registration";
import { DEFAULT_FOOTER_CONFIG, normalizeFooterHref } from "@/lib/footer-config";

const OFFICIAL_DATES_DEFAULT = IMPORTANT_DATES.map((d) => ({
  id: d.id,
  title: d.title,
  date: d.date,
  originalDeadline: "",
  extendedDeadline: "",
  category: d.category,
  status: d.highlight ? "Key Deadline" : "Upcoming",
  highlight: Boolean(d.highlight),
}));

const REGISTRATION_RATES_DEFAULT = [
  {
    category: "IEEE Member (Author / Regular)",
    earlyBird: "$580",
    standard: "$680",
    late: "$750",
    note: "Full technical sessions, digital proceedings, coffee breaks, gala banquet",
    popular: true,
  },
  {
    category: "IEEE Non-Member (Author / Regular)",
    earlyBird: "$680",
    standard: "$780",
    late: "$850",
    note: "Full technical sessions, digital proceedings, coffee breaks, gala banquet",
    popular: false,
  },
  {
    category: "IEEE Student Member",
    earlyBird: "$380",
    standard: "$450",
    late: "$500",
    note: "Technical sessions, digital proceedings, lunches (Student ID required)",
    popular: false,
  },
  {
    category: "Student Non-Member",
    earlyBird: "$440",
    standard: "$510",
    late: "$560",
    note: "Technical sessions, digital proceedings, lunches (Student ID required)",
    popular: false,
  },
  {
    category: "IEEE Life Member",
    earlyBird: "$350",
    standard: "$400",
    late: "$450",
    note: "Full access to technical tracks & networking sessions",
    popular: false,
  },
];

export const SERVER_BLOCK_DEFAULTS: Record<string, Record<string, unknown>> = {
  HeroCarousel: {
    autoplayDuration: 7,
    showOverlayText: false,
    showIndicators: false,
    slides: [
      {
        id: 1,
        badge: "Flagship IEEE Global Conference",
        title: "IEEE SMC 2027",
        highlight: "Human-AI Symbiosis",
        subtitle:
          "2027 IEEE International Conference on Systems, Man, and Cybernetics • October 6–10, 2027",
        image: "/carousel/hero-desktop-smc2027.png",
        mobileImage: "/carousel/hero-mobile-smc2027.jpg",
        primaryAction: { label: "Call for Papers", href: "/submissions" },
        secondaryAction: { label: "Download CFP PDF", href: CONFERENCE_INFO.cfpPdfUrl },
      },
    ],
  },
  SubmissionCountdown: {
    title: "Paper Submission Deadline:",
    deadlineText: "April 08, 2027",
    iconImage: "/assets/3d/calendar-dates-3d.png",
    calendarEventTitle: "IEEE SMC 2027 Paper Submission Deadline",
    calendarDates: "20270408T165959Z/20270408T165959Z",
    calendarLocation: "Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam",
    primaryButtonLabel: "Author Guidelines",
    primaryButtonUrl: "#cfp",
    secondaryButtonLabel: "CFP PDF",
    cfpPdfUrl: CONFERENCE_INFO.cfpPdfUrl,
    showCalendarActions: true,
  },
  ConferenceHighlights: {
    items: CONFERENCE_STATS,
    showIndexingBanner: true,
    indexingTitle: "Global Indexing & Publication",
    indexingDescription:
      "All accepted and presented conference papers are submitted to IEEE Xplore and indexed in major global scientific databases.",
    indexingBadges: [
      { label: "IEEE Xplore" },
      { label: "Scopus" },
      { label: "EI Compendex" },
    ],
  },
  WelcomeLetter: {
    title: "Welcome Message from the General Chairs & Honorary Chairs",
    heading: "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
    subtitle: "Invitation from the IEEE SMC 2027 General Chairs & Organizing Leadership",
    conferenceName: "IEEE SMC 2027",
    salutation: "Dear Colleagues & Honored Participants,",
    theme: CONFERENCE_INFO.theme,
    datesLocation: "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
    closingText: "Warm regards,",
    showSignatures: true,
  },
  About: {
    theme: CONFERENCE_INFO.theme,
    publicationsTitle: "Affiliated IEEE SMC Publications",
  },
  CallForPapers: {
    title: "Call For Papers & Submission Guidelines",
    subtitle: "Submission Categories & Technical Topics • IEEE SMC 2027",
    cfpPdfUrl: CONFERENCE_INFO.cfpPdfUrl,
    submissionUrl: CONFERENCE_INFO.submissionPortal,
    submissionDeadline: "April 08, 2027",
    downloadButtonLabel: "Download Official CFP Brochure",
  },
  SubmissionPortalsBlock: {
    title: "Submission Portals & Electronic Tools",
    subtitle:
      "Submit manuscripts, validate PDF Xplore compliance, and sign copyright agreements",
    portals: [
      {
        name: "PaperCept Conference Management System",
        system: "PaperCept",
        badge: "Official Primary Portal",
        description:
          "Official manuscript submission system for IEEE SMC 2027. Submit Regular Papers, Special Session Papers, and Workshop Manuscripts.",
        url: "https://ras.papercept.net",
        buttonLabel: "Open PaperCept",
        primary: true,
      },
      {
        name: "IEEE PDF eXpress Verification",
        system: "PDF eXpress",
        badge: "Camera-Ready Check",
        description:
          "Mandatory IEEE Xplore compatibility verification tool for all accepted manuscripts prior to uploading the final camera-ready PDF.",
        url: "https://ieee-pdf-express.org",
        buttonLabel: "Open PDF eXpress",
        primary: false,
      },
      {
        name: "IEEE Electronic Copyright Form",
        system: "IEEE eCF",
        badge: "Copyright Transfer",
        description:
          "Completed directly through your PaperCept author workspace during final camera-ready manuscript submission.",
        url: "https://ras.papercept.net",
        buttonLabel: "Open IEEE eCF",
        primary: false,
      },
    ],
  },
  CfpPoliciesBlock: {
    title: "Call For Papers & Submission Policies",
    subtitle: "IEEE Systems, Man, and Cybernetics Society Review & Publication Standards",
    cfpPdfUrl: CONFERENCE_INFO.cfpPdfUrl,
    downloadButtonLabel: "Download Official CFP Brochure",
    policies: [
      {
        badge: "Electronic Submission",
        title: "Language & Format Specification",
        description: CONFERENCE_INFO.submissionNotice,
      },
      {
        badge: "Indexing & Publication",
        title: "IEEE Xplore & Copyright Policy",
        description: CONFERENCE_INFO.ieeeXploreNotice,
        linkLabel: "Official IEEE SMC Website",
        linkUrl: CONFERENCE_INFO.website,
      },
    ],
  },
  SubmissionCategoriesBlock: {
    title: "Submission Categories & Paper Types",
    subtitle:
      "Regular papers, special sessions, workshops, and tutorials across core conference tracks",
  },
  CfpBrochureBannerBlock: {
    title: "Complete IEEE SMC 2027 Call for Papers Brochure",
    description:
      "Download the authoritative specification for paper templates, special session guidelines, committees, and topics.",
    cfpPdfUrl: CONFERENCE_INFO.cfpPdfUrl,
    previewButtonLabel: "Preview PDF Specification",
    hidePreviewButtonLabel: "Hide PDF Preview",
    openButtonLabel: "Open PDF Document",
    defaultExpanded: false,
  },
  ConferenceTracksSection: {
    title: "Technical Tracks & 3 Core Pillars",
    subtitle: "Systems Science • Cybernetics • Human–Machine Systems",
    searchPlaceholder: "Search tracks, topics, or keywords...",
    pillars: TECHNICAL_TRACKS,
  },
  ImportantDatesSection: {
    title: "Important Dates",
    subtitle: "Key conference deadlines and milestone schedule for IEEE SMC 2027",
    colMilestoneLabel: "Milestone Event",
    colDeadlineLabel: "Submission Deadline",
    timezoneNotice: "All deadlines are 23:59 GMT-12 — Anywhere on Earth",
    ctaLabel: "View Submission Details",
    viewDetailsUrl: "#cfp",
    dates: OFFICIAL_DATES_DEFAULT,
  },
  CommitteesSection: {
    title: "Organizing Committee",
    titleAccent: "& Leadership",
    subtitle:
      "International Steering & Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
    autoplayDelay: 3500,
    groups: COMMITTEE_GROUPS,
  },
  PaperSubmissionGuidelinesSection: {
    title: "Author Submission Templates & Guidelines",
    subtitle:
      "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
  },
  KeynoteSpeakersSection: {
    title: "Keynote Speakers & Plenary Sessions",
    subtitle:
      "Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics",
    speakers: [],
    emptyTitle: "Plenary Keynote Speakers Announcement Coming Soon",
    themeLabel: "Theme Focus:",
    themeText: "Human–Machine Symbiosis & Intelligent Futures",
    ctaLabel: "Explore Call For Papers & Tracks",
    ctaUrl: "#cfp",
  },
  ScheduleTimelineSection: {
    title: "Conference Schedule & Daily Timeline",
    subtitle:
      "October 6–10, 2027 • Five days of cutting-edge research, keynotes, workshops, and networking",
    venueBadge: CONFERENCE_INFO.venue,
  },
  WorkshopTutorialSection: {
    title: "Workshops & Tutorial Proposals",
    subtitle:
      "Propose hands-on tutorials and specialized workshops preceding the main technical conference program",
    proposalDeadline: "February 15, 2027",
    contactEmail: CONFERENCE_INFO.contactEmail,
  },
  AwardsSection: {
    title: "IEEE SMC 2027 Conference Awards",
    subtitle:
      "Recognizing excellence in research rigor, student innovation, and scientific novelty",
  },
  PastConferencesSection: {
    title: "Past IEEE SMC Conferences",
    subtitle:
      "Discover the international heritage of the IEEE Systems, Man, and Cybernetics Society flagship annual conference",
  },
  RegistrationWizardBlock: {
    title: "Conference Registration Portal",
    subtitle: "Select delegate fee tier and complete participant registration",
    continueLabel: "Continue to Participant Details",
    defaultCurrency: "VND",
    extraPageVnd: 3750000,
    extraPageUsd: 150,
    extraBanquetVnd: 2250000,
    extraBanquetUsd: 90,
    tiers: (Object.values(REGISTRATION_FEES) as FeeTier[]).map((tier) => ({
      id: tier.id,
      label: tier.label,
      badge: tier.badge,
      vnd: tier.vnd,
      usd: tier.usd,
      description: tier.description,
      requiresPaper: tier.requiresPaper,
      features: tier.features.map((text) => ({ text })),
    })),
  },
  RegistrationFeeTableBlock: {
    title: "Registration & Fee Schedule",
    subtitle:
      "Official registration fee schedule and entitlements for IEEE SMC 2027 participants and authors",
    scheduleHeading: "Registration Fee Schedule",
    earlyBirdNote:
      "All prices in USD. Early bird registration deadline: July 05, 2027",
    includedBadge: "IEEE Scopus & Xplore Proceedings Included",
    rates: REGISTRATION_RATES_DEFAULT,
  },
  PaymentChannelsBlock: {
    title: "Accepted Payment Channels & Wire Instructions",
    subtitle:
      "Secure bank transfer, SWIFT international wire, and online card settlement",
    channels: [
      {
        iconType: "bank",
        badge: "Domestic Vietnam",
        title: "Domestic Bank Transfer",
        description:
          "For authors and delegates in Vietnam paying registration fees via VietQR or Napas 24/7 interbank transfer.",
        details: [
          { label: "Beneficiary Organization", value: CONFERENCE_BANK_INFO.accountName },
          {
            label: "Account Number",
            value: CONFERENCE_BANK_INFO.accountNo,
            copyValue: CONFERENCE_BANK_INFO.accountNo,
          },
          { label: "Bank Name", value: CONFERENCE_BANK_INFO.bankName },
          {
            label: "Payment Reference",
            value: "SMC2027 PaperID Author Name",
            copyValue: "SMC2027 [PaperID] [Author Name]",
          },
        ],
        footerLeft: "VAT e-Invoice Available",
        footerRight: "Automated Reconciliation",
      },
      {
        iconType: "globe",
        badge: "International Authors",
        title: "International Wire Transfer",
        description:
          "Recommended for international overseas wire payments in USD. Sender covers intermediary remittance fees.",
        details: [
          { label: "Beneficiary Name", value: CONFERENCE_BANK_INFO.accountName },
          {
            label: "Beneficiary Bank",
            value: "Joint Stock Commercial Bank for Foreign Trade of Vietnam",
          },
          {
            label: "SWIFT Code",
            value: CONFERENCE_BANK_INFO.swiftBic,
            copyValue: CONFERENCE_BANK_INFO.swiftBic,
          },
          { label: "Payment Reference", value: "IEEE SMC 2027 - Paper ID" },
        ],
        footerLeft: "Currency: USD",
        footerRight: "SWIFT Verified",
      },
      {
        iconType: "card",
        badge: "Online Portal",
        title: "Payoo & International Cards",
        description:
          "Pay securely with Visa, Mastercard, JCB, or domestic ATM cards with automatic invoice generation.",
        details: [],
        tags: [
          { label: "Visa / Mastercard" },
          { label: "JCB / UnionPay" },
          { label: "VietQR Instant" },
        ],
        ctaLabel: "Open Online Checkout",
        ctaUrl: "/registration",
        footerLeft: "PCI-DSS Compliant",
        footerRight: "Instant Confirmation",
      },
    ],
  },
  VatInvoiceNoticeBlock: {
    title: "Electronic Financial Invoice & Tax Receipt Issuance",
    description:
      "Authors needing official financial invoices for institutional reimbursement should provide institution tax identification and billing details to the secretariat with payment proof.",
    email: CONFERENCE_INFO.contactEmail,
    buttonLabel: "Request Invoice Receipt",
    emailSubject: "IEEE SMC 2027 VAT Invoice Request",
  },
  RegistrationFeesSection: {
    title: "Registration & Payment Methods",
    subtitle:
      "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
    rates: REGISTRATION_RATES_DEFAULT,
  },
  VenueLocationSection: {
    title: "Travel & Accommodation & Ho Chi Minh City Guide",
    venueName: CONFERENCE_INFO.venue,
    address: CONFERENCE_INFO.address,
    googleMapsUrl: CONFERENCE_INFO.googleMapsUrl,
    image: "/images/sheraton-saigon-card.jpg",
    attractions: MUST_VISIT_ATTRACTIONS,
  },
  VenueOverviewBlock: {
    title: "Conference Venue & Host City",
    subtitle: "Official Hotel & Destination Guide for Delegates Attending IEEE SMC 2027",
    venueName: CONFERENCE_INFO.venue,
    address: CONFERENCE_INFO.address,
    hostInstitution: CONFERENCE_INFO.host,
    contactEmail: CONFERENCE_INFO.contactEmail,
    hotline: CONFERENCE_INFO.hotline,
    image: "/images/sheraton-saigon-card.jpg",
    googleMapsUrl: CONFERENCE_INFO.googleMapsUrl,
    hotelBookingUrl:
      "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
    visaUrl: CONFERENCE_INFO.visaUrl,
    travelGuideUrl: "/travel",
  },
  TransitLogisticsBlock: {
    title: "Transit & Arrival Logistics",
    subtitle:
      "Visa entry guidance, airport transfers, and downtown District 1 connectivity",
  },
  CityAttractionsBlock: {
    title: "Must-Visit Heritage & Cultural Places in Ho Chi Minh City",
    subtitle:
      "Explore iconic Saigon architecture, museums, and dining around District 1",
    attractions: MUST_VISIT_ATTRACTIONS,
  },
  VisitorInfoBlock: {
    title: "Local Weather, Transport & Practicalities",
    subtitle:
      "Practical information for international visitors arriving in Ho Chi Minh City",
  },
  TravelAccommodationSection: {
    title: "Travel & Accommodation Guide",
    subtitle:
      "Information for attendees traveling to Ho Chi Minh City, airport transit, and hotel accommodations",
    hotelBookingUrl:
      "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
    airportDistance: "7 km (~20–30 mins from Tan Son Nhat Airport)",
  },
  VisaInformationSection: {
    title: "Vietnam Visa & Entry Requirements",
    subtitle:
      "Complete travel and entry guidance for international delegates attending IEEE SMC 2027 in Ho Chi Minh City",
    evisaUrl: CONFERENCE_INFO.visaUrl,
    visaLetterEmail: CONFERENCE_INFO.contactEmail,
  },
  MediaGallerySection: {
    title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
    subtitle:
      "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global collaboration.",
    videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
    qqVideoVid: "x3508h1k2m9",
    viewDetailsUrl: "#venue",
    venueName: CONFERENCE_INFO.venue,
  },
  SponsorshipSection: {
    title: "Sponsors & Partners & Supporting Societies",
    subtitle: "Partners & Organizing Institutions Supporting IEEE SMC 2027",
  },
  FaqAccordionSection: {
    title: "Frequently Asked Questions & Help",
    subtitle: "Author & Attendee Assistance • Conference Policies & Guidance",
    items: FAQS,
  },
  ContactSupportSection: {
    title: "Contact the Organizing Secretariat",
    subtitle:
      "Have questions regarding paper submissions, proposals, or conference participation? We are here to assist you.",
    email: CONFERENCE_INFO.contactEmail,
    location: CONFERENCE_INFO.location,
    venue: CONFERENCE_INFO.venue,
    address: CONFERENCE_INFO.address,
    hotline: CONFERENCE_INFO.hotline,
    googleMapsUrl: CONFERENCE_INFO.googleMapsUrl,
    website: CONFERENCE_INFO.website,
  },
  NewsList: {
    title: "Conference News & Announcements",
    subtitle:
      "Stay updated with the latest milestones, partnership alerts, and program schedules",
  },
  CfpSubscribe: {
    title: "Receive CFP Updates & Deadline Alerts",
    subtitle:
      "Subscribe for official alerts on submission deadlines, keynote announcements, and registration milestones.",
    buttonLabel: "Subscribe",
    successMessage: "You will receive IEEE SMC 2027 milestone alerts at",
  },
  TechnicalSessionsBlock: {
    title: "Technical Sessions & Symposium Schedule",
    subtitle:
      "Browse the daily agenda for plenary keynotes, paper tracks, and industry panels",
    syncFromDatabase: true,
  },
  FooterSection: DEFAULT_FOOTER_CONFIG as unknown as Record<string, unknown>,
};

const SERVER_ALIASES: Record<string, string> = {
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
  Hero: "HeroCarousel",
  FAQ: "FaqAccordionSection",
};

/**
 * Hydrate missing props on a block on the server without importing `"use client"` registries.
 */
export function hydrateBlockPropsServer(
  type: string,
  existingProps: Record<string, unknown> | undefined
): Record<string, unknown> {
  const canonical = SERVER_ALIASES[type] || type;
  const defaults = SERVER_BLOCK_DEFAULTS[canonical] || {};
  const next: Record<string, unknown> = existingProps ? { ...existingProps } : {};

  for (const [k, v] of Object.entries(defaults)) {
    if (next[k] === undefined) {
      next[k] = structuredClone(v);
    }
  }

  if (canonical === "FooterSection" && Array.isArray(next.linkGroups)) {
    next.linkGroups = next.linkGroups.map((group) => {
      if (!group || typeof group !== "object") return group;
      const g = group as Record<string, unknown>;
      return {
        ...g,
        links: Array.isArray(g.links)
          ? g.links.map((l) =>
              l && typeof l === "object" && typeof (l as Record<string, unknown>).href === "string"
                ? {
                    ...(l as Record<string, unknown>),
                    href: normalizeFooterHref(String((l as Record<string, unknown>).href)),
                  }
                : l
            )
          : [],
      };
    });
  }

  return next;
}

export function hydrateBlocksServer<
  T extends { type?: string; props?: Record<string, unknown> }
>(blocks: T[]): T[] {
  return blocks.map((b) => {
    if (!b || typeof b !== "object" || !b.type) return b;
    const isEmpty = !b.props || Object.keys(b.props).length === 0;
    if (!isEmpty) return b;
    return {
      ...b,
      props: hydrateBlockPropsServer(b.type, b.props),
    };
  });
}
