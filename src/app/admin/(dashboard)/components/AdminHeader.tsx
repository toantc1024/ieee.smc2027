"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItemData[] {
  const items: BreadcrumbItemData[] = [
    { label: "Console", href: "/admin" },
  ];

  if (pathname === "/admin") {
    items.push({ label: "Overview" });
    return items;
  }

  if (pathname.startsWith("/admin/posts")) {
    items.push({ label: "Content Management" });
    items.push({ label: "Posts & News", href: "/admin/posts" });
    if (pathname === "/admin/posts/new") {
      items.push({ label: "New Post" });
    } else if (pathname !== "/admin/posts") {
      items.push({ label: "Editor" });
    }
    return items;
  }

  if (pathname.startsWith("/admin/media")) {
    items.push({ label: "Content Management" });
    items.push({ label: "Media Library", href: "/admin/media" });
    return items;
  }

  if (pathname.startsWith("/admin/pages")) {
    items.push({ label: "Website" });
    items.push({ label: "Pages", href: "/admin/pages" });
    if (pathname !== "/admin/pages") {
      items.push({ label: "Visual Page Builder" });
    }
    return items;
  }

  if (pathname.startsWith("/admin/header")) {
    items.push({ label: "Website" });
    items.push({ label: "Header & Navigation", href: "/admin/header" });
    return items;
  }

  if (pathname.startsWith("/admin/registrations")) {
    items.push({ label: "Conference & Finance" });
    items.push({ label: "Registrations & Payoo", href: "/admin/registrations" });
    return items;
  }

  if (pathname.startsWith("/admin/broadcast")) {
    items.push({ label: "Conference & Finance" });
    items.push({ label: "Broadcast Emails", href: "/admin/broadcast" });
    return items;
  }

  if (pathname.startsWith("/admin/users")) {
    items.push({ label: "Administration" });
    items.push({ label: "Users & Roles", href: "/admin/users" });
    return items;
  }

  items.push({ label: "Dashboard" });
  return items;
}

export function AdminHeader() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4">
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <SidebarTrigger className="-ml-1 mr-1" />

        <Breadcrumb className="min-w-0 overflow-hidden">
          <BreadcrumbList className="flex-nowrap whitespace-nowrap overflow-hidden text-xs">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div
                  key={item.label + index}
                  className="flex items-center gap-1.5 min-w-0 shrink-0"
                >
                  {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
                  <BreadcrumbItem className="min-w-0">
                    {item.href && !isLast ? (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-primary transition-colors max-w-[140px] truncate block"
                          title={item.label}
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage
                        className="font-normal text-foreground max-w-[200px] truncate block"
                        title={item.label}
                      >
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors border border-slate-200/80 dark:border-slate-700"
        >
          <span>View Site</span>
          <ExternalLink className="size-3.5 text-slate-400 group-hover:text-primary" />
        </Link>
      </div>
    </header>
  );
}
