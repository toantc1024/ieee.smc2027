"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Phone,
  Mail,
  Search,
  Menu,
  X,
  ArrowUpRight,
  FileDown,
  ChevronDown,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { PaperCeptIcon } from "@/components/common/ProviderIcons";
import {
  HeaderConfig,
  NavLinkItem,
  NavSubItem,
  NavColumnItem,
  DEFAULT_HEADER_DATA,
} from "@/lib/header-config";
import { getNavIcon } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

/* ─── Stripe Direction-Aware Animation Variants (Exact Smooth Ease from HCMUTE) ─── */
const SMOOTH_EASE = [0.25, 0.1, 0.25, 1] as const;

const stripeContentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 90 : direction < 0 ? -90 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: {
        type: "tween",
        ease: SMOOTH_EASE,
        duration: 0.32,
      },
      opacity: {
        duration: 0.26,
        ease: "easeInOut",
      },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -90 : direction < 0 ? 90 : 0,
    opacity: 0,
    transition: {
      x: {
        type: "tween",
        ease: SMOOTH_EASE,
        duration: 0.28,
      },
      opacity: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }),
};

/* ─── Dynamic Height Animated Menu Container ─── */
const DynamicHeightMenu = React.memo(function DynamicHeightMenu({
  activeItem,
  direction,
  closeMenu,
  columns,
}: {
  activeItem: NavLinkItem;
  direction: number;
  closeMenu: () => void;
  columns: NavColumnItem[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = contentRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let rafId: number | null = null;
    const ro = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.height > 0) {
        const maxAllowed =
          typeof window !== "undefined"
            ? Math.max(200, window.innerHeight - 88)
            : 800;
        const h = Math.min(Math.round(entry.contentRect.height), maxAllowed);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setContentHeight(h);
        });
      }
    });

    try {
      ro.observe(el);
    } catch {}

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        ro.disconnect();
      } catch {}
    };
  }, [activeItem?.id, columns]);

  return (
    <motion.div
      animate={{ height: contentHeight }}
      transition={{
        height: {
          type: "tween",
          ease: SMOOTH_EASE,
          duration: 0.3,
        },
      }}
      className="overflow-hidden relative transform-gpu will-change-[height] max-h-[calc(100vh-5.5rem)] flex flex-col"
    >
      <div ref={contentRef} className="w-full">
        {/* Aligned with site horizontal padding so content matches header buttons above */}
        <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] py-0 overflow-hidden relative">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={activeItem.id}
              custom={direction}
              variants={stripeContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full transform-gpu will-change-[transform,opacity]"
            >
              <div className="flex flex-col lg:flex-row items-stretch w-full divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
                {/* Columns Section */}
                {columns.map((col, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === columns.length - 1 && !activeItem.promoCard;

                  return (
                    <div
                      key={col.id}
                      className={cn(
                        "group/col flex flex-col min-w-0 flex-1 self-stretch py-6",
                        isFirst
                          ? "pl-2.5 xl:pl-3.5 pr-4 xl:pr-6"
                          : isLast
                          ? "pl-4 xl:pl-6 pr-2.5 xl:pr-3.5"
                          : "px-4 xl:px-6"
                      )}
                    >
                      {/* Fixed Title Header */}
                      <div className="relative pb-2 mb-3 shrink-0">
                        <h3 className="text-[13.5px] font-extrabold text-slate-900 tracking-normal transition-colors">
                          {col.title}
                        </h3>
                        {/* Thin track line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200/80 rounded-full" />
                        {/* Thin animated gradient line on column hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full scale-x-0 group-hover/col:scale-x-100 origin-left transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
                      </div>

                      {/* Column Links List */}
                      <div className="flex flex-col gap-1 flex-1">
                        {col.links.map((link) => {
                          const IconComp = getNavIcon(link.icon);
                          return (
                            <Link
                              key={link.id}
                              href={link.href}
                              target={link.isExternal ? "_blank" : undefined}
                              rel={link.isExternal ? "noopener noreferrer" : undefined}
                              onClick={closeMenu}
                              className="group/item flex flex-col gap-0.5 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-all duration-150 cursor-pointer min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover/item:bg-[#115eff] group-hover/item:border-[#115eff] transition-colors">
                                  <IconComp className="w-3.5 h-3.5 text-[#115eff] group-hover/item:text-white transition-colors" />
                                </div>
                                <span className="text-[13px] font-bold text-slate-900 group-hover/item:text-[#115eff] transition-colors leading-tight truncate">
                                  {link.title}
                                </span>
                                {link.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-[#115eff]">
                                    {link.badge}
                                  </span>
                                )}
                                {link.isExternal && (
                                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover/item:text-[#115eff] shrink-0 transition-colors" />
                                )}
                              </div>
                              {link.description && (
                                <p className="text-[11.5px] text-slate-500 font-normal leading-normal truncate group-hover/item:text-slate-700 transition-colors pl-8">
                                  {link.description}
                                </p>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Right Side Featured Promo Card (Exact HCMUTE UTE Flower style) */}
                {activeItem.promoCard && (
                  <div className="w-64 xl:w-72 shrink-0 py-6 pl-5 pr-2 flex flex-col justify-start self-stretch">
                    <div className="relative pb-2 mb-3">
                      <h3 className="text-[13px] font-bold text-slate-700 tracking-normal whitespace-nowrap">
                        {activeItem.promoCard.badge || "Tiêu điểm"}
                      </h3>
                      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200/80 rounded-full" />
                      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full" />
                    </div>

                    {/* Promo Card Block */}
                    <a
                      href={activeItem.promoCard.href}
                      target={activeItem.promoCard.href.startsWith("http") ? "_blank" : undefined}
                      rel={activeItem.promoCard.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      onClick={closeMenu}
                      className="group/promo relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white hover:bg-[#115eff] hover:border-[#115eff] shadow-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform-gpu cursor-pointer"
                    >
                      {/* Dot Pattern in Default state */}
                      <div
                        className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.3px,transparent_1.3px)] [background-size:12px_12px] opacity-60 group-hover/promo:opacity-0 transition-opacity duration-300 pointer-events-none z-[1] [mask-image:radial-gradient(ellipse_55%_48%_at_bottom_right,white_10%,transparent_58%)]"
                        aria-hidden="true"
                      />

                      {/* Top Image Banner */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 z-[2]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeItem.promoCard.image}
                          alt={activeItem.promoCard.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/promo:scale-105"
                        />
                        {activeItem.promoCard.badge && (
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#115eff] backdrop-blur-sm shadow-sm group-hover/promo:bg-white group-hover/promo:text-[#115eff] transition-colors">
                            {activeItem.promoCard.badge}
                          </div>
                        )}
                      </div>

                      {/* Bottom Content Area */}
                      <div className="relative z-[2] p-3.5 flex flex-col gap-1">
                        <h4 className="text-[13.5px] font-bold text-slate-900 group-hover/promo:text-white transition-colors duration-200 leading-snug">
                          {activeItem.promoCard.title}
                        </h4>
                        {activeItem.promoCard.description && (
                          <p className="text-[11.5px] text-slate-500 group-hover/promo:text-white/90 transition-colors duration-200 font-normal leading-relaxed line-clamp-2">
                            {activeItem.promoCard.description}
                          </p>
                        )}
                        <span className="text-[12px] font-semibold text-[#115eff] group-hover/promo:text-white transition-colors duration-200 inline-flex items-center gap-1 mt-1 group-hover/promo:gap-1.5">
                          {activeItem.promoCard.ctaText || "Khám phá ngay"}
                          <span aria-hidden="true">›</span>
                        </span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

  // Direction-aware state tracking
  const [{ activeMenuId, direction }, setNavState] = useState<{
    activeMenuId: string | null;
    direction: number;
  }>({
    activeMenuId: null,
    direction: 0,
  });

  const currentIndexRef = useRef<number>(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(DEFAULT_HEADER_DATA);

  useEffect(() => {
    fetch("/api/admin/header")
      .then((res) => res.json())
      .then((res) => {
        if (res.header) {
          setHeaderConfig({
            ...DEFAULT_HEADER_DATA,
            ...res.header,
            navLinks: res.header.navLinks || DEFAULT_HEADER_DATA.navLinks,
          });
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = headerConfig.navLinks || DEFAULT_HEADER_DATA.navLinks;
  const hotline = headerConfig.topbar?.hotline || CONFERENCE_INFO.hotline;
  const email = headerConfig.topbar?.email || CONFERENCE_INFO.contactEmail;
  const showTopbar = headerConfig.topbar?.enabled !== false;
  const ctaLabel = headerConfig.ctaButton?.label || "Submit Paper (PaperCept)";
  const ctaHref = headerConfig.ctaButton?.href || "/#cfp";
  const showCta = headerConfig.ctaButton?.enabled !== false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = useCallback(
    (id: string, index?: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
        switchTimeoutRef.current = null;
      }

      const performSwitch = () => {
        setNavState((prev) => {
          if (prev.activeMenuId === id) return prev;

          let dir = 0;
          if (index !== undefined && currentIndexRef.current !== -1) {
            if (index > currentIndexRef.current) {
              dir = 1; // Moving to the right -> new content enters from right
            } else if (index < currentIndexRef.current) {
              dir = -1; // Moving to the left -> new content enters from left
            }
          }

          if (index !== undefined) {
            currentIndexRef.current = index;
          }

          return {
            activeMenuId: id,
            direction: dir,
          };
        });
      };

      if (activeMenuId && activeMenuId !== id) {
        switchTimeoutRef.current = setTimeout(performSwitch, 50);
      } else {
        performSwitch();
      }
    },
    [activeMenuId]
  );

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      setNavState({
        activeMenuId: null,
        direction: 0,
      });
      currentIndexRef.current = -1;
    }, 80);
  }, []);

  const handleContentMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }
    setNavState({
      activeMenuId: null,
      direction: 0,
    });
    currentIndexRef.current = -1;
  }, []);

  // Compute active item for the full-width mega menu
  const activeItem = useMemo(() => {
    if (!activeMenuId) return null;
    return (
      navLinks.find(
        (link) =>
          link.id === activeMenuId &&
          ((link.columns && link.columns.length > 0) ||
            (link.children && link.children.length > 0))
      ) || null
    );
  }, [activeMenuId, navLinks]);

  // Compute normalized columns for the active item
  const activeColumns: NavColumnItem[] = useMemo(() => {
    if (!activeItem) return [];
    if (activeItem.columns && activeItem.columns.length > 0) {
      return activeItem.columns;
    }
    if (activeItem.children && activeItem.children.length > 0) {
      const all = activeItem.children;
      if (all.length <= 3) {
        return [
          {
            id: `${activeItem.id}-col-1`,
            title: activeItem.name,
            links: all,
          },
        ];
      }
      const mid = Math.ceil(all.length / 2);
      return [
        {
          id: `${activeItem.id}-col-1`,
          title: "General Information",
          links: all.slice(0, mid),
        },
        {
          id: `${activeItem.id}-col-2`,
          title: "Key Portals & Resources",
          links: all.slice(mid),
        },
      ];
    }
    return [];
  }, [activeItem]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* ── Top Utility Bar (Exact HCM-UTE Blue #115eff with page-border-x) ── */}
      {showTopbar && (
        <div className="navbar-topbar page-border-x-light hidden lg:block bg-[#115eff] text-white py-1.5 relative z-50 text-xs">
          {/* Flush container matched exactly to site margins */}
          <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] flex h-8 items-center justify-between">
            {/* Left: Hotline & Email & Badges */}
            <div className="flex items-center gap-3 xl:gap-4 min-w-0">
              <a
                href={`tel:${CONFERENCE_INFO.hotlineRaw}`}
                className="flex items-center gap-1.5 text-blue-100 hover:text-white font-semibold transition-colors shrink-0"
                title="Conference Hotline"
              >
                <Phone className="w-3 h-3 text-blue-200" />
                <span>{hotline}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 text-blue-100 hover:text-white font-medium transition-colors shrink-0"
                title="Conference Secretariat Email"
              >
                <Mail className="w-3 h-3 text-blue-200" />
                <span>{email}</span>
              </a>

              <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/20 text-blue-100 text-[11.5px]">
                <a
                  href="https://www.ieeesmc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                >
                  {headerConfig.topbar?.societyBadgeText || "IEEE SMC Society"}
                </a>
                <span className="text-white/30">•</span>
                <a
                  href="https://hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors font-semibold"
                >
                  {headerConfig.topbar?.hostBadgeText || "Host: HCM-UTE"}
                </a>
              </div>
            </div>

            {/* Right: Topbar Navigation Links (News, Partnership, CFP PDF, Search) */}
            <div className="flex items-center gap-2 xl:gap-3 text-xs">
              <Link
                href="/#news"
                className="px-2 py-0.5 rounded text-blue-100 hover:text-white hover:bg-white/10 transition-colors font-medium"
                title="Conference News & Updates"
              >
                News
              </Link>

              <span className="text-white/30">•</span>

              <Link
                href="/#sponsors"
                className="px-2 py-0.5 rounded text-blue-100 hover:text-white hover:bg-white/10 transition-colors font-medium"
                title="Sponsorship & Industrial Exhibition"
              >
                Partnership & Exhibition
              </Link>

              <span className="text-white/30">•</span>

              <a
                href={CONFERENCE_INFO.cfpPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1 font-semibold text-blue-100"
                title="Download Call for Papers PDF"
              >
                <FileDown className="w-3 h-3 text-blue-200" />
                <span>CFP PDF</span>
              </a>

              <span className="text-white/30">•</span>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="px-2 py-1 rounded text-blue-100 hover:text-white hover:bg-white/15 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                title="Search conference topics"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Header + Full Width Mega Menu Dropdown Container ── */}
      <div className="sticky top-0 z-50 w-full relative">
        <header
          className={cn(
            "navbar-header page-border-x-dark w-full bg-white transition-shadow duration-200 ease-out border-b border-slate-200",
            isScrolled && "shadow-[-8px_0_25px_-10px_rgba(0,0,0,0.08),8px_0_25px_-10px_rgba(0,0,0,0.08)]"
          )}
        >
          {/* Flush container matched exactly to site margins with reduced, compact height */}
          <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] flex items-center justify-between h-14 sm:h-16 md:h-16">
            {/* Left: Reduced Size 2027 Conference Official Logo Lockup */}
            <Link
              href="/"
              onClick={() => {
                closeMenu();
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center shrink-0 group focus:outline-none py-1"
              title="IEEE SMC 2027 • HCM-UTE Ho Chi Minh City, Vietnam"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/ieee-smc-2027-logo-group-transparent.png"
                alt="IEEE SMC 2027 Ho Chi Minh City, Vietnam • HCM-UTE"
                className="h-7 sm:h-8 md:h-8.5 w-auto max-w-[180px] sm:max-w-[220px] object-contain transition-transform duration-200 group-hover:scale-102 shrink-0"
              />
            </Link>

            {/* Center/Right: Desktop Navigation Trigger Items */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              <nav className="flex items-center gap-0.5 xl:gap-1 relative">
                {navLinks.map((link, index) => {
                  const hasMegaMenu =
                    (link.columns && link.columns.length > 0) ||
                    (link.children && link.children.length > 0);
                  const isItemActive = activeMenuId === link.id;

                  return (
                    <div
                      key={link.id}
                      className={cn(
                        "relative flex items-center h-full py-2 group/nav-item",
                        isItemActive && "before:absolute before:top-0 before:bottom-[-16px] before:inset-x-0 before:content-[''] before:pointer-events-auto"
                      )}
                      onMouseEnter={() => {
                        if (hasMegaMenu) {
                          handleMouseEnter(link.id, index);
                        } else {
                          closeMenu();
                        }
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      {hasMegaMenu ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (activeMenuId === link.id) {
                              closeMenu();
                            } else {
                              handleMouseEnter(link.id, index);
                            }
                          }}
                          className={cn(
                            "group/btn inline-flex items-center gap-1 font-bold uppercase text-[11px] lg:text-[11.5px] xl:text-xs 2xl:text-[13px] px-2.5 xl:px-3 h-8.5 xl:h-9.5 rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap z-10",
                            isItemActive
                              ? "bg-[#115eff] text-white shadow-sm hover:bg-[#0a4de6]"
                              : "text-slate-800 hover:bg-[#115eff] hover:text-white hover:shadow-xs"
                          )}
                          aria-expanded={isItemActive}
                        >
                          <span>{link.name}</span>
                          <ChevronDown
                            className={cn(
                              "w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200",
                              isItemActive
                                ? "rotate-180 text-white"
                                : "text-slate-400 group-hover/btn:text-white"
                            )}
                          />
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          className="inline-flex items-center gap-1 font-bold uppercase text-[11px] lg:text-[11.5px] xl:text-xs 2xl:text-[13px] px-2.5 xl:px-3 h-8.5 xl:h-9.5 rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap text-slate-800 hover:bg-[#115eff] hover:text-white hover:shadow-xs"
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Taller Call-To-Action Button */}
              {showCta && (
                <a
                  href={ctaHref}
                  onClick={closeMenu}
                  className="ml-2 inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#115eff] hover:bg-[#0a4de6] rounded-[0.26rem] shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
                >
                  <PaperCeptIcon className="w-4 h-4 text-white" />
                  <span>{ctaLabel}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-600 hover:text-[#115eff]"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-[#115eff]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════════
            FULL-WIDTH MEGA DROPDOWN (Aligned with two side margins & moving animation)
           ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {Boolean(activeItem) && activeItem && (
            <div
              className="absolute left-0 right-0 top-full z-50 pointer-events-none"
              onMouseEnter={handleContentMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Flush container matched exactly to site margins boundaries (no horizontal padding on border) */}
              <div className="w-full max-w-[var(--site-width)] mx-auto pointer-events-auto">
                <motion.div
                  key="mega-menu-container"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: SMOOTH_EASE } }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.08, ease: "easeOut" } }}
                  className="w-full bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08),-8px_15px_25px_-10px_rgba(0,0,0,0.05),8px_15px_25px_-10px_rgba(0,0,0,0.05)] overflow-hidden will-change-[transform,opacity] max-h-[calc(100vh-5.5rem)] flex flex-col"
                >
                  <DynamicHeightMenu
                    activeItem={activeItem}
                    direction={direction}
                    closeMenu={closeMenu}
                    columns={activeColumns}
                  />
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Background Overlay (Exact NavbarOverlay from HCMUTE) ── */}
      <AnimatePresence>
        {Boolean(activeItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.08, ease: "easeOut" } }}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-slate-900/[0.08] backdrop-blur-[4px] pointer-events-auto"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-xl">
          <nav className="space-y-1">
            {[
              { id: "mob-news", name: "News", href: "/#news" },
              ...navLinks,
              { id: "mob-sponsors", name: "Partnership & Exhibition", href: "/#sponsors" },
            ].map((link) => {
              const allSubs =
                link.columns && link.columns.length > 0
                  ? link.columns.flatMap((c) => c.links)
                  : link.children || [];
              const hasSubs = allSubs.length > 0;
              const isExpanded = mobileExpandedId === link.id;

              return (
                <div key={link.id} className="border-b border-slate-100 last:border-0 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={() => {
                        if (!hasSubs) setMobileMenuOpen(false);
                      }}
                      className="py-2 text-sm font-bold text-slate-800 hover:text-[#115eff] flex-1"
                    >
                      {link.name}
                    </Link>
                    {hasSubs && (
                      <button
                        type="button"
                        onClick={() => setMobileExpandedId(isExpanded ? null : link.id)}
                        className="p-2 text-slate-500 hover:text-[#115eff]"
                      >
                        <ChevronDown
                          className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")}
                        />
                      </button>
                    )}
                  </div>

                  {hasSubs && isExpanded && (
                    <div className="pl-3 pr-2 py-2 space-y-2 bg-slate-50 rounded-lg">
                      {allSubs.map((sub: NavSubItem) => {
                        const IconComp = getNavIcon(sub.icon);
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 py-1 text-xs text-slate-700 hover:text-[#115eff]"
                          >
                            <IconComp className="w-3.5 h-3.5 text-[#115eff]" />
                            <span className="font-semibold">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {showCta && (
            <a
              href={ctaHref}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#115eff] text-white font-bold text-sm rounded-lg shadow-sm"
            >
              <PaperCeptIcon className="w-4 h-4 text-white" />
              <span>{ctaLabel}</span>
            </a>
          )}
        </div>
      )}

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#115eff]" />
                <span className="font-bold text-slate-900 text-sm">
                  Search IEEE SMC 2027
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search tracks, authors, venue, CFP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchOpen(false);
                  router.push(`/#tracks`);
                }
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#115eff]"
              autoFocus
            />

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Quick: Systems Science • Cybernetics • PaperCept</span>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  router.push(`/#tracks`);
                }}
                className="px-3 py-1 bg-[#115eff] text-white font-bold rounded-lg hover:bg-[#0a4de6]"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
