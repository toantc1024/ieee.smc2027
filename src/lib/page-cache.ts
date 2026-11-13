import { revalidatePath } from "next/cache";

/**
 * Invalidate Next.js cache for a page route across public and admin views.
 */
export function revalidatePagePaths(slug: string) {
  const cleanSlug = slug.startsWith("/") ? slug.slice(1) : slug;
  const publicPath = cleanSlug === "home" || cleanSlug === "" ? "/" : `/${cleanSlug}`;

  try {
    revalidatePath(publicPath);
    revalidatePath(publicPath, "page");
    revalidatePath("/admin/pages");
    if (publicPath === "/") {
      revalidatePath("/home");
      revalidatePath("/home", "page");
    }
  } catch (error) {
    console.warn(`[revalidatePagePaths] Error revalidating ${publicPath}:`, error);
  }
}
