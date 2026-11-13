"use client";

import React from "react";
import type { PageBlock } from "@/modules/website-builder/types";
import { getBlockDefinition } from "@/modules/website-builder/registry";
import { BlockErrorBoundary } from "@/modules/website-builder/components/canvas/block-error-boundary";
import { cn } from "@/lib/utils";
import { getBlockPresentation, isBlockHidden } from "@/modules/website-builder/utils/block-presentation";
import { PublicNestedBlock } from "@/modules/website-builder/components/canvas/columns-slot";

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
        if (isBlockHidden(block)) return null;

        const def = getBlockDefinition(block.type);
        const ComponentToRender = def?.render;
        const presentation = getBlockPresentation(block);

        return (
          <section
            key={block.id || idx}
            id={block.id}
            className={cn(
              "w-full",
              presentation.className
            )}
            style={presentation.style}
          >
            <BlockErrorBoundary blockType={block.type} blockId={block.id}>
              {ComponentToRender ? (
                <ComponentToRender {...block.props} {...(block.type === "ColumnsSlot" ? { builderBlockId: block.id, builderEditing: false } : {})}>{block.children?.map((child) => <PublicNestedBlock key={child.id} block={child} />)}</ComponentToRender>
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
