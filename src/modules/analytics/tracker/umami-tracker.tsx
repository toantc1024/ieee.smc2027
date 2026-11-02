"use client";

import React from "react";
import Script from "next/script";
import { useSectionFocusTracker } from "./use-section-focus-tracker";

interface UmamiTrackerProps {
  initialConfig?: { scriptUrl?: string; websiteId?: string } | null;
  tenantCode?: string;
}

export function sanitizeScriptUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim().replace(/([^:]\/)\/+/g, "$1");

  // Prevent Mixed Content on HTTPS pages
  const isHttps =
    (typeof window !== "undefined" && window.location?.protocol === "https:") ||
    (typeof process !== "undefined" && process.env?.NODE_ENV === "production");

  if (isHttps && url.startsWith("http://")) {
    url = url.replace(/^http:\/\//i, "https://");
  }

  return url;
}

/**
 * Dynamic Umami Analytics Tracker Injector
 * - Resolves tracking configuration from props or environment variables.
 * - Dynamically injects script tag with src=umamiScriptUrl and data-website-id=analyticsWebsiteId.
 * - Activates Section Focus observation for .content-section elements.
 */
export function UmamiTracker({ initialConfig, tenantCode }: UmamiTrackerProps) {
  // Activate Section Focus tracking on public content pages
  useSectionFocusTracker({ tenantCode });

  const scriptUrl =
    sanitizeScriptUrl(initialConfig?.scriptUrl) ||
    sanitizeScriptUrl(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL);
  const websiteId =
    initialConfig?.websiteId || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!scriptUrl || !websiteId) {
    return null;
  }

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
