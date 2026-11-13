"use client";

import { useCallback, useMemo, useState, type CSSProperties, type DragEvent } from "react";
import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { Fragment } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import {
  ChevronDown,
  Columns2,
  Columns3,
  Columns4,
  GripVertical,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isEditorReviewOnly } from "./node-view-utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LAYOUT_RATIOS_BY_COLS,
  clampRatio,
  getLayoutTemplate,
  sanitizeCustomTemplate,
  resizeLayoutContainer,
  type LayoutCols,
  type LayoutGap,
  type LayoutRatio,
} from "./layout-container-extension";
import { getNodeViewPosition } from "./node-view-utils";

/**
 * Container node view. Deliberately does NOT use BlockWrapper — this block
 * is its own visual island. Children rely on styles.css to be flattened into
 * direct grid items (via `display: contents` on the auto-injected
 * @tiptap/react wrapper) and to ignore their own BlockWrapper inline
 * max-width / float rules.
 */
const COL_OPTIONS: { value: LayoutCols; Icon: typeof Columns2; label: string }[] = [
  { value: 2, Icon: Columns2, label: "2 columns" },
  { value: 3, Icon: Columns3, label: "3 columns" },
  { value: 4, Icon: Columns4, label: "4 columns" },
];

const GAP_OPTIONS: { value: LayoutGap; label: string; tooltip: string }[] = [
  { value: "sm", label: "Small", tooltip: "Small gap (8px)" },
  { value: "md", label: "Medium", tooltip: "Medium gap (16px)" },
  { value: "lg", label: "Large", tooltip: "Large gap (28px)" },
];

const RATIO_LABELS: Record<LayoutRatio, { label: string; tooltip: string }> = {
  equal: { label: "Equal", tooltip: "Equal columns" },
  "2-1": { label: "2:1", tooltip: "Wider left column" },
  "1-2": { label: "1:2", tooltip: "Wider right column" },
  "3-1": { label: "3:1", tooltip: "Much wider left column" },
  "1-3": { label: "1:3", tooltip: "Much wider right column" },
  "3-2": { label: "3:2", tooltip: "Wider left column" },
  "2-3": { label: "2:3", tooltip: "Wider right column" },
  "2-1-1": { label: "2:1:1", tooltip: "Wider first column" },
  "1-2-1": { label: "Wide center", tooltip: "Wider center column" },
  "1-1-2": { label: "1:1:2", tooltip: "Wider last column" },
  "2-1-1-1": { label: "2:1:1:1", tooltip: "Wider first column" },
  "1-1-1-2": { label: "1:1:1:2", tooltip: "Wider last column" },
  custom: { label: "Custom", tooltip: "Set column proportions" },
};

function getDefaultCustomTemplate(cols: LayoutCols) {
  return Array.from({ length: cols }, () => "1fr").join(" ");
}

function templateToNumbers(template: string, cols: LayoutCols) {
  const sanitized = sanitizeCustomTemplate(template, cols) || getDefaultCustomTemplate(cols);
  return sanitized.split(" ").map((part) => Number(part.replace("fr", "")) || 1);
}

function RatioGridPreview({ ratio, cols, active }: { ratio: string; cols: number; active: boolean }) {
  if (ratio === "custom") {
    return (
      <div className={cn("text-[10px] font-medium leading-none tracking-tight", active ? "text-indigo-600" : "text-muted-foreground")}>
        Custom
      </div>
    );
  }

  let gridStyle = "";
  if (ratio === "equal") gridStyle = `repeat(${cols}, 1fr)`;
  else gridStyle = ratio.split("-").map((n) => `${n}fr`).join(" ");

  return (
    <div
      className={cn(
        "grid h-5 w-8 gap-[2px] rounded-[3px] p-[2px] transition-colors",
        active ? "bg-indigo-100" : "bg-muted group-hover:bg-muted-foreground/20"
      )}
      style={{ gridTemplateColumns: gridStyle }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-full rounded-[1px] transition-colors",
            active ? "bg-indigo-500" : "bg-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export default function LayoutContainerView({
  node,
  updateAttributes,
  deleteNode,
  getPos,
  editor,
  selected,
}: NodeViewProps) {
  const cols = (node.attrs.cols as LayoutCols) ?? 2;
  const gap = (node.attrs.gap as LayoutGap) ?? "md";
  const ratio = clampRatio(node.attrs.ratio, cols);
  const customTemplate = sanitizeCustomTemplate(node.attrs.customTemplate, cols);
  const layoutTemplate = getLayoutTemplate(cols, ratio, customTemplate);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const customValues = useMemo(
    () => templateToNumbers(customTemplate, cols),
    [cols, customTemplate],
  );
  const wrapperStyle = layoutTemplate
    ? ({ "--layout-template": layoutTemplate } as CSSProperties & Record<"--layout-template", string>)
    : undefined;

  const isReviewOnly = isEditorReviewOnly(editor);
  const isEditable = editor.isEditable && !isReviewOnly;

  const changeCols = useCallback(
    (next: LayoutCols) => {
      if (next === cols) return;
      const position = getNodeViewPosition(getPos);
      if (position === null) return;
      const replacement = resizeLayoutContainer(node, editor.state.schema, next);
      editor.view.dispatch(editor.state.tr.replaceWith(position, position + node.nodeSize, replacement).scrollIntoView());
    },
    [cols, editor, getPos, node],
  );

  const changeGap = useCallback(
    (next: LayoutGap) => updateAttributes({ gap: next }),
    [updateAttributes],
  );

  const changeRatio = useCallback(
    (next: LayoutRatio) => {
      const safeRatio = clampRatio(next, cols);
      updateAttributes({
        ratio: safeRatio,
        customTemplate:
          safeRatio === "custom" ? customTemplate || getDefaultCustomTemplate(cols) : "",
      });
    },
    [cols, customTemplate, updateAttributes],
  );

  const changeCustomValue = useCallback(
    (index: number, value: number) => {
      const next = [...customValues];
      next[index] = Math.max(1, Math.min(12, value || 1));
      updateAttributes({
        ratio: "custom",
        customTemplate: sanitizeCustomTemplate(next.join(" "), cols),
      });
    },
    [cols, customValues, updateAttributes],
  );

  const extractInnerBlocks = useCallback(() => {
    const pos = getNodeViewPosition(getPos);
    if (pos === null) return;

    const extracted = node.content.content.flatMap((column) =>
      column.type.name === "layoutColumn" ? column.content.content : [column],
    );
    const from = pos;
    const to = pos + node.nodeSize;
    const replacement = Fragment.fromArray(extracted);
    const tr = editor.state.tr.replaceWith(from, to, replacement).scrollIntoView();
    editor.view.dispatch(tr);
  }, [editor, getPos, node]);

  const deleteLayout = useCallback(() => {
    deleteNode();
  }, [deleteNode]);

  const handleHeaderDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const pos = getNodeViewPosition(getPos);
      if (pos === null || !event.dataTransfer) return;

      const selectedNode = editor.state.doc.nodeAt(pos);
      if (!selectedNode) return;

      editor.view.dispatch(
        editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)),
      );

      const dom = editor.view.nodeDOM(pos) as HTMLElement | null;
      if (dom) {
        event.dataTransfer.setDragImage(dom, 0, 0);
      }
      event.dataTransfer.effectAllowed = "move";
    },
    [editor, getPos],
  );

  return (
    <>
      <NodeViewWrapper
        data-type="layout-container"
        data-cols={String(cols)}
        data-gap={gap}
        data-ratio={ratio === "equal" ? undefined : ratio}
        data-custom-template={ratio === "custom" && customTemplate ? customTemplate : undefined}
        style={wrapperStyle}
        className={cn(
          "layout-container",
          selected && "layout-container--selected",
        )}
      >
        {isEditable && (
          <div
            data-drag-handle
            contentEditable={false}
            draggable
            onDragStart={handleHeaderDragStart}
            className="layout-container__header"
          >
            <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
            <LayoutGrid className="size-3.5 shrink-0 text-indigo-500" />
            <span className="layout-container__title">Layout</span>
            <div className="layout-container__spacer" />

            <label className="flex items-center gap-1 text-xs text-slate-600">Gap<select aria-label="Column gap" value={gap} onChange={(event) => changeGap(event.target.value as LayoutGap)} onMouseDown={(event) => event.stopPropagation()} className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs">{GAP_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  className="layout-container__trigger"
                  title="Columns"
                >
                  {(() => {
                    const Icon =
                      COL_OPTIONS.find((o) => o.value === cols)?.Icon ?? Columns2;
                    return <Icon className="size-3.5" />;
                  })()}
                  <span className="layout-container__trigger-value">{cols} columns</span>
                  <ChevronDown className="size-3 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={6}
                className="w-auto p-2"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="layout-container__popover-label">Columns</div>
                <div
                  className="layout-container__chips"
                  role="group"
                  aria-label="Columns"
                >
                  {COL_OPTIONS.map(({ value, Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => changeCols(value)}
                      aria-pressed={cols === value}
                      title={label}
                      className={cn(
                        "layout-container__chip",
                        cols === value && "layout-container__chip--active",
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span className="ml-1.5">{value}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  className="layout-container__trigger"
                  title="Column proportions"
                >
                  <span className="opacity-60">Proportions</span>
                  <span className="layout-container__trigger-value">
                    {RATIO_LABELS[ratio].label}
                  </span>
                  <ChevronDown className="size-3 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={6}
                className="w-56 p-2"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="layout-container__popover-label mb-2">Column proportions</div>
                <div
                  className="grid grid-cols-3 gap-1"
                  role="group"
                  aria-label="Column proportions"
                >
                  {LAYOUT_RATIOS_BY_COLS[cols].map((value) => {
                    const option = RATIO_LABELS[value];
                    const active = ratio === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => changeRatio(value)}
                        aria-pressed={active}
                        title={option.tooltip}
                        className={cn(
                          "group flex flex-col items-center justify-center gap-1.5 rounded-sm border p-2 transition-all",
                          active
                            ? "border-indigo-500 bg-indigo-50/50"
                            : "border-transparent bg-transparent hover:bg-muted"
                        )}
                      >
                        <RatioGridPreview ratio={value} cols={cols} active={active} />
                        <span className={cn(
                          "text-[10px] leading-none",
                          active ? "font-medium text-indigo-700" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {ratio === "custom" && (
                  <>
                    <div className="layout-container__popover-label mt-3 mb-1.5">
                      Custom proportions
                    </div>
                    <div
                      className="flex items-center gap-1.5"
                      role="group"
                      aria-label="Custom proportions"
                    >
                      {customValues.map((value, index) => (
                        <div key={index} className="relative flex-1">
                          <input
                            type="number"
                            min={1}
                            max={12}
                            step={0.5}
                            value={value}
                            onChange={(event) =>
                              changeCustomValue(index, Number(event.target.value))
                            }
                            onKeyDown={(event) => event.stopPropagation()}
                            className="flex h-7 w-full rounded-md border border-input bg-transparent px-2 py-1 text-center text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                            aria-label={`Column proportions ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 text-center text-[10px] text-muted-foreground">
                      (Units: relative fractions)
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="layout-container__delete"
              onClick={() => setShowDeleteDialog(true)}
              onMouseDown={(event) => event.stopPropagation()}
              title="Delete layout"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}

        <NodeViewContent className="layout-container__content" />
      </NodeViewWrapper>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete layout?</AlertDialogTitle>
            <AlertDialogDescription>
              Keep the content by moving it outside the layout, or delete the layout and its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="border border-slate-200/85 bg-white text-slate-700" onClick={extractInnerBlocks}>
              Keep content
            </AlertDialogAction>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={deleteLayout}>
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

