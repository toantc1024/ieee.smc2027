/** Draft previews are restricted to administrators with an active session. */
export function canViewPage(isPublished: boolean, preview: string | undefined, role?: string): boolean {
  return isPublished || ((preview === "true" || preview === "1") && role === "ADMIN");
}
