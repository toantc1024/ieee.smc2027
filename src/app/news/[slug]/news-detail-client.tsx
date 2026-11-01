"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Printer,
  ChevronUp,
  Type,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface NewsDetailClientProps {
  title: string;
  slug: string;
  summary: string;
}

export function NewsDetailClient({ title, slug, summary }: NewsDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Calculate reading progress and toggle back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
        setReadingProgress(progress);
      }
      setShowScrollTop(totalScroll > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update article reader font size via CSS class on .post-reader
  useEffect(() => {
    const article = document.querySelector(".post-reader");
    if (!article) return;
    article.classList.remove("text-base", "text-lg", "text-xl", "leading-[1.8]", "leading-[1.9]", "leading-[2.0]");
    if (fontSize === "normal") {
      article.classList.add("text-base", "leading-[1.8]");
    } else if (fontSize === "large") {
      article.classList.add("text-lg", "leading-[1.9]");
    } else if (fontSize === "xlarge") {
      article.classList.add("text-xl", "leading-[2.0]");
    }
  }, [fontSize]);

  const getFullUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/news/${slug}`;
    }
    return `https://ieee-smc2027.org/news/${slug}`;
  }, [slug]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl());
      setCopied(true);
      toast.success("Announcement link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [getFullUrl]);

  const handleShareSocial = useCallback(
    (platform: "facebook" | "twitter" | "linkedin") => {
      const url = encodeURIComponent(getFullUrl());
      const text = encodeURIComponent(`${title} — IEEE SMC 2027 Vietnam`);

      let shareUrl = "";
      if (platform === "facebook") {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      } else if (platform === "twitter") {
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      } else if (platform === "linkedin") {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=450");
      }
    },
    [getFullUrl, title]
  );

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary || `${title} — IEEE SMC 2027`,
          url: getFullUrl(),
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await handleCopyLink();
        }
      }
    } else {
      await handleCopyLink();
    }
  }, [title, summary, getFullUrl, handleCopyLink]);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const cycleFontSize = useCallback(() => {
    setFontSize((prev) => {
      if (prev === "normal") return "large";
      if (prev === "large") return "xlarge";
      return "normal";
    });
    toast.info(
      fontSize === "normal"
        ? "Font size: Large"
        : fontSize === "large"
        ? "Font size: Extra Large"
        : "Font size: Default",
      { duration: 1500 }
    );
  }, [fontSize]);

  return (
    <>
      {/* ── 1. Reading Progress Bar at Top of Viewport ── */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[60] pointer-events-none">
        <div
          className="h-full bg-[#115eff] shadow-[0_0_12px_rgba(17,94,255,0.7)] transition-all duration-100 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ── 2. Desktop Floating Action Bar (Left Rail) ── */}
      <aside
        aria-label="Article actions"
        className="hidden xl:flex flex-col items-center gap-2.5 sticky top-24 shrink-0 py-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Share
        </span>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => handleShareSocial("facebook")}
          className="size-10 rounded-xl bg-white border border-slate-200 hover:border-[#1877F2] hover:bg-blue-50/50 flex items-center justify-center text-[#1877F2] transition-colors shadow-2xs cursor-pointer group"
          title="Share to Facebook"
        >
          <span className="font-bold text-sm group-hover:scale-110 transition-transform">f</span>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={() => handleShareSocial("linkedin")}
          className="size-10 rounded-xl bg-white border border-slate-200 hover:border-[#0A66C2] hover:bg-blue-50/50 flex items-center justify-center text-[#0A66C2] transition-colors shadow-2xs cursor-pointer group"
          title="Share to LinkedIn"
        >
          <span className="font-bold text-xs group-hover:scale-110 transition-transform">in</span>
        </button>

        {/* X / Twitter */}
        <button
          type="button"
          onClick={() => handleShareSocial("twitter")}
          className="size-10 rounded-xl bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors shadow-2xs cursor-pointer group"
          title="Share to X"
        >
          <span className="font-bold text-xs group-hover:scale-110 transition-transform">𝕏</span>
        </button>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="size-10 rounded-xl bg-white border border-slate-200 hover:border-[#115eff] hover:bg-blue-50/50 flex items-center justify-center text-slate-600 hover:text-[#115eff] transition-colors shadow-2xs cursor-pointer"
          title="Copy article link"
        >
          {copied ? (
            <Check className="size-4 text-emerald-600 animate-in zoom-in-75 duration-200" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>

        <div className="w-6 border-t border-slate-200 my-1" />

        {/* Font Size Toggle */}
        <button
          type="button"
          onClick={cycleFontSize}
          className="size-10 rounded-xl bg-white border border-slate-200 hover:border-[#115eff] hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-600 hover:text-[#115eff] transition-colors shadow-2xs cursor-pointer group"
          title={`Adjust reading size (Current: ${fontSize})`}
        >
          <Type className="size-4" />
          <span className="text-[8px] font-bold text-slate-400 group-hover:text-[#115eff]">
            {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
          </span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="size-10 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
          title="Print announcement"
        >
          <Printer className="size-4" />
        </button>

        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="size-10 rounded-xl bg-[#004776] text-white hover:bg-[#115eff] flex items-center justify-center transition-all shadow-xs cursor-pointer animate-in fade-in zoom-in-75 duration-200 mt-1"
            title="Scroll to top"
          >
            <ChevronUp className="size-4" />
          </button>
        )}
      </aside>

      {/* ── 3. Bottom Inline Share Dock (Inside Article End) ── */}
      <div className="mt-10 sm:mt-14 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back Link */}
        <Link
          href="/#news"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors whitespace-nowrap shadow-2xs w-fit group"
        >
          <ArrowLeft className="size-4 text-[#115eff] transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Announcements</span>
        </Link>

        {/* Share buttons group */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">
            Share:
          </span>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Copy link"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4 text-[#115eff]" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleShareSocial("facebook")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-xs font-semibold text-[#1877F2] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Share to Facebook"
          >
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => handleShareSocial("linkedin")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-xs font-semibold text-[#0A66C2] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Share to LinkedIn"
          >
            <span>LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={() => handleShareSocial("twitter")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-900 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Share to X"
          >
            <span>X / Twitter</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Print announcement"
          >
            <Printer className="size-4 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ── 4. Mobile Floating Bottom Action Dock ── */}
      <div className="xl:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl">
          <Link
            href="/#news"
            className="size-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#115eff] hover:bg-slate-100 transition-colors"
            title="Back to all news"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#115eff] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Share2 className="size-3.5 text-[#115eff]" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="size-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#115eff] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy Link"
          >
            {copied ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <Copy className="size-4 text-slate-600" />
            )}
          </button>

          {showScrollTop && (
            <>
              <div className="h-4 w-px bg-slate-200" />
              <button
                type="button"
                onClick={scrollToTop}
                className="size-9 rounded-full bg-[#004776] text-white flex items-center justify-center hover:bg-[#115eff] transition-colors cursor-pointer"
                title="Top"
              >
                <ChevronUp className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
