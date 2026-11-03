"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, User, Trash2 } from "lucide-react";
import type { AdminUserRecord } from "./proposed_users_page";

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserRecord | null;
  currentUserEmail?: string | null;
  onConfirm: (id: string) => Promise<void>;
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  currentUserEmail,
  onConfirm,
}: UserDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const isSelf = Boolean(
    currentUserEmail &&
      user.email.toLowerCase() === currentUserEmail.toLowerCase()
  );

  const handleConfirm = async () => {
    if (isSelf) return;
    setDeleting(true);
    try {
      await onConfirm(user.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-sans p-6 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="size-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed mt-1">
              {isSelf ? (
                <span className="text-rose-600 font-semibold">
                  You cannot delete your own active administrator account.
                </span>
              ) : (
                <span>
                  Are you sure you want to delete this user account? All associated
                  delegation records, session data, and preferences will be permanently removed.
                </span>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              unoptimized
              className="size-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="size-10 rounded-full bg-blue-50 text-[#115eff] font-bold text-xs flex items-center justify-center shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="h-8.5 px-3.5 text-xs rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={deleting || isSelf}
            className="h-8.5 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-none disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5 mr-1.5" />
                Delete Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
