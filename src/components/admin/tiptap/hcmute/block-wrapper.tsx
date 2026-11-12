"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  GripVertical,
  Settings,
  Trash2,
  AlignCenter,
  PanelLeft,
  PanelRight,
  AlignHorizontalDistributeCenter,
  Maximize2,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import type { BlockLayout } from "./block-layout";
import {
  getBlockLayoutWrapperClasses,
  getBlockLayoutWrapperStyle,
  parseHeightPx,
  parseWidthPct,
} from "./block-layout";
import { scrollBlockIntoView } from "./node-view-utils";

const MIN_RESIZE_WIDTH_PCT = 20;
const MIN_RESIZE_HEIGHT_PX = 120;

const LAYOUT_OPTIONS: {
  value: BlockLayout;
  icon: typeof AlignCenter;
  label: string;
}[] = [
  { value: "block", icon: AlignCenter, label: "In line" },
  { value: "wrap-left", icon: PanelLeft, label: "Wrap left" },
  { value: "wrap-right", icon: PanelRight, label: "Wrap right" },
  { value: "half-left", icon: LayoutGrid, label: "Left half" },
  { value: "half-right", icon: LayoutGrid, label: "Right half" },
  { value: "wide", icon: AlignHorizontalDistributeCenter, label: "Wide" },
  { value: "full", icon: Maximize2, label: "Full width" },
];

export interface BlockWrapperProps {
  /** Block content */
  children: ReactNode;
  /** Whether the node is selected in the editor */
  selected?: boolean;
  /** Icon element shown in the header */
  icon: ReactNode;
  /** Block type label */
  label: string;
  /** Whether the editor is in editable mode */
  editable?: boolean;
  /** Callback to delete this block */
  onDelete?: () => void;
  /** Whether settings panel is visible */
  showSettings?: boolean;
  /** Toggle settings panel visibility */
  onToggleSettings?: () => void;
  /** Save callback (e.g. on Enter key or explicit save) */
  onSave?: () => void;
  /** Current caption value */
  captionValue?: string;
  /** Caption change handler */
  onCaptionChange?: (value: string) => void;
  /** Merged caption + photo credit display string */
  mergedCaption?: string;
  /** Block-specific settings content (rendered below caption input) */
  settingsPanel?: ReactNode;
  /** Extra action buttons for the header */
  headerActions?: ReactNode;
  /** data-type attribute on the wrapper */
  dataType: string;
  /** Extra CSS classes for the NodeViewWrapper (e.g., layout classes) */
  wrapperClassName?: string;
  /** Extra inline styles for the NodeViewWrapper */
  wrapperStyle?: React.CSSProperties;
  /** Current layout value (enables layout controls when provided) */
  layout?: BlockLayout;
  /** Current block width string e.g. "50%" */
  blockWidth?: string;
  /** Current block min-height string e.g. "240px" */
  blockHeight?: string | null;
  /** Current alignment */
  align?: "left" | "center" | "right";
  /** Callback to update alignment */
  onAlignChange?: (align: "left" | "center" | "right") => void;
  /** Callback to update layout + width */
  onLayoutChange?: (layout: BlockLayout, blockWidth: string) => void;
  /** Callback to update min-height */
  onHeightChange?: (blockHeight: string | null) => void;
}

export function BlockWrapper({
  children,
  selected,
  icon,
  label,
  editable = true,
  onDelete,
  showSettings,
  onToggleSettings,
  onSave,
  captionValue,
  onCaptionChange,
  mergedCaption,
  settingsPanel,
  headerActions,
  dataType,
  wrapperClassName,
  wrapperStyle,
  layout,
  blockWidth,
  blockHeight,
  align = "center",
  onLayoutChange,
  onHeightChange,
}: BlockWrapperProps) {
  const captionRef = useRef<HTMLInputElement>(null);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const layoutPickerRef = useRef<HTMLDivElement>(null);
  const resizeContainerRef = useRef<HTMLDivElement>(null);

  const prevShowSettingsRef = useRef(showSettings);

  useEffect(() => {
    // When settings panel was open and is now closed/saved, ensure the block stays comfortably in-view
    if (prevShowSettingsRef.current && !showSettings) {
      const el =
        resizeContainerRef.current?.closest<HTMLElement>("[data-node-view-wrapper]") ||
        resizeContainerRef.current;
      if (el) {
        let timerId: ReturnType<typeof setTimeout>;
        const rafId = requestAnimationFrame(() => {
          timerId = setTimeout(() => {
            scrollBlockIntoView(el);
          }, 35);
        });
        return () => {
          cancelAnimationFrame(rafId);
          clearTimeout(timerId);
        };
      }
    }
    prevShowSettingsRef.current = showSettings;
  }, [showSettings]);

  const handleCaptionDoubleClick = useCallback(() => {
    if (onToggleSettings && !showSettings) {
      onToggleSettings();
      setTimeout(() => captionRef.current?.focus(), 50);
    }
  }, [onToggleSettings, showSettings]);

  const effectiveLayout = layout || "block";
  const widthPct = parseWidthPct(blockWidth);
  const heightPx = parseHeightPx(blockHeight);
  const layoutClasses = onLayoutChange
    ? getBlockLayoutWrapperClasses(effectiveLayout)
    : "";
  const layoutStyle = onLayoutChange
    ? getBlockLayoutWrapperStyle(effectiveLayout, widthPct, align)
    : undefined;

  const [isWidthResizing, setIsWidthResizing] = useState(false);
  const [isHeightResizing, setIsHeightResizing] = useState(false);
  const [resizeWidth, setResizeWidth] = useState<number | null>(null);
  const [resizeHeight, setResizeHeight] = useState<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);
  const containerWidthRef = useRef(0);
  const sideRef = useRef<"left" | "right">("right");

  const isFullOrWide = effectiveLayout === "full" || effectiveLayout === "wide";
  const canResizeWidth = !!onLayoutChange && editable && !isFullOrWide;
  const canResizeHeight = !!onHeightChange && editable;
  const isResizing = isWidthResizing || isHeightResizing;
  const displayWidthPct =
    isWidthResizing && resizeWidth !== null ? resizeWidth : widthPct;
  const displayHeightPx =
    isHeightResizing && resizeHeight !== null
      ? resizeHeight
      : heightPx;

  const handleWidthResizeStart = useCallback(
    (e: React.MouseEvent, side: "left" | "right") => {
      if (!canResizeWidth || !resizeContainerRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      sideRef.current = side;
      startXRef.current = e.clientX;

      const wrapper = resizeContainerRef.current.closest<HTMLElement>("[data-node-view-wrapper]");
      const parentRect = wrapper?.parentElement?.getBoundingClientRect();
      const currentRect = wrapper?.getBoundingClientRect();
      const proseMirrorRect = resizeContainerRef.current
        .closest<HTMLElement>(".ProseMirror")
        ?.getBoundingClientRect();
      const cw = Math.max(
        1,
        parentRect?.width || proseMirrorRect?.width || currentRect?.width || 800,
      );
      const currentWidthPct = parseWidthPct(blockWidth);
      containerWidthRef.current = cw;
      startWidthRef.current = currentRect?.width || (currentWidthPct / 100) * cw;
      setIsWidthResizing(true);
      setResizeWidth(Math.round((startWidthRef.current / cw) * 100));
    },
    [canResizeWidth, blockWidth],
  );

  const handleHeightResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!canResizeHeight || !resizeContainerRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      startYRef.current = e.clientY;
      startHeightRef.current =
        parseHeightPx(blockHeight) || resizeContainerRef.current.offsetHeight;
      setIsHeightResizing(true);
      setResizeHeight(Math.max(MIN_RESIZE_HEIGHT_PX, startHeightRef.current));
    },
    [blockHeight, canResizeHeight],
  );

  useEffect(() => {
    if (!isWidthResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const containerWidth = containerWidthRef.current || 800;
      const delta = e.clientX - startXRef.current;
      const isCentered = !effectiveLayout.startsWith("wrap") && (align === "center" || !align);
      const factor = isCentered ? 2 : 1;
      const direction = sideRef.current === "right" ? 1 : -1;
      const newPx = Math.max(
        (MIN_RESIZE_WIDTH_PCT / 100) * containerWidth,
        Math.min(containerWidth, startWidthRef.current + delta * direction * factor),
      );
      let newPct = Math.round((newPx / containerWidth) * 100);

      // Magnetic snap points
      const snapPoints = [25, 33, 50, 66, 75, 100];
      for (const snap of snapPoints) {
        if (Math.abs(newPct - snap) <= 2) {
          newPct = snap;
          break;
        }
      }

      setResizeWidth(
        Math.max(MIN_RESIZE_WIDTH_PCT, Math.min(100, newPct)),
      );
    };

    const handleMouseUp = () => {
      setIsWidthResizing(false);
      if (resizeWidth !== null && onLayoutChange) {
        onLayoutChange(effectiveLayout, `${resizeWidth}%`);
      }
      setResizeWidth(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [align, effectiveLayout, isWidthResizing, onLayoutChange, resizeWidth]);

  useEffect(() => {
    if (!isHeightResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const nextHeight = Math.max(
        MIN_RESIZE_HEIGHT_PX,
        Math.round(startHeightRef.current + e.clientY - startYRef.current),
      );
      setResizeHeight(nextHeight);
    };

    const handleMouseUp = () => {
      setIsHeightResizing(false);
      if (resizeHeight !== null && onHeightChange) {
        onHeightChange(`${resizeHeight}px`);
      }
      setResizeHeight(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isHeightResizing, onHeightChange, resizeHeight]);

  const resizeOverrideStyle: React.CSSProperties | undefined =
    isWidthResizing && resizeWidth !== null
      ? {
          maxWidth: `${resizeWidth}%`,
          marginLeft: align === "left" ? 0 : "auto",
          marginRight: align === "right" ? 0 : "auto",
          transition: "none",
        }
      : undefined;
  const heightStyle: React.CSSProperties | undefined =
    isHeightResizing && resizeHeight !== null
      ? { minHeight: `${resizeHeight}px` }
      : heightPx
        ? { minHeight: `${heightPx}px` }
        : undefined;

  const finalStyle = {
    ...layoutStyle,
    ...heightStyle,
    ...wrapperStyle,
    ...resizeOverrideStyle,
  };

  const currentLayoutOption = LAYOUT_OPTIONS.find(
    (o) => o.value === effectiveLayout,
  );
  const LayoutIcon = currentLayoutOption?.icon || AlignCenter;

  return (
    <NodeViewWrapper
      className={cn(
        "my-2 rounded-[var(--radius)] overflow-hidden transition-colors",
        editable
          ? (selected
              ? "border border-primary ring-2 ring-primary/20"
              : "border border-border hover:border-border/80")
          : "border border-transparent",
        layoutClasses,
        wrapperClassName,
      )}
      data-type={dataType}
      draggable={false}
      style={finalStyle}
    >
      {editable && (
        <div
          data-drag-handle
          contentEditable={false}
          className="flex items-center gap-1 border-b bg-muted/30 px-2 py-1 rounded-t-[var(--radius)] select-none cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
          {icon}
          <span className="text-xs font-medium text-muted-foreground select-none truncate max-w-[200px]">
            {label}
          </span>
          <div className="flex-1" />
          {headerActions}
          {onLayoutChange && (
            <div className="relative" ref={layoutPickerRef}>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                  showLayoutPicker && "bg-accent text-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLayoutPicker((v) => !v);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Layout"
              >
                <LayoutIcon className="size-3.5" />
              </button>
              {showLayoutPicker && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 bg-background border border-border/60 rounded-[var(--radius)] shadow-lg p-1 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {LAYOUT_OPTIONS.map(({ value, icon: Icon, label: lbl }) => (
                    <button
                      key={value}
                      type="button"
                      title={lbl}
                      className={cn(
                        "flex items-center justify-center size-7 rounded-md transition-all cursor-pointer",
                        effectiveLayout === value
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        const isWrap =
                          value === "wrap-left" || value === "wrap-right";
                        const isHalf =
                          value === "half-left" || value === "half-right";
                        const currentPct = parseWidthPct(blockWidth);
                        const defaultWidth = isWrap
                          ? `${Math.min(currentPct, 60)}%`
                          : isHalf
                            ? "50%"
                            : value === "wide"
                              ? "75%"
                              : value === "full"
                                ? "100%"
                                : blockWidth || "100%";
                        onLayoutChange(value, defaultWidth);
                        setShowLayoutPicker(false);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {onToggleSettings && (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                showSettings && "bg-accent text-foreground",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSettings();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Settings className="size-3.5" />
            </button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      <div
        ref={resizeContainerRef}
        className="relative group/resize"
        style={heightStyle}
      >
        {children}

        {canResizeWidth && (
          <>
            <div
              contentEditable={false}
              className="absolute left-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize opacity-0 group-hover/resize:opacity-100 transition-opacity z-10"
              onMouseDown={(e) => handleWidthResizeStart(e, "left")}
            >
              <div className="w-1 h-8 rounded-full bg-primary/60 shadow-sm" />
            </div>
            <div
              contentEditable={false}
              className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize opacity-0 group-hover/resize:opacity-100 transition-opacity z-10"
              onMouseDown={(e) => handleWidthResizeStart(e, "right")}
            >
              <div className="w-1 h-8 rounded-full bg-primary/60 shadow-sm" />
            </div>
          </>
        )}

        {canResizeHeight && (
          <div
            contentEditable={false}
            className="absolute left-0 right-0 bottom-0 h-4 flex items-end justify-center cursor-row-resize opacity-0 group-hover/resize:opacity-100 transition-opacity z-10"
            onMouseDown={handleHeightResizeStart}
            title="Drag to resize height"
          >
            <div className="mb-1 h-1 w-10 rounded-full bg-primary/60 shadow-sm" />
          </div>
        )}

        {isWidthResizing && (
          <div
            contentEditable={false}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-md pointer-events-none"
          >
            {displayWidthPct}%
          </div>
        )}

        {isHeightResizing && displayHeightPx !== null && (
          <div
            contentEditable={false}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-md pointer-events-none"
          >
            {Math.round(displayHeightPx)}px
          </div>
        )}

        {isResizing && (
          <div className="absolute inset-0 ring-2 ring-primary/30 rounded-[var(--radius)] pointer-events-none z-10" />
        )}
      </div>

      {(mergedCaption || captionValue) && !showSettings && (
        <div
          contentEditable={false}
          className="group/caption px-2 pb-0 pt-0.5 text-center select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={editable ? handleCaptionDoubleClick : undefined}
          style={editable ? { cursor: "pointer" } : undefined}
        >
          <span
            className={cn(
              "inline-block text-xs italic text-muted-foreground px-2 py-0.5 rounded border border-transparent transition-colors",
              editable &&
                "group-hover/caption:border-border/50 group-hover/caption:bg-muted/30",
            )}
          >
            {mergedCaption || captionValue}
          </span>
        </div>
      )}

      {showSettings && editable && (
        <div
          contentEditable={false}
          className="border-t px-4 py-3 space-y-3 select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {onCaptionChange && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Caption
              </label>
              <input
                ref={captionRef}
                type="text"
                value={captionValue || ""}
                onChange={(e) => onCaptionChange(e.target.value)}
                placeholder="Add a caption for this block..."
                className="w-full h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (onSave) {
                      onSave();
                    } else if (onToggleSettings) {
                      onToggleSettings();
                    }
                  }
                }}
              />
            </div>
          )}
          {settingsPanel}
        </div>
      )}

      <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete content block</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the {label ? label.toLowerCase() : "content"} block and its data from this article?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(false);
                onDelete?.();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NodeViewWrapper>
  );
}
