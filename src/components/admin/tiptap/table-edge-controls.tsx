"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Editor } from "@tiptap/react";
import { Columns3, Plus, Rows3, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableEdgeControlsProps {
  editor: Editor;
  containerRef: RefObject<HTMLDivElement | null>;
}

type EdgeKind = "column" | "row";

interface EdgeControlState {
  visible: boolean;
  open: boolean;
  kind: EdgeKind;
  top: number;
  left: number;
  pos: number | null;
}

const EDGE_HIT_SIZE = 8;

function getCellPoint(cell: HTMLElement) {
  const rect = cell.getBoundingClientRect();
  return {
    left: Math.min(
      rect.right - 6,
      Math.max(rect.left + 6, rect.left + rect.width / 2),
    ),
    top: Math.min(
      rect.bottom - 6,
      Math.max(rect.top + 6, rect.top + rect.height / 2),
    ),
  };
}

export function TableEdgeControls({
  editor,
  containerRef,
}: TableEdgeControlsProps) {
  const [state, setState] = useState<EdgeControlState>({
    visible: false,
    open: false,
    kind: "column",
    top: 0,
    left: 0,
    pos: null,
  });

  const hide = useCallback(() => {
    setState((prev) =>
      prev.visible || prev.open ? { ...prev, visible: false, open: false } : prev,
    );
  }, []);

  const focusStoredCell = useCallback(() => {
    if (state.pos == null || editor.isDestroyed) return false;
    return editor.chain().focus().setTextSelection(state.pos).run();
  }, [editor, state.pos]);

  const runTableCommand = useCallback(
    (command: () => boolean) => {
      focusStoredCell();
      command();
    },
    [focusStoredCell],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || editor.isDestroyed) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (state.open) return;

      const target = event.target as HTMLElement | null;
      if (
        !target ||
        target.closest("[data-table-edge-controls]") ||
        target.closest("[data-table-context-menu]")
      ) {
        return;
      }

      const cell = target.closest("td, th") as HTMLElement | null;
      const table = cell?.closest("table");
      if (!cell || !table || !container.contains(cell)) {
        setState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const cellRect = cell.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const nearLeft = Math.abs(event.clientX - cellRect.left) <= EDGE_HIT_SIZE;
      const nearRight = Math.abs(event.clientX - cellRect.right) <= EDGE_HIT_SIZE;
      const nearTop = Math.abs(event.clientY - cellRect.top) <= EDGE_HIT_SIZE;
      const nearBottom = Math.abs(event.clientY - cellRect.bottom) <= EDGE_HIT_SIZE;

      if (!nearLeft && !nearRight && !nearTop && !nearBottom) {
        setState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const point = getCellPoint(cell);
      const pos = editor.view.posAtCoords(point)?.pos ?? null;
      if (pos == null) return;

      if (nearLeft || nearRight) {
        const edgeX = nearLeft ? cellRect.left : cellRect.right;
        const top =
          tableRect.top - containerRect.top + container.scrollTop - 12;
        const left = edgeX - containerRect.left + container.scrollLeft - 12;
        setState({
          visible: true,
          open: false,
          kind: "column",
          top: Math.max(8, top),
          left: Math.max(8, left),
          pos,
        });
        return;
      }

      const edgeY = nearTop ? cellRect.top : cellRect.bottom;
      const top = edgeY - containerRect.top + container.scrollTop - 12;
      const left = tableRect.left - containerRect.left + container.scrollLeft - 12;
      setState({
        visible: true,
        open: false,
        kind: "row",
        top: Math.max(8, top),
        left: Math.max(8, left),
        pos,
      });
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (state.open) return;
      const related = event.relatedTarget as Node | null;
      if (related && container.contains(related)) return;
      hide();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, editor, hide, state.open]);

  if (!state.visible && !state.open) return null;

  const isColumn = state.kind === "column";

  return (
    <div
      data-table-edge-controls
      className="absolute z-50"
      style={{ top: state.top, left: state.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <DropdownMenu
        open={state.open}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, open, visible: open || prev.visible }))
        }
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_6px_18px_rgba(15,23,42,0.16)] transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            aria-label={isColumn ? "Tùy chọn cột" : "Tùy chọn hàng"}
            onMouseDown={(event) => {
              event.preventDefault();
              focusStoredCell();
            }}
          >
            <Plus className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" className="w-52">
          <DropdownMenuLabel className="flex items-center gap-2">
            {isColumn ? (
              <>
                <Columns3 className="size-4" />
                Cột
              </>
            ) : (
              <>
                <Rows3 className="size-4" />
                Hàng
              </>
            )}
          </DropdownMenuLabel>
          {isColumn ? (
            <>
              <DropdownMenuItem
                onClick={() =>
                  runTableCommand(() => editor.chain().focus().addColumnBefore().run())
                }
              >
                Thêm cột bên trái
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runTableCommand(() => editor.chain().focus().addColumnAfter().run())
                }
              >
                Thêm cột bên phải
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600"
                onClick={() =>
                  runTableCommand(() => editor.chain().focus().deleteColumn().run())
                }
              >
                <Trash2 className="size-4" />
                Xóa cột
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() =>
                  runTableCommand(() => editor.chain().focus().addRowBefore().run())
                }
              >
                Thêm hàng phía trên
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  runTableCommand(() => editor.chain().focus().addRowAfter().run())
                }
              >
                Thêm hàng phía dưới
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600"
                onClick={() =>
                  runTableCommand(() => editor.chain().focus().deleteRow().run())
                }
              >
                <Trash2 className="size-4" />
                Xóa hàng
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
