"use client";

import React, { useState, useEffect } from "react";
import { Link2, Unlink, X, ExternalLink } from "lucide-react";

interface LinkModalProps {
  open: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialText?: string;
  hasSelection: boolean;
  onApply: (url: string, text?: string, openInNewTab?: boolean) => void;
  onUnlink?: () => void;
  isLinked?: boolean;
}

export function LinkModal({
  open,
  onClose,
  initialUrl = "",
  initialText = "",
  hasSelection,
  onApply,
  onUnlink,
  isLinked = false,
}: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    setUrl(initialUrl);
    setText(initialText);
  }, [initialUrl, initialText, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = url.trim();
    if (!finalUrl) return;

    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^tel:/i.test(finalUrl) && !finalUrl.startsWith("/")) {
      finalUrl = `https://${finalUrl}`;
    }

    onApply(finalUrl, !hasSelection ? text.trim() : undefined, openInNewTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="h-11 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-[#115eff]" />
            <h3 className="text-xs font-bold text-slate-800">
              {isLinked ? "Edit Link" : "Insert Link"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {!hasSelection && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Display Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Link text..."
                className="w-full h-8 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#115eff]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">
              Link URL
            </label>
            <input
              type="text"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full h-8 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#115eff]"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="rounded border-slate-300 text-[#115eff] focus:ring-[#115eff]"
            />
            <ExternalLink className="size-3 text-slate-400" />
            <span>Open link in new tab</span>
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isLinked && onUnlink ? (
              <button
                type="button"
                onClick={() => {
                  onUnlink();
                  onClose();
                }}
                className="h-8 px-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Unlink className="size-3.5" />
                <span>Remove Link</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!url.trim()}
                className="h-8 px-4 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                Save Link
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
