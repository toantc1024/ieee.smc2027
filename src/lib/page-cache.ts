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

/**
 * Invalidate Next.js cache for posts across public news/post views and admin lists.
 */
export function revalidatePostPaths(slug?: string) {
  try {
    revalidatePath("/");
    revalidatePath("/", "page");
    revalidatePath("/news");
    revalidatePath("/news", "page");
    revalidatePath("/admin/posts");
    if (slug) {
      const cleanSlug = slug.startsWith("/") ? slug.slice(1) : slug;
      revalidatePath(`/news/${cleanSlug}`);
      revalidatePath(`/news/${cleanSlug}`, "page");
      revalidatePath(`/posts/${cleanSlug}`);
      revalidatePath(`/posts/${cleanSlug}`, "page");
    }
  } catch (error) {
    console.warn(`[revalidatePostPaths] Error revalidating ${slug ?? "posts"}:`, error);
  }
}

