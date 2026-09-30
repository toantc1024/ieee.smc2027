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
  FileText,
  ChevronDown,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
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
                        "group/col flex flex-col min-w-0 flex-1 self-stretch py-7",
                        isFirst
                          ? "pl-2.5 xl:pl-3.5 pr-4 xl:pr-6"
                          : isLast
                          ? "pl-4 xl:pl-6 pr-2.5 xl:pr-3.5"
                          : "px-4 xl:px-6"
                      )}
                    >
                      {/* Fixed Title Header */}
                      <div className="relative pb-2.5 mb-3.5 shrink-0">
                        <h3 className="text-[17px] xl:text-[18.5px] font-black text-[#004776] tracking-tight transition-colors">
                          {col.title}
                        </h3>
                        {/* Thin track line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200/80 rounded-full" />
                        {/* Thin animated gradient line on column hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full scale-x-0 group-hover/col:scale-x-100 origin-left transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
                      </div>

                      {/* Column Links List */}
                      <div className="flex flex-col gap-2 flex-1">
                        {col.links.map((link) => {
                          const IconComp = getNavIcon(link.icon);
                          return (
                            <Link
                              key={link.id}
                              href={link.href}
                              target={link.isExternal ? "_blank" : undefined}
                              rel={link.isExternal ? "noopener noreferrer" : undefined}
                              onClick={closeMenu}
                              className="group/item flex flex-col gap-1 py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-all duration-150 cursor-pointer min-w-0"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover/item:bg-[#115eff] group-hover/item:border-[#115eff] transition-colors">
                                  <IconComp className="w-4.5 h-4.5 text-[#115eff] group-hover/item:text-white transition-colors" />
                                </div>
                                <span className="text-base xl:text-[17.5px] font-bold text-slate-900 group-hover/item:text-[#115eff] transition-colors leading-tight truncate">
                                  {link.title}
                                </span>
                                {link.badge && (
                                  <span className="text-xs xl:text-[13px] px-2.5 py-0.5 rounded font-bold bg-blue-100 text-[#115eff]">
                                    {link.badge}
                                  </span>
                                )}
                                {link.isExternal && (
                                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/item:text-[#115eff] shrink-0 transition-colors" />
                                )}
                              </div>
                              {link.description && (
                                <p className="text-[14px] xl:text-[15px] text-slate-600 font-normal leading-relaxed truncate group-hover/item:text-slate-800 transition-colors pl-11.5">
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
                  <div className="w-72 xl:w-84 shrink-0 py-7 pl-6 pr-2 flex flex-col justify-start self-stretch">
                    <div className="relative pb-2.5 mb-3.5">
                      <h3 className="text-[17px] xl:text-[18.5px] font-black text-[#004776] tracking-tight whitespace-nowrap">
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
                      className="header-promo-card group/promo relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white hover:bg-[#115eff] hover:border-[#115eff] shadow-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform-gpu cursor-pointer"
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
                          <div className="promo-card-badge absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-[#115eff] backdrop-blur-sm shadow-sm transition-colors">
                            {activeItem.promoCard.badge}
                          </div>
                        )}
                      </div>

                      {/* Bottom Content Area */}
                      <div className="relative z-[2] p-4 flex flex-col gap-1.5">
                        <h4 className="promo-card-title text-lg sm:text-xl font-bold text-slate-900 transition-colors duration-200 leading-snug">
                          {activeItem.promoCard.title}
                        </h4>
                        {activeItem.promoCard.description && (
                          <p className="promo-card-desc text-sm sm:text-base text-slate-600 transition-colors duration-200 font-normal leading-relaxed line-clamp-2">
                            {activeItem.promoCard.description}
                          </p>
                        )}
                        <span className="promo-card-cta text-base font-bold text-[#115eff] transition-colors duration-200 inline-flex items-center gap-1.5 mt-1.5 group-hover/promo:gap-2">
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
          const links: NavLinkItem[] = res.header.navLinks || DEFAULT_HEADER_DATA.navLinks;
          const hasHome = links.some((l) => l.href === "/" || l.id === "nav-home");
          const finalLinks = hasHome
            ? links
            : [{ id: "nav-home", name: "Home", href: "/", type: "link" as const }, ...links];

          setHeaderConfig({
            ...DEFAULT_HEADER_DATA,
            ...res.header,
            navLinks: finalLinks,
          });
        }
      })
      .catch(() => {});
  }, []);

  const rawNavLinks = headerConfig.navLinks || DEFAULT_HEADER_DATA.navLinks;
  const navLinks = useMemo(() => {
    const hasHome = rawNavLinks.some((l) => l.href === "/" || l.id === "nav-home");
    if (!hasHome) {
      return [{ id: "nav-home", name: "Home", href: "/", type: "link" as const }, ...rawNavLinks];
    }
    return rawNavLinks;
  }, [rawNavLinks]);

  const mobileNavItems = useMemo(() => {
    return [
      ...navLinks,
      { id: "mob-news", name: "News & Announcements", href: "/#news", type: "link" as const },
      { id: "mob-sponsors", name: "Partnership & Exhibition", href: "/#sponsors", type: "link" as const },
      { id: "mob-cfp-pdf", name: "Download Call for Papers (PDF)", href: CONFERENCE_INFO.cfpPdfUrl, type: "link" as const },
    ];
  }, [navLinks]);

  const hotline = headerConfig.topbar?.hotline || CONFERENCE_INFO.hotline;
  const email = headerConfig.topbar?.email || CONFERENCE_INFO.contactEmail;
  const showTopbar = headerConfig.topbar?.enabled !== false;
  const ctaLabel = headerConfig.ctaButton?.label || "Submit Paper";
  const ctaHref = headerConfig.ctaButton?.href || "/#cfp";
  const showCta = headerConfig.ctaButton?.enabled !== false;

  const handleMobileNavClick = useCallback((href: string) => {
    setMobileMenuOpen(false);
    if (href === "/" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on route change (React recommended pattern without effect)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close mobile drawer when resizing up to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        <div className="navbar-topbar page-border-x-light hidden lg:block bg-[#115eff] text-white py-1.5 relative z-50 text-sm">
          {/* Flush container matched exactly to site margins */}
          <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] flex h-9 items-center justify-between">
            {/* Left: Hotline & Email & Badges */}
            <div className="flex items-center gap-3.5 xl:gap-4.5 min-w-0">
              <a
                href={`tel:${CONFERENCE_INFO.hotlineRaw}`}
                className="flex items-center gap-1.5 text-blue-100 hover:text-white font-semibold transition-colors shrink-0 text-sm"
                title="Conference Hotline"
              >
                <Phone className="w-4 h-4 text-blue-200" />
                <span>{hotline}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 text-blue-100 hover:text-white font-medium transition-colors shrink-0 text-sm"
                title="Conference Secretariat Email"
              >
                <Mail className="w-4 h-4 text-blue-200" />
                <span>{email}</span>
              </a>
            </div>

            {/* Right: Topbar Navigation Links (News, Partnership, CFP PDF, Search) */}
            <div className="flex items-center gap-2.5 xl:gap-3.5 text-sm">
              <Link
                href="/#news"
                className="px-2.5 py-0.5 rounded text-blue-100 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm"
                title="Conference News & Updates"
              >
                News
              </Link>

              <span className="text-white/30">•</span>

              <Link
                href="/#sponsors"
                className="px-2.5 py-0.5 rounded text-blue-100 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm"
                title="Sponsorship & Industrial Exhibition"
              >
                Partnership & Exhibition
              </Link>

              <span className="text-white/30">•</span>

              <a
                href={CONFERENCE_INFO.cfpPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-blue-100 text-sm"
                title="Download Call for Papers PDF"
              >
                <FileDown className="w-4 h-4 text-blue-200" />
                <span>CFP PDF</span>
              </a>

              <span className="text-white/30">•</span>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="px-2.5 py-1 rounded text-blue-100 hover:text-white hover:bg-white/15 transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium"
                title="Search conference topics"
              >
                <Search className="w-4 h-4" />
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
          {/* Flush container matched exactly to site margins with comfortable height */}
          <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] flex items-center justify-between h-16 sm:h-18 md:h-18">
            {/* Desktop Navigation on Left, CTA on Right (No Header Logo) */}
            <div className="hidden lg:flex items-center justify-between w-full gap-4 xl:gap-6 2xl:gap-8">
              <nav className="flex items-center gap-1 xl:gap-1.5 relative">
                {navLinks.map((link, index) => {
                  const hasMegaMenu =
                    link.type !== "link" &&
                    ((link.columns && link.columns.length > 0) ||
                    (link.children && link.children.length > 0));
                  const isMenuOpen = activeMenuId === link.id;

                  return (
                    <div
                      key={link.id}
                      className={cn(
                        "relative flex items-center h-full py-2 group/nav-item",
                        isMenuOpen && "before:absolute before:top-0 before:bottom-[-16px] before:inset-x-0 before:content-[''] before:pointer-events-auto"
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
                      <Link
                        href={link.href}
                        onClick={() => {
                          closeMenu();
                          if (link.href === "/" && typeof window !== "undefined") {
                            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                          }
                        }}
                        className={cn(
                          "group/btn inline-flex items-center gap-1.5 font-bold uppercase text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px] px-3.5 xl:px-4.5 h-10 xl:h-11 rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap z-10 focus:outline-none focus:ring-0",
                          isMenuOpen
                            ? "bg-[#115eff] text-white shadow-xs"
                            : "text-[#004776] hover:bg-[#115eff] hover:text-white"
                        )}
                        aria-expanded={isMenuOpen}
                      >
                        <span>{link.name}</span>
                        {hasMegaMenu && (
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isMenuOpen
                                ? "text-white rotate-180"
                                : "text-slate-400 group-hover/btn:text-white"
                            )}
                          />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </nav>

              {/* Call-To-Action Button on Far Right with dedicated gap */}
              {showCta && (
                <a
                  href={ctaHref}
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-2.5 h-10 xl:h-11 px-5 xl:px-6 text-[14px] lg:text-[15px] xl:text-[16px] font-bold text-white bg-[#115eff] hover:bg-[#0a4de6] rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer select-none whitespace-nowrap ml-3 xl:ml-6 shrink-0"
                >
                  <FileText className="w-4 h-4 text-white shrink-0" />
                  <span>{ctaLabel}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </a>
              )}
            </div>

            {/* Mobile Header: Brand text on Left, Search + Hamburger on Right */}
            <div className="flex items-center justify-between w-full lg:hidden">
              <Link
                href="/"
                onClick={() => {
                  closeMenu();
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  }
                }}
                className="font-extrabold text-base sm:text-lg text-[#004776] tracking-tight hover:text-[#115eff] transition-colors py-1 select-none"
              >
                IEEE SMC 2027
              </Link>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-slate-600 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className={cn(
                    "p-2 text-slate-700 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer",
                    mobileMenuOpen && "text-[#115eff] bg-blue-50"
                  )}
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-[#115eff]" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
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

      {/* ── Background Overlay for Desktop Mega Menu ── */}
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

      {/* ── Mobile Navigation Drawer & Backdrop ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 sm:top-18 bg-slate-900/40 backdrop-blur-xs z-40"
              aria-hidden="true"
            />

            {/* Sliding Mobile Drawer */}
            <motion.div
              key="mobile-nav-drawer"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-x-0 top-16 sm:top-18 z-50 bg-white border-b border-slate-200 shadow-2xl max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4.5rem)] overflow-y-auto overflow-x-hidden flex flex-col divide-y divide-slate-100"
            >
              <div className="px-4 py-3 space-y-1">
                {mobileNavItems.map((link) => {
                  const allSubs =
                    link.type === "link"
                      ? []
                      : (link.columns && link.columns.length > 0
                          ? link.columns.flatMap((c) => c.links)
                          : link.children || []);
                  const hasSubs = allSubs.length > 0;
                  const isExpanded = mobileExpandedId === link.id;

                  return (
                    <div key={link.id} className="border-b border-slate-100/80 last:border-0 pb-1">
                      <div className="flex items-center justify-between gap-1">
                        <Link
                          href={link.href}
                          onClick={() => {
                            handleMobileNavClick(link.href);
                          }}
                          className="py-3 text-base sm:text-lg font-bold flex-1 transition-colors select-none text-[#004776] hover:text-[#115eff]"
                        >
                          {link.name}
                        </Link>
                        {hasSubs && (
                          <button
                            type="button"
                            onClick={() => setMobileExpandedId(isExpanded ? null : link.id)}
                            className="p-2.5 text-slate-500 hover:text-[#115eff] cursor-pointer rounded-lg hover:bg-slate-50"
                            aria-label={`Toggle ${link.name} submenu`}
                          >
                            <ChevronDown
                              className={cn(
                                "w-4.5 h-4.5 transition-transform duration-200",
                                isExpanded && "rotate-180 text-[#115eff]"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {/* Submenu Accordion */}
                      {hasSubs && isExpanded && (
                        <div className="pl-2 pr-1 py-2 mb-2 space-y-1.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          {allSubs.map((sub: NavSubItem) => {
                            const IconComp = getNavIcon(sub.icon);
                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                target={sub.isExternal ? "_blank" : undefined}
                                rel={sub.isExternal ? "noopener noreferrer" : undefined}
                                onClick={() => handleMobileNavClick(sub.href)}
                                className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[15px] sm:text-base text-slate-700 hover:text-[#115eff] hover:bg-white transition-colors"
                              >
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                  <IconComp className="w-4 h-4 text-[#115eff]" />
                                </div>
                                <span className="font-semibold flex-1 leading-snug">{sub.title}</span>
                                {sub.badge && (
                                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-[#115eff]">
                                    {sub.badge}
                                  </span>
                                )}
                                {sub.isExternal && (
                                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile CTA and Quick Contacts */}
              <div className="p-4 space-y-3 bg-slate-50/60">
                {showCta && (
                  <a
                    href={ctaHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-base rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <FileText className="w-4.5 h-4.5 text-white" />
                    <span>{ctaLabel}</span>
                    <ArrowUpRight className="w-4.5 h-4.5" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-sm">
                  <a
                    href={`tel:${CONFERENCE_INFO.hotlineRaw}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white border border-slate-200 text-[#004776] hover:text-[#115eff] font-semibold"
                  >
                    <Phone className="w-4 h-4 text-[#115eff]" />
                    <span className="truncate">Hotline</span>
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white border border-slate-200 text-[#004776] hover:text-[#115eff] font-semibold"
                  >
                    <Mail className="w-4 h-4 text-[#115eff]" />
                    <span className="truncate">Email Us</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#115eff]" />
                <span className="font-bold text-slate-900 text-base">
                  Search IEEE SMC 2027
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer p-1"
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
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:border-[#115eff]"
              autoFocus
            />

            <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
              <span>Quick: Systems Science • Cybernetics • Submissions</span>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  router.push(`/#tracks`);
                }}
                className="px-4 py-1.5 bg-[#115eff] text-white font-bold text-sm rounded-lg hover:bg-[#0a4de6] cursor-pointer"
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
