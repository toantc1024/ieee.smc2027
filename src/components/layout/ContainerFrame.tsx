import React from "react";

interface ContainerFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ContainerFrame provides the core structural layout matching HCMUTE design:
 * - Centered max-width container with responsive horizontal padding
 * - Clean white card background with subtle borders and shadow
 */
export function ContainerFrame({
  children,
  className = "",
}: ContainerFrameProps) {
  return (
    <div className="w-full relative min-h-screen bg-slate-50/40">
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className={`bg-white border-x border-[#ccd7e2] shadow-xs relative ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
