export interface NavSubItem {
  id: string;
  title: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
  isExternal?: boolean;
  featured?: boolean;
  wordWrap?: boolean;
}

export interface NavPromoCard {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: string;
  ctaText?: string;
}

export interface NavColumnItem {
  id: string;
  title: string;
  type?: "category-links" | "promo-card";
  links: NavSubItem[];
  promoCard?: NavPromoCard;
  promoPosition?: "top" | "bottom";
}

export interface NavLinkItem {
  id: string;
  name: string;
  href: string;
  type?: "link" | "dropdown" | "mega";
  position?: "left" | "right";
  isExternal?: boolean;
  children?: NavSubItem[];
  columns?: NavColumnItem[];
  promoCard?: NavPromoCard;
}

export interface TopbarQuickLink {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export type HeaderVariant = "left-aligned" | "centered" | "stacked" | "minimal";

export interface HeaderConfig {
  variant?: HeaderVariant;
  sticky?: boolean;
  logoUrl?: string;
  mobileLogoUrl?: string;
  topbar: {
    enabled: boolean;
    hotline: string;
    hotlineRaw: string;
    email: string;
    hostBadgeText: string;
    societyBadgeText: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
    quickLinks?: TopbarQuickLink[];
  };
  brand: {
    conferenceTitle: string;
    conferenceSubtitle: string;
  };
  navLinks: NavLinkItem[];
  ctaButton: {
    enabled: boolean;
    label: string;
    href: string;
  };
  mobileHeader?: {
    showSearch?: boolean;
    searchPlaceholder?: string;
  };
}

export const TOPBAR_NAV_ITEMS: TopbarQuickLink[] = [
  { id: "top-news", label: "News", href: "/#news" },
  { id: "top-sponsors", label: "Partnership & Exhibition", href: "/#sponsors" },
  {
    id: "top-cfp-pdf",
    label: "CFP PDF",
    href: "/cfp-ieee-smc-2027.pdf",
    isExternal: true,
  },
];

export const DEFAULT_HEADER_DATA: HeaderConfig = {
  variant: "left-aligned",
  sticky: true,
  logoUrl: "/logo/rectangle-logo.png",
  mobileLogoUrl: "/logo/square-logo.png",
  topbar: {
    enabled: true,
    hotline: "+84 981 479 507",
    hotlineRaw: "+84981479507",
    email: "ieeesmc2027@hcmute.edu.vn",
    hostBadgeText: "Host: HCM-UTE Vietnam",
    societyBadgeText: "IEEE SMC Society",
    showSearch: true,
    searchPlaceholder: "Search conference, tracks...",
    quickLinks: TOPBAR_NAV_ITEMS,
  },
  brand: {
    conferenceTitle: "IEEE SMC 2027",
    conferenceSubtitle: "Ho Chi Minh City, Vietnam • October 6–10, 2027",
  },
  mobileHeader: {
    showSearch: true,
    searchPlaceholder: "Search tracks, authors, venue, CFP...",
  },
  navLinks: [
    {
      id: "nav-home",
      name: "Home",
      href: "/",
      type: "link",
      position: "left",
    },
    {
      id: "nav-committees",
      name: "Committees",
      href: "/committees",
      type: "link",
      position: "left",
    },
    {
      id: "nav-submissions",
      name: "Submissions",
      href: "/#cfp",
      type: "mega",
      position: "left",
      columns: [
        {
          id: "col-cfp-info",
          title: "Call for Papers & Deadlines",
          type: "category-links",
          links: [
            {
              id: "sub-cfp-call",
              title: "Call for Papers",
              href: "/#cfp",
              description: "Submission guidelines, topics of interest, and publishing standards",
              icon: "FileText",
              badge: "Open",
              wordWrap: true,
            },
            {
              id: "sub-cfp-sessions",
              title: "Special Sessions & Workshops",
              href: "/#tracks",
              description: "Proposals for specialized symposiums and workshop tracks",
              icon: "BookOpen",
              wordWrap: true,
            },
            {
              id: "sub-cfp-deadlines",
              title: "Important Deadlines",
              href: "/#dates",
              description: "Paper submission, acceptance notification, and final camera-ready dates",
              icon: "Calendar",
              wordWrap: true,
            },
          ],
        },
        {
          id: "col-cfp-resources",
          title: "Author Guidelines & Portals",
          type: "category-links",
          links: [
            {
              id: "sub-cfp-templates",
              title: "Manuscript Templates",
              href: "/#templates",
              description: "Download official IEEE double-column conference formats",
              icon: "FileDown",
              wordWrap: true,
            },
            {
              id: "sub-cfp-portal",
              title: "Online Submission Portals",
              href: "/submissions",
              description: "Official submission links, formatting guidelines & templates",
              icon: "ExternalLink",
              badge: "Portals",
              wordWrap: true,
            },
            {
              id: "sub-cfp-policy",
              title: "IEEE Xplore Digital Library Policy",
              href: "https://www.ieee.org/",
              description: "Conference proceedings indexed in IEEE Xplore, EI, Scopus",
              icon: "Globe",
              isExternal: true,
              wordWrap: true,
            },
          ],
        },
      ],
      promoCard: {
        title: "Online Submission Portal",
        description: "Submit original manuscripts and special session papers for IEEE SMC 2027.",
        image: "/assets/cta-background.webp",
        href: "/submissions",
        badge: "Submission Portal",
        ctaText: "Submit Paper",
      },
    },
    {
      id: "nav-program",
      name: "Program",
      href: "/program/sessions",
      type: "mega",
      position: "right",
      columns: [
        {
          id: "col-track-pillars",
          title: "3 Technical Pillars",
          type: "category-links",
          links: [
            {
              id: "sub-track-sse",
              title: "Systems Science & Engineering",
              href: "/program/sessions?track=SSE",
              description: "Autonomous robotics, smart grids, control theory, complex systems",
              icon: "Cpu",
              wordWrap: true,
            },
            {
              id: "sub-track-cyb",
              title: "Cybernetics",
              href: "/program/sessions?track=CYB",
              description: "Artificial intelligence, deep learning, biomedical cybernetics",
              icon: "Bot",
              wordWrap: true,
            },
            {
              id: "sub-track-hms",
              title: "Human-Machine Systems",
              href: "/program/sessions?track=HMS",
              description: "Brain-machine interfaces, collaborative teaming, AR/VR",
              icon: "UserCheck",
              wordWrap: true,
            },
          ],
        },
        {
          id: "col-program-schedule",
          title: "Schedule & Highlights",
          type: "category-links",
          links: [
            {
              id: "sub-prog-parallel",
              title: "Technical Sessions Schedule",
              href: "/program/sessions",
              description: "Detailed schedule of parallel technical sessions by hall and time slot",
              icon: "Layers",
              badge: "Parallel",
              wordWrap: true,
            },
            {
              id: "sub-prog-keynotes",
              title: "Plenary & Keynote Speakers",
              href: "/#dates",
              description: "Distinguished global keynote presentations and panel debates",
              icon: "Award",
              wordWrap: true,
            },
            {
              id: "sub-prog-dates",
              title: "5-Day Technical Program",
              href: "/#dates",
              description: "Master conference schedule, opening ceremony, and gala banquet",
              icon: "Calendar",
              wordWrap: true,
            },
          ],
        },
      ],
      promoCard: {
        title: "Parallel Sessions Schedule",
        description: "Explore the technical presentations across Systems Science, Cybernetics, and HMS.",
        image: "/assets/cta-background.webp",
        href: "/program/sessions",
        badge: "Technical Scope",
        ctaText: "Browse Schedule",
      },
    },
    {
      id: "nav-travel",
      name: "Travel & Accommodation",
      href: "/travel",
      type: "mega",
      position: "right",
      columns: [
        {
          id: "col-venue-hotel",
          title: "Hotel & Conference Venue",
          type: "category-links",
          links: [
            {
              id: "sub-venue-sheraton",
              title: "Sheraton Saigon Grand Opera Hotel",
              href: "/travel#venue",
              description: "88 Dong Khoi, District 1, Ho Chi Minh City, Vietnam",
              icon: "Building2",
              wordWrap: true,
            },
            {
              id: "sub-venue-rooms",
              title: "Conference Halls & Accommodation",
              href: "/travel",
              description: "Special delegate room rates and conference session floor plans",
              icon: "Home",
              wordWrap: true,
            },
            {
              id: "sub-venue-transport",
              title: "Airport & Local Transit",
              href: "/travel",
              description: "Airport pickup, taxi advice, Metro Line 1, and city transit",
              icon: "MapPin",
              wordWrap: true,
            },
          ],
        },
        {
          id: "col-venue-saigon",
          title: "City Sights & Travel Guide",
          type: "category-links",
          links: [
            {
              id: "sub-venue-attractions",
              title: "Must-Visit Places in Saigon",
              href: "/travel#travel-attractions",
              description: "Ben Thanh Market, Post Office, Notre Dame, Cu Chi Tunnels & more",
              icon: "Compass",
              badge: "8 Sights",
              wordWrap: true,
            },
            {
              id: "sub-venue-visa",
              title: "Vietnam e-Visa & Entry Requirements",
              href: "/travel",
              description: "Official guide on 90-day multiple entry electronic visas",
              icon: "FileText",
              wordWrap: true,
            },
            {
              id: "sub-venue-explore",
              title: "Explore Ho Chi Minh City",
              href: "/travel",
              description: "Dynamic economic, cultural, and innovation hub of Vietnam",
              icon: "Globe",
              wordWrap: true,
            },
          ],
        },
      ],
      promoCard: {
        title: "Must-Visit Places in Ho Chi Minh City",
        description: "Discover iconic landmarks including Ben Thanh Market, Central Post Office, and Cu Chi Tunnels.",
        image: "/images/attractions/post-office.jpg",
        href: "/travel",
        badge: "Host Destination",
        ctaText: "Explore Sights",
      },
    },
  ],
  ctaButton: {
    enabled: true,
    label: "Submit Paper",
    href: "/#cfp",
  },
};

/** Normalize legacy or partial HeaderConfig into a consistent studio-ready structure. */
export function normalizeHeaderConfig(raw?: Partial<HeaderConfig> | null): HeaderConfig {
  const source = raw || {};
  const rawLinks = Array.isArray(source.navLinks) && source.navLinks.length > 0
    ? source.navLinks
    : DEFAULT_HEADER_DATA.navLinks;

  const normalizedLinks: NavLinkItem[] = rawLinks.map((link, index) => {
    const inferredPosition: "left" | "right" =
      link.position === "left" || link.position === "right"
        ? link.position
        : index < Math.ceil(rawLinks.length / 2)
        ? "left"
        : "right";

    let columns: NavColumnItem[] = Array.isArray(link.columns)
      ? link.columns.map((col) => ({
          ...col,
          type: col.type || (col.promoCard && (!col.links || col.links.length === 0) ? "promo-card" : "category-links"),
          links: Array.isArray(col.links) ? col.links : [],
        }))
      : [];

    if (columns.length === 0 && Array.isArray(link.children) && link.children.length > 0) {
      columns = [
        {
          id: `${link.id}-col-1`,
          title: link.name || "Links",
          type: "category-links",
          links: link.children,
        },
      ];
    }

    const inferredType: "link" | "dropdown" | "mega" =
      link.type || (columns.length > 0 ? "mega" : "link");

    return {
      ...link,
      type: inferredType,
      position: inferredPosition,
      columns,
    };
  });

  return {
    variant: source.variant || DEFAULT_HEADER_DATA.variant,
    sticky: source.sticky !== undefined ? source.sticky : DEFAULT_HEADER_DATA.sticky,
    logoUrl: source.logoUrl || DEFAULT_HEADER_DATA.logoUrl,
    mobileLogoUrl: source.mobileLogoUrl || DEFAULT_HEADER_DATA.mobileLogoUrl,
    topbar: {
      ...DEFAULT_HEADER_DATA.topbar,
      ...(source.topbar || {}),
      quickLinks:
        Array.isArray(source.topbar?.quickLinks) && source.topbar.quickLinks.length > 0
          ? source.topbar.quickLinks
          : source.topbar?.quickLinks === undefined
          ? DEFAULT_HEADER_DATA.topbar.quickLinks
          : [],
    },
    brand: {
      ...DEFAULT_HEADER_DATA.brand,
      ...(source.brand || {}),
    },
    navLinks: normalizedLinks,
    ctaButton: {
      ...DEFAULT_HEADER_DATA.ctaButton,
      ...(source.ctaButton || {}),
    },
    mobileHeader: {
      ...DEFAULT_HEADER_DATA.mobileHeader,
      ...(source.mobileHeader || {}),
    },
  };
}
