"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ManagementPageHeaderProps {
  icon?: React.ReactNode;
  imageIcon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function ManagementPageHeader({
  icon,
  imageIcon,
  title,
  description,
  children,
  className,
  backgroundImage = "/assets/manage-dashboard-bg.jpg",
}: ManagementPageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white",
        className
      )}
    >
      {/* Background Banner Image */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[72%] bg-cover bg-right bg-no-repeat opacity-90"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />

      {/* Gradient Overlay for Crisp Readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/25 sm:w-[78%]" />

      {/* Header Content */}
      <div className="relative z-10 flex flex-col gap-4 p-5 sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {imageIcon ? (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50/70 p-1.5 border border-blue-100/80 shadow-2xs">
              <img
                src={imageIcon}
                alt=""
                className="size-full object-contain drop-shadow-xs"
              />
            </div>
          ) : icon ? (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/15">
              {icon}
            </div>
          ) : null}

          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#115eff] truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
