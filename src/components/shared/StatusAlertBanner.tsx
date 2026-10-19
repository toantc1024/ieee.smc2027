"use client";

import React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface StatusAlertBannerProps {
  variant: "error" | "success";
  message?: string | null;
  onDismiss?: () => void;
}

export function StatusAlertBanner({
  variant,
  message,
  onDismiss,
}: StatusAlertBannerProps) {
  if (!message) return null;

  const isError = variant === "error";

  return (
    <div
      className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
        isError
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isError ? (
          <AlertCircle className="size-4 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        )}
        <span>{message}</span>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100 cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
