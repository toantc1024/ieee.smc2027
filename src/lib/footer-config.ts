import { CONFERENCE_INFO } from "@/data/conference";

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  heading: string;
  links: FooterLinkItem[];
}

export interface FooterSocialLink {
  name: string;
  href: string;
  platform?: "facebook" | "youtube" | "globe" | "smc";
}

export interface FooterConfigData {
  badgeText: string;
  datesText: string;
  heading: string;
  description: string;
  universityNote: string;
  secondaryDescription: string;
  cfpButtonLabel: string;
  cfpPdfUrl: string;
  portalButtonLabel: string;
  websiteUrl: string;
  venueName: string;
  address: string;
  hotline: string;
  hotlineRaw: string;
  contactEmail: string;
  linkGroups: FooterLinkGroup[];
  socialLinks: FooterSocialLink[];
  copyrightText: string;
  footerRightText: string;
}

export const DEFAULT_FOOTER_CONFIG: FooterConfigData = {
  badgeText: "Flagship Conference",
  datesText: CONFERENCE_INFO.dates,
  heading: "IEEE SMC 2027 • Ho Chi Minh City, Vietnam",
  description: `The 2027 IEEE International Conference on Systems, Man, and Cybernetics, hosted by Ho Chi Minh City University of Technology and Engineering (HCM-UTE). Theme: "${CONFERENCE_INFO.theme}".`,
  universityNote:
    "A premier hub for technical education, research, and innovation in Vietnam.",
  secondaryDescription: `Hosted by HCM-UTE Vietnam under the theme "${CONFERENCE_INFO.theme}". Bringing together worldwide researchers and industry innovators in systems science, human–machine symbiosis, and cybernetics.`,
  cfpButtonLabel: "Download Official CFP (PDF)",
  cfpPdfUrl: CONFERENCE_INFO.cfpPdfUrl,
  portalButtonLabel: "Visit Conference Portal",
  websiteUrl: CONFERENCE_INFO.website,
  venueName: CONFERENCE_INFO.venue,
  address: CONFERENCE_INFO.address,
  hotline: CONFERENCE_INFO.hotline,
  hotlineRaw: CONFERENCE_INFO.hotlineRaw,
  contactEmail: CONFERENCE_INFO.contactEmail,
  socialLinks: [
    {
      name: "Facebook",
      href: "https://facebook.com/hcmute.edu.vn",
      platform: "facebook",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@UTETVChannel",
      platform: "youtube",
    },
    {
      name: "HCM-UTE Official Portal",
      href: "https://hcmute.edu.vn",
      platform: "globe",
    },
    {
      name: "IEEE SMC Society",
      href: "https://www.ieeesmc.org",
      platform: "smc",
    },
  ],
  linkGroups: [
    {
      heading: "Conference",
      links: [
        { label: "About IEEE SMC 2027", href: "/#about" },
        { label: "Organizing Committee", href: "/committees" },
        { label: "Important Dates & Timeline", href: "/#dates" },
        { label: "Conference Video & Scope", href: "/#video" },
        { label: "HCM-UTE Host University", href: "https://hcmute.edu.vn" },
      ],
    },
    {
      heading: "Authors & CFP",
      links: [
        { label: "Call for Papers Guidelines", href: "/submissions" },
        { label: "Download CFP PDF", href: CONFERENCE_INFO.cfpPdfUrl },
        { label: "Online Submission Portal", href: "/submissions" },
        { label: "Special Session Proposals", href: "/program" },
        { label: "Workshop & Tutorial Tracks", href: "/#tracks" },
      ],
    },
    {
      heading: "Technical Tracks",
      links: [
        { label: "Systems Science & Eng. (SSE)", href: "/#tracks" },
        { label: "Cybernetics Systems (CYB)", href: "/#tracks" },
        { label: "Human-Machine Systems (HMS)", href: "/#tracks" },
        { label: "AI & Autonomous Symbiosis", href: "/#tracks" },
        { label: "Paper Formatting Guidelines", href: "/submissions" },
      ],
    },
    {
      heading: "Venue & Support",
      links: [
        { label: "Sheraton Saigon Grand Opera", href: "/travel" },
        { label: "Ho Chi Minh City Guide", href: "/travel" },
        { label: "Vietnam e-Visa Information", href: CONFERENCE_INFO.visaUrl },
        { label: "Frequently Asked Questions", href: "/#faq" },
        { label: "Contact Organizing Secretariat", href: "/#contact" },
      ],
    },
  ],
  copyrightText: "© 2027 IEEE SMC Society & HCM-UTE. All rights reserved.",
  footerRightText:
    "Sheraton Saigon Grand Opera Hotel • Ho Chi Minh City • HCM-UTE",
};

export function normalizeFooterHref(href?: string): string {
  const raw = (href || "").trim();
  if (!raw) return "/";
  if (raw.startsWith("#")) return `/${raw}`;
  return raw;
}
