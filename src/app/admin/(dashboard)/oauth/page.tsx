"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  Bot,
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
      setErrorMessage("Unable to load current OAuth configuration.");
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
        setErrorMessage(data.error || "Failed to save OAuth configuration.");
      }
    } catch {
      setErrorMessage("Server connection error while saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Compile lists of origins and redirect URIs
  const origins = Array.from(
    new Set([
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
      "https://ieee-smc2027.org",
      "https://www.ieee-smc2027.org",
      "https://smc2027.hcmute.edu.vn",
      "https://ieee-smc2027.vercel.app",
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
            Configure Google OAuth 2.0 Client IDs for browser clients, web servers, and automated agents.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Google OAuth: Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Setup Incomplete</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. AI-Powered Agent Notice Box */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white p-5 sm:p-6 shadow-xs border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold tracking-wide uppercase">
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Autonomous Agent Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Authentication Integration for Autonomous Agents
            </h2>
            <p className="text-sm text-white/90 max-w-2xl leading-relaxed">
              The Authorized Origins and Redirect URIs below are pre-configured so authorized administrators and automated workflows can securely authenticate across environments.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-black/20 backdrop-blur-md border border-white/15 text-xs text-white/95">
            <Clock className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold">Propagation Time:</p>
              <p className="text-white/80">
                It may take 5 minutes to a few hours for Google Cloud changes to take effect.
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
                  Authorized JavaScript Origins
                </h3>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Browser
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              For use with requests from a browser. Add these under <strong>URIs</strong> in Google Cloud Console:
            </p>

            <div className="space-y-2.5">
              {origins.map((origin, idx) => (
                <div
                  key={origin}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-xs font-medium text-slate-800 truncate">
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
                    title="Copy URI"
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
            <span className="text-slate-500 font-medium">Copy all origins:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(origins.join("\n"), "all-origins")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004776] font-bold rounded-md transition-colors cursor-pointer"
            >
              {copiedKey === "all-origins" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
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
                  Authorized Redirect URIs
                </h3>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Web Server
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              For use with requests from a web server. Google redirects users to these callback endpoints after sign-in:
            </p>

            <div className="space-y-2.5">
              {redirectUris.map((uri, idx) => (
                <div
                  key={uri}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-xs font-medium text-slate-800 truncate">
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
                    title="Copy Redirect URI"
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
            <span className="text-slate-500 font-medium">Copy all redirect URIs:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(redirectUris.join("\n"), "all-uris")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004776] font-bold rounded-md transition-colors cursor-pointer"
            >
              {copiedKey === "all-uris" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
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
              Enter your Client ID and Client Secret from Google Cloud Console to enable Google Sign-In.
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
              OAuth configuration saved to database and synchronized with system environment settings!
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
                placeholder="e.g. 1234567890-abcdefg12345.apps.googleusercontent.com"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#115eff]/30 focus:border-[#115eff] transition-all"
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
              Retrieved from the <strong>Client ID</strong> field in Google Cloud Console after creating your OAuth client.
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
                  <span>Secret securely stored in system</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={hasSecret ? "••••••••••••••••••••" : "e.g. GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"}
                className="w-full px-4 py-2.5 pr-20 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#115eff]/30 focus:border-[#115eff] transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSecret((s) => !s)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  title={showSecret ? "Hide" : "Show"}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Leave blank to keep the existing secret. Never expose your Client Secret publicly.
            </p>
          </div>

          {/* App URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Application Public URL
            </label>
            <input
              type="text"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://smc2027.hcmute.edu.vn"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#115eff]/30 focus:border-[#115eff] transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Base URL of the website used by Google to redirect users after authentication.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Only administrators have permission to modify these settings.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isConfigured && (
                <a
                  href="/api/auth/google"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 text-[#115eff]" />
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
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
          <span>Setup Guide for Google Cloud Console Credentials</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Step 1: Open Google Cloud Console</span>
            <p className="text-slate-500">
              Navigate to <strong>APIs &amp; Services</strong> &gt; <strong>Credentials</strong> and select or create your project.
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Step 2: Create OAuth Client ID</span>
            <p className="text-slate-500">
              Click <strong>+ Create Credentials</strong> and select <strong>OAuth client ID</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Step 3: Select Application Type</span>
            <p className="text-slate-500">
              Choose <strong>Web application</strong> and enter a client name such as <em>IEEE SMC 2027 Portal</em>.
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#115eff]">Step 4: Add Origins &amp; Redirect URIs</span>
            <p className="text-slate-500">
              Copy the values from the two panels above into <strong>Authorized JavaScript origins</strong> and <strong>Authorized redirect URIs</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
