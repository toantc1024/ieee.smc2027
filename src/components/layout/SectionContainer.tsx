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
 * strictly aligned to the two side borders.
 */
export function SectionContainer({
  children,
  className = "",
  fullWidthBg = "bg-white",
  hasSideBorders = true,
  borderBottom = true,
  borderColor = "border-[#ccd7e2]",
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`w-full ${fullWidthBg} relative`}
    >
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
        <div
          className={`w-full relative ${
            hasSideBorders ? `border-x ${borderColor}` : ""
          } ${borderBottom ? `border-b ${borderColor}` : ""} ${className}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
