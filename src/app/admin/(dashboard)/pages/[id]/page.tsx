"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";
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
  LayoutGrid,
  Info,
  Sliders,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/ui/dot-pattern";

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
      content: "<div class='p-8 text-center bg-slate-100 rounded-sm'><h4>Custom HTML Block</h4><p>Edit the HTML code in the properties panel on the right.</p></div>",
    },
  },
];

// Full set of active conference page blocks matching home page
export const DEFAULT_PAGE_BLOCKS: PageBlockItem[] = [
  {
    id: "block-hero",
    type: "HeroCarousel",
    props: { autoplayDuration: 7, showOverlayText: true, showIndicators: true },
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
    id: "block-dates",
    type: "ImportantDates",
    props: {},
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
        <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden border border-slate-200 bg-slate-100 mb-1.5">
          <Image src={value} alt="Preview" fill unoptimized className="object-cover" />
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/assets/image.jpg or URL"
          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
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
          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#115eff] border border-blue-200 rounded-sm text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
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
        "group relative rounded-sm transition-all duration-200 border-2 select-none",
        isSelected
          ? "border-[#115eff] shadow-sm ring-1 ring-blue-500/20"
          : "border-transparent hover:border-blue-300/80 shadow-2xs",
        isDragging && "opacity-40 z-50 shadow-md scale-[0.99]",
        block.hidden && "opacity-60 bg-slate-100/50"
      )}
    >
      {/* Top Floating Control Bar */}
      <div
        className={cn(
          "absolute -top-3 left-4 z-30 flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold transition-all shadow-xs border border-slate-700/30",
          isSelected
            ? "bg-[#115eff] text-white opacity-100 scale-100"
            : "bg-slate-800 text-slate-100 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
        )}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 hover:text-blue-200"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <span className="px-1 text-[11px] font-semibold">{blockMeta?.title || block.type}</span>

        <div className="w-px h-3 bg-white/30 mx-0.5" />

        {/* Move Up */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="w-5 h-5 flex items-center justify-center rounded-sm text-white hover:bg-white/20 disabled:opacity-30 transition-colors cursor-pointer"
          title="Move up"
        >
          <ChevronUp className="w-3 h-3" />
        </button>

        {/* Move Down */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalBlocks - 1}
          className="w-5 h-5 flex items-center justify-center rounded-sm text-white hover:bg-white/20 disabled:opacity-30 transition-colors cursor-pointer"
          title="Move down"
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="w-5 h-5 flex items-center justify-center rounded-sm text-white hover:bg-white/20 transition-colors cursor-pointer"
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
          className="w-5 h-5 flex items-center justify-center rounded-sm text-white hover:bg-white/20 transition-colors cursor-pointer"
          title={block.hidden ? "Show block" : "Hide block"}
        >
          {block.hidden ? (
            <EyeOff className="w-3 h-3 text-amber-300" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-5 h-5 flex items-center justify-center rounded-sm text-rose-200 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
          title="Delete block"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Render Component Preview */}
      <div className={cn("overflow-hidden rounded-sm", block.hidden && "opacity-60")}>
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
  const [paletteSearch, setPaletteSearch] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "layers" | "settings">("blocks");

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
          let initialBlocks = Array.isArray(res.page.blocks) ? res.page.blocks : [];
          // If empty blocks array (e.g. newly created page or unmigrated home page), default to full set
          if (initialBlocks.length === 0) {
            initialBlocks = DEFAULT_PAGE_BLOCKS;
          }
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
    toast.loading("Saving page blocks...", { id: "page-save" });

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
        toast.success("Page blocks updated successfully!", { id: "page-save" });
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        throw new Error("Server returned error saving page");
      }
    } catch {
      toast.error("Failed to save page to database", { id: "page-save" });
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
    toast.success(`Added ${meta?.title || type} block`);
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
    toast.success("Block duplicated");
  };

  const removeBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    setBlocks(next);
    if (selectedBlockId === blocks[index]?.id) {
      setSelectedBlockId(next[0]?.id || null);
    }
    toast.info("Block removed from canvas");
  };

  const toggleHideBlock = (index: number) => {
    const next = [...blocks];
    next[index] = { ...next[index], hidden: !next[index].hidden };
    setBlocks(next);
    toast.info(next[index].hidden ? "Block hidden" : "Block visible");
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;
    setBlocks((items) => arrayMove(items, fromIndex, toIndex));
  };

  const updateBlockProps = (blockId: string, newProps: Record<string, unknown>) => {
    setBlocks((items) =>
      items.map((item) => (item.id === blockId ? { ...item, props: newProps } : item))
    );
  };

  const renderComponent = (block: PageBlockItem) => {
    switch (block.type) {
      case "HeroCarousel":
        return <HeroCarousel {...block.props} />;
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
      case "CommitteesSection":
        return <CommitteesSection {...block.props} />;
      case "PaymentMethods":
        return <PaymentMethods {...block.props} />;
      case "Venue":
        return <Venue />;
      case "FAQ":
        return <FAQ />;
      case "Sponsors":
        return <Sponsors />;
      case "Keynotes":
        return <Keynotes />;
      case "CustomHTML":
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: (block.props?.content as string) || "",
            }}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-300 rounded-sm">
            Unknown Component: {block.type}
          </div>
        );
    }
  };

  const selectedBlockIndex = blocks.findIndex((b) => b.id === selectedBlockId);
  const selectedBlock = selectedBlockIndex !== -1 ? blocks[selectedBlockIndex] : null;
  const selectedMeta = selectedBlock
    ? AVAILABLE_BLOCKS.find((b) => b.type === selectedBlock.type)
    : null;

  const filteredPalette = AVAILABLE_BLOCKS.filter(
    (b) =>
      b.title.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      b.type.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-sm" />
          <Skeleton className="h-8 w-32 rounded-sm" />
        </div>
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-3 h-[600px] rounded-sm" />
          <Skeleton className="col-span-6 h-[600px] rounded-sm" />
          <Skeleton className="col-span-3 h-[600px] rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Top Page Editor Action Rail ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-1.5 rounded-sm border border-slate-200 hover:bg-slate-50 text-[#004776] transition-colors"
            title="Back to Pages List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#004776] leading-tight">
                {page?.title || "Page Editor"}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-sm bg-blue-50 text-[#115eff] font-semibold border border-blue-200">
                /{page?.slug}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Visual Page Builder • {blocks.length} active blocks
            </p>
          </div>
        </div>

        {/* Viewport Toggles & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-sm border border-slate-200">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={cn(
                "p-1.5 rounded-sm text-slate-600 transition-all cursor-pointer",
                viewport === "desktop" && "bg-white text-[#115eff] shadow-2xs font-semibold"
              )}
              title="Desktop viewport"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={cn(
                "p-1.5 rounded-sm text-slate-600 transition-all cursor-pointer",
                viewport === "tablet" && "bg-white text-[#115eff] shadow-2xs font-semibold"
              )}
              title="Tablet viewport"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={cn(
                "p-1.5 rounded-sm text-slate-600 transition-all cursor-pointer",
                viewport === "mobile" && "bg-white text-[#115eff] shadow-2xs font-semibold"
              )}
              title="Mobile viewport"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Load Full Home Blocks Button */}
          <button
            type="button"
            onClick={() => {
              setBlocks(DEFAULT_PAGE_BLOCKS);
              setSelectedBlockId(DEFAULT_PAGE_BLOCKS[0].id);
              toast.success("Loaded all 19 conference blocks to canvas");
            }}
            className="h-8 px-2.5 rounded-sm border border-slate-200 bg-white hover:bg-blue-50 text-[#004776] hover:text-[#115eff] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Reset canvas with complete standard conference blocks"
          >
            <Layers className="size-3.5 text-[#115eff]" />
            <span className="hidden sm:inline">Load All Current Blocks</span>
          </button>

          <Link
            href={page?.slug === "home" ? "/" : `/${page?.slug}`}
            target="_blank"
            className="h-8 px-2.5 rounded-sm border border-slate-200 bg-white hover:bg-blue-50 text-[#004776] hover:text-[#115eff] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Preview Toggle Button */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "preview" ? "edit" : "preview")}
            className={cn(
              "h-8 px-3 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer",
              viewMode === "preview"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-white border border-slate-200 text-[#004776] hover:bg-blue-50 hover:text-[#115eff]"
            )}
            title={viewMode === "preview" ? "Exit preview mode" : "Preview page canvas"}
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
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-4 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs rounded-sm shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Page"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Studio Body (Col 1 Left Panel 308px | Col 2 Center Canvas 1fr | Col 3 Right Inspector 320px) ── */}
      <div className="flex-1 min-h-[calc(100vh-65px)] flex relative overflow-hidden bg-slate-50">
        {/* ── Left Column: Component Palette / Layers / Settings (308px) ── */}
        {viewMode !== "preview" && (
          <aside className="w-[308px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-65px)] select-none z-20">
            {/* Top Navigation Tabs: 3 navigation icons matching HCMUTE */}
            <nav
              aria-label="Builder Sidebar Navigation"
              className="p-2 border-b border-slate-200 bg-slate-50/80 shrink-0"
            >
              <div className="flex items-center bg-slate-200/70 p-1 rounded-sm gap-1">
                {[
                  { id: "blocks", label: "Component Library", icon: LayoutGrid },
                  { id: "layers", label: "Page Structure", icon: Layers },
                  { id: "settings", label: "Page Info", icon: Info },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = sidebarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSidebarTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-1.5 rounded-sm flex items-center justify-center transition-all cursor-pointer",
                        isActive
                          ? "bg-white text-[#115eff] shadow-xs font-bold"
                          : "text-slate-500 hover:text-[#004776] hover:bg-white/50"
                      )}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Tab 1: Component Library */}
            {sidebarTab === "blocks" && (
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                <div>
                  <input
                    type="text"
                    value={paletteSearch}
                    onChange={(e) => setPaletteSearch(e.target.value)}
                    placeholder="Search blocks (Committees, FAQ...)"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-[#115eff] text-[#004776]"
                  />
                </div>

                <div className="space-y-2">
                  {filteredPalette.map((b) => (
                    <div
                      key={b.type}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-sm transition-all group flex flex-col justify-between gap-1.5 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#004776] group-hover:text-[#115eff] transition-colors">
                            {b.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-50 text-[#115eff] font-semibold border border-blue-200">
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
                        className="w-full inline-flex items-center justify-center gap-1 py-1 px-3 bg-white hover:bg-[#115eff] text-[#004776] hover:text-white border border-slate-200 hover:border-[#115eff] text-xs font-bold rounded-sm transition-all cursor-pointer shadow-2xs active:scale-95"
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
              <div className="flex-1 p-3.5 space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#004776]">Blocks in Canvas ({blocks.length})</span>
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
                          "p-2 rounded-sm border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer",
                          isSelected
                            ? "bg-blue-50 border-blue-300 text-[#115eff] font-bold"
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
                            {block.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
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
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#004776]">Page Information</span>
                  <p className="text-[11px] text-slate-500">Metadata and publication path</p>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#004776] font-bold mb-1">Page Title</label>
                    <input
                      type="text"
                      value={page?.title || ""}
                      readOnly
                      className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-sm text-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[#004776] font-bold mb-1">URL Path / Slug</label>
                    <input
                      type="text"
                      value={`/${page?.slug || ""}`}
                      readOnly
                      className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-sm text-slate-700 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[#004776] font-bold mb-1">Status</label>
                    <span className="inline-block px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                      PUBLISHED
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Center Column: Live Drag-and-Drop Canvas with MagicUI Dot-Pattern ── */}
        <main className="flex-1 min-w-0 bg-slate-100/90 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-65px)] flex flex-col items-center relative">
          {/* Subtle Dot Matrix Background Texture */}
          <DotPattern
            width={20}
            height={20}
            cx={1.2}
            cy={1.2}
            cr={1.2}
            className="opacity-40 pointer-events-none fill-slate-400"
          />

          <div
            className={cn(
              "relative z-10 w-full transition-all duration-300 space-y-6",
              viewport === "desktop" && "max-w-full",
              viewport === "tablet" && "max-w-[768px]",
              viewport === "mobile" && "max-w-[390px]"
            )}
          >
            {blocks.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-sm border-2 border-dashed border-slate-300 space-y-3">
                <Layers className="size-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#004776]">Canvas is Empty</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Load All Current Blocks&rdquo; above to load conference blocks, or select blocks from the library on the left.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBlocks(DEFAULT_PAGE_BLOCKS);
                    setSelectedBlockId(DEFAULT_PAGE_BLOCKS[0].id);
                    toast.success("Loaded all 19 conference blocks");
                  }}
                  className="px-4 py-2 bg-[#115eff] text-white text-xs font-bold rounded-sm shadow-2xs cursor-pointer"
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
                  <div className="space-y-6">
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
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>

        {/* ── Right Column: Field-by-Field Detailed Component Inspector (320px) ── */}
        {viewMode !== "preview" && selectedBlock && (
          <aside className="w-[320px] shrink-0 bg-white border-l border-slate-200 p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-65px)] select-none z-10">
            <div className="space-y-4">
              {/* Header with Close X */}
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#115eff] block">
                    {selectedMeta?.category || "Block"}
                  </span>
                  <h3 className="text-sm font-bold text-[#004776] leading-tight">
                    {selectedMeta?.title || selectedBlock.type}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    #{selectedBlockIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBlockId(null)}
                    className="size-7 rounded-sm border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#004776] transition-colors cursor-pointer"
                    title="Close Inspector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Visibility Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Display on Page</span>
                <button
                  type="button"
                  onClick={() => toggleHideBlock(selectedBlockIndex)}
                  className={cn(
                    "px-2.5 py-1 rounded-sm text-xs font-bold transition-colors cursor-pointer",
                    selectedBlock.hidden
                      ? "bg-slate-200 text-slate-600"
                      : "bg-[#115eff] text-white"
                  )}
                >
                  {selectedBlock.hidden ? "Hidden" : "Visible"}
                </button>
              </div>

              {/* ── Field-by-Field Property Editors ── */}

              {/* 1. HeroCarousel Inspector */}
              {selectedBlock.type === "HeroCarousel" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Hero Carousel Settings
                  </span>

                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">
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
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-slate-600 text-xs font-medium">Show Overlay Text</label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedBlock.props?.showOverlayText ?? true)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          showOverlayText: e.target.checked,
                        })
                      }
                      className="rounded-sm text-[#115eff] focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-slate-600 text-xs font-medium">Show Slide Indicators</label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedBlock.props?.showIndicators ?? true)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          showIndicators: e.target.checked,
                        })
                      }
                      className="rounded-sm text-[#115eff] focus:ring-blue-500"
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

              {/* 2. WelcomeLetter Inspector */}
              {selectedBlock.type === "WelcomeLetter" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Welcome Letter Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Heading</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.heading ?? "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          heading: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Main Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Welcome Message from the General Chairs & Honorary Chairs")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Salutation</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.salutation ?? "Dear Colleagues & Honored Participants,")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          salutation: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Theme</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.theme ?? "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          theme: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Dates &amp; Location Line</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.datesLocation ?? "October 6–10, 2027 • Ho Chi Minh City, Vietnam")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          datesLocation: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="Chairs Signature / Portrait Image"
                    value={String(selectedBlock.props?.signatureImage ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        signatureImage: url,
                      })
                    }
                  />
                </div>
              )}

              {/* 3. NewsList Inspector */}
              {selectedBlock.type === "NewsList" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    News Section Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Conference News & Announcements")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Stay updated with the latest milestones, partnership alerts, and program schedules")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 4. ConferenceVideo Inspector */}
              {selectedBlock.type === "ConferenceVideo" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Video Spotlight Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Spotlight Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "IEEE SMC 2027 Comes to Ho Chi Minh City")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">YouTube Video Embed URL</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.videoUrl ?? "https://www.youtube.com/embed/vTwRHpRNtls")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          videoUrl: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Venue Name</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.venueName ?? "Sheraton Saigon Grand Opera Hotel")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          venueName: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="Video Cover / Poster Image"
                    value={String(selectedBlock.props?.posterImage ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        posterImage: url,
                      })
                    }
                  />
                </div>
              )}

              {/* 5. PaperTemplates Inspector */}
              {selectedBlock.type === "PaperTemplates" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Author Templates Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Author Submission Templates & Guidelines")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 6. CommitteesSection Inspector */}
              {selectedBlock.type === "CommitteesSection" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Committees Carousel Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Organizing & Technical Committees")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Distinguished leadership and academic committee chairs driving IEEE SMC 2027")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Badge Label</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.badge ?? "Leadership & Organization")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          badge: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Auto-scroll Delay (ms)</label>
                    <input
                      type="number"
                      min={1000}
                      max={10000}
                      step={500}
                      value={Number(selectedBlock.props?.autoplayDelay ?? 3500)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          autoplayDelay: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 7. PaymentMethods Inspector */}
              {selectedBlock.type === "PaymentMethods" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Payment Methods Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Registration & Payment Methods")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Official registration fee schedule, bank transfer details, and secure payment channels for IEEE SMC 2027")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Badge</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.badge ?? "Registration Guide")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          badge: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="VietQR Code Image"
                    value={String(selectedBlock.props?.qrImage ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        qrImage: url,
                      })
                    }
                  />
                </div>
              )}

              {/* 8. ContactCards Inspector */}
              {selectedBlock.type === "ContactCards" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Contact Cards Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Contact the Organizing Secretariat")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Secretariat Email</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.email ?? "ieeesmc2027@hcmute.edu.vn")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Physical Location</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.location ?? "Ho Chi Minh City, Vietnam")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Venue Hotel</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.venue ?? "Sheraton Saigon Grand Opera Hotel")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          venue: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Website</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.website ?? "https://ieee-smc2027.org")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          website: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 9. Venue Inspector */}
              {selectedBlock.type === "Venue" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Venue Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Venue Name</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.venueName ?? "Sheraton Saigon Grand Opera Hotel")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          venueName: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Address</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.address ?? "88 Dong Khoi Street, District 1, Ho Chi Minh City, Vietnam")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="Venue Hero Photo"
                    value={String(selectedBlock.props?.venueImage ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        venueImage: url,
                      })
                    }
                  />
                </div>
              )}

              {/* 10. CallForPapers Inspector */}
              {selectedBlock.type === "CallForPapers" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Call for Papers Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Call for Papers")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Theme</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.theme ?? "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          theme: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 11. TracksExplorer Inspector */}
              {selectedBlock.type === "TracksExplorer" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Technical Tracks Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Technical Tracks & Topics")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Explore technical tracks across Systems Science, Cybernetics, and Human-Machine Systems")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 12. ImportantDates Inspector */}
              {selectedBlock.type === "ImportantDates" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Important Dates Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Important Deadlines & Milestones")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Mark your calendars for key submission and registration deadlines")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 13. SubmissionCountdown Inspector */}
              {selectedBlock.type === "SubmissionCountdown" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Countdown Timer Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Milestone Headline</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.headline ?? "Full Paper Submission Deadline")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          headline: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Target Date (YYYY-MM-DD)</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.targetDate ?? "2027-04-08")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          targetDate: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {/* 14. Keynotes Inspector */}
              {selectedBlock.type === "Keynotes" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    Keynote Speakers Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Plenary & Keynote Speakers")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "World-renowned leaders and pioneers shaping the future of AI & cybernetics")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="Featured Keynote Photo"
                    value={String(selectedBlock.props?.featuredSpeakerPhoto ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        featuredSpeakerPhoto: url,
                      })
                    }
                  />
                </div>
              )}

              {/* 15. About Inspector */}
              {selectedBlock.type === "About" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    About Section Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Section Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "About HCM-UTE & IEEE SMC")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="Host Campus Photo"
                    value={String(selectedBlock.props?.campusImage ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        campusImage: url,
                      })
                    }
                  />
                </div>
              )}

              {/* 16. CustomHTML Inspector */}
              {selectedBlock.type === "CustomHTML" && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-sm">
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
                    className="w-full px-2.5 py-2 font-mono text-[11px] bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-[#115eff]"
                    placeholder="<div>Enter HTML here...</div>"
                  />
                </div>
              )}

              {/* Fallback field editor for any other block */}
              {!["HeroCarousel", "WelcomeLetter", "NewsList", "ConferenceVideo", "PaperTemplates", "CommitteesSection", "PaymentMethods", "ContactCards", "Venue", "CallForPapers", "TracksExplorer", "ImportantDates", "SubmissionCountdown", "Keynotes", "About", "CustomHTML"].includes(selectedBlock.type) && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <span className="font-bold text-slate-800 block text-xs">
                    {selectedMeta?.title || selectedBlock.type} Settings
                  </span>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Title</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          title: e.target.value,
                        })
                      }
                      placeholder={selectedMeta?.title}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Optional subtitle..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <BlockImageField
                    label="Block Featured Image"
                    value={String(selectedBlock.props?.image ?? "")}
                    onChange={(url) =>
                      updateBlockProps(selectedBlock.id, {
                        ...selectedBlock.props,
                        image: url,
                      })
                    }
                  />
                </div>
              )}

              {/* Quick Actions (Duplicate / Delete) */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => duplicateBlock(selectedBlockIndex)}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-sm text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate Block</span>
                </button>

                <button
                  type="button"
                  onClick={() => removeBlock(selectedBlockIndex)}
                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-sm text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Block</span>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
