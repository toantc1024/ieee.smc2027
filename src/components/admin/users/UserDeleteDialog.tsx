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
import { AlertTriangle, Loader2 } from "lucide-react";
import type { AdminUserRecord } from "./EditUserModal";

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserRecord | null;
  onConfirm: (id: string) => Promise<void>;
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UserDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
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
      <DialogContent className="max-w-md font-sans p-6">
        <DialogHeader className="space-y-3">
          <div className="size-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">
            Xác nhận xóa tài khoản
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa tài khoản của{" "}
            <strong className="text-slate-900 font-semibold">
              {user.name} ({user.email})
            </strong>
            ? Hành động này sẽ gỡ tài khoản vĩnh viễn khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="h-8.5 px-3.5 text-xs"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={deleting}
            className="h-8.5 px-4 text-xs bg-rose-600 hover:bg-rose-700 text-white"
          >
            {deleting ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa tài khoản"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
