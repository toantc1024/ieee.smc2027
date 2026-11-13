"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  FileCode,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBuilderStore } from "../../store/builder-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PageHistoryItem {
  id: string;
  version: number;
  content: any;
  changeSummary?: string;
  createdAt?: string;
  created_at?: string;
}

export function PageHistoryView() {
  const { pageId, pageVersion, data, initPage } = useBuilderStore();
  const [histories, setHistories] = useState<PageHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [confirmVersion, setConfirmVersion] = useState<number | null>(null);

  const fetchHistories = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      const json = await res.json();
      if (res.ok && json.page?.histories) {
        setHistories(json.page.histories);
        if (json.page.histories.length > 0) {
          setSelectedVersion(json.page.histories[0].version);
        }
      }
    } catch {
      toast.error("Failed to load revision history");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  const activeHistory = histories.find((h) => h.version === selectedVersion);

  const handleRollback = async () => {
    if (!pageId || confirmVersion === null) return;
    const targetVer = confirmVersion;
    setConfirmVersion(null);
    setRollingBack(true);

    try {
      const res = await fetch(`/api/admin/pages/${pageId}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: targetVer }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Rollback failed");

      toast.success(`Successfully restored to revision v${targetVer}`);
      if (json.page) {
        initPage({
          id: json.page.id,
          title: json.page.title,
          slug: json.page.slug,
          parentId: json.page.parentId,
          version: json.page.version,
          isPublished: json.page.isPublished,
          content: json.page.content,
          blocks: json.page.blocks,
        });
      }
      fetchHistories();
    } catch (err: any) {
      toast.error(err.message || "Failed to restore revision");
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50 select-none">
      {/* Left Column: Revision Timeline List (320px) */}
      <div className="w-full md:w-80 border-r border-slate-200/75 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Revisions Timeline</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Current: v{pageVersion}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div role="status" aria-label="Loading history" className="space-y-2.5 p-1">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200/75 space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : histories.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 italic">
              No historical revisions found yet.
            </p>
          ) : (
            histories.map((h) => {
              const isSelected = selectedVersion === h.version;
              const isCurrent = h.version === pageVersion;
              const createdDate = h.createdAt || h.created_at;

              return (
                <button
                  key={h.id || h.version}
                  type="button"
                  onClick={() => setSelectedVersion(h.version)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all relative flex flex-col gap-1",
                    isSelected
                      ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-xs"
                      : "bg-white border-slate-200/75 hover:border-slate-300/80 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Revision v{h.version}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {createdDate ? new Date(createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {h.changeSummary || "Snapshot"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Historical Content & Diff Inspector */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/75 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-9 w-36 rounded-lg shrink-0" />
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/75 space-y-3">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        ) : activeHistory ? (
          <>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/75 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600">
                  Revision Snapshot v{activeHistory.version}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeHistory.changeSummary || "Page Revision"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Created:{" "}
                    {activeHistory.createdAt || activeHistory.created_at
                      ? new Date(activeHistory.createdAt || activeHistory.created_at!).toLocaleString()
                      : "Unknown date"}
                  </span>
                </p>
              </div>

              {activeHistory.version !== pageVersion && (
                <Button
                  size="sm"
                  onClick={() => setConfirmVersion(activeHistory.version)}
                  disabled={rollingBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0 shadow-sm"
                >
                  {rollingBack ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  Restore This Revision
                </Button>
              )}
            </div>

            {/* AST Comparison View */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/75 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Historical AST Snapshot Payload</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-[500px]">
                {JSON.stringify(activeHistory.content, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Select a revision from the timeline to inspect.</p>
          </div>
        )}
      </div>

      {/* Rollback Confirmation Dialog */}
      <AlertDialog
        open={confirmVersion !== null}
        onOpenChange={(open) => !open && setConfirmVersion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-600">
              <RotateCcw className="w-5 h-5" />
              Restore Revision v{confirmVersion}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Restoring will revert your page's section blocks and metadata to the exact state saved in Revision v{confirmVersion}. A new version will be created to preserve your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rollingBack}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRollback}
              disabled={rollingBack}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {rollingBack ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Restoring...
                </>
              ) : (
                "Confirm Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
