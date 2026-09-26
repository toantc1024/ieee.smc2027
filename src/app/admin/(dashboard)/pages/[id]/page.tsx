"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
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
  ArrowUp,
  ArrowDown,
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
    title: "Hero Carousel (Trang chủ)",
    category: "Header & Hero",
    description: "Banner quay vòng toàn màn hình với hiệu ứng chuyển ảnh GSAP và bộ đếm hoa sen",
    defaultProps: {
      autoplayDuration: 7,
    },
  },
  {
    type: "WelcomeLetter",
    title: "Thư chào mừng (Welcome Letter)",
    category: "Giới thiệu",
    description: "Thông điệp từ General Chairs và chủ đề Human-Centric Intelligence",
    defaultProps: {
      title: "Welcome Message from the General Chairs",
      salutation: "Dear Colleagues & Honored Participants,",
      theme: "Human-Centric Intelligence: Shaping the Digital Future",
      datesLocation: "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
    },
  },
  {
    type: "NewsList",
    title: "Tin tức & Thông báo (News)",
    category: "Nội dung",
    description: "Danh sách tin tức đối tác, lịch trình và mốc gia hạn từ IEEE SMC",
    defaultProps: {
      title: "Conference News & Announcements",
      subtitle: "Stay updated with the latest milestones, partnership alerts, and program schedules",
    },
  },
  {
    type: "ConferenceVideo",
    title: "Video giới thiệu (Video Spotlight)",
    category: "Đa phương tiện",
    description: "Video YouTube quảng bá hội nghị tại TP. Hồ Chí Minh và điểm nhấn địa điểm",
    defaultProps: {
      title: "IEEE SMC 2027 Comes to Ho Chi Minh City",
      subtitle: "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors",
      videoUrl: "https://www.youtube.com/embed/I1UGApHrQKo?si=pJEHr9cVC0WN1JFF",
      venueName: "Sheraton Saigon Grand Opera Hotel",
    },
  },
  {
    type: "PaperTemplates",
    title: "Mẫu bài báo & Tải về (Templates)",
    category: "Nộp bài",
    description: "Tải template LaTeX (.zip), Word (.docx) và hướng dẫn chuẩn bị bản thảo",
    defaultProps: {
      title: "Author Submission Templates & Guidelines",
      subtitle: "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
    },
  },
  {
    type: "ContactCards",
    title: "Thẻ liên hệ & Hỗ trợ (Contact Cards)",
    category: "Liên hệ",
    description: "Bộ 3 thẻ liên hệ Email, Địa điểm, Website cùng form gửi câu hỏi nhanh",
    defaultProps: {
      title: "Contact the Organizing Secretariat",
      subtitle: "Have questions regarding paper submissions, proposals, or travel visas? We are here to assist you.",
      email: "smc2027@hcmute.edu.vn",
      location: "Ho Chi Minh City, Vietnam",
      venue: "Sheraton Saigon Grand Opera Hotel",
      website: "ieeesmc2027.hcmute.edu.vn",
    },
  },
  {
    type: "CfpSubscribe",
    title: "Đăng ký nhận tin tức (Newsletter)",
    category: "Liên hệ",
    description: "Form đăng ký email nhận thông báo hạn nộp bài và tin tức hội nghị",
    defaultProps: {},
  },
  {
    type: "SubmissionCountdown",
    title: "Đếm ngược nộp bài (Countdown)",
    category: "Header & Hero",
    description: "Thanh đếm ngược thời gian nộp bài Paper Submission April 08, 2027",
    defaultProps: {},
  },
  {
    type: "ConferenceHighlights",
    title: "Điểm nhấn hội nghị (Highlights)",
    category: "Nội dung",
    description: "Thống kê 68 chủ đề, 3 pillars, Scopus, IEEE Xplore indexing",
    defaultProps: {},
  },
  {
    type: "CallForPapers",
    title: "Thông báo nộp bài (Call for Papers)",
    category: "Nội dung",
    description: "Khối CFP với tải PDF, hướng dẫn tác giả và quy định hội nghị",
    defaultProps: {},
  },
  {
    type: "TracksExplorer",
    title: "3 Trụ cột & 68 Chủ đề (Tracks)",
    category: "Nội dung",
    description: "Hệ thống khám phá Systems, Cybernetics, Human-Machine Systems",
    defaultProps: {},
  },
  {
    type: "ImportantDates",
    title: "Mốc thời gian quan trọng (Timeline)",
    category: "Nội dung",
    description: "Lộ trình 9 mốc thời gian hội nghị với tính năng thêm Google Calendar",
    defaultProps: {},
  },
  {
    type: "About",
    title: "Giới thiệu hội nghị & IEEE SMC (About)",
    category: "Nội dung",
    description: "Giới thiệu HCMUTE và IEEE Systems, Man, and Cybernetics Society",
    defaultProps: {},
  },
  {
    type: "Committee",
    title: "Ban tổ chức (Organizing Committee)",
    category: "Tổ chức",
    description: "Danh sách General Chairs, Program Chairs và ban điều hành quốc tế",
    defaultProps: {},
  },
  {
    type: "Venue",
    title: "Địa điểm & Khách sạn (Venue)",
    category: "Địa điểm",
    description: "Khách sạn Sheraton Saigon Grand Opera Hotel và hướng dẫn du lịch",
    defaultProps: {},
  },
  {
    type: "FAQ",
    title: "Câu hỏi thường gặp (FAQ)",
    category: "Hỗ trợ",
    description: "Accordion giải đáp thắc mắc về visa, đăng ký và nộp bài",
    defaultProps: {},
  },
  {
    type: "Keynotes",
    title: "Diễn giả Plenary (Keynotes)",
    category: "Nội dung",
    description: "Khối thông báo các diễn giả chính uy tín toàn cầu",
    defaultProps: {},
  },
  {
    type: "Sponsors",
    title: "Nhà tài trợ & Đối tác (Sponsors)",
    category: "Đối tác",
    description: "Lưới logo các đơn vị tài trợ và đồng hành",
    defaultProps: {},
  },
  {
    type: "CustomHTML",
    title: "Khối HTML tùy chỉnh (Embed)",
    category: "Nâng cao",
    description: "Chèn mã HTML, iframe, video YouTube hoặc widget tùy ý",
    defaultProps: {
      content: "<div class='p-8 text-center bg-slate-100 rounded-lg'><h4>Khối HTML Tùy Chỉnh</h4><p>Nhập mã HTML vào bảng thuộc tính bên phải.</p></div>",
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
  id: number;
  slug: string;
  title: string;
  blocks: PageBlockItem[];
  is_published: boolean;
  updated_at: string;
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
      alert("Lỗi lưu trang vào Neon DB");
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
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setBlocks(next);
  };

  const updateBlockProps = (blockId: string, newProps: Record<string, unknown>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, props: newProps } : b))
    );
  };

  // Open Raw JSON modal
  const openJsonEditor = () => {
    setRawJsonText(JSON.stringify(blocks, null, 2));
    setJsonError(null);
    setJsonModalOpen(true);
  };

  // Apply Raw JSON
  const applyJsonData = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("Dữ liệu JSON của trang phải là một mảng [] các khối component");
      }
      setBlocks(parsed);
      setJsonModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "JSON cú pháp không hợp lệ";
      setJsonError(message);
    }
  };

  const renderBlockPreview = (block: PageBlockItem) => {
    if (block.hidden) {
      return (
        <div className="p-12 text-center bg-slate-100/70 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-semibold">
          Khối [{block.type}] đang bị ẩn trên trang công khai
        </div>
      );
    }

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
              __html: block.props?.content || "<p>Nội dung trống</p>",
            }}
          />
        );
      default:
        return (
          <div className="p-8 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
            Khối chưa định nghĩa: {block.type}
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
        <span>Đang tải giao diện kéo thả (Drag & Drop Canvas)...</span>
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
            title="Quay lại danh sách trang"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">
              {page?.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#115eff] font-mono">
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
            title="Xem màn hình Máy tính (Desktop 100%)"
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
            title="Xem màn hình Máy tính bảng (Tablet 768px)"
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
            title="Xem màn hình Điện thoại (Mobile 390px)"
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
            title="Xem hoặc dán trực tiếp mã JSON của trang"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            <span>Mã JSON trang</span>
          </button>

          <Link
            href={page?.slug === "home" ? "/" : `/${page?.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <span>Trang ngoài</span>
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
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? "Đang lưu..." : "Lưu trang"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Palette (Left), Canvas (Center), Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-125px)]">
        
        {/* Left Column: Component Palette (Khối giao diện) */}
        <div className="lg:col-span-3 bg-white border-r border-slate-200 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-125px)]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Layers className="w-4 h-4 text-[#115eff]" />
              <span>Kho Khối Giao Diện (Components)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Nhấn &ldquo;+ Thêm&rdquo; để đưa khối vào trang web
            </p>
          </div>

          {/* Search Palette */}
          <div>
            <input
              type="text"
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              placeholder="Tìm kiếm khối (Hero, FAQ, Tracks...)"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-[#115eff]"
            />
          </div>

          {/* Blocks List */}
          <div className="space-y-2.5">
            {filteredPalette.map((b) => (
              <div
                key={b.type}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all group flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#115eff] transition-colors">
                      {b.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
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
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-white hover:bg-[#115eff] text-slate-700 hover:text-white border border-slate-200 hover:border-[#115eff] text-xs font-bold rounded transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm khối</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Live Drag-and-Drop Canvas */}
        <div className="lg:col-span-6 bg-slate-200/60 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-125px)] flex flex-col items-center">
          
          <div
            className={cn(
              "w-full transition-all duration-300 space-y-6",
              viewport === "desktop" && "max-w-full",
              viewport === "tablet" && "max-w-[768px] shadow-2xl rounded-xl overflow-hidden bg-white",
              viewport === "mobile" && "max-w-[390px] shadow-2xl rounded-2xl overflow-hidden bg-white border-8 border-slate-800"
            )}
          >
            {blocks.length === 0 ? (
              <div className="p-16 text-center bg-white border-2 border-dashed border-slate-300 rounded-xl space-y-3">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">Trang chưa có khối nào</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chọn các khối từ bảng bên trái (ví dụ: Hero Carousel, Call for Papers, Timeline...) để bắt đầu thiết kế.
                </p>
              </div>
            ) : (
              blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={cn(
                      "relative group bg-white rounded-lg transition-all",
                      isSelected
                        ? "ring-2 ring-[#115eff] shadow-lg"
                        : "border border-slate-200 hover:border-slate-300 shadow-2xs"
                    )}
                  >
                    {/* Block Floating Control Strip */}
                    <div className="sticky top-2 z-30 px-3 py-1.5 mx-2 my-2 bg-slate-900/90 text-white rounded-md backdrop-blur-md flex items-center justify-between text-xs shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-100">
                          {AVAILABLE_BLOCKS.find((b) => b.type === block.type)?.title || block.type}
                        </span>
                        {block.hidden && (
                          <span className="text-[10px] bg-amber-500/80 px-1.5 py-0.5 rounded text-white font-bold">
                            Đang ẩn
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(index, "up");
                          }}
                          disabled={index === 0}
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                          title="Di chuyển lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(index, "down");
                          }}
                          disabled={index === blocks.length - 1}
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                          title="Di chuyển xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBlock(index);
                          }}
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                          title="Nhân bản khối"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHideBlock(index);
                          }}
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                          title={block.hidden ? "Hiện khối" : "Ẩn khối"}
                        >
                          {block.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBlock(index);
                          }}
                          className="p-1 text-rose-300 hover:text-rose-100 rounded hover:bg-rose-500/30 cursor-pointer"
                          title="Xóa khối khỏi trang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live Block Rendering Area */}
                    <div className="overflow-hidden">
                      {renderBlockPreview(block)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Properties Inspector (Bảng thuộc tính) */}
        <div className="lg:col-span-3 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-125px)]">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Sliders className="w-4 h-4 text-[#115eff]" />
              <span>Bảng Thuộc Tính (Inspector)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Chỉnh sửa tham số chi tiết của khối đang chọn
            </p>
          </div>

          {selectedBlock ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Khối được chọn
                </span>
                <div className="font-extrabold text-slate-900 text-sm">
                  {AVAILABLE_BLOCKS.find((b) => b.type === selectedBlock.type)?.title || selectedBlock.type}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  ID: {selectedBlock.id}
                </div>
              </div>

              {/* General Visibility Toggle */}
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Hiển thị khối</span>
                <input
                  type="checkbox"
                  checked={!selectedBlock.hidden}
                  onChange={() => toggleHideBlock(selectedBlockIndex)}
                  className="rounded text-[#115eff] focus:ring-blue-500"
                />
              </div>

              {/* Type Specific Form Inputs */}
              {selectedBlock.type === "HeroCarousel" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Thuộc tính Hero Carousel
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Thời gian tự chuyển slide (giây)
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
                      Hiển thị chữ đè lên ảnh (Overlay Text & Badge)
                    </label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedBlock.props?.showOverlayText ?? false)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          showOverlayText: e.target.checked,
                        })
                      }
                      className="rounded text-[#115eff] focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <label className="text-slate-600 text-xs">
                      Hiển thị bộ đếm thứ tự slide (Order Indicators)
                    </label>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedBlock.props?.showIndicators ?? false)}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          showIndicators: e.target.checked,
                        })
                      }
                      className="rounded text-[#115eff] focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {selectedBlock.type === "CustomHTML" && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Mã HTML / Nhúng
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
                    placeholder="<div>Nhập HTML ở đây...</div>"
                  />
                </div>
              )}

              {selectedBlock.type === "WelcomeLetter" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Thuộc tính Thư Chào Mừng
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Tiêu đề lớn (Headline)</label>
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
                    <label className="block text-slate-600 mb-1">Tiêu đề khối (Subtitle)</label>
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
                  <div>
                    <label className="block text-slate-600 mb-1">Lời chào</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.salutation ?? "Dear Colleagues & Honored Participants,")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          salutation: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Chủ đề (Theme)</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.theme ?? "Human-Centric Intelligence: Shaping the Digital Future")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          theme: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {selectedBlock.type === "NewsList" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Thuộc tính Tin Tức
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Tiêu đề</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "Conference News & Announcements")}
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
                    <label className="block text-slate-600 mb-1">Mô tả phụ</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.subtitle ?? "Stay updated with the latest milestones, partnership alerts, and program schedules")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {selectedBlock.type === "ConferenceVideo" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Thuộc tính Video Giới Thiệu
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Tiêu đề</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.title ?? "IEEE SMC 2027 Comes to Ho Chi Minh City")}
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
                    <label className="block text-slate-600 mb-1">Link Embed YouTube</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.videoUrl ?? "https://www.youtube.com/embed/I1UGApHrQKo?si=pJEHr9cVC0WN1JFF")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          videoUrl: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Tên khách sạn/địa điểm</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.venueName ?? "Sheraton Saigon Grand Opera Hotel")}
                      onChange={(e) =>
                        updateBlockProps(selectedBlock.id, {
                          ...selectedBlock.props,
                          venueName: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#115eff]"
                    />
                  </div>
                </div>
              )}

              {selectedBlock.type === "ContactCards" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block text-xs">
                    Thuộc tính Liên Hệ
                  </span>
                  <div>
                    <label className="block text-slate-600 mb-1">Email liên hệ</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.email ?? "smc2027@hcmute.edu.vn")}
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
                    <label className="block text-slate-600 mb-1">Địa điểm</label>
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
                    <label className="block text-slate-600 mb-1">Trang web</label>
                    <input
                      type="text"
                      value={String(selectedBlock.props?.website ?? "ieeesmc2027.hcmute.edu.vn")}
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
                  Thuộc tính Props (JSON)
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
                  <span>Nhân bản khối này</span>
                </button>

                <button
                  type="button"
                  onClick={() => removeBlock(selectedBlockIndex)}
                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa khối này</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Chọn một khối component trên canvas để xem và chỉnh sửa thuộc tính.
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
                  Mã JSON Toàn Trang (Full Page JSON Schema)
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
              Bạn có thể sao chép, chỉnh sửa hoặc dán cấu trúc JSON các khối component của trang này:
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
                  alert("Đã sao chép JSON vào clipboard!");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
              >
                Sao chép JSON
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJsonModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={applyJsonData}
                  className="px-5 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold rounded-md transition-colors shadow-2xs"
                >
                  Áp dụng JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
