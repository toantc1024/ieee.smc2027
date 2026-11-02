/**
 * Analytics Utility Formatters
 * Normalizes localized strings and sanitizes metric values.
 */

/**
 * Safely resolves localized name from I18nString objects or stringified JSON.
 * Fixes the issue where tags or categories render raw JSON like {"en": "Robotics"}.
 */
export function formatLocalizedName(
  val: unknown,
  preferredLocale: string = "en"
): string {
  if (!val) return "";

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const direct = obj[preferredLocale] || obj.en || obj.vi;
    if (direct) return String(direct);
    const first = Object.values(obj).find(
      (v) => v !== null && v !== undefined && v !== ""
    );
    return first ? String(first) : "";
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatLocalizedName(parsed, preferredLocale);
      } catch {
        // Fall back to clean trimmed string
      }
    }
    return trimmed;
  }

  return String(val);
}

/**
 * Ensures duration values (e.g. average days, median days) are positive numbers.
 * Protects against negative values resulting from reversed timestamp subtractions.
 */
export function formatPositiveDays(
  days: number | undefined | null,
  decimals = 1
): string {
  if (days === undefined || days === null || isNaN(days)) return "0.0";
  return Math.abs(days).toFixed(decimals);
}
