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
  title: "IEEE SMC 2027 | Hosted by HCM-UTE • Ho Chi Minh City, Vietnam",
  description:
    "Official website for the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), October 10–13, 2027, hosted by Ho Chi Minh City University of Technology and Education (HCM-UTE), Vietnam.",
  keywords: [
    "IEEE SMC 2027",
    "HCM-UTE",
    "Ho Chi Minh City University of Technology and Education",
    "Systems Man and Cybernetics",
    "Systems Science and Engineering",
    "Human-Machine Systems",
    "Cybernetics",
    "Artificial Intelligence",
    "Vietnam Conference",
    "IEEE Xplore",
  ],
  authors: [{ name: "IEEE SMC Society & HCM-UTE" }],
  openGraph: {
    title: "IEEE SMC 2027 | Hosted by HCM-UTE • Ho Chi Minh City, Vietnam",
    description:
      "Join global leaders in Systems Science, Human-Machine Systems, and Cybernetics at HCM-UTE, Ho Chi Minh City, Vietnam, October 10–13, 2027.",
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

