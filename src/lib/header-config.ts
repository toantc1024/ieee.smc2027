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
      id: "nav-about",
      name: "About",
      href: "/#about",
      type: "mega",
      columns: [
        {
          id: "col-about-overview",
          title: "Overview & Vision",
          links: [
            {
              id: "sub-about-smc",
              title: "About IEEE SMC 2027",
              href: "/#about",
              description: "Flagship conference theme, scope, and international vision",
              icon: "Info",
            },
            {
              id: "sub-about-welcome",
              title: "Welcome Letter from General Chairs",
              href: "/#welcome",
              description: "Official welcome message from conference leadership",
              icon: "FileText",
            },
            {
              id: "sub-about-video",
              title: "Conference Spotlight Video",
              href: "/#video",
              description: "Venue teaser and welcoming video from Saigon",
              icon: "Video",
            },
          ],
        },
        {
          id: "col-about-host",
          title: "Host Institution & Society",
          links: [
            {
              id: "sub-about-hcmute",
              title: "HCM-UTE Host University",
              href: "https://hcmute.edu.vn",
              description: "Vietnam's premier technical engineering university",
              icon: "School",
              isExternal: true,
            },
            {
              id: "sub-about-society",
              title: "IEEE Systems, Man, and Cybernetics Society",
              href: "https://www.ieeesmc.org/",
              description: "Global community dedicated to theory and practice of SMC",
              icon: "Globe",
              isExternal: true,
            },
            {
              id: "sub-about-hcmc",
              title: "Host City: Ho Chi Minh City",
              href: "/#venue",
              description: "Dynamic economic, cultural, and innovation hub of Vietnam",
              icon: "Landmark",
            },
          ],
        },
      ],
      promoCard: {
        title: "Sheraton Saigon Grand Opera Hotel",
        description: "5-star luxury conference venue at 88 Dong Khoi, District 1, Ho Chi Minh City.",
        image: "/assets/cta-background.webp",
        href: "/#venue",
        badge: "Host Venue",
        ctaText: "Explore Venue",
      },
    },
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
          ],
        },
        {
          id: "col-comm-tech",
          title: "Technical & Organization",
          links: [
            {
              id: "sub-comm-tpc",
              title: "Technical Program Committee",
              href: "/committees",
              description: "Leading researchers managing peer review across all tracks",
              icon: "Layers",
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
      id: "nav-authors",
      name: "Authors & CFP",
      href: "/#cfp",
      type: "mega",
      columns: [
        {
          id: "col-cfp-info",
          title: "Submissions & Categories",
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
          title: "Author Templates & Portals",
          links: [
            {
              id: "sub-cfp-templates",
              title: "Manuscript Templates (LaTeX & Word)",
              href: "/#templates",
              description: "Download official IEEE double-column conference formats",
              icon: "FileDown",
            },
            {
              id: "sub-cfp-papercept",
              title: "PaperCept Submission Portal",
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
        title: "PaperCept Submission Portal",
        description: "Submit original manuscripts and special session papers for IEEE SMC 2027.",
        image: "/assets/cta-background.webp",
        href: "/#cfp",
        badge: "Submission Portal",
        ctaText: "Submit Paper",
      },
    },
    {
      id: "nav-tracks",
      name: "Tracks & Topics",
      href: "/#tracks",
      type: "mega",
      columns: [
        {
          id: "col-track-sse",
          title: "Systems Science & Engineering (SSE)",
          links: [
            {
              id: "sub-sse-autonomous",
              title: "Autonomous Systems & Robotics",
              href: "/#tracks",
              description: "Unmanned aerial vehicles, autonomous mobile robots, perception",
              icon: "Bot",
            },
            {
              id: "sub-sse-smart",
              title: "Smart Infrastructure & Transportation",
              href: "/#tracks",
              description: "Intelligent transport systems, smart grids, resilient infrastructure",
              icon: "Building2",
            },
            {
              id: "sub-sse-control",
              title: "Control Theory & Complex Systems",
              href: "/#tracks",
              description: "System of systems, adaptive control, mathematical modeling",
              icon: "Cpu",
            },
          ],
        },
        {
          id: "col-track-cyb",
          title: "Cybernetics (CYB)",
          links: [
            {
              id: "sub-cyb-ai",
              title: "Artificial Intelligence & Machine Learning",
              href: "/#tracks",
              description: "Deep learning, foundation models, explainable AI, neural computing",
              icon: "Bot",
            },
            {
              id: "sub-cyb-medical",
              title: "Bio-Cybernetics & Medical Systems",
              href: "/#tracks",
              description: "Computational healthcare, biomedical signals, diagnostic AI",
              icon: "Stethoscope",
            },
            {
              id: "sub-cyb-security",
              title: "Cyber-Physical Security & Privacy",
              href: "/#tracks",
              description: "Trustworthy systems, anomaly detection, adversarial defense",
              icon: "Award",
            },
          ],
        },
        {
          id: "col-track-hms",
          title: "Human-Machine Systems (HMS)",
          links: [
            {
              id: "sub-hms-bci",
              title: "Brain-Machine Interfaces",
              href: "/#tracks",
              description: "Neural signal processing, EEG diagnostics, neuro-prosthetics",
              icon: "UserCheck",
            },
            {
              id: "sub-hms-teaming",
              title: "Human-AI Collaborative Teaming",
              href: "/#tracks",
              description: "Co-robots, operator mental workload, cognitive ergonomics",
              icon: "Users",
            },
            {
              id: "sub-hms-ar",
              title: "Augmented & Virtual Reality",
              href: "/#tracks",
              description: "Immersive simulation, haptic interaction, digital twins",
              icon: "Monitor",
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
      id: "nav-dates",
      name: "Dates",
      href: "/#dates",
      type: "link",
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
      id: "nav-venue",
      name: "Venue",
      href: "/#venue",
      type: "mega",
      columns: [
        {
          id: "col-venue-hotel",
          title: "Hotel & Facilities",
          links: [
            {
              id: "sub-venue-sheraton",
              title: "Sheraton Saigon Grand Opera Hotel",
              href: "/#venue",
              description: "88 Dong Khoi, District 1, Ho Chi Minh City, Vietnam",
              icon: "Building2",
            },
            {
              id: "sub-venue-rooms",
              title: "Conference Halls & Accommodation",
              href: "/#venue",
              description: "Special delegate room rates and conference session floor plans",
              icon: "Home",
            },
          ],
        },
        {
          id: "col-venue-saigon",
          title: "Saigon Travel & Guide",
          links: [
            {
              id: "sub-venue-visa",
              title: "Vietnam e-Visa & Entry Requirements",
              href: "/#venue",
              description: "Official guide on 90-day multiple entry electronic visas",
              icon: "FileText",
            },
            {
              id: "sub-venue-transport",
              title: "Airport (SGN) & Local Transport",
              href: "/#venue",
              description: "Airport pickup, taxi advice, and city navigation tips",
              icon: "MapPin",
            },
          ],
        },
      ],
      promoCard: {
        title: "Explore Ho Chi Minh City",
        description: "Discover historic French architecture, renowned gastronomy, and vibrant nightlife.",
        image: "/assets/cta-background.webp",
        href: "/#venue",
        badge: "Host Destination",
        ctaText: "Saigon Guide",
      },
    },
    {
      id: "nav-faq",
      name: "FAQ",
      href: "/#faq",
      type: "link",
    },
  ],
  ctaButton: {
    enabled: true,
    label: "Submit Paper (PaperCept)",
    href: "/#cfp",
  },
};
