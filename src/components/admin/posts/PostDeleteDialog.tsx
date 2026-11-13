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
import { AlertCircle, Loader2 } from "lucide-react";

interface PostDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: { id: string; title: string } | null;
  onConfirm: (id: string) => Promise<void>;
}

export function PostDeleteDialog({
  open,
  onOpenChange,
  post,
  onConfirm,
}: PostDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!post) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(post.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-sans p-6 rounded-xl shadow-xl border border-slate-200">
        <DialogHeader className="space-y-3">
          <div className="size-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="size-5" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
            Confirm Post Deletion
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete the post{" "}
            <strong className="text-slate-900 font-semibold">
              &quot;{post.title}&quot;
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="h-9 px-4 text-xs sm:text-sm font-semibold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={deleting}
            className="h-9 px-4 text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
          >
            {deleting ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
