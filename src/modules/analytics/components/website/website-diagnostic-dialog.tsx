"use client";

import React, { useState } from "react";
import { Stethoscope, CheckCircle, Copy, Globe, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WebsiteDetailDto } from "../../types";

interface WebsiteDiagnosticDialogProps {
  diagnostic: WebsiteDetailDto | null;
  onOpen: () => void;
}

export function WebsiteDiagnosticDialog({
  diagnostic,
  onOpen,
}: WebsiteDiagnosticDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (diagnostic?.id) {
      navigator.clipboard.writeText(diagnostic.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && onOpen()}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs rounded-xl bg-background hover:bg-muted border-border/70 font-medium gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Stethoscope className="size-3.5 text-blue-500" />
          <span className="hidden sm:inline">Diagnostic</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Stethoscope className="size-4" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Telemetry Diagnostic Status
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configuration parameters for the active telemetry tracker instance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="font-medium text-muted-foreground">Tracker Engine</span>
            <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle className="size-3 text-emerald-600" />
              <span>Operational</span>
            </Badge>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Website ID</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {copied ? <CheckCircle className="size-3" /> : <Copy className="size-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <code className="block p-2 rounded-lg bg-background border border-border/60 text-[11px] font-mono select-all truncate">
              {diagnostic?.id || "ieee-smc-2027-umami-prod"}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Globe className="size-3 text-blue-500" />
                Domain
              </span>
              <span className="font-semibold text-foreground truncate block">
                {diagnostic?.domain || "ieeesmc2027.org"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Calendar className="size-3 text-blue-500" />
                Created
              </span>
              <span className="font-semibold text-foreground truncate block">
                {diagnostic?.createdAt ? new Date(diagnostic.createdAt).toLocaleDateString() : "2026-01-01"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
