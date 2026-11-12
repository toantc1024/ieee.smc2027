"use client";

/* TipTap node attributes are external state and must synchronize with the editing draft. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useCallback } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import katex from "katex";
import { Sigma, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SECURE_KATEX_INLINE_OPTIONS,
  sanitizeKaTeXContainer,
} from "./katex-config";

// ── Quick-insert LaTeX snippets ──────────────────────────────────────
const LATEX_SNIPPETS = [
  { label: "a/b", latex: "\\frac{a}{b}", tip: "Fraction" },
  { label: "x²", latex: "x^{2}", tip: "Power" },
  { label: "√", latex: "\\sqrt{}", tip: "Root" },
  { label: "∑", latex: "\\sum_{i=1}^{n}", tip: "Sum" },
  { label: "∫", latex: "\\int_{a}^{b}", tip: "Integral" },
  { label: "α", latex: "\\alpha", tip: "Alpha" },
  { label: "π", latex: "\\pi", tip: "Pi" },
  { label: "≠", latex: "\\neq", tip: "Other" },
  { label: "≤", latex: "\\leq", tip: "Less than or equal" },
  { label: "≥", latex: "\\geq", tip: "Greater than or equal" },
  { label: "±", latex: "\\pm", tip: "Plus or minus" },
  { label: "×", latex: "\\times", tip: "Multiply" },
];

export function MathInlineView({
  node,
  updateAttributes,
  deleteNode,
  editor,
}: NodeViewProps) {
  const { formula } = node.attrs as { formula: string };
  const [isDialogOpen, setIsDialogOpen] = useState(!formula);
  const [localFormula, setLocalFormula] = useState(formula || "");
  const previewRef = useRef<HTMLSpanElement>(null);
  const dialogPreviewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from node attrs
  useEffect(() => {
    setLocalFormula(formula || "");
  }, [formula]);

  // Render KaTeX preview (inline display)
  useEffect(() => {
    if (!previewRef.current || isDialogOpen) return;
    if (!formula) {
      previewRef.current.innerHTML = "";
      previewRef.current.textContent = "$…$";
      return;
    }
    try {
      katex.render(formula, previewRef.current, SECURE_KATEX_INLINE_OPTIONS);
      sanitizeKaTeXContainer(previewRef.current);
    } catch {
      previewRef.current.textContent = formula;
    }
  }, [formula, isDialogOpen]);

  // Render KaTeX preview in dialog
  useEffect(() => {
    if (!dialogPreviewRef.current || !isDialogOpen) return;
    if (!localFormula) {
      dialogPreviewRef.current.innerHTML =
        '<span class="text-muted-foreground italic text-sm">Preview...</span>';
      return;
    }
    try {
      katex.render(localFormula, dialogPreviewRef.current, SECURE_KATEX_INLINE_OPTIONS);
      sanitizeKaTeXContainer(dialogPreviewRef.current);
    } catch {
      dialogPreviewRef.current.textContent = localFormula;
    }
  }, [localFormula, isDialogOpen]);

  const handleApply = useCallback(() => {
    updateAttributes({ formula: localFormula });
    setIsDialogOpen(false);
  }, [localFormula, updateAttributes]);

  const handleClick = useCallback(() => {
    if (!editor.isEditable) return;
    setLocalFormula(formula || "");
    setIsDialogOpen(true);
  }, [editor, formula]);

  const insertSnippet = useCallback(
    (latex: string) => {
      if (!inputRef.current) return;
      const start = inputRef.current.selectionStart ?? localFormula.length;
      const end = inputRef.current.selectionEnd ?? localFormula.length;
      const newFormula =
        localFormula.slice(0, start) + latex + localFormula.slice(end);
      setLocalFormula(newFormula);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const newPos = start + latex.length;
          inputRef.current.setSelectionRange(newPos, newPos);
          inputRef.current.focus();
        }
      });
    },
    [localFormula],
  );

  return (
    <NodeViewWrapper as="span" className="inline relative">
      {/* Rendered formula (click to edit) */}
      <span
        ref={previewRef}
        onClick={handleClick}
        className={`math-inline-view inline cursor-pointer rounded px-1 py-0.5 border transition-colors ${
          formula
            ? "border-purple-200/60 bg-purple-50/40 hover:border-purple-300 hover:bg-purple-50/80"
            : "border-dashed border-muted-foreground/30 text-muted-foreground italic"
        }`}
      />

      {/* Modal editor — replaces the inline bubble to prevent multi-bubble issues */}
      {editor.isEditable && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) updateAttributes({ formula: localFormula });
            setIsDialogOpen(open);
          }}
        >
          <DialogContent
            className="max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                <Sigma className="size-4 text-purple-500" />
                Inline equation
              </DialogTitle>
            </DialogHeader>

            {/* Input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-border bg-muted/40 px-2.5 h-9 focus-within:border-purple-400/50 focus-within:ring-1 focus-within:ring-purple-400/20 transition-colors">
                <Sigma className="size-3.5 text-purple-500 shrink-0" />
                <input
                  ref={inputRef}
                  value={localFormula}
                  onChange={(e) => setLocalFormula(e.target.value)}
                  placeholder="VD: \\frac{a}{b}, x^{2}..."
                  className="flex-1 min-w-0 text-sm bg-transparent outline-none placeholder:text-muted-foreground/50 font-mono"
                  autoFocus
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApply();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsDialogOpen(false);
                    }
                  }}
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Preview
              </label>
              <div
                ref={dialogPreviewRef}
                className="min-h-[40px] rounded-lg border bg-background p-3 flex items-center justify-center overflow-x-auto"
              />
            </div>

            {/* Quick snippets */}
            <div className="flex items-center gap-1 flex-wrap">
              {LATEX_SNIPPETS.map((s) => (
                <button
                  key={s.latex}
                  type="button"
                  title={s.tip}
                  onClick={() => insertSnippet(s.latex)}
                  className="h-6 px-1.5 rounded border text-xs font-mono text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  deleteNode();
                  setIsDialogOpen(false);
                }}
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalFormula(formula || "");
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </NodeViewWrapper>
  );
}
