/**
 * Umami & Internal Custom Events Dispatcher
 * Provides typed convenience helpers for tracking user actions:
 * - Section / Tab clicks
 * - Document downloads (PDFs, docs)
 * - Form submissions
 * - Custom telemetry events
 */

declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string | ((props: Record<string, unknown>) => Record<string, unknown>),
        eventData?: Record<string, unknown>
      ) => void;
      identify?: (userId: string, userAttributes?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Dispatches a custom event to Umami if initialized, and reports to internal telemetry.
 */
export function trackUmamiEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  if (window.umami && typeof window.umami.track === "function") {
    try {
      window.umami.track(eventName, eventData);
    } catch (e) {
      console.warn("[Umami] Failed to track event:", eventName, e);
    }
  }

  // Also post to internal analytics endpoint non-blockingly
  try {
    fetch("/api/admin/analytics/website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        ...eventData,
      }),
      keepalive: true,
    }).catch(() => {
      // Ignore background telemetry transmission errors
    });
  } catch {
    // Silent fail-safe
  }
}

/**
 * Tracks when a user clicks a content section tab or accordion.
 */
export function trackSectionTabClick(
  sectionId: string,
  tabName: string,
  extraData?: Record<string, unknown>
): void {
  trackUmamiEvent("Section Tab Click", {
    section_id: sectionId,
    tab_name: tabName,
    ...extraData,
  });
}

/**
 * Tracks when a user downloads an academic or conference document/PDF.
 */
export function trackDocumentDownload(
  fileName: string,
  category?: string,
  extraData?: Record<string, unknown>
): void {
  trackUmamiEvent("Download Document", {
    file_name: fileName,
    category: category || "general",
    ...extraData,
  });
}

/**
 * Tracks when a user submits a contact or registration inquiry.
 */
export function trackFormSubmission(
  formName: string,
  status: "success" | "failed",
  extraData?: Record<string, unknown>
): void {
  trackUmamiEvent("Form Submission", {
    form_name: formName,
    status,
    ...extraData,
  });
}

/**
 * Tracks when a user selects an audience category in the Audience Survey.
 */
export function trackAudienceSurvey(
  audienceType: string,
  audienceLabel: string,
  extraData?: Record<string, unknown>
): void {
  trackUmamiEvent("Audience Survey Selection", {
    audience_type: audienceType,
    audience_label: audienceLabel,
    ...extraData,
  });
}
