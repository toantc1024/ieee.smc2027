import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidthBg?: string;
  hasSideBorders?: boolean;
  borderBottom?: boolean;
  borderColor?: string;
  id?: string;
}

/**
 * SectionContainer provides full-width section bands with content
 * strictly aligned to the site width.
 * Note: Continuous side borders are already provided globally by
 * body.page-border-x at --site-width (1280px). hasSideBorders is false
 * by default to prevent duplicate borders.
 */
export function SectionContainer({
  children,
  className = "",
  fullWidthBg = "bg-white",
  hasSideBorders = false,
  borderBottom = false,
  borderColor = "border-slate-200",
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`w-full ${fullWidthBg} relative ${
        borderBottom ? `border-b ${borderColor}` : ""
      }`}
    >
      <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)]">
        <div
          className={`w-full relative ${
            hasSideBorders ? `border-x ${borderColor}` : ""
          } ${className}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
