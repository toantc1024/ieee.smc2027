"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  EyeOff,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
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
import { toast } from "sonner";

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  onRefresh,
}: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBulkPublish = async (isPublished: boolean) => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) =>
          fetch(`/api/admin/pages/${id}/publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublished }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      toast.success(
        `${successful} of ${selectedIds.length} pages ${
          isPublished ? "published" : "set to draft"
        }`
      );
      onClearSelection();
      onRefresh();
    } catch {
      toast.error("Failed to update selected pages");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    setShowDeleteConfirm(false);
    try {
      const results = await Promise.allSettled(
        selectedIds.map(async (id) => {
          if (id === "home") return { ok: false, error: "Cannot delete home page" };
          const res = await fetch(`/api/admin/pages/${id}`, {
            method: "DELETE",
          });
          return res.ok;
        })
      );

      const successful = results.filter(
        (r) => r.status === "fulfilled" && (r.value as any) === true
      ).length;
      toast.success(`${successful} of ${selectedIds.length} pages deleted`);
      onClearSelection();
      onRefresh();
    } catch {
      toast.error("Failed to delete selected pages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/95 text-white shadow-xl backdrop-blur-md border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <span className="text-xs font-semibold text-slate-300 pl-2 pr-1 border-r border-slate-700 select-none">
          {selectedIds.length} selected
        </span>

        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleBulkPublish(true)}
          className="h-8 text-xs text-white hover:bg-slate-800 hover:text-white gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-blue-400" />
          )}
          Publish
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleBulkPublish(false)}
          className="h-8 text-xs text-white hover:bg-slate-800 hover:text-white gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          Draft
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => setShowDeleteConfirm(true)}
          className="h-8 text-xs text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          Delete
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="h-7 w-7 p-0 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              Delete {selectedIds.length} Selected Pages?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete these pages? Child sub-pages will be re-parented automatically. Note that the default Home page cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Pages"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
