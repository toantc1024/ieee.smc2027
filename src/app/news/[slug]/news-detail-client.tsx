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
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const handleZoom = useCallback((direction: "in" | "out") => {
    setFontSize((prev) => {
      if (direction === "in") {
        if (prev === "normal") return "large";
        return "xlarge";
      } else {
        if (prev === "xlarge") return "large";
        return "normal";
      }
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
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

      {/* ── 2. Desktop Floating Action Bar (Left Rail) Matching HCMUTE Exact Layout ── */}
      <aside
        aria-label="Article actions"
        className="hidden xl:flex flex-col gap-3 sticky top-28 lg:top-32 shrink-0 py-2 z-20"
      >
        {/* Text Size Zoom Controls */}
        <div className="w-11 flex flex-col rounded-sm bg-white text-[#115eff] shadow-xs border border-slate-200 overflow-hidden box-border">
          <button
            type="button"
            onClick={() => handleZoom("in")}
            className="h-10 w-full flex items-center justify-center text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6] transition-colors cursor-pointer"
            title="Zoom In (A+)"
            aria-label="Zoom in font size"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 mx-1.5" />
          <button
            type="button"
            onClick={() => handleZoom("out")}
            className="h-10 w-full flex items-center justify-center text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6] transition-colors cursor-pointer"
            title="Zoom Out (A-)"
            aria-label="Zoom out font size"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Share & Actions Controls */}
        <div className="w-11 flex flex-col rounded-sm bg-white text-[#115eff] shadow-xs border border-slate-200 overflow-hidden box-border">
          <button
            type="button"
            onClick={handleNativeShare}
            className="h-10 w-full flex items-center justify-center text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6] transition-colors cursor-pointer"
            title="Share Announcement"
            aria-label="Share article"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 mx-1.5" />
          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "h-10 w-full flex items-center justify-center transition-colors cursor-pointer",
              copied
                ? "bg-[#115eff] text-white"
                : "text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6]"
            )}
            title={copied ? "Copied!" : "Copy Link"}
            aria-label="Copy article link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-white animate-in zoom-in-75 duration-200" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <div className="h-px bg-slate-200 mx-1.5" />
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 w-full flex items-center justify-center text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6] transition-colors cursor-pointer"
            title="Print Announcement"
            aria-label="Print article"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Navigation Controls */}
        <div className="w-11 flex flex-col rounded-sm bg-white text-[#115eff] shadow-xs border border-slate-200 overflow-hidden box-border">
          <button
            type="button"
            onClick={scrollToTop}
            className="h-10 w-full flex items-center justify-center text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6] transition-colors cursor-pointer"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 mx-1.5" />
          <button
            type="button"
            onClick={scrollToBottom}
            className="h-10 w-full flex items-center justify-center text-[#115eff] hover:bg-[#115eff] hover:text-white active:bg-[#0a4de6] transition-colors cursor-pointer"
            title="Scroll to Bottom"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── 3. Bottom Inline Share Dock (Inside Article End) with Minimal Sharp Radius ── */}
      <div className="mt-10 sm:mt-14 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back Link */}
        <Link
          href="/#news"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-slate-200 bg-white hover:bg-blue-50 text-xs sm:text-sm font-semibold text-[#004776] hover:text-[#115eff] transition-colors whitespace-nowrap shadow-2xs w-fit group"
        >
          <ArrowLeft className="size-4 text-[#115eff] transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Announcements</span>
        </Link>

        {/* Share buttons group */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#004776] uppercase tracking-wider mr-1 hidden md:inline">
            Share:
          </span>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Copy link"
          >
            {copied ? (
              <>
                <Check className="size-4 text-white" />
                <span className="text-white font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4 text-white" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleShareSocial("facebook")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-blue-50 text-xs font-semibold text-[#004776] hover:text-[#115eff] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Share to Facebook"
          >
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => handleShareSocial("linkedin")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-blue-50 text-xs font-semibold text-[#004776] hover:text-[#115eff] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Share to LinkedIn"
          >
            <span>LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={() => handleShareSocial("twitter")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-[#004776] hover:text-[#115eff] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Share to X"
          >
            <span>X / Twitter</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-blue-50 text-xs font-semibold text-[#004776] hover:text-[#115eff] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            title="Print announcement"
          >
            <Printer className="size-4 text-[#115eff]" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ── 4. Mobile Floating Bottom Action Dock with Minimal Sharp Radius ── */}
      <div className="xl:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
          <Link
            href="/#news"
            className="size-8 rounded-sm flex items-center justify-center text-[#004776] hover:text-white hover:bg-[#115eff] transition-colors"
            title="Back to all news"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#115eff] text-white hover:bg-[#0a4de6] transition-colors cursor-pointer"
          >
            <Share2 className="size-3.5 text-white" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="size-8 rounded-sm flex items-center justify-center text-[#115eff] hover:text-white hover:bg-[#115eff] transition-colors cursor-pointer"
            title="Copy Link"
          >
            {copied ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>

          {showScrollTop && (
            <>
              <div className="h-4 w-px bg-slate-200" />
              <button
                type="button"
                onClick={scrollToTop}
                className="size-8 rounded-sm bg-[#115eff] text-white flex items-center justify-center hover:bg-[#0a4de6] transition-colors cursor-pointer"
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
