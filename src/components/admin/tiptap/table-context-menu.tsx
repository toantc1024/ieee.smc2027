"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import type { Editor } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import gsap from "gsap";
import {
  ChevronDown,
  Columns3,
  PanelLeft,
  PanelTop,
  Plus,
  Rows3,
  Table2,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface TableContextMenuProps {
  editor: Editor;
  containerRef: RefObject<HTMLDivElement | null>;
}

interface MenuPosition {
  visible: boolean;
  top: number;
  left: number;
}

function getActiveTableCell(editor: Editor) {
  const { from } = editor.state.selection;
  const coords = editor.view.coordsAtPos(from);
  const target = document.elementFromPoint(coords.left, coords.top) as
    | HTMLElement
    | null;
  const cellFromPoint = target?.closest("td, th") as HTMLElement | null;
  if (cellFromPoint && editor.view.dom.contains(cellFromPoint)) {
    return cellFromPoint;
  }

  const domAtPos = editor.view.domAtPos(from).node;
  const element =
    domAtPos.nodeType === Node.ELEMENT_NODE
      ? (domAtPos as HTMLElement)
      : domAtPos.parentElement;
  const cellFromDom = element?.closest("td, th") as HTMLElement | null;
  return cellFromDom && editor.view.dom.contains(cellFromDom)
    ? cellFromDom
    : null;
}

function distributeColumnsEvenly(editor: Editor) {
  if (editor.isDestroyed) return;
  const { tr, doc } = editor.state;
  const { from } = editor.state.selection;
  const $pos = doc.resolve(from);
  let tablePos = -1;
  let tableNode: ProseMirrorNode | null = null;
  for (let d = $pos.depth; d > 0; d--) {
    if ($pos.node(d).type.name === "table") {
      tablePos = $pos.before(d);
      tableNode = $pos.node(d);
      break;
    }
  }
  if (!tableNode || tablePos === -1) return;

  let rowPos = tablePos + 1;
  tableNode.forEach((row) => {
    let cellPos = rowPos + 1;
    row.forEach((cell) => {
      if (cell.attrs.colwidth) {
        tr.setNodeMarkup(cellPos, null, {
          ...cell.attrs,
          colwidth: null,
        });
      }
      cellPos += cell.nodeSize;
    });
    rowPos += row.nodeSize;
  });

  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
}

function TableActionButton({
  label,
  onClick,
  children,
  className,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-xs font-medium text-foreground/75 transition-colors",
            "hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
            "disabled:pointer-events-none disabled:opacity-40",
            className,
          )}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function TableContextMenu({
  editor,
  containerRef,
}: TableContextMenuProps) {
  const [position, setPosition] = useState<MenuPosition>({
    visible: false,
    top: 0,
    left: 0,
  });
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    if (!container || editor.isDestroyed || !editor.isActive("table")) {
      setPosition((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      setExpanded(false);
      return;
    }

    try {
      const activeCell = getActiveTableCell(editor);
      if (!activeCell) {
        setPosition((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        setExpanded(false);
        return;
      }

      const cellRect = activeCell.getBoundingClientRect();
      const rowRect = activeCell.closest("tr")?.getBoundingClientRect() ?? cellRect;
      const containerRect = container.getBoundingClientRect();
      const menuWidth = 390;
      const top = Math.max(
        8,
        rowRect.top - containerRect.top + container.scrollTop - 46,
      );
      const maxLeft = Math.max(8, container.clientWidth - menuWidth - 8);
      const left = Math.max(
        8,
        Math.min(
          cellRect.left - containerRect.left + container.scrollLeft - 46,
          maxLeft,
        ),
      );

      setPosition({ visible: true, top, left });
    } catch {
      setPosition((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, [containerRef, editor]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!expanded || !panel) return;
    const context = gsap.context(() => {
      gsap.fromTo(panel, { autoAlpha: 0, scaleX: 0.88, x: -8 }, {
        autoAlpha: 1, scaleX: 1, x: 0, duration: 0.2,
        ease: "power3.out", overwrite: true,
      });
    }, menuRef);
    return () => context.revert();
  }, [expanded]);

  useEffect(() => {
    const frameId = requestAnimationFrame(updatePosition);
    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);
    editor.on("focus", updatePosition);

    const container = containerRef.current;
    container?.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frameId);
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
      editor.off("focus", updatePosition);
      container?.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [containerRef, editor, updatePosition]);

  useEffect(() => {
    const editorDom = editor.view.dom;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-table-context-menu]")) return;
      if (target.closest("td, th")) {
        setExpanded(false);
      }
    };

    editorDom.addEventListener("mousedown", handleMouseDown);
    return () => editorDom.removeEventListener("mousedown", handleMouseDown);
  }, [editor]);

  if (!position.visible) return null;

  return (
    <div
      ref={menuRef}
      data-table-context-menu
      className="absolute z-50 flex items-center gap-1.5"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => setExpanded(true)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-orange-200/80 bg-background/95 text-orange-500 shadow-[0_8px_22px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-orange-100/70 backdrop-blur-md transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 hover:shadow-[0_14px_34px_rgba(249,115,22,0.28),0_3px_10px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/50"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setExpanded(true)}
          >
            <Table2 className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Công cụ bảng
        </TooltipContent>
      </Tooltip>

      {expanded && (
      <div
        ref={panelRef}
        className="inline-flex h-10 w-max max-w-[calc(100vw-4rem)] origin-left items-center gap-1 overflow-x-auto rounded-lg border border-border/70 bg-background/95 px-1.5 shadow-[0_12px_34px_rgba(15,23,42,0.14),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.03] backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center gap-1 rounded-lg bg-muted/55 px-2 py-1 text-xs font-semibold text-foreground/75">
          <Table2 className="size-3.5 text-orange-500" />
          Bảng
        </div>

        <div className="mx-0.5 h-5 w-px bg-border/80" />

        <TableActionButton
          label="Thêm hàng phía trên"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
        >
          <Plus className="size-3.5" />
          <Rows3 className="size-3.5" />
        </TableActionButton>
        <TableActionButton
          label="Thêm cột bên trái"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
        >
          <Plus className="size-3.5" />
          <Columns3 className="size-3.5" />
        </TableActionButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
              onMouseDown={(event) => event.preventDefault()}
            >
              Sửa
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel>Hàng và cột</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <Rows3 className="size-4" />
              Thêm hàng phía trên
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <Rows3 className="size-4" />
              Thêm hàng phía dưới
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <Columns3 className="size-4" />
              Thêm cột bên trái
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <Columns3 className="size-4" />
              Thêm cột bên phải
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => distributeColumnsEvenly(editor)}
            >
              <Columns3 className="size-4" />
              Căn đều độ rộng cột
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="text-rose-600 focus:text-rose-600"
            >
              <Trash2 className="size-4" />
              Xóa hàng
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="text-rose-600 focus:text-rose-600"
            >
              <Trash2 className="size-4" />
              Xóa cột
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
              onMouseDown={(event) => event.preventDefault()}
            >
              Ô
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel>Ô và tiêu đề</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().mergeCells().run()}
            >
              <TableCellsMerge className="size-4" />
              Gộp ô đã chọn
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().splitCell().run()}
            >
              <TableCellsSplit className="size-4" />
              Tách ô
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
              <PanelTop className="size-4" />
              Bật/tắt hàng tiêu đề
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            >
              <PanelLeft className="size-4" />
              Bật/tắt cột tiêu đề
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderCell().run()}
            >
              <Table2 className="size-4" />
              Bật/tắt ô tiêu đề
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TableActionButton
          label="Sửa cấu trúc bảng"
          onClick={() => editor.chain().focus().fixTables().run()}
        >
          <Wrench className="size-3.5" />
        </TableActionButton>

        <div className="mx-0.5 h-5 w-px bg-border/80" />

        <TableActionButton
          label="Xóa bảng"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 className="size-3.5" />
        </TableActionButton>
      </div>
      )}
    </div>
  );
}
