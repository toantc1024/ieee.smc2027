"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export default function SubmissionsPage() {
  const submissionPortals = [
    {
      name: "PaperCept Conference Portal",
      system: "PaperCept",
      status: "Khuyên dùng (Official IEEE SMC)",
      badge: "Primary Portal",
      description: "Hệ thống nộp bài tiêu chuẩn của IEEE SMC Society. Tự động kiểm tra định dạng PDF eXpress, quản lý tác giả và phân bổ phản biện ẩn danh.",
      url: "https://ras.papercept.net",
      primary: true,
    },
    {
      name: "EDAS Conference Management",
      system: "EDAS",
      status: "Dự phòng",
      badge: "Mirror Portal",
      description: "Cổng nộp bài quốc tế tích hợp phân ban chuyên môn và theo dõi trạng thái phản biện của ban biên tập.",
      url: "https://edas.info",
      primary: false,
    },
    {
      name: "Microsoft CMT / B-Young System",
      system: "CMT / B-Young",
      status: "Hỗ trợ đại biểu khu vực",
      badge: "Regional Access",
      description: "Hệ thống hỗ trợ nộp bài và tương tác chuyên đề dành cho các phiên đặc biệt (Special Sessions) và đại biểu khu vực châu Á.",
      url: "https://cmt3.research.microsoft.com",
      primary: false,
    },
  ];

  const milestones = [
    {
      date: "April 08, 2027",
      event: "Hạn chót Nộp Bản thảo Toàn văn (Regular & Special Sessions)",
      status: "Upcoming",
    },
    {
      date: "June 15, 2027",
      event: "Thông báo Kết quả Phản biện (Acceptance Notification)",
      status: "Upcoming",
    },
    {
      date: "July 20, 2027",
      event: "Hạn chót Nộp Bản in Sẵn sàng (Camera-ready Submission)",
      status: "Upcoming",
    },
    {
      date: "August 10, 2027",
      event: "Hạn chót Đăng ký Tác giả (Author Registration Deadline)",
      status: "Upcoming",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="submissions-header" fullWidthBg="bg-white" className="py-10 sm:py-14">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#115eff] border border-blue-100">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Call For Papers & Submission Portals</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Cổng Nộp Bài & <span className="text-[#115eff]">Hướng Dẫn Tác Giả</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Hướng dẫn quy chuẩn định dạng bài báo IEEE 2 cột, tài liệu biểu mẫu LaTeX/Word và các liên kết chuyển hướng nộp bài trực tuyến qua PaperCept, EDAS và B-Young.
            </p>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="submissions-body" fullWidthBg="transparent" className="pt-8">
        <div className="space-y-10">
          {/* 1. Portals Grid */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              1. Cổng Nộp Bài Trực Tuyến
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Các bài báo nộp vào IEEE SMC 2027 phải là công trình nghiên cứu nguyên bản, chưa từng xuất bản ở bất kỳ hội nghị hoặc tạp chí nào khác.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {submissionPortals.map((portal, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl border-2 p-6 sm:p-7 flex flex-col justify-between transition-all ${
                    portal.primary
                      ? "border-[#115eff] shadow-lg ring-4 ring-blue-50"
                      : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          portal.primary
                            ? "bg-blue-100 text-[#115eff]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {portal.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{portal.system}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {portal.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      {portal.description}
                    </p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      portal.primary
                        ? "bg-[#115eff] text-white hover:bg-[#0a4de6] shadow-md"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <span>Truy Cập Cổng {portal.system}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Manuscript Templates & Requirements */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              2. Định Dạng Bản Thảo & Biểu Mẫu (Templates)
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Tất cả các bài báo gửi đến hội nghị phải tuân thủ nghiêm ngặt định dạng chuẩn của IEEE (Letter format, 2 cột).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LaTeX Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#115eff] flex items-center justify-center font-black">
                      TeX
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        LaTeX Conference Template
                      </h4>
                      <span className="text-xs text-slate-500">IEEEtran.cls format</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Gói mẫu định dạng chuẩn LaTeX bao gồm cấu trúc file mẫu, thư mục style và hướng dẫn biên dịch với BibTeX.
                  </p>
                </div>

                <a
                  href="https://www.ieee.org/conferences/publishing/templates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#115eff] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải gói mẫu LaTeX (ZIP từ IEEE)</span>
                </a>
              </div>

              {/* Word Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      DOC
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Microsoft Word Template
                      </h4>
                      <span className="text-xs text-slate-500">.DOCX (US Letter)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Tệp mẫu Microsoft Word 2 cột chuẩn hóa tiêu chuẩn font, lề, tiêu đề và trích dẫn theo đúng hướng dẫn của IEEE.
                  </p>
                </div>

                <a
                  href="https://www.ieee.org/conferences/publishing/templates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#115eff] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp mẫu Word (.docx)</span>
                </a>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Checklist kiểm tra trước khi nộp bài:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Độ dài tối đa 6 trang (bao gồm hình ảnh, bảng biểu và tài liệu tham khảo).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Quy trình phản biện ẩn danh (Double-blind hoặc Single-blind theo từng track).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tất cả file PDF phải vượt qua kiểm tra chuẩn IEEE PDF eXpress trước khi nộp bản cuối.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ít nhất 1 tác giả phải đăng ký tham dự (Author Registration) để bài báo được đưa vào Kỷ yếu.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Important Dates */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              3. Mốc Thời Gian Quan Trọng
            </h2>
            <div className="mt-6 space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#115eff] shrink-0" />
                    <span className="text-sm font-bold text-slate-900">{m.event}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#115eff] bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
                    {m.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}
