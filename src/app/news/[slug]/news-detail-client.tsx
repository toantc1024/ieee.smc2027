"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Printer,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { POSTS_SYNC_CHANNEL } from "@/lib/post-sync";

export interface NewsDetailClientProps {
  title: string;
  slug: string;
  summary?: string;
  initialUpdatedAt?: string;
}

/**
 * Sticky Left Toolbar and Mobile Floating Dock matching HCMUTE design.
 * Features rounded-full pills, zoom controls, share triggers, and smooth scroll navigation.
 */
export function NewsDetailToolbar({
  title,
  slug,
  summary,
  initialUpdatedAt,
}: NewsDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastUpdatedAtRef = useRef<string | undefined>(initialUpdatedAt);

  useEffect(() => {
    lastUpdatedAtRef.current = initialUpdatedAt;
  }, [initialUpdatedAt]);

  useEffect(() => {
    if (!slug) return;

    const checkPostUpdates = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(
          `/api/posts/${encodeURIComponent(slug)}?poll=1`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const nextUpdatedAt: string | undefined = data?.post?.updatedAt;
        if (nextUpdatedAt && nextUpdatedAt !== lastUpdatedAtRef.current) {
          lastUpdatedAtRef.current = nextUpdatedAt;
          router.refresh();
        }
      } catch {
        // Ignore transient polling errors
      }
    };

    const intervalId = window.setInterval(checkPostUpdates, 5000);
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void checkPostUpdates();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
      channel.onmessage = () => {
        void checkPostUpdates();
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (channel) channel.close();
    };
  }, [router, slug]);

  // Reading progress tracker & scroll-to-top trigger
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
        setReadingProgress(progress);
      }
      setShowScrollTop(totalScroll > 320);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update article reader font size on .post-reader
  useEffect(() => {
    const article = document.querySelector(".post-reader");
    if (!article) return;
    article.classList.remove(
      "text-base",
      "text-lg",
      "text-xl",
      "leading-[1.8]",
      "leading-[1.9]",
      "leading-[2.0]"
    );
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

  const scrollToBottom = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
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

  return (
    <>
      {/* ── 1. Reading Progress Bar at Top of Viewport ── */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[60] pointer-events-none">
        <div
          className="h-full bg-primary shadow-[0_0_12px_rgba(17,94,255,0.7)] transition-all duration-100 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ── 2. Desktop Floating Action Dock (Left Rail) — Minimal Radius Square with Solid Hover ── */}
      <aside
        aria-label="Article actions"
        className="hidden lg:flex flex-col gap-3 sticky top-28 lg:top-32 shrink-0 py-2 z-20 select-none"
      >
        {/* Block 1: Text Size Zoom Controls */}
        <div className="w-11 flex flex-col rounded-sm bg-white dark:bg-card text-[#004776] shadow-xs border border-slate-200 overflow-hidden box-border">
          <button
            type="button"
            onClick={() => handleZoom("in")}
            className="h-11 w-full flex items-center justify-center text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90 transition-colors cursor-pointer"
            title="Zoom In (A+)"
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4.5" />
          </button>
          <div className="h-px bg-slate-200/80 mx-1.5" />
          <button
            type="button"
            onClick={() => handleZoom("out")}
            className="h-11 w-full flex items-center justify-center text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90 transition-colors cursor-pointer"
            title="Zoom Out (A-)"
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4.5" />
          </button>
        </div>

        {/* Block 2: Share & Action Controls */}
        <div className="w-11 flex flex-col rounded-sm bg-white dark:bg-card text-[#004776] shadow-xs border border-slate-200 overflow-hidden box-border">
          <button
            type="button"
            onClick={handleNativeShare}
            className="h-11 w-full flex items-center justify-center text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90 transition-colors cursor-pointer"
            title="Share Announcement"
            aria-label="Share announcement"
          >
            <Share2 className="size-4.5" />
          </button>
          <div className="h-px bg-slate-200/80 mx-1.5" />
          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "h-11 w-full flex items-center justify-center transition-colors cursor-pointer",
              copied
                ? "bg-primary text-white"
                : "text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90"
            )}
            title={copied ? "Copied" : "Copy Link"}
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="size-4.5 text-white" />
            ) : (
              <Copy className="size-4.5" />
            )}
          </button>
          <div className="h-px bg-slate-200/80 mx-1.5" />
          <button
            type="button"
            onClick={handlePrint}
            className="h-11 w-full flex items-center justify-center text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90 transition-colors cursor-pointer"
            title="Print Announcement"
            aria-label="Print announcement"
          >
            <Printer className="size-4.5" />
          </button>
        </div>

        {/* Block 3: Scroll Navigation Controls (Top & Bottom) */}
        <div className="w-11 flex flex-col rounded-sm bg-white dark:bg-card text-[#004776] shadow-xs border border-slate-200 overflow-hidden box-border">
          <button
            type="button"
            className="h-11 w-full flex items-center justify-center text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90 transition-colors cursor-pointer"
            onClick={scrollToTop}
            title="Back to Top"
            aria-label="Back to top"
          >
            <ArrowUp className="size-4.5" />
          </button>
          <div className="h-px bg-slate-200/80 mx-1.5" />
          <button
            type="button"
            className="h-11 w-full flex items-center justify-center text-[#004776] hover:bg-primary hover:text-white active:bg-primary/90 transition-colors cursor-pointer"
            onClick={scrollToBottom}
            title="Scroll to Bottom"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="size-4.5" />
          </button>
        </div>
      </aside>

      {/* ── 3. Mobile Floating Bottom Action Dock — Square Minimal Radius ── */}
      <div className="lg:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/95 dark:bg-card/95 backdrop-blur-md border border-slate-200 shadow-md select-none">
          <Link
            href="/#news"
            className="size-9 rounded-sm flex items-center justify-center text-[#004776] hover:text-white hover:bg-primary transition-colors"
            title="Back to announcements"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <Share2 className="size-3.5 text-white" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "size-9 rounded-sm flex items-center justify-center transition-colors cursor-pointer",
              copied
                ? "bg-primary text-white"
                : "text-[#004776] hover:text-white hover:bg-primary"
            )}
            title="Copy Link"
          >
            {copied ? (
              <Check className="size-4 text-white" />
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
                className="size-9 rounded-sm bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                title="Back to Top"
              >
                <ArrowUp className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * End-of-article share dock with back navigation and social channels.
 */
export function NewsDetailShareBar({ title, slug, summary }: NewsDetailClientProps) {
  const [copied, setCopied] = useState(false);

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

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  return (
    <div className="mt-10 sm:mt-14 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Back Link */}
      <Link
        href="/#news"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-slate-200 bg-white hover:bg-primary text-xs sm:text-sm font-semibold text-[#004776] hover:text-white hover:border-primary transition-colors whitespace-nowrap shadow-2xs w-fit group"
      >
        <ArrowLeft className="size-4 text-primary group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
        <span>Back to All Announcements</span>
      </Link>

      {/* Share Buttons Group */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#004776] mr-1 hidden md:inline">
          Share:
        </span>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
          title="Copy link"
        >
          {copied ? (
            <>
              <Check className="size-4 text-white" />
              <span>Copied!</span>
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
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-primary hover:border-primary text-xs font-semibold text-[#004776] hover:text-white transition-colors whitespace-nowrap shadow-2xs cursor-pointer group"
          title="Share to Facebook"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="hidden sm:inline">Facebook</span>
        </button>

        <button
          type="button"
          onClick={() => handleShareSocial("linkedin")}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-primary hover:border-primary text-xs font-semibold text-[#004776] hover:text-white transition-colors whitespace-nowrap shadow-2xs cursor-pointer group"
          title="Share to LinkedIn"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          <span className="hidden sm:inline">LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={() => handleShareSocial("twitter")}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-primary hover:border-primary text-xs font-semibold text-[#004776] hover:text-white transition-colors whitespace-nowrap shadow-2xs cursor-pointer group"
          title="Share to X"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">X / Twitter</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-primary hover:border-primary text-xs font-semibold text-[#004776] hover:text-white transition-colors whitespace-nowrap shadow-2xs cursor-pointer group"
          title="Print announcement"
        >
          <Printer className="size-4 text-[#004776] group-hover:text-white transition-colors" />
          <span className="hidden sm:inline">Print</span>
        </button>
      </div>
    </div>
  );
}

// Default export compatibility
export const NewsDetailClient = NewsDetailToolbar;
