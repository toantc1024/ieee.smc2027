"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JsonCodeEditorModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  initialJson: Record<string, unknown>;
  saving?: boolean;
  onClose: () => void;
  onSave: (parsedJson: Record<string, unknown>) => Promise<void> | void;
}

export function JsonCodeEditorModal({
  open,
  title,
  subtitle,
  initialJson,
  saving = false,
  onClose,
  onSave,
}: JsonCodeEditorModalProps) {
  const [jsonText, setJsonText] = useState("{}");
  const [syntaxError, setSyntaxError] = useState("");

  useEffect(() => {
    if (open) {
      setJsonText(JSON.stringify(initialJson || {}, null, 2));
      setSyntaxError("");
    }
  }, [open, initialJson]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyntaxError("");
    try {
      const parsed = JSON.parse(jsonText || "{}");
      await onSave(parsed);
    } catch {
      setSyntaxError("Invalid JSON syntax. Please check keys and quotes.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Code2 className="size-5 text-[#115eff]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label>PostgreSQL JSONB Payload</Label>
            <Textarea
              rows={14}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="font-mono text-xs bg-slate-900 text-emerald-400"
            />
          </div>

          {syntaxError && (
            <p className="text-xs font-semibold text-red-600">{syntaxError}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="ute" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save JSON to PostgreSQL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
