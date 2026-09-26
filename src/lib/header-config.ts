export interface NavLinkItem {
  id?: string;
  name: string;
  href: string;
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
    hotline: "+84 28 3722 1223",
    hotlineRaw: "+842837221223",
    email: "smc2027@hcmute.edu.vn",
    hostBadgeText: "Host: HCM-UTE (Vietnam)",
    societyBadgeText: "IEEE SMC Society (Global)",
  },
  brand: {
    conferenceTitle: "IEEE SMC 2027",
    conferenceSubtitle: "Ho Chi Minh City, Vietnam • October 6–10, 2027",
  },
  navLinks: [
    { id: "1", name: "About", href: "/#about" },
    { id: "2", name: "Tracks", href: "/#tracks" },
    { id: "3", name: "Dates", href: "/#dates" },
    { id: "4", name: "Committee", href: "/#committee" },
    { id: "5", name: "Venue", href: "/#venue" },
    { id: "6", name: "FAQ", href: "/#faq" },
  ],
  ctaButton: {
    enabled: true,
    label: "Submit Paper (PaperCept)",
    href: "https://ieee.siam.org",
  },
};
