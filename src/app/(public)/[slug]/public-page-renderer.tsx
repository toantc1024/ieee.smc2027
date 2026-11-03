"use client";

import React from "react";
import type { PageBlock } from "@/modules/website-builder/types";
import { getBlockDefinition } from "@/modules/website-builder/registry";
import { BlockErrorBoundary } from "@/modules/website-builder/components/canvas/block-error-boundary";
import { cn } from "@/lib/utils";

interface PublicPageRendererProps {
  blocks: PageBlock[];
}

export function PublicPageRenderer({ blocks }: PublicPageRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col min-h-[50vh]">
      {blocks.map((block, idx) => {
        if (block.hidden) return null;

        const def = getBlockDefinition(block.type);
        const ComponentToRender = def?.render;
        const customStyles = (block.props?._styles || {}) as Record<string, string>;

        return (
          <section
            key={block.id || idx}
            id={block.id}
            className={cn(
              "w-full",
              customStyles.paddingTop,
              customStyles.paddingBottom,
              customStyles.className
            )}
            style={{
              backgroundColor: customStyles.backgroundColor || undefined,
              color: customStyles.textColor || undefined,
            }}
          >
            <BlockErrorBoundary blockType={block.type} blockId={block.id}>
              {ComponentToRender ? (
                <ComponentToRender {...block.props} />
              ) : (
                <div className="py-12 px-4 text-center text-slate-400 bg-slate-50 border-y border-slate-100">
                  <p className="text-sm">Section type: {block.type}</p>
                </div>
              )}
            </BlockErrorBoundary>
          </section>
        );
      })}
    </div>
  );
}
