"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ManagementPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  imageIcon?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  backgroundImage?: string;
  hideBg?: boolean;
}

export function ManagementPageHeader({
  title,
  description,
  icon,
  imageIcon,
  children,
  actions,
  className,
  backgroundImage,
  hideBg = false,
}: ManagementPageHeaderProps) {
  const contentActions = actions || children;

  if (hideBg) {
    return (
      <div
        className={cn(
          "relative bg-white rounded-2xl border border-slate-200 p-5 sm:p-6",
          className
        )}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            {imageIcon ? (
              <div className="relative size-12 sm:size-14 shrink-0 select-none">
                <img
                  src={imageIcon}
                  alt=""
                  className="size-full object-contain"
                />
              </div>
            ) : icon ? (
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#115eff] text-white">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight truncate">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 max-w-2xl line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          {contentActions && (
            <div className="w-full xl:w-auto min-w-0 flex items-center justify-start xl:justify-end gap-2.5">
              {contentActions}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[#03142e] text-white border border-slate-800 py-4.5 px-5 sm:px-6 lg:px-7 min-h-[108px] sm:min-h-[114px] flex items-center justify-between gap-4",
        className
      )}
    >
      {/* Background Graphic Pattern */}
      <div className="absolute inset-0 pointer-events-none select-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />
      {backgroundImage && (
        <div
          className="absolute inset-0 select-none pointer-events-none opacity-20 bg-cover bg-right"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {imageIcon ? (
            <div className="relative size-12 sm:size-14 shrink-0 select-none">
              <img
                src={imageIcon}
                alt=""
                className="size-full object-contain"
              />
            </div>
          ) : icon ? (
            <div className="grid size-11 sm:size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-white border border-white/20">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {contentActions && (
          <div className="w-full xl:w-auto min-w-0 relative z-10 flex items-center justify-start xl:justify-end gap-2.5">
            {contentActions}
          </div>
        )}
      </div>
    </div>
  );
}

