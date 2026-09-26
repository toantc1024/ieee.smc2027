"use client";

import React, { useState, useEffect } from "react";
import {
  PanelTop,
  Save,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { DEFAULT_HEADER_DATA, type HeaderConfig } from "@/lib/header-config";

export default function HeaderEditorPage() {
  const [data, setData] = useState<typeof DEFAULT_HEADER_DATA>(DEFAULT_HEADER_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/header")
      .then((res) => res.json())
      .then((res) => {
        if (res.header) {
          setData({
            ...DEFAULT_HEADER_DATA,
            ...res.header,
            topbar: { ...DEFAULT_HEADER_DATA.topbar, ...(res.header.topbar || {}) },
            brand: { ...DEFAULT_HEADER_DATA.brand, ...(res.header.brand || {}) },
            ctaButton: { ...DEFAULT_HEADER_DATA.ctaButton, ...(res.header.ctaButton || {}) },
            navLinks: res.header.navLinks || DEFAULT_HEADER_DATA.navLinks,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/admin/header", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert("Lỗi khi lưu Header vào Neon DB!");
    } finally {
      setSaving(false);
    }
  };

  const addNavLink = () => {
    const newItem = {
      id: String(Date.now()),
      name: "Menu Mới",
      href: "/#",
    };
    setData({
      ...data,
      navLinks: [...data.navLinks, newItem],
    });
  };

  const updateNavLink = (index: number, field: "name" | "href", val: string) => {
    const next = [...data.navLinks];
    next[index] = { ...next[index], [field]: val };
    setData({ ...data, navLinks: next });
  };

  const removeNavLink = (index: number) => {
    const next = data.navLinks.filter((_, i) => i !== index);
    setData({ ...data, navLinks: next });
  };

  const moveNavLink = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= data.navLinks.length) return;
    const next = [...data.navLinks];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setData({ ...data, navLinks: next });
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#115eff]" />
        <span>Đang tải cấu hình Header từ Neon Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#115eff] text-xs font-bold uppercase tracking-wider mb-1">
            <PanelTop className="w-3.5 h-3.5" />
            <span>Visual Header Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Chỉnh Sửa Thanh Điều Hướng (Header)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tùy biến thanh tiện ích, các liên kết điều hướng và nút Call-To-Action. Xem trước trực quan ở bên dưới.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Đã lưu thành công!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </>
          )}
        </button>
      </div>

      {/* Live Preview Canvas Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Eye className="w-4 h-4 text-[#115eff]" />
            <span>Xem trước trực tiếp (Live Header Preview)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tự động cập nhật theo thời gian thực khi chỉnh sửa
          </span>
        </div>

        {/* Live Header Render Box */}
        <div className="p-4 sm:p-6 bg-slate-100/50">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
            {/* Live Topbar */}
            {data.topbar.enabled && (
              <div className="bg-[#115eff] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-blue-100 font-medium">
                    <Phone className="w-3.5 h-3.5 text-blue-200" />
                    <span>{data.topbar.hotline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-100 font-medium">
                    <Mail className="w-3.5 h-3.5 text-blue-200" />
                    <span>{data.topbar.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-blue-100">
                  <span className="bg-white/15 px-2 py-0.5 rounded font-bold">
                    {data.topbar.hostBadgeText}
                  </span>
                  <span className="bg-white/15 px-2 py-0.5 rounded font-bold">
                    {data.topbar.societyBadgeText}
                  </span>
                </div>
              </div>
            )}

            {/* Live Navbar */}
            <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#115eff] text-white flex items-center justify-center font-bold text-xs">
                  SMC
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {data.brand.conferenceTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 hidden sm:block">
                    {data.brand.conferenceSubtitle}
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center gap-1">
                {data.navLinks.map((link) => (
                  <span
                    key={link.id}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#115eff] rounded-md transition-colors"
                  >
                    {link.name}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              {data.ctaButton.enabled && (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#115eff] text-white text-xs font-bold rounded-[0.26rem]">
                  <span>{data.ctaButton.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Navigation Links Manager */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Menu Điều Hướng Chính (Nav Links)
              </h2>
              <p className="text-xs text-slate-500">
                Sắp xếp và quản lý các mục liên kết xuất hiện trên thanh Navbar
              </p>
            </div>
            <button
              type="button"
              onClick={addNavLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#115eff] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mục</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.navLinks.map((link, idx) => (
              <div
                key={link.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => updateNavLink(idx, "name", e.target.value)}
                    className="w-36 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-[#115eff]"
                    placeholder="Tên menu"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateNavLink(idx, "href", e.target.value)}
                    className="w-44 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 font-mono focus:outline-none focus:border-[#115eff]"
                    placeholder="Đường dẫn (URL/#id)"
                  />
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => moveNavLink(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Lên trên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNavLink(idx, "down")}
                    disabled={idx === data.navLinks.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Xuống dưới"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNavLink(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Topbar & CTA Button Settings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Topbar Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Thanh Tiện Ích Trên Cùng (Topbar)
              </h2>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={data.topbar.enabled}
                  onChange={(e) =>
                    setData({
                      ...data,
                      topbar: { ...data.topbar, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#115eff] focus:ring-blue-500"
                />
                <span>Bật</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Số điện thoại Hotline
                </label>
                <input
                  type="text"
                  value={data.topbar.hotline}
                  onChange={(e) =>
                    setData({
                      ...data,
                      topbar: { ...data.topbar, hotline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Ban Thư Ký
                </label>
                <input
                  type="email"
                  value={data.topbar.email}
                  onChange={(e) =>
                    setData({
                      ...data,
                      topbar: { ...data.topbar, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Huy hiệu Đơn vị Đăng cai (Host Badge)
                </label>
                <input
                  type="text"
                  value={data.topbar.hostBadgeText}
                  onChange={(e) =>
                    setData({
                      ...data,
                      topbar: { ...data.topbar, hostBadgeText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>
            </div>
          </div>

          {/* Call-to-action Button */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Nút Hành Động Nổi Bật (CTA Button)
              </h2>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={data.ctaButton.enabled}
                  onChange={(e) =>
                    setData({
                      ...data,
                      ctaButton: { ...data.ctaButton, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#115eff] focus:ring-blue-500"
                />
                <span>Bật</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nhãn nút (Label)
                </label>
                <input
                  type="text"
                  value={data.ctaButton.label}
                  onChange={(e) =>
                    setData({
                      ...data,
                      ctaButton: { ...data.ctaButton, label: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Liên kết đích (URL)
                </label>
                <input
                  type="text"
                  value={data.ctaButton.href}
                  onChange={(e) =>
                    setData({
                      ...data,
                      ctaButton: { ...data.ctaButton, href: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
