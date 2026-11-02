"use client";

import { useEffect } from "react";
import { trackUmamiEvent } from "./custom-events";

interface SectionFocusTrackerOptions {
  tenantCode?: string;
  threshold?: number;
  selector?: string;
}

/**
 * Hook to automatically observe content sections and send "Section Focus" events to Umami
 * when a section occupies at least 50% (threshold = 0.5) of the viewport.
 */
export function useSectionFocusTracker({
  tenantCode,
  threshold = 0.5,
  selector = ".content-section, [data-section-name]",
}: SectionFocusTrackerOptions = {}) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const trackedSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const sectionId = el.id || el.getAttribute("data-section-id") || "unknown-section";
            const sectionName =
              el.getAttribute("data-section-name") ||
              el.getAttribute("aria-label") ||
              sectionId;

            // Avoid rapid duplicate fires within the same page session
            const key = `${sectionId}:${sectionName}`;
            if (!trackedSections.has(key)) {
              trackedSections.add(key);
              trackUmamiEvent("Section Focus", {
                section_id: sectionId,
                section_name: sectionName,
                tenant: tenantCode || "default",
              });
            }
          }
        });
      },
      { threshold }
    );

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [tenantCode, threshold, selector]);
}
