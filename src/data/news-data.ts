export interface NewsItem {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  year: string;
  category: "Partnership" | "Program" | "Deadline" | "Keynote" | "Announcement" | string;
  summary: string;
  content: string;
  image?: string;
  viewCount?: number;
  externalUrl?: string;
  slug?: string;
}

export function getNewsDetailUrl(news: NewsItem): string {
  if (news.slug) return `/news/${news.slug}`;
  if (news.id === "news-host-hcmute") return `/news/hcm-ute-to-host-ieee-smc-2027-vietnam`;
  return `/news/${news.id}`;
}

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-cfp-2027",
    slug: "news-cfp-2027",
    title: "IEEE SMC 2027 Call for Papers Officially Released – Human-AI Symbiosis",
    date: "01/15/2027",
    day: "15",
    month: "01",
    year: "2027",
    category: "Call for Papers",
    summary: "The IEEE SMC 2027 Organizing Committee has published the official Call for Papers under the theme Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures.",
    content: "Hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam (HCM-UTE), the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027) will take place October 6–10, 2027 at the Sheraton Saigon Grand Opera Hotel in Ho Chi Minh City, Vietnam. Submissions across Systems Science & Engineering (SSE), Cybernetics (CYB), and Human-Machine Systems (HMS) are now invited.",
    image: "/news/hoi-thao-ute.jpg",
    viewCount: 3420,
    externalUrl: "#cfp",
  },
  {
    id: "news-proposals-deadline",
    slug: "news-proposals-deadline",
    title: "Call for Special Sessions, Tutorials and Workshops Proposals Due February 15, 2027",
    date: "01/25/2027",
    day: "25",
    month: "01",
    year: "2027",
    category: "Special Sessions",
    summary: "Proposals for organized Special Sessions, technical Tutorials, and Workshops are now being accepted through February 15, 2027.",
    content: "Researchers and industry pioneers are invited to submit proposals for Special Sessions, Tutorials, and Workshops for IEEE SMC 2027. Formal notification of accepted proposals will be announced on March 04, 2027.",
    image: "/news/top-50.jpg",
    viewCount: 2150,
    externalUrl: "#dates",
  },
  {
    id: "news-paper-submission-deadline",
    slug: "news-paper-submission-deadline",
    title: "Paper Submission Deadline for Workshops, Regular and Special Sessions: April 08, 2027",
    date: "02/05/2027",
    day: "05",
    month: "02",
    year: "2027",
    category: "Deadline",
    summary: "Full paper submissions for IEEE SMC 2027 Regular, Special Sessions, and Workshops are due on April 08, 2027.",
    content: "All submissions must be in English. The full papers are to be submitted electronically in PDF format via the online submission system link. Accepted and presented papers will be eligible for inclusion in the IEEE Xplore® Digital Library.",
    image: "/news/aun.jpg",
    viewCount: 4890,
    externalUrl: "#dates",
  },
  {
    id: "news-venue-sheraton",
    slug: "news-venue-sheraton",
    title: "Sheraton Saigon Grand Opera Hotel Confirmed as Official Conference Headquarters",
    date: "02/15/2027",
    day: "15",
    month: "02",
    year: "2027",
    category: "Announcement",
    summary: "IEEE SMC 2027 delegates will experience five memorable days in District 1, Ho Chi Minh City at the prestigious Sheraton Saigon Grand Opera Hotel.",
    content: "Located at No. 88 Dong Khoi, Saigon Ward, District 1, the venue is situated in the cultural and business heart of Saigon, steps from historical landmarks, the Saigon Opera House, and Metro Line 1.",
    image: "/images/sheraton-saigon-card.jpg",
    viewCount: 2980,
    externalUrl: "#venue",
  },
  {
    id: "news-visa-portal",
    slug: "news-visa-portal",
    title: "Official Vietnam Electronic Visa (e-Visa) Application Portal Guide for Attendees",
    date: "02/28/2027",
    day: "28",
    month: "02",
    year: "2027",
    category: "Announcement",
    summary: "International attendees can apply directly for official 90-day Vietnam electronic visas online at evisa.gov.vn.",
    content: "The organizing committee has published official visa guidance for international attendees. Citizens of all countries can apply for electronic visas directly through the official Vietnam government visa portal at https://evisa.gov.vn.",
    image: "/assets/3d/visa-travel-3d.png",
    viewCount: 3120,
    externalUrl: "https://evisa.gov.vn",
  },
  {
    id: "news-technical-pillars",
    slug: "news-technical-pillars",
    title: "IEEE SMC 2027 Unveils 68+ Technical Tracks Across SSE, CYB, and HMS",
    date: "03/10/2027",
    day: "10",
    month: "03",
    year: "2027",
    category: "Program",
    summary: "Explore the comprehensive technical scope spanning autonomous bionic robotics, quantum cybernetics, and brain-machine interface systems.",
    content: "The 2027 technical program includes three core pillars: Systems Science & Engineering (27 topics), Cybernetics (28 topics), and Human-Machine Systems (14 topics), addressing cutting-edge artificial intelligence, human-AI symbiosis, and trustworthy autonomous systems.",
    image: "/news/4.0-tech.jpg",
    viewCount: 2740,
    externalUrl: "#tracks",
  },
  {
    id: "news-industry-partnerships",
    slug: "news-industry-partnerships",
    title: "Call for Industry Exhibition & Partnership Sponsorships Open for IEEE SMC 2027",
    date: "03/20/2027",
    day: "20",
    month: "03",
    year: "2027",
    category: "Partnership",
    summary: "Leading technology enterprises, robotics developers, and academic institutions are invited to participate as conference partners.",
    content: "IEEE SMC 2027 offers premier exhibition booths, industrial demonstration tracks, and diamond/platinum/gold sponsorship packages at the Sheraton Saigon Grand Opera Hotel in Ho Chi Minh City.",
    image: "/news/giai-nha-robot.jpeg",
    viewCount: 1640,
    externalUrl: "#contact",
  },
  {
    id: "news-host-hcmute",
    slug: "hcm-ute-to-host-ieee-smc-2027-vietnam",
    title: "HCM-UTE to Host IEEE SMC 2027 – Vietnam's Premier Systems & AI Gathering",
    date: "04/01/2027",
    day: "01",
    month: "04",
    year: "2027",
    category: "Announcement",
    summary: "HCM-UTE welcomes the international systems, cybernetics, and human-machine systems community to Ho Chi Minh City on October 6–10, 2027.",
    content: "With over six decades of leadership in engineering and technological education, Ho Chi Minh City University of Technology and Engineering (HCM-UTE) is honored to host the flagship annual conference of the IEEE Systems, Man, and Cybernetics Society.",
    image: "/news/vina-ute.png",
    viewCount: 3820,
    externalUrl: "#welcome",
  },
];
