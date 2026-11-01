import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NewsList } from "@/components/sections/NewsList";

export const metadata: Metadata = {
  title: "News & Announcements | IEEE SMC 2027",
  description:
    "Official announcements, call for papers, important deadlines, and conference milestones for IEEE SMC 2027.",
};

export default function NewsArchivePage() {
  return (
    <div className="w-full bg-white font-sans text-slate-800 min-h-screen">
      {/* Top Breadcrumb Bar */}
      <div className="w-full border-b border-slate-100 bg-slate-50/70">
        <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link href="/" className="hover:text-[#115eff] transition-colors font-normal">
            Home
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-600 font-normal">News &amp; Announcements</span>
        </div>
      </div>

      {/* Main News Section */}
      <div className="w-full">
        <NewsList />
      </div>
    </div>
  );
}
