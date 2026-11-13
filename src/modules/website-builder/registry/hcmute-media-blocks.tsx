"use client";
/* eslint-disable @next/next/no-img-element -- Media URLs can come from arbitrary configured domains. */

import React, { useState } from "react";
import Link from "next/link";
import { Play, ArrowUpRight, Film, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { spacingStyle } from "./hcmute-spacing";
type Locale = "vi" | "en";

function getLocalizedText(
  field: string | { en?: string; vi?: string } | undefined,
  locale: Locale = "vi",
  fallback = "",
): string {
  if (field === undefined || field === null) return fallback;
  if (typeof field === "string") return field;
  if (typeof field === "object") {
    const val = field[locale];
    if (val !== undefined && val !== null) return val;
    if (field.vi !== undefined && field.vi !== null) return field.vi;
    if (field.en !== undefined && field.en !== null) return field.en;
    return fallback;
  }
  return fallback;
}

/**
 * Parse any video URL (YouTube, Vimeo, MP4/direct) into embed-ready metadata
 */
export function parseVideoUrl(url: string = ""): {
  type: "youtube" | "vimeo" | "video" | "unknown";
  embedUrl: string;
  videoId?: string;
} {
  const clean = (url || "").trim();
  if (!clean) return { type: "unknown", embedUrl: "" };

  // YouTube matchers:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = clean.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      videoId: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo matcher:
  // - https://vimeo.com/VIDEO_ID
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = clean.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct MP4 / WebM / video link:
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean) || clean.startsWith("blob:") || clean.startsWith("data:video")) {
    return {
      type: "video",
      embedUrl: clean,
    };
  }

  return { type: "unknown", embedUrl: clean };
}

/**
 * Return poster thumbnail: custom poster or YouTube high-res thumbnail
 */
export function getVideoPoster(videoUrl: string = "", customPoster?: string): string {
  if (customPoster && customPoster.trim()) return customPoster.trim();
  const parsed = parseVideoUrl(videoUrl);
  if (parsed.type === "youtube" && parsed.videoId) {
    return `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
  }
  return "";
}

/**
 * Interactive Video Player component with custom poster, animated play button, and inline playback
 */
export function VideoPlayer({
  videoUrl,
  videoPoster,
  videoTitle,
  videoSubtitle,
  videoBadge,
  aspectRatio = "16/9",
  rounded = "rounded-2xl",
  className,
}: {
  videoUrl?: string;
  videoPoster?: string;
  videoTitle?: string;
  videoSubtitle?: string;
  videoBadge?: string;
  aspectRatio?: string;
  rounded?: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const parsed = parseVideoUrl(videoUrl);
  const poster = getVideoPoster(videoUrl, videoPoster);

  const aspectClass =
    aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : aspectRatio === "21/9"
      ? "aspect-[21/9]"
      : "aspect-video";

  if (!videoUrl && !poster) {
    return (
      <div
        className={cn(
          "w-full flex flex-col items-center justify-center p-12 bg-slate-900/10 dark:bg-slate-900 border border-dashed border-slate-200/85 dark:border-slate-800 text-muted-foreground text-xs gap-2 min-h-[220px]",
          aspectClass,
          rounded,
          className,
        )}
      >
        <Film className="size-8 opacity-40 text-primary" />
        <span className="font-medium">No video URL has been added</span>
        <span className="text-[11px] opacity-75">Supports YouTube, Vimeo, or an MP4 file</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-lg group transition-all duration-300",
        aspectClass,
        rounded,
        className,
      )}
    >
      {isPlaying ? (
        parsed.type === "youtube" || parsed.type === "vimeo" ? (
          <iframe
            src={parsed.embedUrl}
            title={videoTitle || "Video player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={parsed.embedUrl}
            poster={poster || undefined}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )
      ) : (
        <div
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full cursor-pointer overflow-hidden group/play"
        >
          {/* Poster image or dark placeholder */}
          {poster ? (
            <img
              src={poster}
              alt={videoTitle || "Video thumbnail"}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/play:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center" />
          )}

          {/* Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover/play:from-black/70 transition-all duration-300" />

          {/* Video Badge (Top-left) */}
          {videoBadge && (
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-blue-600/90 text-white shadow-md backdrop-blur-md border border-blue-400/30 flex items-center gap-1.5">
                <Film className="size-3" />
                {videoBadge}
              </span>
            </div>
          )}

          {/* Centered Pulsing Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-20 rounded-full bg-primary/30 animate-ping opacity-60" />
              <div className="relative size-16 sm:size-18 rounded-full bg-white/95 dark:bg-primary text-primary dark:text-white shadow-2xl flex items-center justify-center pl-1 group-hover/play:scale-110 group-hover/play:bg-primary group-hover/play:text-white transition-all duration-300">
                <Play className="size-7 sm:size-8 fill-current transition-transform duration-300 group-hover/play:scale-110" />
              </div>
            </div>
          </div>

          {/* Bottom Title & Subtitle */}
          {(videoTitle || videoSubtitle) && (
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 flex flex-col gap-1 text-white">
              {videoTitle && (
                <h4 className="text-base sm:text-lg font-bold line-clamp-2 drop-shadow-md text-white">
                  {videoTitle}
                </h4>
              )}
              {videoSubtitle && (
                <p className="text-xs sm:text-sm text-white/80 line-clamp-1 drop-shadow-sm">
                  {videoSubtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Clickable Image Card component navigating to href with high-end hover effects
 */
export function ClickableImageCard({
  imageSrc,
  imageHref,
  imageOpenInNewTab,
  imageAlt,
  imageTitle,
  imageSubtitle,
  imageBadge,
  aspectRatio = "16/9",
  rounded = "rounded-2xl",
  className,
}: {
  imageSrc?: string;
  imageHref?: string;
  imageOpenInNewTab?: boolean;
  imageAlt?: string;
  imageTitle?: string;
  imageSubtitle?: string;
  imageBadge?: string;
  aspectRatio?: string;
  rounded?: string;
  className?: string;
}) {
  const aspectClass =
    aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "21/9"
      ? "aspect-[21/9]"
      : aspectRatio === "auto"
      ? ""
      : "aspect-video";

  const cardInner = (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md transition-all duration-500",
        rounded,
        imageHref && "group cursor-pointer hover:shadow-2xl hover:border-primary/50",
        aspectClass,
        className,
      )}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt || imageTitle || "Image"}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 ease-out",
            imageHref && "group-hover:scale-105",
          )}
        />
      ) : (
        <div className="w-full h-full min-h-[220px] bg-slate-800/40 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2">
          <Film className="size-8 opacity-40 text-primary" />
          <span className="text-xs font-medium">No image selected</span>
        </div>
      )}

      {/* Dark overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/75 transition-all duration-300 pointer-events-none" />

      {/* Top Badge */}
      {imageBadge && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-white/90 text-slate-900 shadow-md backdrop-blur-md border border-white/50 flex items-center gap-1.5">
            <Bookmark className="size-3 text-primary" />
            {imageBadge}
          </span>
        </div>
      )}

      {/* Interactive Link Indicator (Top Right) */}
      {imageHref && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="size-9 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
            <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Information */}
      {(imageTitle || imageSubtitle || imageHref) && (
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 flex flex-col gap-1 text-white pointer-events-none">
          {imageTitle && (
            <h4 className="text-base sm:text-lg font-bold line-clamp-2 drop-shadow-md text-white group-hover:text-primary-foreground transition-colors">
              {imageTitle}
            </h4>
          )}
          {imageSubtitle && (
            <p className="text-xs sm:text-sm text-white/85 line-clamp-2 drop-shadow-sm font-normal">
              {imageSubtitle}
            </p>
          )}

          {/* Action indicator button */}
          {imageHref && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary-300 group-hover:text-white transition-colors">
              <span>{imageBadge || "View details"}</span>
              <ArrowUpRight className="size-3.5" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (imageHref) {
    return (
      <Link
        href={imageHref}
        target={imageOpenInNewTab ? "_blank" : undefined}
        rel={imageOpenInNewTab ? "noopener noreferrer" : undefined}
        className="block focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-2xl transition-transform"
      >
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}

/**
 * Composite Image & Video Block Renderer supporting 6 versatile layouts
 */
export function ImageVideoRenderer({
  badge,
  title,
  description,
  layout = "split-img-left",
  imageSrc,
  imageHref,
  imageOpenInNewTab = false,
  imageAlt,
  imageTitle,
  imageSubtitle,
  imageBadge = "Explore",
  videoUrl,
  videoPoster,
  videoTitle,
  videoSubtitle,
  videoBadge = "Official video",
  aspectRatio = "16/9",
  containerWidth = "max-w-7xl",
  rounded = "rounded-2xl",
  locale = "en",
  styles,
  ...rest
}: {
  badge?: string; title?: string | { en?: string; vi?: string }; description?: string | { en?: string; vi?: string };
  layout?: string; imageSrc?: string; imageHref?: string; imageOpenInNewTab?: boolean; imageAlt?: string;
  imageTitle?: string; imageSubtitle?: string; imageBadge?: string; videoUrl?: string; videoPoster?: string;
  videoTitle?: string; videoSubtitle?: string; videoBadge?: string; aspectRatio?: string; containerWidth?: string;
  rounded?: string; locale?: Locale; styles?: Record<string, unknown>;
}) {
  const titleText = getLocalizedText(title, locale);
  const descText = getLocalizedText(description, locale);

  const imageCard = (
    <ClickableImageCard
      imageSrc={imageSrc}
      imageHref={imageHref}
      imageOpenInNewTab={imageOpenInNewTab}
      imageAlt={imageAlt}
      imageTitle={imageTitle}
      imageSubtitle={imageSubtitle}
      imageBadge={imageBadge}
      aspectRatio={aspectRatio}
      rounded={rounded}
    />
  );

  const videoPlayer = (
    <VideoPlayer
      videoUrl={videoUrl}
      videoPoster={videoPoster}
      videoTitle={videoTitle}
      videoSubtitle={videoSubtitle}
      videoBadge={videoBadge}
      aspectRatio={aspectRatio}
      rounded={rounded}
    />
  );

  return (
    <section
      className={cn("w-full mx-auto px-4 sm:px-6 py-10 sm:py-16", containerWidth)}
      style={spacingStyle(styles || rest)}
    >
      {/* Header Info */}
      {(badge || titleText || descText) && (
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Bookmark className="size-3" />
              {badge}
            </span>
          )}
          {titleText && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {titleText}
            </h2>
          )}
          {descText && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {descText}
            </p>
          )}
        </div>
      )}

      {/* Layout Variations */}
      {layout === "split-img-left" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div>{imageCard}</div>
          <div>{videoPlayer}</div>
        </div>
      )}

      {layout === "split-video-left" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="order-2 lg:order-1">{videoPlayer}</div>
          <div className="order-1 lg:order-2">{imageCard}</div>
        </div>
      )}

      {layout === "bento-img-wide" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7">{imageCard}</div>
          <div className="lg:col-span-5">{videoPlayer}</div>
        </div>
      )}

      {layout === "bento-video-wide" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7">{videoPlayer}</div>
          <div className="lg:col-span-5">{imageCard}</div>
        </div>
      )}

      {layout === "stack-video-top" && (
        <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div>{videoPlayer}</div>
          <div>{imageCard}</div>
        </div>
      )}

      {layout === "overlay-play" && (
        <div className="relative max-w-5xl mx-auto">
          {videoPlayer}
          {imageHref && (
            <div className="mt-4 text-center">
              <Link
                href={imageHref}
                target={imageOpenInNewTab ? "_blank" : undefined}
                rel={imageOpenInNewTab ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                <span>{imageBadge || "View details"}</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Standalone Video Block Renderer
 */
export function VideoRenderer({
  url,
  poster,
  title,
  caption,
  aspectRatio = "16/9",
  maxWidth = "max-w-4xl",
  locale = "en",
  styles,
  ...rest
}: {
  url?: string; poster?: string; title?: string; caption?: string | { en?: string; vi?: string };
  aspectRatio?: string; maxWidth?: string; locale?: Locale; styles?: Record<string, unknown>;
}) {
  const captionText = getLocalizedText(caption, locale);

  return (
    <figure
      className={cn("w-full mx-auto px-4 py-8", maxWidth)}
      style={spacingStyle(styles || rest)}
    >
      <VideoPlayer
        videoUrl={url}
        videoPoster={poster}
        videoTitle={title}
        aspectRatio={aspectRatio}
        rounded="rounded-2xl"
      />
      {captionText && (
        <figcaption className="text-center text-xs text-muted-foreground mt-3">
          {captionText}
        </figcaption>
      )}
    </figure>
  );
}
