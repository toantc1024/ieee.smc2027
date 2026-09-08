import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#115eff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ieee-smc2027.vercel.app"),
  title: {
    default: "IEEE SMC 2027 | Ho Chi Minh City, Vietnam • October 6–10, 2027",
    template: "%s | IEEE SMC 2027",
  },
  description:
    "Official website of the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027). October 6–10, 2027 at Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam. Hosted by Ho Chi Minh City University of Technology and Engineering (HCM-UTE). Theme: Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures. Paper Submission Deadline: April 08, 2027.",
  keywords: [
    "IEEE SMC 2027",
    "IEEE SMC Society",
    "HCM-UTE",
    "Ho Chi Minh City University of Technology and Engineering",
    "Call for Papers SMC 2027",
    "Human-AI Symbiosis",
    "Systems Science and Engineering",
    "Cybernetics",
    "Human-Machine Systems",
    "Autonomous Systems",
    "Robotics",
    "Artificial Intelligence",
    "IEEE Xplore",
    "Scopus Indexed Conference",
    "Sheraton Saigon Grand Opera Hotel",
    "Ho Chi Minh City",
    "Vietnam",
  ],
  authors: [
    { name: "IEEE Systems, Man, and Cybernetics Society", url: "https://www.ieeesmc.org" },
    { name: "HCM-UTE (Ho Chi Minh City University of Technology and Engineering)", url: "https://hcmute.edu.vn" },
  ],
  creator: "IEEE Systems, Man, and Cybernetics Society & HCM-UTE",
  publisher: "IEEE",
  category: "Academic Conference",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "IEEE SMC 2027 | Ho Chi Minh City, Vietnam • October 6–10, 2027",
    description:
      "Flagship global conference on systems science, human–machine systems, and cybernetics. October 6–10, 2027 in Ho Chi Minh City, Vietnam, hosted by HCM-UTE. Theme: Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures. Paper submission deadline: April 08, 2027.",
    url: "https://ieee-smc2027.vercel.app",
    siteName: "IEEE SMC 2027 Conference",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IEEE SMC 2027 - Ho Chi Minh City, Vietnam - October 6-10, 2027",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IEEE SMC 2027 | Ho Chi Minh City, Vietnam • October 6–10, 2027",
    description:
      "Flagship global conference on systems science, human–machine systems, and cybernetics. October 6–10, 2027 in Ho Chi Minh City, Vietnam, hosted by HCM-UTE. Theme: Human-AI Symbiosis. Paper Submission Deadline: April 08, 2027.",
    images: ["/og-image.jpg"],
    creator: "@IEEESMC",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdEvent = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027)",
  startDate: "2027-10-06T08:00:00+07:00",
  endDate: "2027-10-10T18:00:00+07:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Sheraton Saigon Grand Opera Hotel",
    address: {
      "@type": "PostalAddress",
      streetAddress: "88 Dong Khoi Street, District 1",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
  },
  image: ["https://ieee-smc2027.vercel.app/og-image.jpg"],
  description:
    "The flagship conference of the IEEE Systems, Man, and Cybernetics Society (SMC), hosted by Ho Chi Minh City University of Technology and Engineering (HCM-UTE) in Ho Chi Minh City, Vietnam. Theme: Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures.",
  organizer: {
    "@type": "Organization",
    name: "Ho Chi Minh City University of Technology and Engineering (HCM-UTE)",
    url: "https://hcmute.edu.vn",
  },
  offers: {
    "@type": "Offer",
    url: "https://ieee-smc2027.vercel.app/#cfp",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2026-09-01T00:00:00+07:00",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        {/* Full-width HCMUTE styled header with topbar and sticky 3-column nav */}
        <Header />

        {/* Main Content */}
        <main className="grow w-full flex flex-col">{children}</main>
      </body>
    </html>
  );
}
