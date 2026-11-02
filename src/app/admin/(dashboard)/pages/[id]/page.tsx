"use client";

import React, { useState, useEffect, useRef, use, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Code2,
  ExternalLink,
  Layers,
  LayoutGrid,
  Info,
  Sliders,
  Upload,
  FileEdit,
  Paintbrush,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
      title: "Welcome Message from the General Chairs & Honorary Chairs",
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
    category: "Submissions",
    description: "Live countdown timer to paper submission and camera-ready deadlines",
    defaultProps: {},
  },
  {
    type: "ConferenceHighlights",
    title: "Conference Highlights",
    category: "Overview",
    description: "Key themes, attendee numbers, workshop slots, and keynote count highlights",
    defaultProps: {},
  },
  {
    type: "CallForPapers",
    title: "Call for Papers",
    category: "Submissions",
    description: "Scope, submission instructions, IEEE Xplore indexing info, and proposal guidelines",
    defaultProps: {},
  },
  {
    type: "TracksExplorer",
    title: "Technical Tracks Explorer",
    category: "Submissions",
    description: "Interactive selector for Cybernetics, Systems Science, and Human-Machine Systems",
    defaultProps: {},
  },
  {
    type: "ImportantDates",
    title: "Important Milestone Dates",
    category: "Submissions",
    description: "Timeline card for paper submission, notifications, and camera-ready deadlines",
    defaultProps: {},
  },
  {
    type: "About",
    title: "About HCMUTE & IEEE SMC",
    category: "Overview",
    description: "Host institution overview and IEEE Systems, Man, and Cybernetics Society intro",
    defaultProps: {},
  },
  {
    type: "Committee",
    title: "Key Leadership Chairs",
    category: "Organization",
    description: "General Chairs, Steering Chairs, and Honorary Chairs portrait showcase",
    defaultProps: {},
  },
  {
    type: "Venue",
    title: "Venue & Hotel Information",
    category: "Overview",
    description: "Sheraton Saigon Grand Opera Hotel, address, accommodation, and travel guidance",
    defaultProps: {},
  },
  {
    type: "FAQ",
    title: "Frequently Asked Questions",
    category: "Content",
    description: "Expandable accordion answers for authors, visa applicants, and delegates",
    defaultProps: {},
  },
  {
    type: "Sponsors",
    title: "Sponsors & Academic Partners",
    category: "Organization",
    description: "IEEE SMC Society, HCMUTE, IEEE Vietnam Section, and corporate partner logos",
    defaultProps: {},
  },
  {
    type: "Keynotes",
    title: "Keynote Speakers",
    category: "Content",
    description: "Distinguished keynote addresses, speaker bios, and presentation titles",
    defaultProps: {},
  },
];

const DEFAULT_PAGE_BLOCKS: PageBlockItem[] = [
  {
    id: "block-hero",
    type: "HeroCarousel",
    props: {
      autoplayDuration: 7,
      showOverlayText: true,
      showIndicators: true,
    },
    hidden: false,
  },
  {
    id: "block-welcome",
    type: "WelcomeLetter",
    props: {
      heading: "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
      title: "Welcome Message from the General Chairs & Honorary Chairs",
      salutation: "Dear Colleagues & Honored Participants,",
      theme: "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
      datesLocation: "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
    },
    hidden: false,
  },
  {
    id: "block-news",
    type: "NewsList",
    props: {
      title: "Conference News & Announcements",
      subtitle: "Stay updated with the latest milestones, partnership alerts, and program schedules",
    },
    hidden: false,
  },
  {
    id: "block-countdown",
    type: "SubmissionCountdown",
    props: {},
    hidden: false,
  },
  {
    id: "block-highlights",
    type: "ConferenceHighlights",
    props: {},
    hidden: false,
  },
  {
    id: "block-video",
    type: "ConferenceVideo",
    props: {
      title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
      subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
      videoUrl: "https://www.youtube.com/embed/vTwRHpRNtls",
      venueName: "Sheraton Saigon Grand Opera Hotel",
    },
    hidden: false,
  },
  {
    id: "block-cfp",
    type: "CallForPapers",
    props: {},
    hidden: false,
  },
  {
    id: "block-tracks",
    type: "TracksExplorer",
    props: {},
    hidden: false,
  },
  {
    id: "block-templates",
    type: "PaperTemplates",
    props: {
      title: "Author Submission Templates & Guidelines",
      subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
    },
    hidden: false,
  },
  {
    id: "block-committees",
    type: "CommitteesSection",
    props: {
      title: "Organizing & Technical Committees",
      subtitle: "Distinguished leadership and academic committee chairs driving IEEE SMC 2027",
      badge: "Leadership & Organization",
      autoplayDelay: 3500,
    },
    hidden: false,
  },
  {
    id: "block-keynotes",
    type: "Keynotes",
    props: {},
    hidden: false,
  },
  {
    id: "block-venue",
    type: "Venue",
    props: {},
    hidden: false,
  },
  {
    id: "block-payments",
    type: "PaymentMethods",
    props: {
      title: "Registration & Payment Methods",
      subtitle: "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027",
      badge: "Registration Guide",
    },
    hidden: false,
  },
  {
    id: "block-faq",
    type: "FAQ",
    props: {},
    hidden: false,
  },
  {
    id: "block-sponsors",
    type: "Sponsors",
    props: {},
    hidden: false,
  },
  {
    id: "block-about",
    type: "About",
    props: {},
    hidden: false,
  },
  {
    id: "block-contact",
    type: "ContactCards",
    props: {
      title: "Contact the Organizing Secretariat",
      email: "ieeesmc2027@hcmute.edu.vn",
      location: "Ho Chi Minh City, Vietnam",
      venue: "Sheraton Saigon Grand Opera Hotel",
      website: "https://ieee-smc2027.org",
    },
    hidden: false,
  },
  {
    id: "block-subscribe",
    type: "CfpSubscribe",
    props: {},
    hidden: false,
  },
];

interface PageBlockItem {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  hidden?: boolean;
}

interface WebsitePageRecord {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  blocks: PageBlockItem[];
  updated_at: string;
}

function generateBlockId(type: string): string {
  return `${type.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Image Upload Input with direct storage upload and Sonner notifications
 */
function BlockImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.loading(`Uploading ${file.name}...`, { id: "img-upload" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "public/uploads");

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }
      const url = data.data?.url || data.url || data.data?.file?.url;
      if (url) {
        onChange(url);
        toast.success("Image uploaded successfully!", { id: "img-upload" });
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed", {
        id: "img-upload",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      {value && (
        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mb-1.5 shadow-2xs">
          <Image src={value} alt="Preview" fill unoptimized className="object-cover" />
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/assets/image.jpg or URL"
          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#115eff]"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#115eff] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          title="Upload image file"
        >
          {uploading ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          <span>Upload</span>
        </button>
      </div>
    </div>
  );
}

// Draggable Sortable Item Wrapper
function SortableBlockItem({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onToggleHide,
  onMoveUp,
  onMoveDown,
  children,
}: {
  block: PageBlockItem;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onToggleHide: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockMeta = AVAILABLE_BLOCKS.find((b) => b.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative w-full transition-all duration-150 select-none cursor-pointer",
        isDragging && "opacity-40 z-50 scale-[0.99]",
        block.hidden && "opacity-50"
      )}
    >
      {/* ── Selection Indicator: Solid Left Blue Bar (No inner top/left padding!) ── */}
      {isSelected && (
        <>
          {/* Left Solid Blue Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#115eff] z-30 pointer-events-none rounded-l-[1px] shadow-xs" />

          {/* Full Crisp Bounding Box */}
          <div className="absolute inset-0 border-2 border-[#115eff] pointer-events-none z-30 shadow-xs" />

          {/* 4 Figma Corner Handles */}
          <div className="w-2.5 h-2.5 bg-white border-2 border-[#115eff] rounded-[1px] absolute -top-1.25 -left-1.25 shadow-md pointer-events-none z-40" />
          <div className="w-2.5 h-2.5 bg-white border-2 border-[#115eff] rounded-[1px] absolute -top-1.25 -right-1.25 shadow-md pointer-events-none z-40" />
          <div className="w-2.5 h-2.5 bg-white border-2 border-[#115eff] rounded-[1px] absolute -bottom-1.25 -left-1.25 shadow-md pointer-events-none z-40" />
          <div className="w-2.5 h-2.5 bg-white border-2 border-[#115eff] rounded-[1px] absolute -bottom-1.25 -right-1.25 shadow-md pointer-events-none z-40" />

          {/* Top Floating Control Bar: Positioned above the block so content is not obscured */}
          <div
            className="absolute -top-8 left-0 z-50 flex items-center gap-1.5 h-7.5 bg-[#115eff] text-white rounded-t-lg rounded-br-lg px-2.5 py-1 shadow-lg shadow-blue-600/35 border border-blue-400/80 font-sans text-xs font-semibold whitespace-nowrap select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing hover:text-blue-100"
              title="Drag to reorder"
            >
              <GripVertical className="w-3.5 h-3.5 text-blue-100" />
              <span className="text-xs font-bold font-sans">{blockMeta?.title || block.type}</span>
            </div>

            <div className="w-px h-3.5 bg-white/30 mx-0.5" />

            {/* Move Up */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={index === 0}
              className="p-1 hover:bg-blue-700 rounded disabled:opacity-30 transition-colors cursor-pointer"
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
              className="p-1 hover:bg-blue-700 rounded disabled:opacity-30 transition-colors cursor-pointer"
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
              className="p-1 hover:bg-blue-700 rounded transition-colors cursor-pointer"
              title="Duplicate block"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Visibility */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleHide();
              }}
              className="p-1 hover:bg-blue-700 rounded transition-colors cursor-pointer"
              title={block.hidden ? "Show block" : "Hide block"}
            >
              {block.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-rose-600 rounded transition-colors cursor-pointer"
              title="Remove block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Hover outline when not selected */}
      {!isSelected && (
        <div className="absolute inset-0 border border-transparent group-hover:border-blue-300/80 pointer-events-none transition-colors" />
      )}

      {/* Actual Block Content (zero padding added, totally unaltered) */}
      <div className={cn("w-full relative", block.hidden && "grayscale-[30%]")}>
        {children}
      </div>
    </div>
  );
}

export default function PageBlockEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [page, setPage] = useState<WebsitePageRecord | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [blocks, setBlocks] = useState<PageBlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Inspector tabs: Content, Styles, JSON
  const [inspectorTab, setInspectorTab] = useState<"content" | "styles" | "json">("content");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Responsive Viewport and Auto-Fit Zoom (matching HCMUTE BuilderCanvas)
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = useState<number>(100);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(1280);
  const [frameHeight, setFrameHeight] = useState<number>(900);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // Left Drawer Tabs: blocks, layers, settings
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "layers" | "settings">("blocks");
  const [paletteSearch, setPaletteSearch] = useState("");

  // Undo / Redo History
  const [history, setHistory] = useState<PageBlockItem[][]>([]);
  const [future, setFuture] = useState<PageBlockItem[][]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // ResizeObserver to measure center canvas container width for responsive scaling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => {
      if (el) setContainerWidth(el.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ResizeObserver to measure artboard frame height for proportional visual footprint
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => {
      if (el) setFrameHeight(el.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [blocks, viewport]);

  const pushState = (newBlocks: PageBlockItem[]) => {
    setHistory((prev) => [...prev.slice(-25), blocks]);
    setFuture([]);
    setBlocks(newBlocks);
    setHasUnsaved(true);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture((prev) => [blocks, ...prev]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setBlocks(previous);
    setHasUnsaved(true);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((prev) => [...prev, blocks]);
    setFuture((prev) => prev.slice(1));
    setBlocks(next);
    setHasUnsaved(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/pages/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.page) {
          setPage(res.page);
          setPageTitle(res.page.title || "");
          const initialBlocks: PageBlockItem[] =
            Array.isArray(res.page.blocks) && res.page.blocks.length > 0
              ? res.page.blocks
              : DEFAULT_PAGE_BLOCKS;
          setBlocks(initialBlocks);
          if (initialBlocks.length > 0) {
            setSelectedBlockId(initialBlocks[0].id);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load page blocks");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Sync selected block JSON AST
  useEffect(() => {
    if (!selectedBlockId) return;
    const current = blocks.find((b) => b.id === selectedBlockId);
    if (current) {
      setJsonText(JSON.stringify(current, null, 2));
      setJsonError(null);
    }
  }, [selectedBlockId, blocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      pushState(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: string) => {
    const blockMeta = AVAILABLE_BLOCKS.find((b) => b.type === type);
    const newBlock: PageBlockItem = {
      id: generateBlockId(type),
      type,
      props: { ...(blockMeta?.defaultProps || {}) },
      styles: {},
      hidden: false,
    };
    pushState([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${blockMeta?.title || type}`);
  };

  const removeBlock = (index: number) => {
    const removed = blocks[index];
    const newBlocks = blocks.filter((_, i) => i !== index);
    pushState(newBlocks);
    if (selectedBlockId === removed.id) {
      setSelectedBlockId(newBlocks[0]?.id || null);
    }
    toast.success("Block removed");
  };

  const duplicateBlock = (index: number) => {
    const orig = blocks[index];
    const dup: PageBlockItem = {
      ...orig,
      id: generateBlockId(orig.type),
      props: JSON.parse(JSON.stringify(orig.props || {})),
      styles: JSON.parse(JSON.stringify(orig.styles || {})),
    };
    const next = [...blocks];
    next.splice(index + 1, 0, dup);
    pushState(next);
    setSelectedBlockId(dup.id);
    toast.success("Block duplicated");
  };

  const toggleHideBlock = (index: number) => {
    const next = [...blocks];
    next[index] = { ...next[index], hidden: !next[index].hidden };
    pushState(next);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;
    pushState(arrayMove(blocks, fromIndex, toIndex));
  };

  const updateBlockProps = (blockId: string, newProps: Record<string, unknown>) => {
    const next = blocks.map((b) => (b.id === blockId ? { ...b, props: newProps } : b));
    setBlocks(next);
    setHasUnsaved(true);
  };

  const updateBlockStyles = (blockId: string, newStyles: Record<string, unknown>) => {
    const next = blocks.map((b) => (b.id === blockId ? { ...b, styles: newStyles } : b));
    setBlocks(next);
    setHasUnsaved(true);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (selectedBlockId && parsed) {
        const next = blocks.map((b) => (b.id === selectedBlockId ? parsed : b));
        setBlocks(next);
        setHasUnsaved(true);
        setJsonError(null);
        toast.success("Applied JSON AST changes");
      }
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle.trim() || page?.title,
          blocks,
        }),
      });

      if (res.ok) {
        toast.success("Page layout saved successfully!");
        setHasUnsaved(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save page");
      }
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const selectedBlockIndex = blocks.findIndex((b) => b.id === selectedBlockId);
  const selectedBlock = selectedBlockIndex !== -1 ? blocks[selectedBlockIndex] : null;
  const selectedMeta = selectedBlock
    ? AVAILABLE_BLOCKS.find((b) => b.type === selectedBlock.type)
    : null;

  const filteredPalette = useMemo(() => {
    if (!paletteSearch.trim()) return AVAILABLE_BLOCKS;
    const q = paletteSearch.toLowerCase();
    return AVAILABLE_BLOCKS.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }, [paletteSearch]);

  // Canonical device base width: desktop = 1240px, tablet = 768px, mobile = 390px (matching HCMUTE)
  const baseWidth = viewport === "mobile" ? 390 : viewport === "tablet" ? 768 : 1240;

  // Auto-fit calculation: if page overflows the container (with 48px padding), scale it down
  const autoFitRatio = Math.min(1, Math.max(280, containerWidth - 48) / baseWidth);
  const activeScale = isAutoFit ? autoFitRatio : zoom / 100;
  const visualWidth = Math.round(baseWidth * activeScale);
  const visualHeight = Math.round(frameHeight * activeScale);

  // Render Component onto Canvas
  const renderComponent = (block: PageBlockItem) => {
    const p = block.props || {};
    switch (block.type) {
      case "HeroCarousel":
        return <HeroCarousel />;
      case "WelcomeLetter":
        return <WelcomeLetter />;
      case "NewsList":
        return <NewsList />;
      case "ConferenceVideo":
        return <ConferenceVideo />;
      case "PaperTemplates":
        return <PaperTemplates />;
      case "ContactCards":
        return <ContactCards />;
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
      case "CommitteesSection":
        return <CommitteesSection />;
      case "PaymentMethods":
        return <PaymentMethods />;
      case "Venue":
        return <Venue />;
      case "FAQ":
        return <FAQ />;
      case "Sponsors":
        return <Sponsors />;
      case "Keynotes":
        return <Keynotes />;
      default:
        return (
          <div className="p-8 text-center bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Custom Component: {block.type}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 text-[#115eff] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading Page Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100 font-sans select-none">
      {/* ── Top Header (Matching HCMUTE BuilderHeader) ── */}
      <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur px-3 sm:px-4 flex items-center justify-between gap-3 select-none z-30 shrink-0 text-slate-900 font-sans">
        {/* Left section: Back & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/admin/pages"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title="Back to Pages List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-5 w-px bg-slate-200 shrink-0" />

          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => {
                setPageTitle(e.target.value);
                setHasUnsaved(true);
              }}
              placeholder="Page title..."
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 focus:bg-white px-1.5 py-0.5 rounded-lg border border-transparent focus:border-[#115eff]/50 focus:outline-none transition-all truncate max-w-[180px] sm:max-w-[240px]"
            />
            {page?.slug && (
              <span className="text-[10px] text-slate-500 px-1.5 truncate leading-tight font-mono">
                /{page.slug === "home" ? "" : page.slug}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs leading-none",
              hasUnsaved
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#115eff]" />
                Saving…
              </>
            ) : hasUnsaved ? (
              "Unsaved Changes"
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Saved
              </>
            )}
          </span>
        </div>

        {/* Center section: Viewport Switcher & Undo/Redo */}
        <div className="hidden md:flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 disabled:opacity-25 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 disabled:opacity-25 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viewport Breakpoints */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                viewport === "desktop"
                  ? "bg-white text-[#115eff] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Desktop Screen (1240px)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                viewport === "tablet"
                  ? "bg-white text-[#115eff] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Tablet Screen (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                viewport === "mobile"
                  ? "bg-white text-[#115eff] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Mobile Screen (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Mobile</span>
            </button>
          </div>

          {/* Zoom controls with Auto-Fit */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => {
                setIsAutoFit(false);
                setZoom((z) => Math.max(40, (isAutoFit ? Math.round(activeScale * 100) : z) - 10));
              }}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoFit(!isAutoFit)}
              className={cn(
                "px-2 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer",
                isAutoFit
                  ? "bg-white text-[#115eff] shadow-2xs"
                  : "text-slate-700 hover:bg-white"
              )}
              title={isAutoFit ? "Auto-fit enabled. Click to disable." : "Click to auto-fit"}
            >
              {isAutoFit ? `Auto (${Math.round(activeScale * 100)}%)` : `${zoom}%`}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoFit(false);
                setZoom((z) => Math.min(150, (isAutoFit ? Math.round(activeScale * 100) : z) + 10));
              }}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoFit(false);
                setZoom(100);
              }}
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer border-l border-slate-200 ml-0.5",
                !isAutoFit && zoom === 100 && "text-[#115eff] font-bold"
              )}
              title="Reset to 100%"
            >
              100%
            </button>
          </div>
        </div>

        {/* Right section: Preview Toggle & Save Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Preview Toggle Button */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "preview" ? "edit" : "preview")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer",
              viewMode === "preview"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                : "bg-white border border-slate-200 text-slate-700 hover:text-[#115eff] hover:border-blue-300"
            )}
            title={viewMode === "preview" ? "Exit Preview" : "Live Preview"}
          >
            {viewMode === "preview" ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Exit Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#115eff]" />
                <span>Preview</span>
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={savePage}
            disabled={saving}
            className={cn(
              "relative px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50",
              hasUnsaved
                ? "bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-blue-600/25 ring-2 ring-blue-400/30"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            )}
            title="Save Page (Cmd+S / Ctrl+S)"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{hasUnsaved ? "Save Changes" : "Saved"}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main Body: 3-Column Layout (Palette, Canvas, Inspector) ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ── Column 1: Left Drawer (284px) matching HCMUTE ── */}
        {viewMode !== "preview" && (
          <aside className="w-[284px] shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden select-none z-10">
            {/* Drawer Header Tabs */}
            <div className="p-2 border-b border-slate-200 bg-slate-50/80 shrink-0">
              <div className="flex items-center bg-slate-200/70 p-1 rounded-xl gap-1">
                {[
                  { id: "blocks", label: "Block Library", icon: LayoutGrid },
                  { id: "layers", label: "Page Layers", icon: Layers },
                  { id: "settings", label: "Page Info", icon: Info },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = sidebarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSidebarTab(tab.id as typeof sidebarTab)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        isActive
                          ? "bg-white text-[#115eff] shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                      )}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab 1: Component Library */}
            {sidebarTab === "blocks" && (
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <input
                  type="text"
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  placeholder="Search blocks (Committees, FAQ...)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#115eff] text-slate-800 shadow-2xs"
                />

                <div className="space-y-2">
                  {filteredPalette.map((b) => (
                    <div
                      key={b.type}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group flex flex-col justify-between gap-1.5 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#115eff] transition-colors">
                            {b.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-[#115eff] font-semibold border border-blue-200">
                            {b.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2 font-normal">
                          {b.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => addBlock(b.type)}
                        className="w-full inline-flex items-center justify-center gap-1 py-1 px-3 bg-white hover:bg-[#115eff] text-slate-700 hover:text-white border border-slate-200 hover:border-[#115eff] text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Block</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Page Layers Structure */}
            {sidebarTab === "layers" && (
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Blocks on Page ({blocks.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {blocks.map((block, idx) => {
                    const meta = AVAILABLE_BLOCKS.find((b) => b.type === block.type);
                    const isSelected = selectedBlockId === block.id;
                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={cn(
                          "p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs",
                          isSelected
                            ? "bg-blue-50/80 border-blue-300 text-[#115eff] font-bold border-l-4 border-l-[#115eff]"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                          <span className="truncate">{meta?.title || block.type}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHideBlock(idx);
                            }}
                            className="p-1 hover:text-[#115eff]"
                            title={block.hidden ? "Show" : "Hide"}
                          >
                            {block.hidden ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(idx);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Page Settings */}
            {sidebarTab === "settings" && (
              <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800">Page Information</span>
                  <p className="text-[11px] text-slate-500">Metadata and publication path</p>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Page Title</label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => {
                        setPageTitle(e.target.value);
                        setHasUnsaved(true);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">URL Path / Slug</label>
                    <input
                      type="text"
                      value={`/${page?.slug || ""}`}
                      readOnly
                      className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Status</label>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                      PUBLISHED
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Column 2: Center Canvas (Infinite Dot Matrix + True Desktop Size Frame) ── */}
        <div
          ref={scrollContainerRef}
          onClick={() => setSelectedBlockId(null)}
          className="flex-1 overflow-auto flex flex-col min-w-0 bg-[#edf2f7] dark:bg-[#0b0f19] bg-[radial-gradient(#94a3b8_1.25px,transparent_1.25px)] dark:bg-[radial-gradient(#334155_1.25px,transparent_1.25px)] [background-size:24px_24px] bg-fixed select-none relative"
        >
          {/* Centering Wrapper: allows wide artboard without clipping */}
          <div className="min-w-full w-max flex flex-col items-center justify-start min-h-full py-8 px-6 box-border">
            {/* Scaled Wrapper Shell: occupies exact visual footprint so scrollbar and document flow match seamlessly */}
            <div
              style={{
                width: `${visualWidth}px`,
                height: frameHeight > 0 ? `${visualHeight}px` : "auto",
                transition: "width 0.15s ease-out, height 0.15s ease-out",
              }}
              className="relative shrink-0"
            >
              {/* Sized Visual Artboard Frame: baseWidth scaled by activeScale with transformOrigin 0 0 */}
              <div
                ref={frameRef}
                style={{
                  width: `${baseWidth}px`,
                  minWidth: `${baseWidth}px`,
                  maxWidth: `${baseWidth}px`,
                  transform: `scale(${activeScale})`,
                  transformOrigin: "0 0",
                  backgroundColor: "#ffffff",
                }}
                className="absolute left-0 top-0 flex flex-col min-h-[900px] rounded-xl border border-slate-300/90 dark:border-zinc-800 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5 overflow-visible transition-transform duration-150"
              >
              {blocks.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl space-y-3 m-auto">
                  <Layers className="size-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">Canvas is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click below to load all official conference blocks, or pick blocks from the library on the left.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBlocks(DEFAULT_PAGE_BLOCKS);
                      setSelectedBlockId(DEFAULT_PAGE_BLOCKS[0].id);
                      setHasUnsaved(true);
                      toast.success("Loaded all conference blocks");
                    }}
                    className="px-4 py-2 bg-[#115eff] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                  >
                    Load All Conference Blocks
                  </button>
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
                    {/* Continuous seamless page content: NO space-y-6 breaking gaps */}
                    <div className="w-full flex flex-col min-h-full pb-8">
                      {blocks.map((block, idx) => (
                        <SortableBlockItem
                          key={block.id}
                          block={block}
                          index={idx}
                          totalBlocks={blocks.length}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => setSelectedBlockId(block.id)}
                          onRemove={() => removeBlock(idx)}
                          onDuplicate={() => duplicateBlock(idx)}
                          onToggleHide={() => toggleHideBlock(idx)}
                          onMoveUp={() => moveBlock(idx, idx - 1)}
                          onMoveDown={() => moveBlock(idx, idx + 1)}
                        >
                          {renderComponent(block)}
                        </SortableBlockItem>
                      ))}

                      {/* Bottom Add Block Pill: matching HCMUTE */}
                      {viewMode !== "preview" && (
                        <div className="pt-8 pb-4 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => addBlock("NewsList")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs hover:border-blue-400 hover:text-[#115eff] transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4 text-[#115eff]" />
                            <span>Add block to end of page</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* ── Column 3: Right Inspector (320px) matching HCMUTE PropertyInspector ── */}
        {viewMode !== "preview" && (
          <aside className="w-[320px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden select-none z-10 text-slate-900 font-sans min-w-0">
            {!selectedBlock ? (
              /* Empty Selection State */
              <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center select-none bg-white">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#115eff] mb-3 shadow-xs">
                  <Sliders className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">No Block Selected</p>
                <p className="text-xs leading-relaxed max-w-[220px] text-slate-500">
                  Click any block on the canvas or layers tree to customize its content and styles.
                </p>
              </div>
            ) : (
              /* Active Block Property Inspector */
              <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 min-w-0 gap-2 shrink-0">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-[13px] font-bold text-slate-800 truncate">
                      {selectedMeta?.title || selectedBlock.type}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      #{selectedBlock.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleHideBlock(selectedBlockIndex)}
                      className={cn(
                        "px-2 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                        selectedBlock.hidden
                          ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                          : "border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                      title={selectedBlock.hidden ? "Block is hidden" : "Hide block"}
                    >
                      {selectedBlock.hidden ? (
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{selectedBlock.hidden ? "Hidden" : "Visible"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setInspectorTab(inspectorTab === "json" ? "content" : "json")
                      }
                      className={cn(
                        "p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                        inspectorTab === "json"
                          ? "bg-blue-50 border-blue-200 text-[#115eff]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                      title="Edit raw JSON AST"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBlockId(null)}
                      className="size-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Close Inspector"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tabs: Content, Styles */}
                <div className="flex border-b border-slate-200 p-1.5 bg-slate-100/60 gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setInspectorTab("content")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      inspectorTab === "content"
                        ? "bg-[#115eff] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    )}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Content</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab("styles")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      inspectorTab === "styles"
                        ? "bg-[#115eff] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    )}
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    <span>Styles</span>
                  </button>
                </div>

                {/* Tab Content Panels */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-4 min-w-0">
                  {/* JSON Editor Tab */}
                  {inspectorTab === "json" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Raw Block AST</span>
                        <button
                          type="button"
                          onClick={handleApplyJson}
                          className="px-2.5 py-1 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold rounded-md shadow-2xs cursor-pointer"
                        >
                          Apply JSON
                        </button>
                      </div>
                      {jsonError && (
                        <p className="text-[11px] text-rose-600 font-semibold">{jsonError}</p>
                      )}
                      <textarea
                        rows={16}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        className="w-full p-2 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Styles Tab */}
                  {inspectorTab === "styles" && (
                    <div className="space-y-4 text-xs">
                      {/* Display toggle */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 block">Display on Page</span>
                          <span className="text-[10px] text-slate-500">
                            {selectedBlock.hidden ? "Currently hidden" : "Visible to attendees"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleHideBlock(selectedBlockIndex)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer",
                            selectedBlock.hidden
                              ? "bg-slate-200 text-slate-600"
                              : "bg-[#115eff] text-white"
                          )}
                        >
                          {selectedBlock.hidden ? "Hidden" : "Visible"}
                        </button>
                      </div>

                      {/* Background Style Preset */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">
                          Background Style
                        </label>
                        <select
                          value={String(selectedBlock.styles?.bgPreset || "default")}
                          onChange={(e) =>
                            updateBlockStyles(selectedBlock.id, {
                              ...selectedBlock.styles,
                              bgPreset: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        >
                          <option value="default">Default Component Theme</option>
                          <option value="white">Pure White (#ffffff)</option>
                          <option value="slate-50">Light Slate (#f8fafc)</option>
                          <option value="royal-blue">Royal Blue Theme (#004776)</option>
                          <option value="dark">Dark Theme (#0f172a)</option>
                        </select>
                      </div>

                      {/* Padding Top */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">
                          Padding Top (px)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={Number(selectedBlock.styles?.paddingTop ?? 0)}
                          onChange={(e) =>
                            updateBlockStyles(selectedBlock.id, {
                              ...selectedBlock.styles,
                              paddingTop: Number(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      {/* Padding Bottom */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">
                          Padding Bottom (px)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={Number(selectedBlock.styles?.paddingBottom ?? 0)}
                          onChange={(e) =>
                            updateBlockStyles(selectedBlock.id, {
                              ...selectedBlock.styles,
                              paddingBottom: Number(e.target.value),
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content Tab: Specific Component Props */}
                  {inspectorTab === "content" && (
                    <div className="space-y-4 text-xs">
                      {/* HeroCarousel Inspector */}
                      {selectedBlock.type === "HeroCarousel" && (
                        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="font-bold text-slate-800 block text-xs">
                            Hero Carousel Settings
                          </span>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">
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
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <label className="text-slate-600 font-medium">Show Overlay Text</label>
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

                          <div className="flex items-center justify-between pt-1">
                            <label className="text-slate-600 font-medium">Show Slide Indicators</label>
                            <input
                              type="checkbox"
                              checked={Boolean(selectedBlock.props?.showIndicators ?? true)}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  showIndicators: e.target.checked,
                                })
                              }
                              className="rounded text-[#115eff] focus:ring-blue-500"
                            />
                          </div>

                          <BlockImageField
                            label="Slide 1 Background Image"
                            value={String(selectedBlock.props?.slide1Image ?? "")}
                            onChange={(url) =>
                              updateBlockProps(selectedBlock.id, {
                                ...selectedBlock.props,
                                slide1Image: url,
                              })
                            }
                          />

                          <BlockImageField
                            label="Slide 2 Background Image"
                            value={String(selectedBlock.props?.slide2Image ?? "")}
                            onChange={(url) =>
                              updateBlockProps(selectedBlock.id, {
                                ...selectedBlock.props,
                                slide2Image: url,
                              })
                            }
                          />
                        </div>
                      )}

                      {/* WelcomeLetter Inspector */}
                      {selectedBlock.type === "WelcomeLetter" && (
                        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="font-bold text-slate-800 block text-xs">
                            Welcome Letter Settings
                          </span>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Section Heading</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.heading ?? "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  heading: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Main Title</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.title ?? "Welcome Message from the General Chairs & Honorary Chairs")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Salutation</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.salutation ?? "Dear Colleagues & Honored Participants,")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  salutation: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Theme</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.theme ?? "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  theme: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Dates &amp; Location Line</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.datesLocation ?? "October 6–10, 2027 • Ho Chi Minh City, Vietnam")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  datesLocation: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                        </div>
                      )}

                      {/* NewsList Inspector */}
                      {selectedBlock.type === "NewsList" && (
                        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="font-bold text-slate-800 block text-xs">
                            News Section Settings
                          </span>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Section Title</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.title ?? "Conference News & Announcements")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Subtitle</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.subtitle ?? "Stay updated with the latest milestones, partnership alerts, and program schedules")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  subtitle: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ConferenceVideo Inspector */}
                      {selectedBlock.type === "ConferenceVideo" && (
                        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="font-bold text-slate-800 block text-xs">
                            Video Spotlight Settings
                          </span>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Spotlight Title</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.title ?? "IEEE SMC 2027 Comes to Ho Chi Minh City")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Subtitle</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.subtitle ?? "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  subtitle: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">YouTube Video Embed URL</label>
                            <input
                              type="text"
                              value={String(selectedBlock.props?.videoUrl ?? "https://www.youtube.com/embed/vTwRHpRNtls")}
                              onChange={(e) =>
                                updateBlockProps(selectedBlock.id, {
                                  ...selectedBlock.props,
                                  videoUrl: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#115eff]"
                            />
                          </div>
                        </div>
                      )}

                      {/* Generic Prop Editor for other blocks */}
                      {!["HeroCarousel", "WelcomeLetter", "NewsList", "ConferenceVideo"].includes(
                        selectedBlock.type
                      ) && (
                        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                          <span className="font-bold text-slate-800 block text-xs">
                            {selectedMeta?.title || selectedBlock.type} Properties
                          </span>
                          {Object.keys(selectedBlock.props || {}).length === 0 ? (
                            <p className="text-[11px] text-slate-500">
                              This block renders dynamically from the conference database and requires no extra configuration.
                            </p>
                          ) : (
                            Object.entries(selectedBlock.props || {}).map(([key, val]) => (
                              <div key={key}>
                                <label className="block text-slate-600 mb-1 font-medium capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </label>
                                {typeof val === "boolean" ? (
                                  <input
                                    type="checkbox"
                                    checked={val}
                                    onChange={(e) =>
                                      updateBlockProps(selectedBlock.id, {
                                        ...selectedBlock.props,
                                        [key]: e.target.checked,
                                      })
                                    }
                                    className="rounded text-[#115eff]"
                                  />
                                ) : typeof val === "number" ? (
                                  <input
                                    type="number"
                                    value={val}
                                    onChange={(e) =>
                                      updateBlockProps(selectedBlock.id, {
                                        ...selectedBlock.props,
                                        [key]: Number(e.target.value),
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={String(val || "")}
                                    onChange={(e) =>
                                      updateBlockProps(selectedBlock.id, {
                                        ...selectedBlock.props,
                                        [key]: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
