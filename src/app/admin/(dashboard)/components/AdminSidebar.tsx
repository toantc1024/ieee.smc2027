"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Home,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  quickNavItems,
  sidebarMenuGroups,
  type SidebarMenuGroup,
} from "./sidebar-config";
import type { SessionUser } from "@/lib/auth";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

const LIGHT_AVATAR_COLORS = [
  { bg: "#0d529c", text: "#ffffff" }, // Corporate Royal Blue
  { bg: "#0f766e", text: "#ffffff" }, // Executive Deep Teal
  { bg: "#1e3a8a", text: "#ffffff" }, // Deep Navy
  { bg: "#0369a1", text: "#ffffff" }, // Ocean Sapphire
  { bg: "#334155", text: "#ffffff" }, // Architectural Slate
  { bg: "#4338ca", text: "#ffffff" }, // Refined Indigo
  { bg: "#15803d", text: "#ffffff" }, // Forest Green
  { bg: "#854d0e", text: "#ffffff" }, // Warm Amber Bronze
  { bg: "#991b1b", text: "#ffffff" }, // Deep Crimson
];

const NIGHT_AVATAR_COLORS = [
  { bg: "#1e293b", text: "#f8fafc" }, // Midnight Slate
  { bg: "#312e81", text: "#e0e7ff" }, // Twilight Indigo
  { bg: "#1e1b4b", text: "#c7d2fe" }, // Deepest Navy
  { bg: "#134e4a", text: "#ccfbf1" }, // Dark Emerald Teal
  { bg: "#3b0764", text: "#f3e8ff" }, // Royal Violet
  { bg: "#0c4a6e", text: "#e0f2fe" }, // Nocturne Cyan
  { bg: "#1f2937", text: "#f9fafb" }, // Rich Charcoal
  { bg: "#450a0a", text: "#fee2e2" }, // Night Bordeaux
];

function getAvatarSolidColor(name: string, isNight: boolean) {
  const palette = isNight ? NIGHT_AVATAR_COLORS : LIGHT_AVATAR_COLORS;
  let hash = 0;
  const str = name || "User";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % palette.length;
  return palette[idx];
}

interface AdminSidebarProps {
  user: SessionUser;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const [isConfirmHomeOpen, setIsConfirmHomeOpen] = useState(false);

  const handleGoHome = useCallback(() => {
    setIsConfirmHomeOpen(false);
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const greeting = useMemo(() => getTimeGreeting(), []);
  const brandSiteName = "HCMUTE - IEEE SMC 2027";
  const displayUnit = "HCMUTE - IEEE SMC 2027";

  const isNightTime = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  }, []);

  const avatarColor = useMemo(() => {
    const identifier = user?.name || user?.email || "Admin";
    return getAvatarSolidColor(identifier, isNightTime);
  }, [user?.name, user?.email, isNightTime]);

  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = scrollContentRef.current;
    if (!el) return;
    const isDown = el.scrollTop + el.clientHeight < el.scrollHeight - 6;
    setCanScrollDown((prev) => (prev !== isDown ? isDown : prev));
  }, []);

  useEffect(() => {
    const el = scrollContentRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const normalizeHref = (href: string) =>
    href.split("?")[0].replace(/\/$/, "") || "/";

  const activeHref = useMemo(() => {
    const candidates = [
      ...quickNavItems.map((item) => item.href),
      ...sidebarMenuGroups.flatMap((group) => group.items.map((item) => item.href)),
      "/admin/profile",
    ]
      .map(normalizeHref)
      .filter((href) => href !== "/admin")
      .sort((a, b) => b.length - a.length);

    return (
      candidates.find((href) => pathname === href || pathname.startsWith(`${href}/`)) ??
      (pathname === "/admin" ? "/admin" : null)
    );
  }, [pathname]);

  const isActive = (href: string) => normalizeHref(href) === activeHref;
  const isProfileActive =
    pathname === "/admin/profile" || pathname.startsWith("/admin/profile/");

  const getUserInitials = () => {
    const rawName = user?.name || "Admin";
    if (rawName.trim()) {
      const parts = rawName.trim().split(/\s+/);
      const lastPart = parts[parts.length - 1];
      return (lastPart ? lastPart[0] : parts[0][0]).toUpperCase();
    }
    return "A";
  };

  const displayName = user?.name || "Administrator";

  const handleItemClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    try {
      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const scrollToActive = () => {
      if (!scrollContentRef.current) return;
      const activeEl = scrollContentRef.current.querySelector<HTMLElement>(
        '[data-active-item="true"], a.sidebar-nav-active, [data-active="true"]'
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    const timer1 = setTimeout(scrollToActive, 80);
    const timer2 = setTimeout(scrollToActive, 260);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeHref]);

  return (
    <Sidebar
      collapsible="icon"
      className="bg-white dark:bg-[#090e1a] group-data-[side=left]:border-r border-sidebar-border shadow-none relative overflow-hidden"
    >
      {/* ── Brand Header ── */}
      <SidebarHeader
        className={cn(
          "shrink-0 h-16 flex items-center",
          state === "collapsed"
            ? "p-0 justify-center w-full"
            : "px-3 justify-center"
        )}
      >
        {state === "collapsed" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/admin/posts"
                className="size-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 outline-hidden aspect-square cursor-pointer"
              >
                <Image
                  src="/logo/square-logo.png"
                  alt={brandSiteName}
                  width={38}
                  height={38}
                  priority
                  className="size-8.5 object-contain"
                />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {brandSiteName}
            </TooltipContent>
          </Tooltip>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={brandSiteName}
                className="data-[state=open]:bg-transparent hover:bg-transparent rounded-xl transition-all h-auto py-0.5 px-1 justify-center"
                asChild
              >
                <Link href="/admin/posts" className="flex items-center justify-center w-full">
                  <div className="relative h-10 w-full flex items-center justify-center">
                    <Image
                      src="/logo/rectangle-logo.png"
                      alt={brandSiteName}
                      width={260}
                      height={70}
                      priority
                      className="h-9 sm:h-10 w-auto max-w-full object-contain dark:brightness-110"
                    />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>

      {/* ── Profile Greeting Card ── */}
      {state !== "collapsed" && (
        <div className="px-2 pt-4 pb-2 shrink-0 select-none">
          <Link
            href="/admin/profile"
            prefetch={true}
            onClick={handleItemClick}
            className={cn(
              "block relative overflow-hidden rounded-2xl text-white py-4.5 px-3.5 min-h-[92px] shadow-sm border border-white/20 bg-primary/20 backdrop-blur-md transition-all duration-200 group/greeting-card cursor-pointer",
              isProfileActive
                ? "ring-2 ring-white/50 bg-white/15 backdrop-blur-md shadow-md"
                : "hover:border-white/35 hover:shadow-md active:scale-[0.99]"
            )}
            title="View Profile"
          >
            {/* Background Image Asset */}
            <div className="absolute inset-0 select-none pointer-events-none">
              <Image
                src="/assets/sidebar-greeting-bg.jpg"
                alt="HCMUTE Innovation"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent pointer-events-none" />
            </div>

            <div className="relative z-1 flex flex-col justify-between">
              {/* Top Row: Avatar + Greeting + Display Name */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar className="size-11 rounded-xl shrink-0 shadow-sm border border-white/25 group-hover/greeting-card:border-white/40 transition-colors">
                    <AvatarFallback
                      style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                      className="rounded-xl font-medium text-xs select-none tracking-normal"
                    >
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-medium text-white/80 leading-tight drop-shadow-xs">
                      {greeting}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold tracking-tight text-white truncate mt-0.5 drop-shadow-xs group-hover/greeting-card:text-white transition-colors">
                      {displayName}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 shadow-2xs self-center",
                    isProfileActive
                      ? "opacity-100 bg-white/30 backdrop-blur-md border-white/55 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ring-2 ring-white/35"
                      : "opacity-0 translate-x-1 group-hover/greeting-card:opacity-100 group-hover/greeting-card:translate-x-0 bg-white/20 backdrop-blur-md border-white/35 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover/greeting-card:bg-white/30 group-hover/greeting-card:border-white/50"
                  )}
                  aria-hidden="true"
                >
                  <ChevronRight className="size-4 stroke-[2.4] shrink-0" />
                </div>
              </div>

              {/* Bottom Row: Role badge & Unit badge */}
              <div className="mt-2.5 flex items-center gap-1.5 min-w-0">
                <span className="inline-flex items-center text-[9.5px] font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-2xs shrink-0 whitespace-nowrap">
                  {user.role === "ADMIN" ? "Administrator" : "Organizer"}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[9.5px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-2xs min-w-0 truncate max-w-full"
                  title={`Unit: ${displayUnit}`}
                >
                  <span className="text-white/75 shrink-0">Unit: </span>
                  <span className="font-semibold text-white truncate">{displayUnit}</span>
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Scrollable Navigation Items Area with Progressive Blur ── */}
      <div id="admin-sidebar-nav" className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <SidebarContent
          ref={scrollContentRef}
          onScroll={checkScroll}
          className="gap-1 px-1 group-data-[collapsible=icon]:px-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-12"
        >
          {/* ── Quick Nav Items ── */}
          {state === "collapsed" ? (
            <SidebarGroup className="p-0 py-0.5 flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center gap-1 w-full">
                {/* Visit Homepage */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                          return;
                        }
                        e.preventDefault();
                        setIsConfirmHomeOpen(true);
                      }}
                      className="size-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 outline-hidden cursor-pointer aspect-square hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                      <Home className="size-4.5 shrink-0 transition-colors duration-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Visit Homepage
                  </TooltipContent>
                </Tooltip>

                {quickNavItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          prefetch={true}
                          onClick={handleItemClick}
                          data-active-item={active ? "true" : undefined}
                          className={cn(
                            "size-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 outline-hidden cursor-pointer aspect-square",
                            active
                              ? "sidebar-nav-active text-primary-foreground hover:brightness-95"
                              : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4.5 shrink-0 transition-colors duration-200",
                              active ? "text-primary-foreground" : ""
                            )}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </SidebarGroup>
          ) : (
            <SidebarGroup className="px-2 py-1">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {/* Visit Homepage */}
                  <SidebarMenuItem className="w-full">
                    <SidebarMenuButton
                      asChild
                      tooltip="Visit Homepage"
                      className="relative overflow-hidden rounded-xl px-2.5 py-2 h-auto flex items-center gap-3 transition-all duration-200 group/navitem border w-full border-transparent hover:border-primary/45 dark:hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-foreground/80 hover:text-foreground cursor-pointer shadow-none"
                    >
                      <Link
                        href="/"
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                            return;
                          }
                          e.preventDefault();
                          setIsConfirmHomeOpen(true);
                        }}
                      >
                        <div className="relative z-1 size-7 flex items-center justify-center shrink-0">
                          <Home className="size-4.5 shrink-0 text-muted-foreground group-hover/navitem:text-primary transition-colors duration-200" />
                        </div>
                        <span className="relative z-1 truncate min-w-0 flex-1 text-xs font-medium group-hover/navitem:font-semibold transition-colors">
                          Visit Homepage
                        </span>
                        <ExternalLink className="relative z-1 size-3.5 text-muted-foreground/60 group-hover/navitem:text-primary/70 transition-colors shrink-0 mr-1" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {quickNavItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.id} className="w-full">
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          data-active-item={active ? "true" : undefined}
                          className={cn(
                            "relative overflow-hidden rounded-xl px-2.5 py-2 h-auto flex items-center gap-3 transition-all duration-200 group/navitem border w-full shadow-none",
                            active
                              ? "sidebar-nav-active font-semibold text-primary-foreground"
                              : "border-transparent hover:border-primary/45 dark:hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-foreground/80 hover:text-foreground"
                          )}
                        >
                          <Link
                            href={item.href}
                            prefetch={true}
                            onClick={handleItemClick}
                            className="relative z-1 min-w-0 flex items-center gap-3 w-full"
                          >
                            {active && (
                              <div
                                className="sidebar-dot-pattern pointer-events-none absolute bottom-0 right-0 w-20 h-6 rounded-br-xl"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative z-1 size-7 flex items-center justify-center shrink-0">
                              <Icon
                                className={cn(
                                  "size-4.5 shrink-0 transition-colors duration-200",
                                  active
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground group-hover/navitem:text-primary"
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "relative z-1 truncate min-w-0 flex-1 text-xs transition-colors",
                                active
                                  ? "font-semibold text-primary-foreground"
                                  : "font-medium group-hover/navitem:font-semibold"
                              )}
                            >
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* ── Collapsible Menu Groups ── */}
          {sidebarMenuGroups.map((group) => (
            <NavGroup
              key={group.id}
              group={group}
              isActive={isActive}
            />
          ))}
        </SidebarContent>

        {/* Bottom Progressive Blur */}
        <ProgressiveBlur
          position="bottom"
          height="56px"
          className={cn(
            "pointer-events-none group-data-[collapsible=icon]:hidden z-10 transition-opacity duration-200",
            canScrollDown ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Bottom Chevron Scroll Indicator */}
        {canScrollDown && state !== "collapsed" && (
          <button
            type="button"
            onClick={() => scrollContentRef.current?.scrollBy({ top: 140, behavior: "smooth" })}
            title="Scroll down for more"
            aria-label="Scroll down for more"
            className="absolute bottom-0 inset-x-0 z-20 h-10 w-full flex items-end justify-center bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-[#090e1a]/95 dark:via-[#090e1a]/70 dark:to-transparent hover:via-white dark:hover:via-[#090e1a] transition-colors cursor-pointer group-data-[collapsible=icon]:hidden pb-2"
          >
            <ChevronDown className="size-5 shrink-0 stroke-[2.4] text-muted-foreground hover:text-primary transition-all hover:translate-y-0.5 mb-1.5" />
          </button>
        )}
      </div>

      {/* ── Sidebar Footer: Collapse Toggle & Logout Action ── */}
      <SidebarFooter
        className={cn(
          "relative z-10 bg-white dark:bg-card border-t border-sidebar-border shrink-0 shadow-none",
          state === "collapsed" ? "p-0 py-2 flex flex-col items-center justify-center gap-1.5 w-full" : "p-2"
        )}
      >
        {state === "collapsed" ? (
          <div className="flex flex-col items-center gap-1.5 w-full">
            {/* Collapse/Expand Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  data-testid="sidebar-collapse-toggle"
                  aria-label="Expand sidebar"
                  className="size-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 outline-hidden cursor-pointer aspect-square bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-foreground/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary dark:hover:bg-primary/20 dark:hover:border-primary/50 group/toggle shadow-none"
                >
                  <ChevronRight className="size-4 stroke-[2.2] transition-transform duration-200 group-hover/toggle:translate-x-0.5 text-muted-foreground group-hover/toggle:text-primary shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                Expand sidebar
              </TooltipContent>
            </Tooltip>

            <div className="w-7 my-1 border-t border-sidebar-border" />

            {/* Logout (Collapsed) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    aria-label="Log out"
                    className="size-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 outline-hidden cursor-pointer aspect-square bg-transparent hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/60 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 group/logout shadow-none"
                  >
                    <LogOut className="size-4 transition-transform group-hover/logout:-translate-x-0.5 text-slate-500 dark:text-slate-400 group-hover/logout:text-red-600 dark:group-hover/logout:text-red-400 shrink-0" />
                  </button>
                </form>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                Log out
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <SidebarMenu className="items-center w-full gap-1">
            {/* Collapse/Expand Toggle */}
            <SidebarMenuItem className="w-full">
              <SidebarMenuButton
                onClick={toggleSidebar}
                data-testid="sidebar-collapse-toggle"
                tooltip="Collapse sidebar"
                className={cn(
                  "relative overflow-hidden rounded-lg px-2.5 py-1.5 h-8.5 flex items-center gap-2.5 w-full cursor-pointer transition-all duration-200 border group/collapse shadow-none",
                  "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-foreground/80 font-medium",
                  "hover:bg-primary/10 hover:border-primary/40 hover:text-primary dark:hover:bg-primary/20 dark:hover:border-primary/50"
                )}
              >
                <div className="size-5 flex items-center justify-center shrink-0">
                  <ChevronLeft className="size-4 stroke-[2.2] transition-transform duration-200 group-hover/collapse:-translate-x-0.5 text-muted-foreground group-hover/collapse:text-primary" />
                </div>
                <span className="text-xs font-semibold transition-colors group-hover/collapse:text-primary">
                  Collapse sidebar
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <div className="w-full my-1 border-t border-sidebar-border" />

            {/* Logout button */}
            <SidebarMenuItem className="w-full">
              <form action="/api/auth/logout" method="POST" className="w-full">
                <SidebarMenuButton
                  type="submit"
                  tooltip="Log out"
                  className={cn(
                    "relative overflow-hidden rounded-lg px-2.5 py-1.5 h-8.5 flex items-center gap-2.5 w-full cursor-pointer transition-all duration-200 border group/logout shadow-none",
                    "bg-transparent border-transparent text-muted-foreground font-medium",
                    "hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:border-red-900/60 dark:hover:text-red-400"
                  )}
                >
                  <div className="size-5 flex items-center justify-center shrink-0">
                    <LogOut className="size-4 transition-transform group-hover/logout:-translate-x-0.5 text-muted-foreground group-hover/logout:text-red-600 dark:group-hover/logout:text-red-400" />
                  </div>
                  <span className="text-xs font-semibold transition-colors group-hover/logout:text-red-600 dark:group-hover/logout:text-red-400">
                    Log out
                  </span>
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      {/* ── Resizable and Interactive Sidebar Rail (Drag to resize width) ── */}
      <SidebarRail />

      {/* Confirmation Dialog: Leave Admin Console */}
      <AlertDialog open={isConfirmHomeOpen} onOpenChange={setIsConfirmHomeOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Admin Console?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to visit the homepage? Any unsaved changes on your current page may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/" onClick={handleGoHome}>
                Visit Homepage
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

interface NavGroupProps {
  group: SidebarMenuGroup;
  isActive: (href: string) => boolean;
}

function NavGroup({ group, isActive }: NavGroupProps) {
  const Icon = group.icon;
  const groupLabel = group.title;
  const { state } = useSidebar();
  const hasActiveChild = group.items.some((item) => isActive(item.href));
  const [isOpen, setIsOpen] = useState(group.defaultOpen || hasActiveChild);
  const [prevHasActiveChild, setPrevHasActiveChild] = useState(hasActiveChild);
  if (hasActiveChild !== prevHasActiveChild) {
    setPrevHasActiveChild(hasActiveChild);
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }
  const contentRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (hasActiveChild && isOpen) {
      const timer = setTimeout(() => {
        try {
          const activeChild = contentRef.current?.querySelector<HTMLElement>(
            '[data-active-item="true"], .sidebar-nav-active'
          );
          if (activeChild) {
            activeChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } catch {
          // ignore
        }
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [hasActiveChild, isOpen]);

  const handleItemClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    try {
      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch {
      // ignore
    }
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTimeout(() => {
        try {
          const activeChild = contentRef.current?.querySelector<HTMLElement>(
            '[data-active-item="true"], .sidebar-nav-active'
          );
          if (activeChild) {
            activeChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
          } else if (contentRef.current) {
            contentRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } catch {
          // ignore
        }
      }, 160);
    }
  }, []);

  // When collapsed to icon mode, render as a button with a clean flyout dropdown
  if (state === "collapsed") {
    return (
      <SidebarGroup className="p-0 py-0.5 flex justify-center items-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={groupLabel}
              aria-label={groupLabel}
              data-active-item={hasActiveChild ? "true" : undefined}
              className={cn(
                "relative size-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 outline-hidden cursor-pointer aspect-square",
                hasActiveChild
                  ? "sidebar-nav-active text-primary-foreground shadow-none hover:brightness-95"
                  : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "size-4.5 shrink-0 transition-colors duration-200",
                  hasActiveChild ? "text-primary-foreground" : ""
                )}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={10}
            className="w-56 p-1.5 rounded-xl border border-border bg-popover shadow-lg space-y-1 z-50"
          >
            <div className="px-2.5 py-1.5 text-xs font-semibold text-foreground/70 border-b border-border/50">
              <span>{groupLabel}</span>
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const ItemIcon = item.icon;

              return (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className={cn(
                    "p-0 rounded-lg cursor-pointer",
                    active
                      ? "!bg-primary focus:!bg-primary/90 data-[highlighted]:!bg-primary/90 !text-white focus:!text-white data-[highlighted]:!text-white"
                      : "focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                  )}
                >
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={handleItemClick}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg w-full transition-colors",
                      active
                        ? "bg-primary text-white font-semibold shadow-none hover:bg-primary/90 hover:text-white focus:bg-primary/90 focus:text-white"
                        : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <ItemIcon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active ? "!text-white text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarGroup>
    );
  }

  // Expanded mode: Collapsible menu with matching primary styling
  return (
    <SidebarGroup className="px-2 py-0.5">
      <SidebarMenu>
        <SidebarMenuItem className="w-full">
          <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="group/collapsible w-full"
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  "relative overflow-hidden rounded-xl px-2.5 py-2 h-auto flex items-center gap-3 transition-all duration-200 group/navitem min-w-0 border cursor-pointer w-full shadow-none",
                  hasActiveChild
                    ? "sidebar-nav-active font-semibold text-primary-foreground"
                    : "border-transparent hover:border-primary/45 dark:hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-foreground/80 hover:text-foreground"
                )}
              >
                {hasActiveChild && (
                  <div
                    className="sidebar-dot-pattern pointer-events-none absolute bottom-0 right-0 w-20 h-6 rounded-br-xl"
                    aria-hidden="true"
                  />
                )}
                <div className="relative z-1 size-7 flex items-center justify-center shrink-0">
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0 transition-colors duration-200",
                      hasActiveChild
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover/navitem:text-primary"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "relative z-1 truncate min-w-0 flex-1 text-left text-xs transition-colors",
                    hasActiveChild
                      ? "font-semibold text-primary-foreground"
                      : "font-medium group-hover/navitem:font-semibold"
                  )}
                >
                  {groupLabel}
                </span>
                <div
                  className={cn(
                    "relative z-1 size-5.5 rounded-full flex items-center justify-center shrink-0 ml-auto border transition-all duration-200 group-data-[collapsible=icon]:hidden shadow-none",
                    hasActiveChild
                      ? "bg-white/20 backdrop-blur-xs border-white/35 text-primary-foreground"
                      : "bg-background border-border text-muted-foreground group-hover/navitem:bg-muted/80 group-hover/navitem:text-primary group-hover/navitem:border-primary/30"
                  )}
                >
                  <ChevronRight className="size-3 stroke-[2.4] shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub
                ref={contentRef}
                className="mx-0 ml-4.5 mr-0 translate-x-0 border-l-2 border-primary/25 pl-2.5 pr-0 my-1.5 space-y-1 w-[calc(100%-1.125rem)] min-w-0 flex flex-col"
              >
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const ItemIcon = item.icon;

                  return (
                    <SidebarMenuSubItem key={item.id} className="w-full min-w-0 list-none">
                      <SidebarMenuSubButton
                        asChild
                        isActive={active}
                        data-active-item={active ? "true" : undefined}
                        className={cn(
                          "w-full h-auto relative overflow-hidden rounded-lg px-2.5 py-1.5 min-w-0 transition-all duration-200 text-xs border group/subitem translate-x-0 shadow-none",
                          active
                            ? "sidebar-nav-active font-semibold text-primary-foreground"
                            : "border-transparent hover:border-primary/35 hover:bg-primary/6 text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <Link
                          href={item.href}
                          prefetch={true}
                          onClick={handleItemClick}
                          className="relative z-1 min-w-0 flex items-center gap-2.5 w-full"
                        >
                          {active && (
                            <div
                              className="sidebar-dot-pattern pointer-events-none absolute bottom-0 right-0 w-16 h-5 rounded-br-lg"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative z-1 size-3.5 flex items-center justify-center shrink-0">
                            <ItemIcon
                              className={cn(
                                "size-3.5 shrink-0 transition-colors duration-200",
                                active
                                  ? "!text-white text-primary-foreground"
                                  : "text-muted-foreground group-hover/subitem:text-primary"
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "relative z-1 truncate min-w-0 flex-1 text-left transition-colors",
                              active
                                ? "font-semibold text-primary-foreground"
                                : "group-hover/subitem:text-primary font-normal"
                            )}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
