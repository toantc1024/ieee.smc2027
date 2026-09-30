"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Sparkles,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Globe,
  Server,
  RefreshCw,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface OAuthSettings {
  clientId: string;
  hasSecret: boolean;
  maskedSecret: string;
  appUrl: string;
  isConfigured: boolean;
}

export default function AdminOAuthPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [appUrl, setAppUrl] = useState("http://localhost:3000");
  const [showSecret, setShowSecret] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasSecret, setHasSecret] = useState(false);

  // Dynamic Browser Origin detection
  const [currentOrigin, setCurrentOrigin] = useState("http://localhost:3002");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  // Fetch initial settings from API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/oauth");
      if (res.ok) {
        const data: OAuthSettings = await res.json();
        setClientId(data.clientId || "");
        setAppUrl(data.appUrl || window.location.origin || "http://localhost:3000");
        setIsConfigured(data.isConfigured);
        setHasSecret(data.hasSecret);
      }
    } catch (err) {
      console.error("Failed to load OAuth settings:", err);
      setErrorMessage("Không thể tải cấu hình OAuth hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          appUrl: appUrl.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(true);
        setIsConfigured(data.isConfigured);
        if (clientSecret) {
          setHasSecret(true);
          setClientSecret(""); // Clear secret input after successful save
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || "Lỗi khi lưu cấu hình.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ khi lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  // Compile lists of origins and redirect URIs
  const origins = Array.from(
    new Set([
      "http://localhost:3000",
      "http://localhost:3002",
      currentOrigin,
      appUrl,
    ].filter(Boolean))
  );

  const redirectUris = origins.map(
    (origin) => `${origin.replace(/\/$/, "")}/api/auth/callback/google`
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-lg bg-[#115eff]/10 text-[#115eff] flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004776] tracking-tight">
              OAuth 2.0 &amp; AI Agent Configuration
            </h1>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Cấu hình xác thực Google OAuth 2.0 Client IDs cho trình duyệt, máy chủ và AI-powered Agent.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Google OAuth: Hoạt động</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Chưa hoàn tất cài đặt</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. AI-Powered Agent Notice Box (Prominently featured) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-[#115eff] to-indigo-600 text-white p-6 sm:p-7 shadow-lg">
        {/* Decorative Grid & Blurred Orbs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold tracking-wide uppercase">
              <Bot className="w-4 h-4 text-amber-300" />
              <span>This client will be used by an AI-powered agent</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Tích hợp xác thực thông minh cho Autonomous Agent
            </h2>
            <p className="text-sm text-white/90 max-w-2xl leading-relaxed">
              Các thiết lập Authorized Origins và Redirect URIs bên dưới được tối ưu hóa để AI Agent có thể truy cập, quản lý nội dung và thực hiện các tác vụ tự động hóa an toàn.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-black/20 backdrop-blur-md border border-white/15 text-xs text-white/95">
            <Clock className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold">Thời gian có hiệu lực:</p>
              <p className="text-white/80">
                Note: It may take 5 minutes to a few hours for settings to take effect.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Credentials Copy Sections for Google Cloud Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box A: Authorized JavaScript origins */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#115eff]" />
                <h3 className="font-extrabold text-[#004776] text-base sm:text-lg">
                  Authorized JavaScript origins
                </h3>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Browser
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              For use with requests from a browser. Thêm vào mục <strong>URIs</strong> trong Google Cloud Console:
            </p>

            <div className="space-y-2.5">
              {origins.map((origin, idx) => (
                <div
                  key={origin}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-xs font-mono font-semibold text-slate-800 truncate">
                      {origin}
                    </span>
                    {origin === currentOrigin && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#115eff]/10 text-[#115eff] shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(origin, `origin-${idx}`)}
                    className="p-1.5 text-slate-500 hover:text-[#115eff] hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0"
                    title="Sao chép URI"
                  >
                    {copiedKey === `origin-${idx}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Sao chép tất cả origins:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(origins.join("\n"), "all-origins")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004776] font-bold rounded-md transition-colors cursor-pointer"
            >
              {copiedKey === "all-origins" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy tất cả</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Box B: Authorized redirect URIs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-[#004776] text-base sm:text-lg">
                  Authorized redirect URIs
                </h3>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Web Server
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              For use with requests from a web server. Google sẽ chuyển hướng người dùng về các endpoint này sau khi đăng nhập:
            </p>

            <div className="space-y-2.5">
              {redirectUris.map((uri, idx) => (
                <div
                  key={uri}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-xs font-mono font-semibold text-slate-800 truncate">
                      {uri}
                    </span>
                    {uri.includes(currentOrigin) && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(uri, `uri-${idx}`)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0"
                    title="Sao chép Redirect URI"
                  >
                    {copiedKey === `uri-${idx}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Sao chép tất cả redirect URIs:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(redirectUris.join("\n"), "all-uris")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004776] font-bold rounded-md transition-colors cursor-pointer"
            >
              {copiedKey === "all-uris" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy tất cả</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Credentials Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#004776]">
              Google OAuth 2.0 Credentials
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Nhập Client ID và Client Secret từ Google Cloud Console để kích hoạt đăng nhập tài khoản.
            </p>
          </div>

          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-blue-50 text-[#115eff] border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Cấu hình OAuth đã được lưu thành công vào cơ sở dữ liệu và đồng bộ vào file cấu hình hệ thống!
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Client ID */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Google Client ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ví dụ: 1234567890-abcdefg12345.apps.googleusercontent.com"
                className="w-full px-4 py-2.5 text-sm font-mono border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#115eff]/30 focus:border-[#115eff] transition-all"
              />
              {clientId && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(clientId, "clientIdInput")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                  title="Copy Client ID"
                >
                  {copiedKey === "clientIdInput" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Lấy từ mục <strong>Client ID</strong> trong Google Cloud Console sau khi tạo OAuth client.
            </p>
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Google Client Secret
              </label>
              {hasSecret && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã lưu Secret bảo mật trong hệ thống</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={hasSecret ? "•••••••••••••••••••• (Nhập nếu muốn đổi mới)" : "Ví dụ: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"}
                className="w-full px-4 py-2.5 pr-20 text-sm font-mono border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#115eff]/30 focus:border-[#115eff] transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSecret((s) => !s)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  title={showSecret ? "Ẩn" : "Hiện"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Khóa bí mật được mã hóa và lưu trữ an toàn. Không bao giờ để lộ Client Secret công khai.
            </p>
          </div>

          {/* App URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Application Public URL (NEXT_PUBLIC_APP_URL)
            </label>
            <input
              type="text"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="http://localhost:3000 hoặc https://your-domain.org"
              className="w-full px-4 py-2.5 text-sm font-mono border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#115eff]/30 focus:border-[#115eff] transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Địa chỉ gốc của trang web, dùng làm cơ sở để Google chuyển hướng sau khi đăng nhập thành công.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Chỉ quản trị viên cấp cao (ADMIN) mới có quyền truy cập trang này.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isConfigured && (
                <a
                  href="/api/auth/google"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Test Google Login</span>
                </a>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg shadow-[#115eff]/25 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 5. Visual Step-by-Step Instructions */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4">
        <h3 className="font-extrabold text-[#004776] text-base sm:text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#115eff]" />
          <span>Hướng dẫn 5 bước lấy Credentials trên Google Cloud Console</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Bước 1: Mở Google Cloud Console</span>
            <p className="text-slate-500">
              Truy cập <strong>APIs &amp; Services</strong> &gt; <strong>Credentials</strong> và chọn dự án của bạn (hoặc tạo dự án mới).
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Bước 2: Tạo OAuth Client ID</span>
            <p className="text-slate-500">
              Nhấn <strong>+ Create Credentials</strong> &gt; chọn <strong>OAuth client ID</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Bước 3: Chọn Application Type</span>
            <p className="text-slate-500">
              Chọn <strong>Web application</strong> và đặt tên client (ví dụ: <em>IEEE SMC 2027 Portal</em>).
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Bước 4: Dán Origins &amp; Redirect URIs</span>
            <p className="text-slate-500">
              Copy các giá trị ở 2 bảng bên trên và dán vào <strong>Authorized JavaScript origins</strong> và <strong>Authorized redirect URIs</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
