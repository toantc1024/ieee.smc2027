export interface NavSubItem {
  id: string;
  title: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
  isExternal?: boolean;
}

export interface NavColumnItem {
  id: string;
  title: string;
  links: NavSubItem[];
}

export interface NavPromoCard {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: string;
  ctaText?: string;
}

export interface NavLinkItem {
  id: string;
  name: string;
  href: string;
  type?: "link" | "dropdown" | "mega";
  children?: NavSubItem[];
  columns?: NavColumnItem[];
  promoCard?: NavPromoCard;
}

export interface HeaderConfig {
  topbar: {
    enabled: boolean;
    hotline: string;
    hotlineRaw: string;
    email: string;
    hostBadgeText: string;
    societyBadgeText: string;
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
}

export const TOPBAR_NAV_ITEMS = [
  { id: "top-news", label: "News", href: "/#news" },
  { id: "top-sponsors", label: "Partnership & Exhibition", href: "/#sponsors" },
];

export const DEFAULT_HEADER_DATA: HeaderConfig = {
  topbar: {
    enabled: true,
    hotline: "+84 981 479 507",
    hotlineRaw: "+84981479507",
    email: "ieeesmc2027@hcmute.edu.vn",
    hostBadgeText: "Host: HCM-UTE (Vietnam)",
    societyBadgeText: "IEEE SMC Society (Global)",
  },
  brand: {
    conferenceTitle: "IEEE SMC 2027",
    conferenceSubtitle: "Ho Chi Minh City, Vietnam • October 6–10, 2027",
  },
  navLinks: [
    {
      id: "nav-committees",
      name: "Committees",
      href: "/committees",
      type: "mega",
      columns: [
        {
          id: "col-comm-exec",
          title: "Leadership & Steering",
          links: [
            {
              id: "sub-comm-directory",
              title: "Complete Committee Directory",
              href: "/committees",
              description: "Full directory of chairs, advisory, and organizing committee",
              icon: "Users",
              badge: "Full List",
            },
            {
              id: "sub-comm-general",
              title: "Honorary & General Chairs",
              href: "/#welcome",
              description: "Conference executive chairs and international advisory board",
              icon: "Award",
            },
            {
              id: "sub-comm-steering",
              title: "IEEE SMC Steering Committee",
              href: "/committees",
              description: "International leaders overseeing IEEE SMC Society conference governance",
              icon: "Globe",
            },
          ],
        },
        {
          id: "col-comm-tech",
          title: "Technical & Local Organization",
          links: [
            {
              id: "sub-comm-tpc",
              title: "Technical Program Committee",
              href: "/committees",
              description: "Leading researchers managing peer review across all tracks",
              icon: "Layers",
            },
            {
              id: "sub-comm-local",
              title: "HCM-UTE Local Organizing Committee",
              href: "/committees",
              description: "Host university operational leadership in Ho Chi Minh City",
              icon: "School",
              badge: "HCM-UTE",
            },
            {
              id: "sub-comm-secretariat",
              title: "Secretariat & Support Desk",
              href: "/#contact",
              description: "Official secretariat contacts, inquiries, and participant support",
              icon: "Phone",
            },
          ],
        },
      ],
      promoCard: {
        title: "Meet the SMC 2027 Leadership",
        description: "Distinguished IEEE Fellows, university leaders, and global research pioneers.",
        image: "/assets/cta-background.webp",
        href: "/committees",
        badge: "Leadership Directory",
        ctaText: "View Committees",
      },
    },
    {
      id: "nav-submissions",
      name: "Submissions",
      href: "/#cfp",
      type: "mega",
      columns: [
        {
          id: "col-cfp-info",
          title: "Call for Papers & Deadlines",
          links: [
            {
              id: "sub-cfp-call",
              title: "Call for Papers (CFP)",
              href: "/#cfp",
              description: "Submission guidelines, topics of interest, and publishing standards",
              icon: "FileText",
              badge: "Open",
            },
            {
              id: "sub-cfp-sessions",
              title: "Special Sessions & Workshops",
              href: "/#tracks",
              description: "Proposals for specialized symposiums and workshop tracks",
              icon: "BookOpen",
            },
            {
              id: "sub-cfp-deadlines",
              title: "Important Deadlines",
              href: "/#dates",
              description: "Paper submission, acceptance notification, and final camera-ready dates",
              icon: "Calendar",
            },
          ],
        },
        {
          id: "col-cfp-resources",
          title: "Author Guidelines & Portals",
          links: [
            {
              id: "sub-cfp-templates",
              title: "Manuscript Templates (LaTeX & Word)",
              href: "/#templates",
              description: "Download official IEEE double-column conference formats",
              icon: "FileDown",
            },
            {
              id: "sub-cfp-portal",
              title: "Online Submission Portal",
              href: "/#cfp",
              description: "Official online submission system for blind peer review",
              icon: "ExternalLink",
              isExternal: true,
            },
            {
              id: "sub-cfp-policy",
              title: "IEEE Xplore Digital Library Policy",
              href: "https://www.ieee.org/",
              description: "Conference proceedings indexed in IEEE Xplore, EI, Scopus",
              icon: "Globe",
              isExternal: true,
            },
          ],
        },
      ],
      promoCard: {
        title: "Online Submission Portal",
        description: "Submit original manuscripts and special session papers for IEEE SMC 2027.",
        image: "/assets/cta-background.webp",
        href: "/#cfp",
        badge: "Submission Portal",
        ctaText: "Submit Paper",
      },
    },
    {
      id: "nav-program",
      name: "Program",
      href: "/#tracks",
      type: "mega",
      columns: [
        {
          id: "col-track-pillars",
          title: "3 Technical Pillars",
          links: [
            {
              id: "sub-track-sse",
              title: "Systems Science & Engineering (SSE)",
              href: "/#tracks",
              description: "Autonomous robotics, smart grids, control theory, complex systems",
              icon: "Cpu",
            },
            {
              id: "sub-track-cyb",
              title: "Cybernetics (CYB)",
              href: "/#tracks",
              description: "Artificial intelligence, deep learning, biomedical cybernetics",
              icon: "Bot",
            },
            {
              id: "sub-track-hms",
              title: "Human-Machine Systems (HMS)",
              href: "/#tracks",
              description: "Brain-machine interfaces, collaborative teaming, AR/VR",
              icon: "UserCheck",
            },
          ],
        },
        {
          id: "col-program-schedule",
          title: "Schedule & Highlights",
          links: [
            {
              id: "sub-prog-keynotes",
              title: "Plenary & Keynote Speakers",
              href: "/#dates",
              description: "Distinguished global keynote presentations and panel debates",
              icon: "Award",
            },
            {
              id: "sub-prog-sessions",
              title: "Special Sessions & Workshops",
              href: "/#tracks",
              description: "68+ peer-reviewed topics across 5 intensive conference days",
              icon: "Layers",
            },
            {
              id: "sub-prog-dates",
              title: "5-Day Technical Program (Oct 6–10)",
              href: "/#dates",
              description: "Master conference schedule, opening ceremony, and gala banquet",
              icon: "Calendar",
            },
          ],
        },
      ],
      promoCard: {
        title: "3 Pillars & 68 Technical Topics",
        description: "Explore the interdisciplinary convergence across Systems Science, Cybernetics, and HMS.",
        image: "/assets/cta-background.webp",
        href: "/#tracks",
        badge: "Technical Scope",
        ctaText: "Browse All Tracks",
      },
    },
    {
      id: "nav-registration",
      name: "Registration",
      href: "/#registration",
      type: "mega",
      columns: [
        {
          id: "col-reg-fees",
          title: "Registration Policies",
          links: [
            {
              id: "sub-reg-schedule",
              title: "Fee Schedule & Pricing",
              href: "/#registration",
              description: "Early bird, IEEE member, non-member, and student delegate pricing",
              icon: "CreditCard",
            },
            {
              id: "sub-reg-policy",
              title: "Author Registration Requirement",
              href: "/#registration",
              description: "Every accepted paper requires at least one author registration",
              icon: "Award",
            },
          ],
        },
        {
          id: "col-reg-pay",
          title: "Payment Gateways",
          links: [
            {
              id: "sub-reg-vietqr",
              title: "VietQR Instant Domestic Transfer",
              href: "/#registration",
              description: "Direct zero-fee mobile bank transfer with instant confirmation",
              icon: "QrCode",
              badge: "VietQR",
            },
            {
              id: "sub-reg-swift",
              title: "International SWIFT Bank Wire",
              href: "/#registration",
              description: "Official university bank transfer details for international delegates",
              icon: "Landmark",
            },
          ],
        },
      ],
      promoCard: {
        title: "Early Bird Registration",
        description: "Enjoy discounted registration fees when registering before the early bird deadline.",
        image: "/assets/cta-background.webp",
        href: "/#registration",
        badge: "Discount Available",
        ctaText: "View Fees",
      },
    },
    {
      id: "nav-travel",
      name: "Travel & Accommodation",
      href: "/travel",
      type: "mega",
      columns: [
        {
          id: "col-venue-hotel",
          title: "Hotel & Conference Venue",
          links: [
            {
              id: "sub-venue-sheraton",
              title: "Sheraton Saigon Grand Opera Hotel",
              href: "/travel#venue",
              description: "88 Dong Khoi, District 1, Ho Chi Minh City, Vietnam",
              icon: "Building2",
            },
            {
              id: "sub-venue-rooms",
              title: "Conference Halls & Accommodation",
              href: "/travel",
              description: "Special delegate room rates and conference session floor plans",
              icon: "Home",
            },
            {
              id: "sub-venue-transport",
              title: "Airport (SGN) & Local Transit",
              href: "/travel",
              description: "Airport pickup, taxi advice, Metro Line 1, and city transit",
              icon: "MapPin",
            },
          ],
        },
        {
          id: "col-venue-saigon",
          title: "City Sights & Travel Guide",
          links: [
            {
              id: "sub-venue-attractions",
              title: "Must-Visit Places in Saigon",
              href: "/travel#travel-attractions",
              description: "Ben Thanh Market, Post Office, Notre Dame, Cu Chi Tunnels & more",
              icon: "Compass",
              badge: "8 Sights",
            },
            {
              id: "sub-venue-visa",
              title: "Vietnam e-Visa & Entry Requirements",
              href: "/travel",
              description: "Official guide on 90-day multiple entry electronic visas",
              icon: "FileText",
            },
            {
              id: "sub-venue-explore",
              title: "Explore Ho Chi Minh City",
              href: "/travel",
              description: "Dynamic economic, cultural, and innovation hub of Vietnam",
              icon: "Sparkles",
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
