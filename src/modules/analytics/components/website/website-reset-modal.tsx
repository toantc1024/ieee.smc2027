"use client";

import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface WebsiteResetModalProps {
  onReset: () => Promise<boolean>;
  isResetting: boolean;
}

export function WebsiteResetModal({
  onReset,
  isResetting,
}: WebsiteResetModalProps) {
  const handleConfirmReset = async () => {
    try {
      await onReset();
      toast.success("Telemetry cache refreshed successfully");
    } catch {
      toast.error("Failed to reset telemetry cache");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isResetting}
          className="h-9 px-3 text-xs rounded-xl bg-background hover:bg-muted border-border/70 text-red-600 dark:text-red-400 font-medium gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1 text-red-600">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="size-4" />
            </div>
            <AlertDialogTitle className="text-base font-semibold">
              Reset Telemetry Data
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            This action will clear temporary in-memory telemetry records and reload fresh analytics metrics from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmReset}
            className="text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isResetting ? "Resetting..." : "Confirm Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
