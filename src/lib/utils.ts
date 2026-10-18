import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import path from "path";

/**
 * Merge Tailwind CSS classes safely without style conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize email address (lowercase + trim)
 */
export function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Normalize conference registration code (uppercase + trim)
 */
export function normalizeRegistrationCode(code?: string | null): string {
  return (code || "").trim().toUpperCase();
}

/**
 * Convert a single string into a URL-safe slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalize a multi-segment hierarchical page slug path (e.g. "program/sessions")
 */
export function normalizeSlugPath(rawPath: string): string {
  return rawPath
    .toLowerCase()
    .trim()
    .split("/")
    .map((segment) => segment.replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/");
}

/**
 * Sanitize uploaded file name into timestamped stem and lowercase extension
 */
export function sanitizeFilename(filename: string): {
  stem: string;
  ext: string;
  fullName: string;
} {
  const ext = path.extname(filename).toLowerCase() || ".bin";
  const base = path.basename(filename, path.extname(filename));
  const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "file";
  const stem = `${Date.now()}-${safeBase}`;
  return {
    stem,
    ext,
    fullName: `${stem}${ext}`,
  };
}

/**
 * Safely extract human-readable error message from unknown catch error
 */
export function extractErrorMessage(
  error: unknown,
  fallback = "Internal Server Error"
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  return fallback;
}

/**
 * Format currency in Vietnamese Dong (VND)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency in US Dollars (USD)
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format Date in Vietnamese locale (dd/mm/yyyy)
 */
export function formatDateVi(date?: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
}

/**
 * Format Time in Vietnamese locale (HH:mm:ss)
 */
export function formatTimeVi(date?: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("vi-VN");
}
