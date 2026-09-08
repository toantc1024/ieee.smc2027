import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IEEE SMC 2027 | Ho Chi Minh City, Vietnam • October 6–10, 2027",
  description:
    "Official website for The 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), October 6–10, 2027, hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam. Theme: Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures.",
  keywords: [
    "IEEE SMC 2027",
    "HCMUTE",
    "Ho Chi Minh City University of Technology and Engineering",
    "Systems Man and Cybernetics",
    "Systems Science and Engineering",
    "Human-Machine Systems",
    "Cybernetics",
    "Artificial Intelligence",
    "Human-AI Symbiosis",
    "Sheraton Saigon Grand Opera Hotel",
    "Vietnam Conference",
    "IEEE Xplore",
  ],
  authors: [{ name: "IEEE SMC Society & HCMUTE" }],
  openGraph: {
    title: "IEEE SMC 2027 | Ho Chi Minh City, Vietnam • October 6–10, 2027",
    description:
      "The 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam, October 6–10, 2027.",
    type: "website",
    locale: "en_US",
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
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        {/* Full-width HCMUTE styled header with topbar and sticky 3-column nav */}
        <Header />

        {/* Main Content */}
        <main className="grow w-full flex flex-col">{children}</main>
      </body>
    </html>
  );
}
