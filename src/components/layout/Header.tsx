"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Phone,
  Mail,
  Search,
  X,
  ArrowUpRight,
  FileDown,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import {
  HeaderConfig,
  NavLinkItem,
  NavSubItem,
  NavColumnItem,
  NavPromoCard,
  DEFAULT_HEADER_DATA,
  normalizeHeaderConfig,
} from "@/lib/header-config";
import { getNavIcon } from "@/lib/nav-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BuilderBlockContext } from "@/modules/website-builder/utils/sub-item-path";

/* ─── Stripe Direction-Aware Animation Variants (Exact Smooth Ease from HCM-UTE) ─── */
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

/* ─── Reusable HCM-UTE Promo Card Block (Dot Pattern Default, Solid Primary Blue + White UTE Flower on Hover) ─── */
export const PromoCardBlock = React.memo(function PromoCardBlock({
  promoCard,
  closeMenu,
  className,
}: {
  promoCard: NavPromoCard;
  closeMenu: () => void;
  className?: string;
}) {
  const resolvedHref = promoCard.href || "/#cfp";
  const isHttp = resolvedHref.startsWith("http");

  return (
    <a
      href={resolvedHref}
      target={isHttp ? "_blank" : undefined}
      rel={isHttp ? "noopener noreferrer" : undefined}
      onClick={closeMenu}
      className={cn(
        "group/promo relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-zinc-800",
        "bg-white dark:bg-zinc-950 hover:bg-primary dark:hover:bg-primary hover:border-primary dark:hover:border-primary",
        "shadow-sm hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 transform-gpu cursor-pointer",
        className
      )}
    >
      {/* 1. Dot Pattern at bottom-right fading out to edges (Default state) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.3px,transparent_1.3px)] dark:bg-[radial-gradient(#71717a_1.3px,transparent_1.3px)] [background-size:12px_12px] opacity-60 group-hover/promo:opacity-0 transition-opacity duration-300 pointer-events-none z-[1] [mask-image:radial-gradient(ellipse_55%_48%_at_bottom_right,white_10%,transparent_58%)]"
        aria-hidden="true"
      />

      {/* 2. White Grid Pattern on hover */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:16px_16px] opacity-0 group-hover/promo:opacity-100 transition-opacity duration-300 pointer-events-none z-[1] [mask-image:radial-gradient(ellipse_55%_48%_at_bottom_right,white_15%,transparent_65%)]"
        aria-hidden="true"
      />

      {/* 3. UTE Flower in bottom right — Default subtle watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/flower-ute.png"
        alt=""
        className="pointer-events-none absolute -bottom-10 -right-10 w-52 h-52 object-contain select-none opacity-[0.06] group-hover/promo:opacity-0 transition-opacity duration-300 dark:brightness-0 dark:invert z-[1]"
        aria-hidden="true"
      />

      {/* 4. UTE Flower in bottom right — Crisp White Watermark on Hover */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/flower-ute-white.png"
        alt=""
        className="pointer-events-none absolute -bottom-10 -right-10 w-52 h-52 object-contain select-none opacity-0 group-hover/promo:opacity-35 transition-opacity duration-300 z-[1]"
        aria-hidden="true"
      />

      {/* 5. Top Image Banner */}
      {promoCard.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800 z-[2]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promoCard.image}
            alt={promoCard.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/promo:scale-105"
          />
          {promoCard.badge && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-zinc-900/90 text-primary backdrop-blur-sm shadow-sm group-hover/promo:bg-white group-hover/promo:text-primary transition-colors">
              {promoCard.badge}
            </div>
          )}
        </div>
      )}

      {/* 6. Bottom Content Area */}
      <div className="relative z-[2] p-3.5 flex flex-col gap-1">
        <h4 className="text-[13.5px] font-bold text-foreground dark:text-zinc-100 group-hover/promo:text-white transition-colors duration-200 leading-snug">
          {promoCard.title}
        </h4>
        {promoCard.description && (
          <p className="text-[11.5px] text-muted-foreground dark:text-zinc-400 group-hover/promo:text-white/90 transition-colors duration-200 font-normal leading-relaxed line-clamp-3 whitespace-pre-line break-words text-left">
            {promoCard.description}
          </p>
        )}
        <span className="text-[12px] font-semibold text-primary dark:text-blue-400 group-hover/promo:text-white transition-colors duration-200 inline-flex items-center gap-1 mt-1 group-hover/promo:gap-1.5">
          {promoCard.ctaText || "Explore now"}
          <span aria-hidden="true">›</span>
        </span>
      </div>
    </a>
  );
});

/* ─── Featured Promo Column (Exact Vertical Stripe Card + UTE Flower Watermark) ─── */
const FeaturedPromoColumn = React.memo(function FeaturedPromoColumn({
  promoCard,
  closeMenu,
  side = "right",
}: {
  promoCard: NavPromoCard;
  closeMenu: () => void;
  side?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "w-56 xl:w-64 shrink-0 py-6 flex flex-col justify-start self-stretch",
        side === "left" ? "pr-4 xl:pr-5" : "pl-4 xl:pl-5"
      )}
    >
      <div className="group/col relative pb-2 mb-3">
        <h3 className="text-[13px] font-bold text-foreground dark:text-zinc-200 tracking-normal whitespace-nowrap">
          {promoCard.badge || "Spotlight"}
        </h3>
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200/80 dark:bg-zinc-800 rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full scale-x-0 group-hover/col:scale-x-100 origin-left transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
      </div>

      <PromoCardBlock promoCard={promoCard} closeMenu={closeMenu} />
    </div>
  );
});

/* ─── Mega Menu Column Scroll Container with Seamless Progressive Fade ─── */
function MegaMenuColumnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 2);
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 4);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      checkScroll();
    }
  }, [children, checkScroll]);

  return (
    <div className={cn("relative flex-1 min-h-0 flex flex-col", className)}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 h-8 transition-opacity duration-200 bg-gradient-to-b from-white via-white/85 to-transparent dark:from-card dark:via-card/85 flex items-start justify-center pt-0.5",
          canScrollUp ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollRef.current?.scrollBy({ top: -140, behavior: "smooth" });
          }}
          className="group/chevron flex items-center justify-center size-5 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-border/80 text-primary hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
          aria-label="Scroll up"
        >
          <ChevronUp className="size-3 transition-transform group-hover/chevron:-translate-y-0.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-y-auto max-h-[calc(100vh-13.5rem)] pb-2 scrollbar-none mega-menu-scrollbar overscroll-contain flex flex-col flex-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 h-10 transition-opacity duration-200 bg-gradient-to-t from-white via-white/85 to-transparent dark:from-card dark:via-card/85 flex items-end justify-center pb-1",
          canScrollDown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollRef.current?.scrollBy({ top: 140, behavior: "smooth" });
          }}
          className="group/chevron flex items-center justify-center size-6 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-border/80 text-primary hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown className="size-3.5 transition-transform group-hover/chevron:translate-y-0.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Mega Menu Item (Full-width row, solid blue background & white text on hover) ─── */
const StripeMenuItem = React.memo(function StripeMenuItem({
  link,
  closeMenu,
  columnPosition = "middle",
  hasAnyIconInCol = false,
}: {
  link: NavSubItem;
  closeMenu: () => void;
  columnPosition?: "first" | "middle" | "last";
  hasAnyIconInCol?: boolean;
}) {
  const hasIcon = Boolean(link.icon);
  const isExternal = Boolean(link.isExternal || link.href?.startsWith("http"));
  const isWordWrap = link.wordWrap ?? true;
  const labelText = link.title || "";
  const lines = labelText ? labelText.split("\n") : [];

  const colPadding =
    columnPosition === "first"
      ? "pl-3.5 xl:pl-5 pr-4 xl:pr-6"
      : columnPosition === "last"
        ? "pl-4 xl:pl-6 pr-3.5 xl:pr-5"
        : "px-4 xl:px-6";

  const content = (
    <div
      className={cn(
        "group/item w-full flex items-start gap-2.5 py-3 rounded-none transition-colors duration-150 cursor-pointer min-w-0 select-none",
        colPadding,
        "hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white",
        link.featured && "bg-primary/[0.04] border-l-2 border-primary"
      )}
    >
      {hasIcon ? (
        <div className="size-6 rounded-lg bg-primary/10 text-primary group-hover/item:bg-white/20 group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors shadow-2xs">
          {React.createElement(getNavIcon(link.icon), {
            className: "w-3.5 h-3.5",
          })}
        </div>
      ) : hasAnyIconInCol ? (
        <div className="size-6 shrink-0" aria-hidden="true" />
      ) : null}

      <div className="flex-1 flex flex-col min-w-0 text-left">
        <div
          title={labelText}
          className={cn(
            "text-[14.5px] xl:text-[15px] font-bold text-foreground dark:text-zinc-100 group-hover/item:text-white transition-colors leading-snug min-w-0 flex flex-col text-left",
            !isWordWrap && "truncate"
          )}
        >
          {lines.length > 0 ? (
            lines.map((line, lIdx) => (
              <span
                key={lIdx}
                className={cn(
                  "block leading-snug text-left min-h-[1.25em]",
                  isWordWrap
                    ? "whitespace-pre-line break-words [overflow-wrap:anywhere]"
                    : "truncate"
                )}
              >
                {line || "\u00A0"}
              </span>
            ))
          ) : (
            <span className="block leading-snug text-left">{labelText}</span>
          )}
        </div>
      </div>

      {(link.badge || link.featured) && (
        <span className="shrink-0 text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 group-hover/item:bg-white/20 group-hover/item:text-white transition-colors mt-0.5">
          {link.badge || "Hot"}
        </span>
      )}

      {isExternal && (
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60 group-hover/item:text-white transition-colors ml-auto mt-0.5" />
      )}
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMenu}
        className="w-full block no-underline focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      onClick={closeMenu}
      className="w-full block no-underline focus:outline-none"
    >
      {content}
    </Link>
  );
});

/* ─── Dynamic Height Animated Mega Menu Container ─── */
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

  const columnsHavePromo = columns.some(
    (c) => Boolean(c.promoCard) || c.type === "promo-card"
  );
  const showFeaturedPromo = Boolean(activeItem.promoCard && !columnsHavePromo);
  const promoOnLeft = activeItem.promoCardPosition === "left";

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
              <div className="flex flex-col lg:flex-row items-stretch w-full divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-zinc-800">
                {showFeaturedPromo && promoOnLeft && activeItem.promoCard && (
                  <FeaturedPromoColumn
                    promoCard={activeItem.promoCard}
                    closeMenu={closeMenu}
                    side="left"
                  />
                )}

                {columns.map((col, idx) => {
                  const isFirst = idx === 0 && !(showFeaturedPromo && promoOnLeft);
                  const isLast =
                    idx === columns.length - 1 &&
                    !(showFeaturedPromo && !promoOnLeft);
                  const columnPosition = isFirst
                    ? "first"
                    : isLast
                      ? "last"
                      : "middle";
                  const colPadding = isFirst
                    ? "pl-3.5 xl:pl-5 pr-4 xl:pr-6"
                    : isLast
                      ? "pl-4 xl:pl-6 pr-3.5 xl:pr-5"
                      : "px-4 xl:px-6";
                  const hasAnyIconInCol = col.links?.some((l) => Boolean(l.icon));

                  return (
                    <div
                      key={col.id}
                      className="group/col flex flex-col min-w-0 flex-1 self-stretch py-6 px-0"
                    >
                      {/* Fixed Title Header */}
                      <div className={cn("relative pb-2 mb-2 shrink-0", colPadding)}>
                        <h3 className="text-[13.5px] font-extrabold text-foreground dark:text-zinc-100 tracking-normal transition-colors">
                          {col.title}
                        </h3>
                        <div
                          className={cn(
                            "absolute bottom-0 h-[1.5px] bg-slate-200/80 dark:bg-zinc-800 rounded-full",
                            isFirst
                              ? "left-3.5 xl:left-5 right-4 xl:right-6"
                              : isLast
                                ? "left-4 xl:left-6 right-3.5 xl:right-5"
                                : "left-4 xl:left-6 right-4 xl:right-6"
                          )}
                        />
                        <div
                          className={cn(
                            "absolute bottom-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full scale-x-0 group-hover/col:scale-x-100 origin-left transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                            isFirst
                              ? "left-3.5 xl:left-5 right-4 xl:right-6"
                              : isLast
                                ? "left-4 xl:left-6 right-3.5 xl:right-5"
                                : "left-4 xl:left-6 right-4 xl:right-6"
                          )}
                        />
                      </div>

                      <MegaMenuColumnScroll>
                        {col.promoCard && col.promoPosition === "top" && (
                          <div className={cn("mb-2 shrink-0", colPadding)}>
                            <PromoCardBlock
                              promoCard={col.promoCard}
                              closeMenu={closeMenu}
                            />
                          </div>
                        )}

                        {col.type !== "promo-card" && (
                          <div className="flex flex-col flex-1 w-full">
                            {col.links.map((link) => (
                              <StripeMenuItem
                                key={link.id}
                                link={link}
                                closeMenu={closeMenu}
                                columnPosition={columnPosition}
                                hasAnyIconInCol={hasAnyIconInCol}
                              />
                            ))}
                          </div>
                        )}

                        {col.promoCard &&
                          (col.promoPosition === "bottom" || !col.promoPosition) && (
                            <div className={cn("mt-2 shrink-0", colPadding)}>
                              <PromoCardBlock
                                promoCard={col.promoCard}
                                closeMenu={closeMenu}
                              />
                            </div>
                          )}
                      </MegaMenuColumnScroll>
                    </div>
                  );
                })}

                {showFeaturedPromo && !promoOnLeft && activeItem.promoCard && (
                  <FeaturedPromoColumn
                    promoCard={activeItem.promoCard}
                    closeMenu={closeMenu}
                    side="right"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

/* ─── Top Nav Items (Exact HCM-UTE Solid Blue Hover Trigger Buttons) ─── */
function NavItems({
  items,
  allItems,
  pathname,
  activeMenuId,
  align = "start",
  position = "all",
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  closeMenu,
}: {
  items: NavLinkItem[];
  allItems: NavLinkItem[];
  pathname: string | null;
  activeMenuId: string | null;
  align?: "between" | "start" | "center" | "end";
  position?: "left" | "right" | "all";
  handleMouseEnter: (id: string, index?: number) => void;
  handleMouseLeave: () => void;
  handleClick: (id: string, index?: number) => void;
  closeMenu: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center flex-nowrap h-full",
        align === "center" &&
          "justify-center w-full gap-0.5 sm:gap-1 lg:gap-1 xl:gap-2 2xl:gap-3",
        align === "between" && "justify-between w-full gap-0.5 xl:gap-1.5",
        align === "start" &&
          "justify-start w-full gap-0.5 sm:gap-1 lg:gap-1 xl:gap-2 2xl:gap-3",
        align === "end" &&
          "justify-end w-full gap-0.5 sm:gap-1 lg:gap-1 xl:gap-2 2xl:gap-3"
      )}
    >
      {items.map((item, index) => {
        const globalIdx = allItems.findIndex((i) => i.id === item.id);
        const hasMegaMenu =
          item.type !== "link" &&
          ((item.columns && item.columns.length > 0) ||
            (item.children && item.children.length > 0));
        const isDirectLink = !hasMegaMenu;
        const itemHref = item.href || "/";

        const isRouteActive = Boolean(
          pathname &&
            itemHref &&
            !itemHref.startsWith("/#") &&
            (itemHref === "/"
              ? pathname === "/"
              : pathname === itemHref || pathname.startsWith(`${itemHref}/`))
        );
        const isActive =
          activeMenuId === item.id || (!activeMenuId && isRouteActive);

        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const edgeOffsetClass =
          position === "left" && isFirst
            ? "-ml-1.5 xl:-ml-2"
            : (position === "right" || position === "all") && isLast
              ? "-mr-1.5 xl:-mr-2"
              : "";

        const triggerClasses = cn(
          "group/btn inline-flex items-center justify-center gap-0.5 lg:gap-1 font-bold uppercase text-[11px] lg:text-[11.5px] xl:text-xs 2xl:text-sm px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 h-8 xl:h-9 rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap z-10 focus:outline-none",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground hover:shadow-md"
            : "text-foreground dark:text-white hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
        );

        return (
          <div
            key={item.id}
            className={cn(
              "relative flex items-center h-full py-1.5 px-0.5 shrink-0 group/nav-item",
              activeMenuId === item.id &&
                "before:absolute before:top-0 before:bottom-[-8px] before:inset-x-0 before:content-[''] before:pointer-events-auto",
              edgeOffsetClass
            )}
            onMouseEnter={() => {
              if (hasMegaMenu) {
                handleMouseEnter(item.id, globalIdx >= 0 ? globalIdx : index);
              } else {
                closeMenu();
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            {isDirectLink ? (
              item.isExternal || itemHref.startsWith("http") ? (
                <a
                  href={itemHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={triggerClasses}
                >
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link
                  href={itemHref}
                  onClick={() => {
                    closeMenu();
                    if (itemHref === "/" && typeof window !== "undefined") {
                      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    }
                  }}
                  className={triggerClasses}
                >
                  <span>{item.name}</span>
                </Link>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (hasMegaMenu) {
                    handleClick(item.id, globalIdx >= 0 ? globalIdx : index);
                  } else if (itemHref) {
                    router.push(itemHref);
                  }
                }}
                className={triggerClasses}
                aria-expanded={activeMenuId === item.id}
              >
                <span>{item.name}</span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200",
                    activeMenuId === item.id
                      ? "rotate-180 text-primary-foreground"
                      : isActive
                        ? "text-primary-foreground"
                        : "text-foreground/80 dark:text-slate-300 group-hover/btn:text-primary-foreground"
                  )}
                />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Mobile Spotlight Promo Card ─── */
function MobilePromoCard({
  promo,
  onClose,
}: {
  promo: NavPromoCard;
  onClose: () => void;
}) {
  const resolvedHref = promo.href || "/#cfp";
  const isExt = resolvedHref.startsWith("http");

  const cardContent = (
    <div className="group/promo relative flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-primary/[0.09] shadow-sm hover:shadow-md transition-all my-1.5">
      {promo.image && (
        <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.image}
            alt={promo.title}
            className="w-full h-full object-cover group-hover/promo:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {promo.badge && (
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary text-primary-foreground shadow-xs">
              {promo.badge}
            </span>
          )}
          <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 text-primary shadow-xs">
            <ArrowUpRight className="size-3.5" />
          </div>
        </div>
      )}
      <div className="p-3 flex flex-col gap-1">
        <h4 className="text-sm font-bold text-foreground group-hover/promo:text-primary transition-colors line-clamp-1">
          {promo.title}
        </h4>
        {promo.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {promo.description}
          </p>
        )}
      </div>
    </div>
  );

  if (isExt) {
    return (
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="block"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={resolvedHref} onClick={onClose} className="block">
      {cardContent}
    </Link>
  );
}

/* ─── Mobile Tree Node Link Item (Solid Blue Hover) ─── */
function MobileLinkItem({
  link,
  onClose,
}: {
  link: NavSubItem;
  onClose: () => void;
}) {
  const hasIcon = Boolean(link.icon);
  const isExt = Boolean(link.isExternal || link.href?.startsWith("http"));

  const inner = (
    <div
      className={cn(
        "w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors group/item select-none",
        "hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white",
        link.featured && "ring-1 ring-primary/30 bg-primary/[0.04]"
      )}
    >
      {hasIcon ? (
        <div className="size-7 rounded-lg bg-primary/10 text-primary group-hover/item:bg-white/20 group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
          {React.createElement(getNavIcon(link.icon), {
            className: "size-3.5",
          })}
        </div>
      ) : (
        <div className="size-1.5 rounded-full bg-primary/40 group-hover/item:bg-white mt-2 shrink-0 ml-1 transition-colors" />
      )}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-[14.5px] sm:text-[15px] font-bold text-foreground group-hover/item:text-white transition-colors leading-snug flex-1 min-w-0">
          {link.title}
        </span>
        {(link.badge || link.featured) && (
          <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 group-hover/item:bg-white/20 group-hover/item:text-white transition-colors">
            {link.badge || "Hot"}
          </span>
        )}
        {isExt && (
          <ArrowUpRight className="size-3.5 text-slate-400 group-hover/item:text-white transition-colors shrink-0 ml-auto" />
        )}
      </div>
    </div>
  );

  if (isExt) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="block"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={link.href} onClick={onClose} className="block">
      {inner}
    </Link>
  );
}

/* ─── Mobile Tree Category Branch ─── */
function MobileCategoryBranch({
  column,
  onClose,
}: {
  column: NavColumnItem;
  onClose: () => void;
}) {
  return (
    <div className="group/col flex flex-col gap-1.5 p-2 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs">
      <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
          <div className="w-1.5 h-3.5 rounded-full bg-primary shrink-0" />
          <span className="text-xs font-extrabold uppercase tracking-wide text-foreground truncate">
            {column.title}
          </span>
        </div>
        {column.links.length > 0 && (
          <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 rounded-md">
            {column.links.length}
          </Badge>
        )}
      </div>

      {column.promoCard && column.promoPosition === "top" && (
        <MobilePromoCard promo={column.promoCard} onClose={onClose} />
      )}

      {column.links.length > 0 && (
        <div className="flex flex-col gap-0.5 pl-1.5 border-l-2 border-primary/20 ml-2 my-1">
          {column.links.map((link) => (
            <MobileLinkItem key={link.id} link={link} onClose={onClose} />
          ))}
        </div>
      )}

      {column.promoCard &&
        (column.promoPosition === "bottom" || !column.promoPosition) && (
          <MobilePromoCard promo={column.promoCard} onClose={onClose} />
        )}
    </div>
  );
}

export function Header({
  previewInBuilder = false,
}: {
  previewInBuilder?: boolean;
} = {}) {
  const builderCtx = useContext(BuilderBlockContext);
  const pathname = usePathname();
  const isHiddenOnAdmin =
    Boolean(pathname?.startsWith("/admin")) &&
    !previewInBuilder &&
    !builderCtx;
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchFilter, setMobileSearchFilter] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileExpandedIds, setMobileExpandedIds] = useState<Set<string>>(
    () => new Set(["nav-submissions"])
  );
  const [centerLogoRatio, setCenterLogoRatio] = useState<number | null>(null);

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

  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>(DEFAULT_HEADER_DATA);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    role?: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    if (isHiddenOnAdmin) return;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setIsLoggedIn(true);
          setCurrentUser(data.user);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      })
      .catch(() => null);
  }, [isHiddenOnAdmin]);

  useEffect(() => {
    if (isHiddenOnAdmin) return;
    fetch("/api/admin/header")
      .then((res) => res.json())
      .then((res) => {
        if (res.header) {
          setHeaderConfig(normalizeHeaderConfig(res.header));
        }
      })
      .catch(() => {});

    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<HeaderConfig>).detail;
      if (detail) setHeaderConfig(normalizeHeaderConfig(detail));
    };
    window.addEventListener("smc:header-updated", onUpdated);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("smc_header_sync");
      channel.onmessage = (ev) => {
        if (ev.data) setHeaderConfig(normalizeHeaderConfig(ev.data));
      };
    }

    return () => {
      window.removeEventListener("smc:header-updated", onUpdated);
      channel?.close();
    };
  }, [isHiddenOnAdmin]);

  const rawNavLinks = headerConfig.navLinks || DEFAULT_HEADER_DATA.navLinks;
  const navLinks = useMemo(() => {
    const hasHome = rawNavLinks.some(
      (l) => l.href === "/" || l.id === "nav-home"
    );
    if (!hasHome) {
      return [
        {
          id: "nav-home",
          name: "Home",
          href: "/",
          type: "link" as const,
          position: "left" as const,
        },
        ...rawNavLinks,
      ];
    }
    return rawNavLinks;
  }, [rawNavLinks]);

  const mobileNavItems = useMemo(() => {
    const liveCfpHref =
      headerConfig.topbar?.quickLinks?.find((q) => q.id === "top-cfp-pdf")
        ?.href || CONFERENCE_INFO.cfpPdfUrl;
    return [
      ...navLinks,
      {
        id: "mob-news",
        name: "News & Announcements",
        href: "/#news",
        type: "link" as const,
      },
      {
        id: "mob-sponsors",
        name: "Partnership & Exhibition",
        href: "/#sponsors",
        type: "link" as const,
      },
      {
        id: "mob-cfp-pdf",
        name: "Download Call for Papers",
        href: liveCfpHref,
        type: "link" as const,
        isExternal: true,
      },
    ];
  }, [navLinks, headerConfig.topbar?.quickLinks]);

  const filteredMobileNavItems = useMemo(() => {
    const q = mobileSearchFilter.trim().toLowerCase();
    if (!q) return mobileNavItems;
    return mobileNavItems.filter((item) => {
      if (item.name.toLowerCase().includes(q)) return true;
      return item.columns?.some(
        (col) =>
          col.title.toLowerCase().includes(q) ||
          col.links.some((l) => l.title.toLowerCase().includes(q))
      );
    });
  }, [mobileNavItems, mobileSearchFilter]);

  const hotline = headerConfig.topbar?.hotline || CONFERENCE_INFO.hotline;
  const hotlineRaw =
    headerConfig.topbar?.hotlineRaw || CONFERENCE_INFO.hotlineRaw;
  const email = headerConfig.topbar?.email || CONFERENCE_INFO.contactEmail;
  const showTopbar = headerConfig.topbar?.enabled !== false;
  const showTopbarSearch = headerConfig.topbar?.showSearch !== false;
  const searchPlaceholder =
    headerConfig.topbar?.searchPlaceholder || "Search conference, tracks...";
  const topbarQuickLinks =
    headerConfig.topbar?.quickLinks && headerConfig.topbar.quickLinks.length > 0
      ? headerConfig.topbar.quickLinks
      : DEFAULT_HEADER_DATA.topbar?.quickLinks || [];
  const variant = headerConfig.variant || "left-aligned";
  const isSticky = headerConfig.sticky !== false;
  const showLogo = headerConfig.showLogo !== false;
  const desktopLogoUrl =
    headerConfig.logoUrl || DEFAULT_HEADER_DATA.logoUrl || "/logo/tagline.png";
  const mobileLogoUrl =
    headerConfig.mobileLogoUrl ||
    DEFAULT_HEADER_DATA.mobileLogoUrl ||
    "/logo/square-logo.png";
  const logoHref = headerConfig.logoHref || "/";
  const brandTitle = headerConfig.brand?.conferenceTitle || "IEEE SMC 2027";
  const ctaLabel = headerConfig.ctaButton?.label || "Submit Paper";
  const ctaHref = headerConfig.ctaButton?.href || "/#cfp";
  const showCta = headerConfig.ctaButton?.enabled !== false;
  const showMobileSearch = headerConfig.mobileHeader?.showSearch !== false;
  const mobileSearchPlaceholder =
    headerConfig.mobileHeader?.searchPlaceholder || "Search...";

  const { leftNavLinks, rightNavLinks } = useMemo(() => {
    const explicitRight = navLinks.filter((i) => i.position === "right");
    const explicitLeft = navLinks.filter((i) => i.position === "left");
    if (explicitRight.length > 0 && explicitLeft.length > 0) {
      return { leftNavLinks: explicitLeft, rightNavLinks: explicitRight };
    }
    const mid = Math.ceil(navLinks.length / 2);
    return {
      leftNavLinks: navLinks.slice(0, mid),
      rightNavLinks: navLinks.slice(mid),
    };
  }, [navLinks]);

  const portalHref = !isLoggedIn
    ? "/admin/login"
    : currentUser?.role === "ADMIN"
      ? "/admin"
      : "/portal";
  const portalLabel = !isLoggedIn
    ? "Login"
    : currentUser?.role === "ADMIN"
      ? "Dashboard"
      : "Portal";

  const toggleMobileAccordion = useCallback((id: string) => {
    setMobileExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Attribute-driven scroll state on header element (matches hcmute-website-frontend)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => {
      el.toggleAttribute("data-scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHiddenOnAdmin]);

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

  // Close mobile drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setMobileSearchFilter("");
  }

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
            if (index > currentIndexRef.current) dir = 1;
            else if (index < currentIndexRef.current) dir = -1;
          }
          if (index !== undefined) {
            currentIndexRef.current = index;
          }
          return { activeMenuId: id, direction: dir };
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

  const handleClick = useCallback(
    (id: string, index?: number) => {
      if (activeMenuId === id) {
        setNavState({ activeMenuId: null, direction: 0 });
        currentIndexRef.current = -1;
      } else {
        handleMouseEnter(id, index);
      }
    },
    [activeMenuId, handleMouseEnter]
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
      setNavState({ activeMenuId: null, direction: 0 });
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
    setNavState({ activeMenuId: null, direction: 0 });
    currentIndexRef.current = -1;
  }, []);

  const activeItem = useMemo(() => {
    if (!activeMenuId) return null;
    return (
      navLinks.find(
        (link) =>
          link.id === activeMenuId &&
          link.type !== "link" &&
          ((link.columns && link.columns.length > 0) ||
            (link.children && link.children.length > 0))
      ) || null
    );
  }, [activeMenuId, navLinks]);

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

  if (isHiddenOnAdmin) {
    return null;
  }

  const isWideCenterLogo = Boolean(centerLogoRatio && centerLogoRatio > 1.25);

  return (
    <>
      {/* ── TopBar — flows in document, scrolls away naturally (Matches hcmute-website-frontend TopBar 1:1) ── */}
      {showTopbar && (
        <div className="navbar-topbar page-border-x-light hidden lg:block bg-primary py-1.5 text-primary-foreground relative z-50">
          <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] flex h-7.5 sm:h-9 items-center justify-between text-sm gap-2">
            {/* Left Side: Hotline & Email & Quick Links */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 overflow-hidden">
              {hotline && (
                <a
                  href={`tel:${hotlineRaw}`}
                  className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-primary-foreground/95 font-semibold hover:text-white transition-colors shrink-0"
                  title="Call Hotline"
                >
                  <Phone className="w-3 h-3 text-primary-foreground/80 shrink-0" />
                  <span className="truncate">{hotline}</span>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="hidden md:flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-primary-foreground/90 font-medium hover:text-white transition-colors shrink-0"
                  title="Send Email"
                >
                  <Mail className="w-3 h-3 text-primary-foreground/70 shrink-0" />
                  <span>{email}</span>
                </a>
              )}

              {topbarQuickLinks.length > 0 && (
                <div className="hidden lg:flex items-center shrink-0">
                  {topbarQuickLinks.map((ql, idx) => {
                    const isExtOrPdf =
                      ql.isExternal ||
                      ql.href.toLowerCase().includes(".pdf") ||
                      ql.href.startsWith("/api/images/");
                    const chip = (
                      <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold hover:bg-primary-foreground/10 transition-colors whitespace-nowrap">
                        {(ql.href.toLowerCase().includes(".pdf") ||
                          ql.href.startsWith("/api/images/")) && (
                          <FileDown className="w-3 h-3 text-primary-foreground/85 shrink-0" />
                        )}
                        <span>{ql.label}</span>
                      </span>
                    );

                    return (
                      <React.Fragment key={ql.id}>
                        {isExtOrPdf ? (
                          <a
                            href={ql.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {chip}
                          </a>
                        ) : (
                          <Link href={ql.href}>{chip}</Link>
                        )}
                        {idx < topbarQuickLinks.length - 1 && (
                          <span
                            className="h-3 w-px bg-primary-foreground/20 mx-0.5 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side: Rounded-Full Search Pill, Portal Login & Optional CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {showTopbarSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="text-primary-foreground/90 hover:text-white bg-white/10 hover:bg-white/18 focus-visible:bg-white/25 border border-white/20 hover:border-white/35 transition-all h-8 min-w-[150px] sm:min-w-[180px] lg:min-w-[210px] px-3.5 rounded-full hidden sm:flex items-center justify-between gap-2 text-xs font-medium shrink-0 cursor-pointer shadow-2xs select-none"
                  title={searchPlaceholder}
                  aria-label={searchPlaceholder}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Search className="w-3.5 h-3.5 text-white/90 shrink-0" />
                    <span className="truncate text-white/95">
                      {searchPlaceholder}
                    </span>
                  </span>
                  <kbd className="hidden lg:inline-flex items-center text-[10px] font-semibold text-white/90 bg-black/25 border border-white/15 rounded px-1.5 py-0.5 ml-1.5 shrink-0">
                    ⌘K
                  </kbd>
                </button>
              )}

              <Link
                href={portalHref}
                className="inline-flex items-center justify-center gap-1.5 h-7 sm:h-8 xl:h-9 px-2 sm:px-2.5 xl:px-3.5 text-[11px] sm:text-xs xl:text-sm font-bold uppercase text-white hover:bg-white/15 rounded-lg transition-all shrink-0 select-none whitespace-nowrap"
                title={portalLabel}
              >
                <User className="size-3.5 shrink-0" />
                <span>{portalLabel}</span>
              </Link>

              {showCta && (
                <a
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-1 h-7 sm:h-8 px-2.5 xl:px-3 text-[11px] sm:text-xs font-bold uppercase bg-white text-primary hover:bg-blue-50 rounded-lg shadow-2xs transition-all shrink-0 select-none whitespace-nowrap"
                >
                  <span>{ctaLabel}</span>
                  <ArrowUpRight className="size-3.5 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky White Header + Full-Width Mega Menu Dropdown (Matches hcmute-website-frontend Navbar 1:1) ── */}
      <div
        className={cn(
          isSticky
            ? "sticky top-0 z-50 w-full relative"
            : "relative z-50 w-full"
        )}
      >
        <header
          ref={headerRef}
          className="navbar-header page-border-x-dark w-full bg-white shadow-[-8px_0_25px_-10px_rgba(0,0,0,0.05),8px_0_25px_-10px_rgba(0,0,0,0.05)] transition-shadow duration-200 ease-out relative"
        >
          <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] relative">
            {/* Mobile Header — matches hcmute-website-frontend mobile bar 1:1 */}
            <div className="flex lg:hidden items-center justify-between w-full h-[59px] sm:h-[67px] gap-2">
              <Link
                href={logoHref}
                onClick={() => {
                  closeMenu();
                  if (logoHref === "/" && typeof window !== "undefined") {
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  }
                }}
                className="flex items-center gap-2 shrink-0"
                aria-label={brandTitle}
              >
                {showLogo && mobileLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mobileLogoUrl}
                    alt={brandTitle}
                    className="h-10 w-auto sm:h-12 object-contain"
                  />
                ) : (
                  <span className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                    {brandTitle}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
                {showMobileSearch && (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="relative flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-3.5 rounded-full transition-all duration-200 focus:outline-none cursor-pointer border shadow-2xs active:scale-[0.98] bg-slate-100/90 text-foreground border-slate-200/90 hover:bg-slate-200/80 w-32 sm:w-56 md:w-68 max-w-[260px] shrink min-w-0 text-left select-none group"
                    aria-label={mobileSearchPlaceholder}
                  >
                    <Search className="size-3.5 sm:size-4 shrink-0 text-foreground/60 group-hover:text-primary transition-colors" />
                    <span className="truncate text-xs font-normal text-muted-foreground select-none">
                      {mobileSearchPlaceholder}
                    </span>
                  </button>
                )}

                {/* Apple-Style 2-Dash Hamburger to X Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className={cn(
                    "relative flex items-center justify-center w-11 h-9.5 sm:w-12 sm:h-10 ml-0.5 sm:ml-1 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer border shadow-xs active:scale-95 shrink-0",
                    mobileMenuOpen
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-slate-100/90 text-foreground border-slate-200/80 hover:bg-slate-200/70 hover:shadow-sm"
                  )}
                  aria-label={
                    mobileMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  aria-expanded={mobileMenuOpen}
                >
                  <div className="relative flex flex-col items-center justify-center w-6 h-5 shrink-0 pointer-events-none">
                    <motion.span
                      animate={
                        mobileMenuOpen
                          ? { rotate: 45, y: 0 }
                          : { rotate: 0, y: -3.5 }
                      }
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="w-5 sm:w-5.5 h-[2.5px] bg-current rounded-full origin-center absolute"
                    />
                    <motion.span
                      animate={
                        mobileMenuOpen
                          ? { rotate: -45, y: 0 }
                          : { rotate: 0, y: 3.5 }
                      }
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="w-5 sm:w-5.5 h-[2.5px] bg-current rounded-full origin-center absolute"
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Desktop Header — Variant Switcher */}
            {variant === "centered" ? (
              <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center w-full h-[4.5rem] gap-1 lg:gap-1.5 xl:gap-3 2xl:gap-5">
                <nav className="flex items-center justify-start w-full h-full min-w-0 relative z-[60]">
                  <NavItems
                    items={leftNavLinks}
                    allItems={navLinks}
                    pathname={pathname}
                    activeMenuId={activeMenuId}
                    align="start"
                    position="left"
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    handleClick={handleClick}
                    closeMenu={closeMenu}
                  />
                </nav>

                {showLogo && desktopLogoUrl ? (
                  <Link
                    href={logoHref}
                    onClick={() => {
                      closeMenu();
                      if (logoHref === "/" && typeof window !== "undefined") {
                        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                      }
                    }}
                    onMouseEnter={handleContentMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                      "flex items-center justify-center focus:outline-none shrink-0 h-16 z-20 transition-all duration-200 px-1 lg:px-1.5 xl:px-2.5",
                      isWideCenterLogo
                        ? "max-w-[120px] lg:max-w-[135px] xl:max-w-[165px] 2xl:max-w-[200px]"
                        : "max-w-[64px] xl:max-w-[76px] 2xl:max-w-[88px]"
                    )}
                    aria-label={brandTitle}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={desktopLogoUrl}
                      src={desktopLogoUrl}
                      alt={brandTitle}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalHeight > 0) {
                          setCenterLogoRatio(img.naturalWidth / img.naturalHeight);
                        }
                      }}
                      className={cn(
                        "navbar-logo w-auto max-w-full max-h-full object-contain transition-transform duration-200",
                        isWideCenterLogo
                          ? "h-8 lg:h-9 xl:h-11 2xl:h-12 max-w-[110px] lg:max-w-[130px] xl:max-w-[160px] 2xl:max-w-[190px]"
                          : "h-10 lg:h-11 xl:h-13 2xl:h-14 max-w-[56px] xl:max-w-[68px]"
                      )}
                    />
                  </Link>
                ) : (
                  <div />
                )}

                <nav className="flex items-center justify-end w-full h-full min-w-0 relative z-[60]">
                  <NavItems
                    items={rightNavLinks}
                    allItems={navLinks}
                    pathname={pathname}
                    activeMenuId={activeMenuId}
                    align="end"
                    position="right"
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    handleClick={handleClick}
                    closeMenu={closeMenu}
                  />
                </nav>
              </div>
            ) : variant === "stacked" ? (
              <div className="hidden lg:flex flex-col w-full">
                {showLogo && desktopLogoUrl && (
                  <div className="py-2.5 border-b border-border/60 flex items-center justify-between">
                    <Link
                      href={logoHref}
                      onClick={() => {
                        closeMenu();
                        if (logoHref === "/" && typeof window !== "undefined") {
                          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                        }
                      }}
                      className="flex items-center shrink-0 focus:outline-none"
                      aria-label={brandTitle}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={desktopLogoUrl}
                        alt={brandTitle}
                        className="navbar-logo h-12 xl:h-14 w-auto object-contain"
                      />
                    </Link>
                    {!showTopbar && showCta && (
                      <a
                        href={ctaHref}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-bold uppercase text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-all"
                      >
                        <span>{ctaLabel}</span>
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                )}
                <nav className="h-12 flex items-center justify-between w-full relative z-[60]">
                  <NavItems
                    items={navLinks}
                    allItems={navLinks}
                    pathname={pathname}
                    activeMenuId={activeMenuId}
                    align="between"
                    position="all"
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    handleClick={handleClick}
                    closeMenu={closeMenu}
                  />
                </nav>
              </div>
            ) : (
              /* Left-Aligned (default HCM-UTE variant) & Minimal */
              <div className="hidden lg:flex items-center justify-start w-full h-[4.5rem] gap-4 xl:gap-6">
                {showLogo && desktopLogoUrl && (
                  <Link
                    href={logoHref}
                    onClick={() => {
                      closeMenu();
                      if (logoHref === "/" && typeof window !== "undefined") {
                        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                      }
                    }}
                    onMouseEnter={handleContentMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="flex items-center justify-center focus:outline-none shrink-0 h-16 relative"
                    aria-label={brandTitle}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={desktopLogoUrl}
                      alt={brandTitle}
                      className="navbar-logo h-12 xl:h-14 w-auto max-w-[210px] xl:max-w-[250px] object-contain"
                    />
                  </Link>
                )}

                <nav
                  className={cn(
                    "flex items-center flex-1 h-full min-w-0 relative z-[60]",
                    variant === "minimal" ? "justify-end" : "justify-start"
                  )}
                >
                  <NavItems
                    items={navLinks}
                    allItems={navLinks}
                    pathname={pathname}
                    activeMenuId={activeMenuId}
                    align={variant === "minimal" ? "end" : "start"}
                    position="all"
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    handleClick={handleClick}
                    closeMenu={closeMenu}
                  />
                </nav>

                {/* Fallback Login + CTA when TopBar is disabled */}
                {!showTopbar && variant !== "minimal" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={portalHref}
                      onClick={closeMenu}
                      className="inline-flex items-center justify-center gap-1.5 h-8 xl:h-9 px-2.5 xl:px-3 text-xs font-bold uppercase text-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-150 select-none whitespace-nowrap"
                    >
                      <User className="size-3.5 shrink-0" />
                      <span>{portalLabel}</span>
                    </Link>
                    {showCta && (
                      <a
                        href={ctaHref}
                        onClick={closeMenu}
                        className="inline-flex items-center justify-center gap-1 h-8 xl:h-9 px-3 xl:px-3.5 text-xs font-bold uppercase text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-all duration-150 select-none whitespace-nowrap"
                      >
                        <span>{ctaLabel}</span>
                        <ArrowUpRight className="size-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="navbar-bottom-line absolute bottom-0 left-0 right-0 h-px bg-border/50" />
        </header>

        {/* ── Full-Width Mega Menu Dropdown (Aligned to --site-width boundaries) ── */}
        <AnimatePresence>
          {Boolean(activeItem) && activeItem && (
            <div
              className="absolute left-0 right-0 top-full z-50 pointer-events-none"
              onMouseEnter={handleContentMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-full max-w-[var(--site-width)] mx-auto pointer-events-auto">
                <motion.div
                  key="mega-menu-container"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease: SMOOTH_EASE },
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    transition: { duration: 0.08, ease: "easeOut" },
                  }}
                  className="w-full bg-white dark:bg-card border-x border-b border-border rounded-b-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08),-8px_15px_25px_-10px_rgba(0,0,0,0.05),8px_15px_25px_-10px_rgba(0,0,0,0.05)] overflow-hidden will-change-[transform,opacity] max-h-[calc(100vh-5.5rem)] flex flex-col"
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

      {/* ── Background Overlay for Desktop Mega Menu (Matches NavbarOverlay 1:1) ── */}
      <AnimatePresence>
        {Boolean(activeItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.08, ease: "easeOut" },
            }}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/5 pointer-events-auto"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Top-to-Bottom Full Screen Mobile Navigation Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-drawer"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden fixed top-[59px] sm:top-[67px] left-0 right-0 bottom-0 bg-white/98 backdrop-blur-2xl z-50 flex flex-col overflow-hidden shadow-2xl border-t border-slate-200/80"
          >
            {/* Quick Search inside Mobile Navigation */}
            <div className="px-4 pt-3.5 pb-2 border-b border-slate-100">
              <div className="relative flex items-center">
                <Search className="absolute left-3 size-4 text-slate-400" />
                <input
                  type="text"
                  value={mobileSearchFilter}
                  onChange={(e) => setMobileSearchFilter(e.target.value)}
                  placeholder={mobileSearchPlaceholder}
                  className="w-full h-9.5 pl-9 pr-4 text-base rounded-xl bg-slate-100/80 border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-primary/30 touch-manipulation"
                />
              </div>
            </div>

            {/* Scrollable Tree Navigation Body */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                {filteredMobileNavItems.map((item) => {
                  const cols =
                    item.type === "link"
                      ? []
                      : item.columns && item.columns.length > 0
                        ? item.columns
                        : item.children && item.children.length > 0
                          ? [
                              {
                                id: `${item.id}-mob-col`,
                                title: item.name,
                                links: item.children,
                              },
                            ]
                          : [];
                  const hasCols = cols.length > 0;
                  const columnsHavePromo = cols.some((c) => Boolean(c.promoCard));
                  const hasDirectPromo =
                    Boolean(item.promoCard) && !columnsHavePromo;
                  const isDirectLink =
                    item.type === "link" || (!hasCols && !hasDirectPromo);
                  const isExpanded = mobileExpandedIds.has(item.id);

                  if (isDirectLink) {
                    const isExt = Boolean(
                      item.isExternal || item.href?.startsWith("http")
                    );
                    if (isExt) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="group/btn relative flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold uppercase text-foreground hover:text-primary hover:bg-primary/[0.06] transition-all border-b border-slate-100"
                        >
                          <span>{item.name}</span>
                          <ArrowUpRight className="size-3.5 text-slate-400 shrink-0" />
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="group/btn relative flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold uppercase text-foreground hover:text-primary hover:bg-primary/[0.06] transition-all border-b border-slate-100"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col border-b border-slate-100 last:border-none"
                    >
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(item.id)}
                        className={cn(
                          "group/btn relative flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold uppercase text-left transition-all cursor-pointer",
                          isExpanded
                            ? "text-primary bg-primary/[0.04]"
                            : "text-foreground hover:text-primary hover:bg-slate-50"
                        )}
                      >
                        <span className="truncate">{item.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasCols && (
                            <Badge
                              variant="outline"
                              className="text-[9.5px] font-bold px-1.5 py-0 border-slate-200"
                            >
                              {cols.length} {cols.length === 1 ? "item" : "items"}
                            </Badge>
                          )}
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-slate-400 transition-transform duration-300",
                              isExpanded && "rotate-180 text-primary"
                            )}
                          />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.28,
                              ease: [0.25, 0.1, 0.25, 1],
                            }}
                            className="overflow-hidden bg-slate-50/70 rounded-2xl my-1.5 p-2 flex flex-col gap-2.5 border border-slate-200/60"
                          >
                            {hasDirectPromo && item.promoCard && (
                              <MobilePromoCard
                                promo={item.promoCard}
                                onClose={() => setMobileMenuOpen(false)}
                              />
                            )}

                            {cols.map((col) => (
                              <MobileCategoryBranch
                                key={col.id}
                                column={col}
                                onClose={() => setMobileMenuOpen(false)}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {filteredMobileNavItems.length === 0 && (
                  <div className="py-12 text-center text-sm text-slate-400">
                    No items found matching &ldquo;{mobileSearchFilter}&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer inside Mobile Menu */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50/90 flex flex-col gap-2.5 shrink-0">
              <Link
                href={portalHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 inline-flex items-center justify-center gap-2 bg-white hover:bg-primary text-primary hover:text-white border border-primary font-bold text-sm uppercase rounded-xl transition-colors shadow-2xs"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>{portalLabel}</span>
              </Link>

              {showCta && (
                <a
                  href={ctaHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm uppercase rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>{ctaLabel}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Universal Search Modal ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 sm:pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    Search IEEE SMC 2027
                  </h3>
                  <p className="text-xs text-muted-foreground font-normal">
                    Topics, papers, authors, committees, sessions, and guidelines
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tracks, authors, venue, CFP, schedule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchOpen(false);
                    router.push("/#tracks");
                  }
                }}
                className="w-full pl-11 pr-4 py-3 border border-border rounded-full text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-foreground placeholder:text-slate-400"
                autoFocus
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground/80">Quick:</span>
                {[
                  { label: "Systems Science", href: "/#tracks" },
                  { label: "Cybernetics", href: "/#tracks" },
                  { label: "Submissions", href: "/#cfp" },
                ].map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(tag.href);
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-primary hover:text-primary-foreground text-foreground font-medium transition-colors cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  router.push("/#tracks");
                }}
                className="px-5 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-full hover:bg-primary/90 shadow-xs cursor-pointer shrink-0 transition-colors self-end sm:self-auto"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
