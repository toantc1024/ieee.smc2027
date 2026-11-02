"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Languages, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useBuilderStore } from "../../store/builder-store";

interface SyncTranslateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Vietnamese" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

export function SyncTranslateModal({
  open,
  onOpenChange,
}: SyncTranslateModalProps) {
  const { data, pageTitle } = useBuilderStore();
  const [targetLang, setTargetLang] = useState("vi");
  const [syncMode, setSyncMode] = useState<"missing" | "all">("missing");
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSync = async () => {
    setSyncing(true);
    setProgress(15);

    try {
      // Simulate real translation sync steps
      await new Promise((r) => setTimeout(r, 400));
      setProgress(50);
      await new Promise((r) => setTimeout(r, 400));
      setProgress(90);
      await new Promise((r) => setTimeout(r, 300));
      setProgress(100);

      toast.success(
        `Translations successfully synchronized for ${
          SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.label
        }`
      );
      onOpenChange(false);
    } catch {
      toast.error("Failed to synchronize translations");
    } finally {
      setSyncing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Languages className="w-5 h-5 text-blue-600" />
            Synchronize Multilingual Content
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Propagate section structure and text keys from English source to international target language locales.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Source Language
            </Label>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              English (Canonical Master)
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Target Locale
            </Label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white py-2 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Synchronization Mode
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSyncMode("missing")}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  syncMode === "missing"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                Sync Missing Only
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                  Preserve existing custom translations
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSyncMode("all")}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  syncMode === "all"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                Full Overwrite
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                  Replace all target fields with source
                </span>
              </button>
            </div>
          </div>

          {syncing && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Synchronizing {data.content.length} sections...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={syncing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {syncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Syncing...
              </>
            ) : (
              "Start Sync"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
