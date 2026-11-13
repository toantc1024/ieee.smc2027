"use client";

import React, { useState } from "react";
import type { ComponentDefinition } from "../types";
import {
  Type,
  Image as ImageIcon,
  Table2,
  AlertCircle,
  BarChart2,
  LayoutGrid,
  Columns2,
  MousePointerClick,
  HelpCircle,
  CalendarClock,
  Minus,
  Code2,
  Search,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. RichTextBlock (Compact Heading + Rich Paragraph / HTML)
 * ───────────────────────────────────────────────────────────────────────────── */
function RichTextBlockRender({
  heading = "Section Heading",
  subheading = "",
  content = "Enter your paragraph text or HTML content here. You can use this compact block to add announcements, instructions, or formatted text anywhere on the page.",
  align = "left",
  containerWidth = "medium",
  background = "white",
}: {
  heading?: string;
  subheading?: string;
  content?: string;
  align?: "left" | "center";
  containerWidth?: "narrow" | "medium" | "full";
  background?: "white" | "slate" | "blue";
}) {
  const bgClass =
    background === "slate"
      ? "bg-slate-50 border-y border-slate-200/80"
      : background === "blue"
        ? "bg-blue-50/50 border-y border-blue-100"
        : "bg-white";

  const widthClass =
    containerWidth === "narrow"
      ? "max-w-3xl"
      : containerWidth === "full"
        ? "max-w-[1380px]"
        : "max-w-5xl";

  return (
    <div className={cn("w-full py-8 sm:py-10 px-4 sm:px-8", bgClass)}>
      <div
        className={cn(
          "mx-auto space-y-3",
          widthClass,
          align === "center" ? "text-center" : "text-left"
        )}
      >
        {heading && (
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#004776]">
            {heading}
          </h2>
        )}
        {subheading && (
          <p className="text-base sm:text-lg font-medium text-[#115eff]">
            {subheading}
          </p>
        )}
        {content && (
          <div
            className="text-sm sm:text-base text-slate-700 leading-relaxed prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html: content.includes("<")
                ? content
                : content.replace(/\n/g, "<br />"),
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. ImageBlock (Single Image / Banner with Caption & Sizing)
 * ───────────────────────────────────────────────────────────────────────────── */
function ImageBlockRender({
  imageUrl = "",
  alt = "",
  caption = "",
  aspectRatio = "16:9",
  containerWidth = "medium",
  rounded = true,
  linkUrl = "",
}: {
  imageUrl?: string;
  alt?: string;
  caption?: string;
  aspectRatio?: "auto" | "16:9" | "21:9" | "4:3";
  containerWidth?: "narrow" | "medium" | "full";
  rounded?: boolean;
  linkUrl?: string;
}) {
  const widthClass =
    containerWidth === "narrow"
      ? "max-w-3xl"
      : containerWidth === "full"
        ? "max-w-[1380px]"
        : "max-w-5xl";

  const aspectClass =
    aspectRatio === "16:9"
      ? "aspect-video"
      : aspectRatio === "21:9"
        ? "aspect-[21/9]"
        : aspectRatio === "4:3"
          ? "aspect-[4/3]"
          : "";

  const imageElement = (
    <div
      className={cn(
        "relative w-full overflow-hidden border border-slate-200 bg-slate-100",
        rounded ? "rounded-xl" : "rounded-none",
        aspectClass
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className={cn("w-full", aspectRatio === "auto" ? "h-auto object-contain" : "h-full object-cover")} />
      ) : <div className="flex min-h-32 items-center justify-center text-sm text-slate-500">Choose an image in the section settings</div>}
    </div>
  );

  return (
    <div className="w-full py-6 sm:py-8 px-4 sm:px-8 bg-white">
      <figure className={cn("mx-auto", widthClass)}>
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
        {caption && (
          <figcaption className="mt-2.5 text-xs sm:text-sm text-slate-500 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 3. DataSheetBlock (Interactive Sheet / Data Table Block)
 * ───────────────────────────────────────────────────────────────────────────── */
function DataSheetBlockRender({
  title = "Data table",
  subtitle = "",
  headers = "Column 1, Column 2, Column 3",
  rowsData = "",
  striped = true,
  searchable = true,
}: {
  title?: string;
  subtitle?: string;
  headers?: string;
  rowsData?: string;
  striped?: boolean;
  searchable?: boolean;
}) {
  const [query, setQuery] = useState("");

  const headerList = (headers || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  const parsedRows = (rowsData || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.includes("|")
        ? line.split("|").map((c) => c.trim())
        : line.split(",").map((c) => c.trim())
    );

  const filteredRows = parsedRows.filter((row) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return row.some((cell) => cell.toLowerCase().includes(q));
  });

  return (
    <div className="w-full py-8 sm:py-10 px-4 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
          {searchable && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter rows..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff]"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left border-collapse text-sm">
            {headerList.length > 0 && (
              <thead>
                <tr className="bg-[#004776] text-white">
                  {headerList.map((col, idx) => (
                    <th
                      key={idx}
                      className="py-3 px-4 font-semibold text-xs sm:text-sm border-r border-white/15 last:border-r-0"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(headerList.length, 1)}
                    className="py-6 text-center text-slate-400 text-xs"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={cn(
                      "transition-colors hover:bg-blue-50/40",
                      striped && rIdx % 2 === 1 ? "bg-slate-50/70" : "bg-white"
                    )}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={cn(
                          "py-3 px-4 border-r border-slate-100 last:border-r-0 text-slate-700",
                          cIdx === 0 && "font-semibold text-slate-900"
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 4. CalloutBlock (Compact Notice / Alert Box)
 * ───────────────────────────────────────────────────────────────────────────── */
function CalloutBlockRender({
  variant = "info",
  title = "Important notice",
  message = "",
  buttonText = "",
  buttonUrl = "",
}: {
  variant?: "info" | "warning" | "success" | "urgent";
  title?: string;
  message?: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  const styles = {
    info: {
      box: "bg-blue-50/70 border-blue-200 text-slate-800",
      iconWrap: "bg-[#115eff] text-white",
      title: "text-[#004776]",
      btn: "bg-[#115eff] hover:bg-[#0a4de6] text-white",
      Icon: Info,
    },
    warning: {
      box: "bg-amber-50/80 border-amber-200 text-slate-800",
      iconWrap: "bg-amber-500 text-white",
      title: "text-amber-900",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
      Icon: AlertTriangle,
    },
    success: {
      box: "bg-emerald-50/80 border-emerald-200 text-slate-800",
      iconWrap: "bg-emerald-600 text-white",
      title: "text-emerald-900",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      Icon: CheckCircle2,
    },
    urgent: {
      box: "bg-rose-50/80 border-rose-200 text-slate-800",
      iconWrap: "bg-rose-600 text-white",
      title: "text-rose-900",
      btn: "bg-rose-600 hover:bg-rose-700 text-white",
      Icon: AlertCircle,
    },
  }[variant || "info"];

  const IconComp = styles.Icon;

  return (
    <div className="w-full py-6 px-4 sm:px-8 bg-white">
      <div
        className={cn(
          "max-w-5xl mx-auto p-5 sm:p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
          styles.box
        )}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
              styles.iconWrap
            )}
          >
            <IconComp className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            {title && (
              <h4 className={cn("text-base sm:text-lg font-bold", styles.title)}>
                {title}
              </h4>
            )}
            {message && (
              <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
            )}
          </div>
        </div>

        {buttonText && (
          <a
            href={buttonUrl || "#"}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shrink-0 transition-colors",
              styles.btn
            )}
          >
            <span>{buttonText}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 5. StatsRowBlock (Compact 2-4 Column Statistics Counter)
 * ───────────────────────────────────────────────────────────────────────────── */
function StatsRowBlockRender({
  title = "",
  columns = "4",
  items = [],
}: {
  title?: string;
  columns?: "2" | "3" | "4";
  items?: Array<{ value: string; label: string; description?: string }>;
}) {
  const gridCols =
    columns === "2"
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === "3"
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="w-full py-8 px-4 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto space-y-4">
        {title && (
          <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
            {title}
          </h3>
        )}
        <div className={cn("grid gap-4", gridCols)}>
          {(items || []).map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#115eff] transition-colors"
            >
              <div className="text-2xl sm:text-3xl font-black text-[#115eff]">
                {item.value}
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {item.label}
              </div>
              {item.description && (
                <div className="text-xs text-slate-500 mt-1">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 6. CardGridBlock (Modular 2-4 Column Content Cards)
 * ───────────────────────────────────────────────────────────────────────────── */
function CardGridBlockRender({
  title = "Key Information Cards",
  subtitle = "",
  columns = "3",
  cards = [
    {
      title: "Systems Science & Engineering",
      description: "Control systems, model-based systems engineering, smart grids, and cyber-physical infrastructure.",
      linkText: "Explore Track",
      linkUrl: "/submissions",
    },
    {
      title: "Human-Machine Systems",
      description: "Human-AI interaction, cognitive ergonomics, brain-computer interfaces, and wearable robotics.",
      linkText: "Explore Track",
      linkUrl: "/submissions",
    },
    {
      title: "Cybernetics & AI",
      description: "Deep learning, autonomous agents, pattern recognition, and computational intelligence.",
      linkText: "Explore Track",
      linkUrl: "/submissions",
    },
  ],
}: {
  title?: string;
  subtitle?: string;
  columns?: "2" | "3" | "4";
  cards?: Array<{
    title: string;
    description: string;
    linkText?: string;
    linkUrl?: string;
  }>;
}) {
  const gridCols =
    columns === "2"
      ? "grid-cols-1 md:grid-cols-2"
      : columns === "4"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <div className="w-full py-8 sm:py-10 px-4 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto space-y-5">
        {(title || subtitle) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-600">{subtitle}</p>
            )}
          </div>
        )}
        <div className={cn("grid gap-5", gridCols)}>
          {(cards || []).map((card, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 hover:border-[#115eff] shadow-2xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  {card.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
              {card.linkText && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <a
                    href={card.linkUrl || "#"}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#115eff] hover:underline"
                  >
                    <span>{card.linkText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 7. TwoColumnBlock (Split Content + Image)
 * ───────────────────────────────────────────────────────────────────────────── */
function TwoColumnBlockRender({
  title = "Host Institution: HCMUTE",
  content = "Ho Chi Minh City University of Technology and Education is a premier public university in Vietnam specializing in engineering, robotics, cybernetics, and applied technology.",
  imageUrl = "/hero/slide-1-hcmc.jpg",
  imagePosition = "right",
  buttonText = "Learn More",
  buttonUrl = "/travel",
}: {
  title?: string;
  content?: string;
  imageUrl?: string;
  imagePosition?: "left" | "right";
  buttonText?: string;
  buttonUrl?: string;
}) {
  return (
    <div className="w-full py-8 sm:py-10 px-4 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        <div
          className={cn(
            "lg:col-span-6 space-y-4",
            imagePosition === "left" ? "lg:order-2" : "lg:order-1"
          )}
        >
          {title && (
            <h3 className="text-2xl sm:text-3xl font-bold text-[#004776] tracking-tight">
              {title}
            </h3>
          )}
          {content && (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {content}
            </p>
          )}
          {buttonText && (
            <div className="pt-1">
              <a
                href={buttonUrl || "#"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm font-bold transition-colors"
              >
                <span>{buttonText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        <div
          className={cn(
            "lg:col-span-6",
            imagePosition === "left" ? "lg:order-1" : "lg:order-2"
          )}
        >
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || "/hero/slide-1-hcmc.jpg"}
              alt={title || "Feature"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 8. ButtonsBlock (Standalone CTA Button Bar)
 * ───────────────────────────────────────────────────────────────────────────── */
function ButtonsBlockRender({
  primaryLabel = "Register Now",
  primaryUrl = "/registration",
  secondaryLabel = "Download Call for Papers",
  secondaryUrl = "/CFP - IEEE SMC 2027.pdf",
  align = "left",
}: {
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  align?: "left" | "center" | "right";
}) {
  const justifyClass =
    align === "center"
      ? "justify-center"
      : align === "right"
        ? "justify-end"
        : "justify-start";

  return (
    <div className="w-full py-5 px-4 sm:px-8 bg-white">
      <div className={cn("max-w-5xl mx-auto flex flex-wrap items-center gap-3", justifyClass)}>
        {primaryLabel && (
          <a
            href={primaryUrl || "#"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm font-bold transition-colors"
          >
            <span>{primaryLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
        {secondaryLabel && (
          <a
            href={secondaryUrl || "#"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-[#115eff] text-sm font-bold transition-colors"
          >
            <span>{secondaryLabel}</span>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 9. CompactFaqBlock (Customizable Q&A Accordion Block)
 * ───────────────────────────────────────────────────────────────────────────── */
function CompactFaqBlockRender({
  title = "Frequently Asked Questions",
  subtitle = "",
  items = [
    {
      question: "How do I submit my manuscript to IEEE SMC 2027?",
      answer: "All manuscripts must be submitted electronically through the official PaperCept portal in standard IEEE two-column PDF format.",
    },
    {
      question: "Is at least one full author registration required per paper?",
      answer: "Yes. Each accepted paper requires at least one full author registration by the camera-ready deadline to be included in IEEE Xplore.",
    },
  ],
}: {
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="w-full py-8 px-4 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto space-y-4">
        {(title || subtitle) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
        )}
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {(items || []).map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#115eff] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 10. CompactTimelineBlock (Customizable Milestone / Date List)
 * ───────────────────────────────────────────────────────────────────────────── */
function CompactTimelineBlockRender({
  title = "Key Dates & Milestones",
  subtitle = "",
  items = [
    { date: "February 15, 2027", title: "Special Session & Workshop Proposals" },
    { date: "April 08, 2027", title: "Regular & Special Session Paper Submission" },
    { date: "May 30, 2027", title: "Author Acceptance Notification" },
    { date: "July 15, 2027", title: "Camera-Ready Final Upload" },
  ],
}: {
  title?: string;
  subtitle?: string;
  items?: Array<{ date: string; title: string }>;
}) {
  return (
    <div className="w-full py-8 px-4 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto space-y-4">
        {(title || subtitle) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
        )}
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
          {(items || []).map((item, idx) => (
            <div
              key={idx}
              className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm sm:text-base font-semibold text-slate-900">
                {item.title}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-[#115eff] font-bold text-xs sm:text-sm shrink-0">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 11. DividerSpacerBlock (Vertical Spacer & Optional Divider Line)
 * ───────────────────────────────────────────────────────────────────────────── */
function DividerSpacerBlockRender({
  height = 40,
  showLine = true,
  lineStyle = "solid",
}: {
  height?: number;
  showLine?: boolean;
  lineStyle?: "solid" | "dashed" | "dotted";
}) {
  return (
    <div
      style={{ height: `${Math.max(12, Math.min(200, Number(height) || 40))}px` }}
      className="w-full flex items-center justify-center px-4 sm:px-8 bg-white"
    >
      {showLine && (
        <hr
          className={cn(
            "w-full max-w-5xl border-t border-slate-200",
            lineStyle === "dashed" && "border-dashed",
            lineStyle === "dotted" && "border-dotted"
          )}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 12. CustomHTML (Raw HTML / Embed Block)
 * ───────────────────────────────────────────────────────────────────────────── */
function CustomHTMLRender({
  content = '<div class="max-w-5xl mx-auto py-6 px-4 text-slate-700">Custom HTML block</div>',
}: {
  content?: string;
}) {
  return (
    <div
      className="w-full"
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Export Modular Block Definitions
 * ───────────────────────────────────────────────────────────────────────────── */
export const MODULAR_BLOCK_DEFINITIONS: Record<string, ComponentDefinition> = {
  RichTextBlock: {
    type: "RichTextBlock",
    label: "Text & Heading",
    category: "basic",
    icon: Type,
    description: "Compact heading and formatted text paragraph block.",
    fields: {
      heading: { type: "text", label: "Heading" },
      subheading: { type: "text", label: "Subheading" },
      content: { type: "richtext", label: "Content", description: "Format your text with the toolbar below." },
      align: {
        type: "select",
        label: "Text Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      },
      containerWidth: {
        type: "select",
        label: "Width",
        options: [
          { label: "Narrow", value: "narrow" },
          { label: "Standard", value: "medium" },
          { label: "Full Width", value: "full" },
        ],
      },
      background: {
        type: "select",
        label: "Background",
        options: [
          { label: "White", value: "white" },
          { label: "Light Gray", value: "slate" },
          { label: "Soft Blue", value: "blue" },
        ],
      },
    },
    defaultProps: {
      heading: "Section Heading",
      subheading: "",
      content:
        "Enter your paragraph text or HTML content here. Use this compact block to add announcements, instructions, or formatted text anywhere on the page.",
      align: "left",
      containerWidth: "medium",
      background: "white",
    },
    render: (props) => <RichTextBlockRender {...props} />,
  },

  ImageBlock: {
    type: "ImageBlock",
    label: "Image & Banner",
    category: "basic",
    icon: ImageIcon,
    description: "Standalone image or banner with caption, aspect ratio, and link.",
    fields: {
      imageUrl: { type: "image", label: "Image URL" },
      alt: { type: "text", label: "Alt Text" },
      caption: { type: "text", label: "Caption" },
      aspectRatio: {
        type: "select",
        label: "Aspect Ratio",
        options: [
          { label: "16:9 Widescreen", value: "16:9" },
          { label: "21:9 Ultra Banner", value: "21:9" },
          { label: "4:3 Standard", value: "4:3" },
          { label: "Original Auto", value: "auto" },
        ],
      },
      containerWidth: {
        type: "select",
        label: "Width",
        options: [
          { label: "Narrow", value: "narrow" },
          { label: "Standard", value: "medium" },
          { label: "Full Width", value: "full" },
        ],
      },
      rounded: { type: "switch", label: "Rounded Corners" },
      linkUrl: { type: "text", label: "Click Link URL" },
    },
    defaultProps: {
      imageUrl: "",
      alt: "",
      caption: "",
      aspectRatio: "16:9",
      containerWidth: "medium",
      rounded: true,
      linkUrl: "",
    },
    render: (props) => <ImageBlockRender {...props} />,
  },

  DataSheetBlock: {
    type: "DataSheetBlock",
    label: "Sheet / Data Table",
    category: "basic",
    icon: Table2,
    description: "Interactive spreadsheet / data table block with search filter and customizable rows.",
    fields: {
      title: { type: "text", label: "Table Title" },
      subtitle: { type: "text", label: "Subtitle" },
      headers: {
        type: "text",
        label: "Columns (comma-separated)",
        placeholder: "Category, Early Bird, Regular, On-Site",
      },
      rowsData: {
        type: "textarea",
        label: "Rows (one row per line, comma or | separated)",
      },
      striped: { type: "switch", label: "Alternating Striped Rows" },
      searchable: { type: "switch", label: "Show Search Filter" },
    },
    defaultProps: {
      title: "Data table",
      subtitle: "",
      headers: "Column 1, Column 2, Column 3",
      rowsData: "",
      striped: true,
      searchable: true,
    },
    render: (props) => <DataSheetBlockRender {...props} />,
  },

  CalloutBlock: {
    type: "CalloutBlock",
    label: "Callout / Notice Box",
    category: "basic",
    icon: AlertCircle,
    description: "Compact alert or callout box for deadlines, policies, and important notices.",
    fields: {
      variant: {
        type: "select",
        label: "Notice Style",
        options: [
          { label: "Info (Blue)", value: "info" },
          { label: "Warning (Amber)", value: "warning" },
          { label: "Success (Emerald)", value: "success" },
          { label: "Urgent (Rose)", value: "urgent" },
        ],
      },
      title: { type: "text", label: "Notice Title" },
      message: { type: "textarea", label: "Message" },
      buttonText: { type: "text", label: "Action Button Label" },
      buttonUrl: { type: "text", label: "Action Button URL" },
    },
    defaultProps: {
      variant: "info",
      title: "Important notice",
      message: "",
      buttonText: "",
      buttonUrl: "",
    },
    render: (props) => <CalloutBlockRender {...props} />,
  },

  TwoColumnBlock: {
    type: "TwoColumnBlock",
    label: "Two-Column Split",
    category: "basic",
    icon: Columns2,
    description: "Side-by-side text and image split block.",
    fields: {
      title: { type: "text", label: "Heading" },
      content: { type: "textarea", label: "Body Text" },
      imageUrl: { type: "image", label: "Image URL" },
      imagePosition: {
        type: "select",
        label: "Image Position",
        options: [
          { label: "Right", value: "right" },
          { label: "Left", value: "left" },
        ],
      },
      buttonText: { type: "text", label: "Button Label" },
      buttonUrl: { type: "text", label: "Button URL" },
    },
    defaultProps: {
      title: "Host Institution: HCMUTE",
      content:
        "Ho Chi Minh City University of Technology and Education is a premier public university in Vietnam specializing in engineering, robotics, cybernetics, and applied technology.",
      imageUrl: "/hero/slide-1-hcmc.jpg",
      imagePosition: "right",
      buttonText: "Learn More",
      buttonUrl: "/travel",
    },
    render: (props) => <TwoColumnBlockRender {...props} />,
  },

  CardGridBlock: {
    type: "CardGridBlock",
    label: "Content Cards Grid",
    category: "basic",
    icon: LayoutGrid,
    description: "2, 3, or 4 column modular cards with title, description, and link.",
    fields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "text", label: "Subtitle" },
      columns: {
        type: "select",
        label: "Columns",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
      },
      cards: {
        type: "array",
        label: "Cards",
        itemFields: {
          title: { type: "text", label: "Card Title" },
          description: { type: "textarea", label: "Description" },
          linkText: { type: "text", label: "Link Text" },
          linkUrl: { type: "text", label: "Link URL" },
        },
        defaultItem: {
          title: "New Card Title",
          description: "Card summary description.",
          linkText: "Read More",
          linkUrl: "#",
        },
      },
    },
    defaultProps: {
      title: "Key Information Cards",
      subtitle: "",
      columns: "3",
      cards: [
        {
          title: "Systems Science & Engineering",
          description:
            "Control systems, model-based systems engineering, smart grids, and cyber-physical infrastructure.",
          linkText: "Explore Track",
          linkUrl: "/submissions",
        },
        {
          title: "Human-Machine Systems",
          description:
            "Human-AI interaction, cognitive ergonomics, brain-computer interfaces, and wearable robotics.",
          linkText: "Explore Track",
          linkUrl: "/submissions",
        },
        {
          title: "Cybernetics & AI",
          description:
            "Deep learning, autonomous agents, pattern recognition, and computational intelligence.",
          linkText: "Explore Track",
          linkUrl: "/submissions",
        },
      ],
    },
    render: (props) => <CardGridBlockRender {...props} />,
  },

  StatsRowBlock: {
    type: "StatsRowBlock",
    label: "Stats Counter Row",
    category: "basic",
    icon: BarChart2,
    description: "Compact row of 2 to 4 key metric counters.",
    fields: {
      title: { type: "text", label: "Optional Heading" },
      columns: {
        type: "select",
        label: "Columns",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
      },
      items: {
        type: "array",
        label: "Stat Items",
        itemFields: {
          value: { type: "text", label: "Number / Value" },
          label: { type: "text", label: "Label" },
          description: { type: "text", label: "Subtext" },
        },
        defaultItem: {
          value: "100+",
          label: "Metric Label",
          description: "Brief note",
        },
      },
    },
    defaultProps: {
      title: "",
      columns: "4",
      items: [],
    },
    render: (props) => <StatsRowBlockRender {...props} />,
  },

  ButtonsBlock: {
    type: "ButtonsBlock",
    label: "Action Buttons Bar",
    category: "basic",
    icon: MousePointerClick,
    description: "Standalone primary and secondary call-to-action buttons.",
    fields: {
      primaryLabel: { type: "text", label: "Primary Button Label" },
      primaryUrl: { type: "text", label: "Primary Button URL" },
      secondaryLabel: { type: "text", label: "Secondary Button Label" },
      secondaryUrl: { type: "text", label: "Secondary Button URL" },
      align: {
        type: "select",
        label: "Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    },
    defaultProps: {
      primaryLabel: "Register Now",
      primaryUrl: "/registration",
      secondaryLabel: "Download Call for Papers",
      secondaryUrl: "/CFP - IEEE SMC 2027.pdf",
      align: "left",
    },
    render: (props) => <ButtonsBlockRender {...props} />,
  },

  CompactFaqBlock: {
    type: "CompactFaqBlock",
    label: "Compact FAQ List",
    category: "basic",
    icon: HelpCircle,
    description: "Customizable Q&A accordion block with editable questions and answers.",
    fields: {
      title: { type: "text", label: "Heading" },
      subtitle: { type: "text", label: "Subtitle" },
      items: {
        type: "array",
        label: "Questions & Answers",
        itemFields: {
          question: { type: "text", label: "Question" },
          answer: { type: "textarea", label: "Answer" },
        },
        defaultItem: {
          question: "New Question?",
          answer: "Enter the answer here.",
        },
      },
    },
    defaultProps: {
      title: "Frequently Asked Questions",
      subtitle: "",
      items: [
        {
          question: "How do I submit my manuscript to IEEE SMC 2027?",
          answer:
            "All manuscripts must be submitted electronically through the official PaperCept portal in standard IEEE two-column PDF format.",
        },
        {
          question: "Is at least one full author registration required per paper?",
          answer:
            "Yes. Each accepted paper requires at least one full author registration by the camera-ready deadline to be included in IEEE Xplore.",
        },
      ],
    },
    render: (props) => <CompactFaqBlockRender {...props} />,
  },

  CompactTimelineBlock: {
    type: "CompactTimelineBlock",
    label: "Milestone Dates List",
    category: "basic",
    icon: CalendarClock,
    description: "Compact customizable list of dates and milestones.",
    fields: {
      title: { type: "text", label: "Heading" },
      subtitle: { type: "text", label: "Subtitle" },
      items: {
        type: "array",
        label: "Milestones",
        itemFields: {
          title: { type: "text", label: "Milestone Name" },
          date: { type: "text", label: "Date / Deadline" },
        },
        defaultItem: {
          title: "New Milestone",
          date: "October 6, 2027",
        },
      },
    },
    defaultProps: {
      title: "Key Dates & Milestones",
      subtitle: "",
      items: [
        { date: "February 15, 2027", title: "Special Session & Workshop Proposals" },
        { date: "April 08, 2027", title: "Regular & Special Session Paper Submission" },
        { date: "May 30, 2027", title: "Author Acceptance Notification" },
        { date: "July 15, 2027", title: "Camera-Ready Final Upload" },
      ],
    },
    render: (props) => <CompactTimelineBlockRender {...props} />,
  },

  DividerSpacerBlock: {
    type: "DividerSpacerBlock",
    label: "Divider & Spacer",
    category: "basic",
    icon: Minus,
    description: "Adjustable vertical space with optional horizontal divider line.",
    fields: {
      height: { type: "number", label: "Height (px)", min: 12, max: 200 },
      showLine: { type: "switch", label: "Show Divider Line" },
      lineStyle: {
        type: "select",
        label: "Line Style",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Dashed", value: "dashed" },
          { label: "Dotted", value: "dotted" },
        ],
      },
    },
    defaultProps: {
      height: 40,
      showLine: true,
      lineStyle: "solid",
    },
    render: (props) => <DividerSpacerBlockRender {...props} />,
  },

  CustomHTML: {
    type: "CustomHTML",
    label: "Custom HTML",
    category: "basic",
    icon: Code2,
    description: "Embed custom HTML markup or external widgets.",
    fields: {
      content: { type: "textarea", label: "HTML Code" },
    },
    defaultProps: {
      content:
        '<div class="max-w-5xl mx-auto py-6 px-4 text-slate-700">Custom HTML block</div>',
    },
    render: (props) => <CustomHTMLRender {...props} />,
  },
};
