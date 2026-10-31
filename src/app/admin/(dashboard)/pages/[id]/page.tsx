"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Save,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Monitor,
  Tablet,
  Smartphone,
  Code2,
  ExternalLink,
  Layers,
  Sliders,
} from "lucide-react";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { WelcomeLetter } from "@/components/sections/WelcomeLetter";
import { NewsList } from "@/components/sections/NewsList";
import { ConferenceVideo } from "@/components/sections/ConferenceVideo";
import { PaperTemplates } from "@/components/sections/PaperTemplates";
import { ContactCards } from "@/components/sections/ContactCards";
import { CfpSubscribe } from "@/components/sections/CfpSubscribe";
import { CallForPapers } from "@/components/sections/CallForPapers";
import { TracksExplorer } from "@/components/sections/TracksExplorer";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { About } from "@/components/sections/About";
import { Committee } from "@/components/sections/Committee";
import { CommitteesSection } from "@/components/sections/CommitteesSection";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { Venue } from "@/components/sections/Venue";
import { FAQ } from "@/components/sections/FAQ";
import { Sponsors } from "@/components/sections/Sponsors";
import { Keynotes } from "@/components/sections/Keynotes";
import { SubmissionCountdown } from "@/components/sections/SubmissionCountdown";
import { ConferenceHighlights } from "@/components/sections/ConferenceHighlights";
import { cn } from "@/lib/utils";

// Registered block types matching HCMUTE page builder registry
const AVAILABLE_BLOCKS = [
  {
    type: "HeroCarousel",
    title: "Hero Carousel",
    category: "Header & Hero",
    description: "Full-width carousel banner with GSAP transitions and countdown indicators",
    defaultProps: {
      autoplayDuration: 7,
      showOverlayText: true,
      showIndicators: true,
    },
  },
  {
    type: "CommitteesSection",
    title: "Committees Carousel",
    category: "Organization",
    description: "Royal blue organizing and technical committees showcase with auto-scrolling carousel",
    defaultProps: {
      title: "Organizing & Technical Committees",
      subtitle: "Distinguished leadership and academic committee chairs driving IEEE SMC 2027",
      badge: "Leadership & Organization",
      autoplayDelay: 3500,
    },
  },
  {
    type: "PaymentMethods",
    title: "Payment Methods",
    category: "Registration",
    description: "Registration fee schedule, domestic VietQR code, SWIFT wire details, and card payment channels",
    defaultProps: {
      title: "Registration & Payment Methods",
      subtitle: "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
      badge: "Registration Guide",
    },
  },
  {
    type: "WelcomeLetter",
    title: "Welcome Letter",
    category: "Overview",
    description: "Official welcome message from the General Chairs and conference theme overview",
    defaultProps: {
      heading: "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
      title: "Welcome Message from the General Chairs",
      salutation: "Dear Colleagues & Honored Participants,",
      theme: "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
    },
  },
  {
    type: "NewsList",
    title: "News & Announcements",
    category: "Content",
    description: "Latest conference announcements, milestone updates, and program notices",
    defaultProps: {
      title: "Conference News & Announcements",
      subtitle: "Stay updated with the latest milestones, partnership alerts, and program schedules",
    },
  },
  {
    type: "ConferenceVideo",
    title: "Video Spotlight",
    category: "Media",
    description: "Promotional YouTube video showcasing Ho Chi Minh City and the conference venue",
    defaultProps: {
      title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
      subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
      videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
      venueName: "Sheraton Saigon Grand Opera Hotel",
    },
  },
  {
    type: "PaperTemplates",
    title: "Author Submission Templates",
    category: "Submissions",
    description: "Official IEEE LaTeX (.zip) and Microsoft Word (.docx) manuscript templates and guidelines",
    defaultProps: {
      title: "Author Submission Templates & Guidelines",
      subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
    },
  },
  {
    type: "ContactCards",
    title: "Contact & Secretariat Cards",
    category: "Contact",
    description: "Secretariat email, venue address, website cards, and quick inquiry form",
    defaultProps: {
      title: "Contact the Organizing Secretariat",
      subtitle: "Have questions regarding paper submissions, proposals, or travel visas? We are here to assist you.",
      email: "ieeesmc2027@hcmute.edu.vn",
      location: "Ho Chi Minh City, Vietnam",
      venue: "Sheraton Saigon Grand Opera Hotel",
      website: "https://ieee-smc2027.org",
    },
  },
  {
    type: "CfpSubscribe",
    title: "Newsletter Subscription",
    category: "Contact",
    description: "Email subscription form for Call for Papers deadlines and conference alerts",
    defaultProps: {},
  },
  {
    type: "SubmissionCountdown",
    title: "Submission Countdown",
    category: "Header & Hero",
    description: "Live countdown timer to the Paper Submission deadline on April 08, 2027",
    defaultProps: {},
  },
  {
    type: "ConferenceHighlights",
    title: "Conference Highlights",
    category: "Content",
    description: "Key metrics featuring 68 research topics, 3 pillars, Scopus, and IEEE Xplore indexing",
    defaultProps: {},
  },
  {
    type: "CallForPapers",
    title: "Call for Papers",
    category: "Content",
    description: "CFP overview with downloadable brochure, author guidelines, and submission policies",
    defaultProps: {},
  },
  {
    type: "TracksExplorer",
    title: "Research Tracks Explorer",
    category: "Content",
    description: "Interactive explorer for Systems Science, Cybernetics, and Human-Machine Systems",
    defaultProps: {},
  },
  {
    type: "ImportantDates",
    title: "Important Dates Timeline",
    category: "Content",
    description: "9-stage conference milestone timeline with calendar export",
    defaultProps: {},
  },
  {
    type: "About",
    title: "About Conference & IEEE SMC",
    category: "Content",
    description: "Overview of HCMUTE and the IEEE Systems, Man, and Cybernetics Society",
    defaultProps: {},
  },
  {
    type: "Committee",
    title: "Organizing Committee List",
    category: "Organization",
    description: "Structured list of General Chairs, Program Chairs, and international committee members",
    defaultProps: {},
  },
  {
    type: "Venue",
    title: "Venue & Hospitality",
    category: "Venue",
    description: "Sheraton Saigon Grand Opera Hotel details and travel guide",
    defaultProps: {},
  },
  {
    type: "FAQ",
    title: "Frequently Asked Questions",
    category: "Support",
    description: "Accordion answering common questions on visas, registration, and paper submissions",
    defaultProps: {},
  },
  {
    type: "Keynotes",
    title: "Keynote Speakers",
    category: "Content",
    description: "Plenary and keynote speaker spotlight section",
    defaultProps: {},
  },
  {
    type: "Sponsors",
    title: "Sponsors & Institutional Partners",
    category: "Partners",
    description: "Logo grid of organizing institutions, technical sponsors, and partners",
    defaultProps: {},
  },
  {
    type: "CustomHTML",
    title: "Custom HTML Embed",
    category: "Advanced",
    description: "Embed custom HTML markup, iframes, videos, or widgets",
    defaultProps: {
      content: "<div class='p-8 text-center bg-slate-100 rounded-lg'><h4>Custom HTML Block</h4><p>Edit the HTML code in the properties panel on the right.</p></div>",
    },
  },
];

function generateBlockId(type: string): string {
  return `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface PageBlockItem {
  id: string;
  type: string;
  props: Record<string, unknown>;
  hidden?: boolean;
}

interface WebsitePageRecord {
  id: number | string;
  slug: string;
  title: string;
  blocks: PageBlockItem[];
  is_published: boolean;
  updated_at: string;
}

/**
 * Sortable Block Item matching HCMUTE website frontend page builder mechanics 1-to-1
 */
function SortableBlockWrapper({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleHide,
  onRemove,
  children,
}: {
  block: PageBlockItem;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleHide: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : isSelected ? 30 : 1,
  };

  const blockMeta = AVAILABLE_BLOCKS.find((b) => b.type === block.type);
  const blockTitle = blockMeta?.title || block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "relative group bg-white rounded-xl transition-all duration-150 select-none",
        isSelected
          ? "ring-2 ring-[#115eff] shadow-xl"
          : "border border-slate-200/80 hover:border-blue-300 shadow-xs",
        isDragging && "ring-2 ring-blue-400 shadow-2xl scale-[1.01]"
      )}
    >
      {/* ── Top Floating Action Pill (HCMUTE Page Builder Mechanism) ── */}
      <div
        className={cn(
          "absolute top-2 left-2 z-40 flex items-center gap-1.5 h-8 bg-[#115eff] text-white rounded-lg px-2.5 py-1 shadow-md shadow-blue-600/30 border border-blue-400/80 transition-all duration-150",
          isSelected || isDragging ? "opacity-100 scale-100" : "opacity-90 group-hover:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle with Grip Icon */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1.5 px-1 py-0.5 text-white font-bold cursor-grab active:cursor-grabbing select-none shrink-0"
          title="Drag to reorder block"
        >
          <GripVertical className="w-3.5 h-3.5 text-blue-100" />
          <span className="w-4 h-4 rounded bg-white text-[#115eff] text-[10px] font-extrabold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold tracking-tight max-w-[170px] truncate leading-none text-white">
            {blockTitle}
          </span>
        </div>

        {block.hidden && (
          <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded leading-none">
            Hidden
          </span>
        )}

        <div className="h-3.5 w-px bg-blue-400/80 mx-0.5 shrink-0" />

        {/* Move Up */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="w-6 h-6 flex items-center justify-center rounded text-white hover:bg-blue-700 disabled:opacity-30 transition-colors cursor-pointer shrink-0"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        {/* Move Down */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalBlocks - 1}
          className="w-6 h-6 flex items-center justify-center rounded text-white hover:bg-blue-700 disabled:opacity-30 transition-colors cursor-pointer shrink-0"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="w-6 h-6 flex items-center justify-center rounded text-white hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
          title="Duplicate block"
        >
          <Copy className="w-3 h-3" />
        </button>

        {/* Visibility */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleHide();
          }}
          className="w-6 h-6 flex items-center justify-center rounded text-white hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
          title={block.hidden ? "Show block" : "Hide block"}
        >
          {block.hidden ? (
            <EyeOff className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-6 h-6 flex items-center justify-center rounded text-rose-200 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer shrink-0"
          title="Delete block"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render Component Preview */}
      <div className={cn("overflow-hidden rounded-xl", block.hidden && "opacity-60")}>
        {children}
      </div>
    </div>
  );
}

export default function PageBuilderRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [page, setPage] = useState<WebsitePageRecord | null>(null);
  const [blocks, setBlocks] = useState<PageBlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [paletteSearch, setPaletteSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.page) {
          setPage(res.page);
          const initialBlocks = Array.isArray(res.page.blocks) ? res.page.blocks : [];
          setBlocks(initialBlocks);
          if (initialBlocks.length > 0) {
            setSelectedBlockId(initialBlocks[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(items, oldIndex, newIndex);
      }
      return items;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert("Failed to save page to database");
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const meta = AVAILABLE_BLOCKS.find((b) => b.type === type);
    const newBlock: PageBlockItem = {
      id: generateBlockId(type),
      type,
      props: meta?.defaultProps ? { ...meta.defaultProps } : {},
      hidden: false,
    };
    const next = [...blocks, newBlock];
    setBlocks(next);
    setSelectedBlockId(newBlock.id);
  };

  const duplicateBlock = (index: number) => {
    const target = blocks[index];
    const duplicated: PageBlockItem = {
      ...target,
      id: generateBlockId(target.type),
      props: JSON.parse(JSON.stringify(target.props || {})),
    };
    const next = [...blocks];
    next.splice(index + 1, 0, duplicated);
    setBlocks(next);
    setSelectedBlockId(duplicated.id);
  };

  const removeBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    setBlocks(next);
    if (selectedBlockId === blocks[index]?.id) {
      setSelectedBlockId(next[0]?.id || null);
    }
  };

  const toggleHideBlock = (index: number) => {
    const next = [...blocks];
    next[index] = { ...next[index], hidden: !next[index].hidden };
    setBlocks(next);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((items) => arrayMove(items, index, target));
  };

  const updateBlockProps = (blockId: string, newProps: Record<string, unknown>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, props: newProps } : b))
    );
  };

  const openJsonEditor = () => {
    setRawJsonText(JSON.stringify(blocks, null, 2));
    setJsonError(null);
    setJsonModalOpen(true);
  };

  const applyJsonData = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("Page JSON schema must be an array [] of component blocks");
      }
      setBlocks(parsed);
      setJsonModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid JSON syntax";
      setJsonError(message);
    }
  };

  const renderBlockPreview = (block: PageBlockItem) => {
    if (block.hidden) {
      return (
        <div className="p-12 text-center bg-slate-100/70 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-semibold">
          Block [{block.type}] is currently hidden on the live page
        </div>
      );
    }

    switch (block.type) {
      case "HeroCarousel":
        return <HeroCarousel {...block.props} />;
      case "CommitteesSection":
        return <CommitteesSection {...block.props} />;
      case "PaymentMethods":
        return <PaymentMethods {...block.props} />;
      case "WelcomeLetter":
        return <WelcomeLetter {...block.props} />;
      case "NewsList":
        return <NewsList {...block.props} />;
      case "ConferenceVideo":
        return <ConferenceVideo {...block.props} />;
      case "PaperTemplates":
        return <PaperTemplates {...block.props} />;
      case "ContactCards":
        return <ContactCards {...block.props} />;
      case "CfpSubscribe":
        return <CfpSubscribe />;
      case "SubmissionCountdown":
        return <SubmissionCountdown />;
      case "ConferenceHighlights":
        return <ConferenceHighlights />;
      case "CallForPapers":
        return <CallForPapers />;
      case "TracksExplorer":
        return <TracksExplorer />;
      case "ImportantDates":
        return <ImportantDates />;
      case "About":
        return <About />;
      case "Committee":
        return <Committee />;
      case "Venue":
        return <Venue />;
      case "FAQ":
        return <FAQ />;
      case "Keynotes":
        return <Keynotes />;
      case "Sponsors":
        return <Sponsors />;
      case "CustomHTML":
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: (block.props?.content as string) || "<p>Empty content</p>",
            }}
          />
        );
      default:
        return (
          <div className="p-8 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            Undefined block type: {block.type}
          </div>
        );
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockIndex = blocks.findIndex((b) => b.id === selectedBlockId);

  const filteredPalette = AVAILABLE_BLOCKS.filter(
    (b) =>
      b.title.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      b.type.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#115eff]" />
        <span>Loading drag-and-drop page builder canvas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 font-sans">
      {/* Top Toolbar Header */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: Back & Page title */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Back to pages list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#004776] text-sm">
              {page?.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#115eff] font-mono font-semibold">
              /{page?.slug === "home" ? "" : page?.slug}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={cn(
              "p-1.5 rounded transition-all cursor-pointer",
              viewport === "desktop"
                ? "bg-white text-[#115eff] shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Desktop Viewport (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={cn(
              "p-1.5 rounded transition-all cursor-pointer",
              viewport === "tablet"
                ? "bg-white text-[#115eff] shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Tablet Viewport (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={cn(
              "p-1.5 rounded transition-all cursor-pointer",
              viewport === "mobile"
                ? "bg-white text-[#115eff] shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Mobile Viewport (390px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right: JSON Inspector & Save */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openJsonEditor}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="View or edit raw page JSON"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            <span>Page JSON</span>
          </button>

          <Link
            href={page?.slug === "home" ? "/" : `/${page?.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <span>Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-md shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Page"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Palette (Left), Canvas (Center), Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-125px)]">
        {/* Left Column: Component Palette */}
        <div className="lg:col-span-3 bg-white border-r border-slate-200 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-125px)]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#004776]">
              <Layers className="w-4 h-4 text-[#115eff]" />
              <span>Component Library</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Click &ldquo;+ Add Block&rdquo; to insert into the page
            </p>
          </div>

          {/* Search Palette */}
          <div>
            <input
              type="text"
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              placeholder="Search blocks (Committees, Payment, FAQ...)"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-[#115eff]"
            />
          </div>

          {/* Blocks List */}
          <div className="space-y-2.5">
            {filteredPalette.map((b) => (
              <div
                key={b.type}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#115eff] transition-colors">
                      {b.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      {b.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                    {b.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addBlock(b.type)}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-white hover:bg-[#115eff] text-slate-700 hover:text-white border border-slate-200 hover:border-[#115eff] text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Live Drag-and-Drop Canvas with Dot-Matrix Pattern */}
        <div className="lg:col-span-6 bg-[#edf2f7] bg-[radial-gradient(#94a3b8_1.25px,transparent_1.25px)] [background-size:24px_24px] p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-125px)] flex flex-col items-center">
          <div
            className={cn(
              "w-full transition-all duration-300 space-y-6",
              viewport === "desktop" && "max-w-full",
              viewport === "tablet" && "max-w-[768px] shadow-2xl rounded-2xl overflow-hidden bg-white",
              viewport === "mobile" && "max-w-[390px] shadow-2xl rounded-3xl overflow-hidden bg-white border-8 border-slate-800"
            )}
          >
            {blocks.length === 0 ? (
              <div className="p-16 text-center bg-white border-2 border-dashed border-slate-300 rounded-2xl space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">No blocks on this page</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select blocks from the left panel (e.g., Hero Carousel, Committees, Payment Methods, Timeline) to start building.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6 w-full">
                    {blocks.map((block, index) => {
                      const isSelected = block.id === selectedBlockId;

                      return (
                        <SortableBlockWrapper
                          key={block.id}
                          block={block}
                          index={index}
                          totalBlocks={blocks.length}
                          isSelected={isSelected}
                          onSelect={() => setSelectedBlockId(block.id)}
                          onMoveUp={() => moveBlock(index, "up")}
                          onMoveDown={() => moveBlock(index, "down")}
                          onDuplicate={() => duplicateBlock(index)}
                          onToggleHide={() => toggleHideBlock(index)}
                          onRemove={() => removeBlock(index)}
                        >
                          {renderBlockPreview(block)}
                        </SortableBlockWrapper>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Right Column: Properties Inspector */}
        <div className="lg:col-span-3 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-125px)]">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#004776]">
              <Sliders className="w-4 h-4 text-[#115eff]" />
              <span>Properties Inspector</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Configure parameters for the selected block
            </p>
          </div>

          {selectedBlock ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Selected Block
                </span>
                <div className="font-extrabold text-[#004776] text-sm">
                  {AVAILABLE_BLOCKS.find((b) => b.type === selectedBlock.type)?.title || selectedBlock.type}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  ID: {selectedBlock.id}
                </div>
              </div>

              {/* General Visibility Toggle */}
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Block Visible</span>
                <input
                  type="checkbox"
                  checked={!selectedBlock.hidden}
                  onChange={() => toggleHideBlock(selectedBlockIndex)}
                  className="rounded text-[#115eff] focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* CommitteesSection Inspector */}
              {selectedBlock.type === "CommitteesSection" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Committees Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Badge</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.badge ?? "Leadership & Organization")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          badge: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Organizing & Technical Committees")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Subtitle</label>
                    <textarea
                      rows={2}
                      value={String(selectedBlock.props?.subtitle ?? "Distinguished leadership and academic committee chairs driving IEEE SMC 2027")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Autoplay Delay (ms)</label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={Number(selectedBlock.props?.autoplayDelay ?? 3500)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          autoplayDelay: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* PaymentMethods Inspector */}
              {selectedBlock.type === "PaymentMethods" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Payment Methods Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Badge</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.badge ?? "Registration Guide")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          badge: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Registration & Payment Methods")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Subtitle</label>
                    <textarea
                      rows={2}
                      value={String(selectedBlock.props?.subtitle ?? "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* HeroCarousel Inspector */}
              {selectedBlock.type === "HeroCarousel" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Hero Carousel Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Autoplay Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={30}
                      value={Number(selectedBlock.props?.autoplayDuration ?? 7)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          autoplayDuration: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <label className="text-slate-600 text-xs">
                      Show Overlay Text
                    </label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedBlock.props?.showOverlayText ?? true)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          showOverlayText: e.target.checked,
                        })
                      }
                      className="rounded text-[#115eff] focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* CustomHTML Inspector */}
              {selectedBlock.type === "CustomHTML" && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    HTML / Embed Code
                  </span>
                  <textarea
                    rows={8}
                    value={String(selectedBlock.props?.content ?? "")}
                    onChange={(e) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        content: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 font-mono text-[11px] bg-white border border-slate-300 rounded focus:outline-none focus:border-[#115eff]"
                    placeholder="<div>Enter HTML here...</div>"
                  />
                </div>
              )}

              {/* WelcomeLetter Inspector */}
              {selectedBlock.type === "WelcomeLetter" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Welcome Letter Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Headline</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.heading ?? "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          heading: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Welcome Message from the General Chairs")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* ContactCards Inspector */}
              {selectedBlock.type === "ContactCards" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Contact Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Contact Email</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.email ?? "ieeesmc2027@hcmute.edu.vn")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.location ?? "Ho Chi Minh City, Vietnam")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Website</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.website ?? "https://ieee-smc2027.org")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          website: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* Block Raw JSON Props Inspector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Block Props JSON
                </span>
                <textarea
                  rows={8}
                  value={JSON.stringify(selectedBlock.props || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateBlockProps(selectedBlock.id, parsed);
                    } catch {
                      // allow typing
                    }
                  }}
                  className="w-full px-2.5 py-2 font-mono text-[11px] bg-slate-900 text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => duplicateBlock(selectedBlockIndex)}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate Block</span>
                </button>

                <button
                  type="button"
                  onClick={() => removeBlock(selectedBlockIndex)}
                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Block</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a block on the canvas to view and edit its properties.
            </div>
          )}
        </div>
      </div>

      {/* Raw Page JSON Editor Modal */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#115eff]" />
                <h3 className="text-base font-bold text-slate-900">
                  Full Page JSON Schema
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Copy, edit, or paste the JSON array of component blocks for this page:
            </p>

            {jsonError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md">
                {jsonError}
              </div>
            )}

            <textarea
              rows={16}
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(rawJsonText);
                  alert("Copied JSON to clipboard!");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
              >
                Copy JSON
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJsonModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyJsonData}
                  className="px-5 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold rounded-md transition-colors shadow-2xs"
                >
                  Apply JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
