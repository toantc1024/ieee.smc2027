"use client";

/* TipTap node attributes are external state and must synchronize with the editing draft. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useCallback, useEffect, useRef, useId } from "react";
import type { NodeViewProps } from "@tiptap/react";
import {
  GitBranch,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  PieChart,
  BarChart3,
  Calendar,
  Brain,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlockWrapper } from "./block-wrapper";
import { isEditorReviewOnly, isNodeViewInsideLayoutColumn } from "./node-view-utils";

const MERMAID_THEMES = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "forest", label: "Forest" },
  { value: "neutral", label: "Neutral" },
] as const;

interface MermaidTemplate {
  name: string;
  icon: LucideIcon;
  code: string;
}

const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    name: "Flowchart",
    icon: GitBranch,
    code: "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Result 1]\n  B -->|No| D[Result 2]",
  },
  {
    name: "Sequence diagram",
    icon: RefreshCw,
    code: "sequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>Alice: Hello!\n  Alice->>Bob: How are you?\n  Bob-->>Alice: Fine, thanks!",
  },
  {
    name: "Pie chart",
    icon: PieChart,
    code: 'pie title Budget allocation\n  "Teaching" : 45\n  "Research" : 30\n  "Infrastructure" : 15\n  "Other" : 10',
  },
  {
    name: "ER diagram",
    icon: BarChart3,
    code: "erDiagram\n  STUDENT ||--o{ ENROLLMENT : registers\n  COURSE ||--o{ ENROLLMENT : contains\n  DEPARTMENT ||--o{ COURSE : offers",
  },
  {
    name: "Gantt",
    icon: Calendar,
    code: "gantt\n  title Project plan\n  dateFormat YYYY-MM-DD\n  section Phase 1\n    Analysis: a1, 2024-01-01, 30d\n    Design: a2, after a1, 20d\n  section Phase 2\n    Development: a3, after a2, 40d\n    Testing: a4, after a3, 15d",
  },
  {
    name: "Mindmap",
    icon: Brain,
    code: "mindmap\n  root((Main topic))\n    Branch 1\n      Detail A\n      Detail B\n    Branch 2\n      Detail C\n      Detail D\n    Branch 3",
  },
];

// Global render counter for unique IDs
let renderCounter = 0;

export function MermaidBlockView({
  node,
  updateAttributes,
  deleteNode,
  getPos,
  selected,
  editor,
}: NodeViewProps) {
  const { code, theme, caption } = node.attrs as {
    code: string;
    theme: string;
    caption: string;
  };
  const [showCode, setShowCode] = useState(!code);
  const [showSettings, setShowSettings] = useState(false);
  const [localCode, setLocalCode] = useState(code || "");
  const [svgOutput, setSvgOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!code);
  const renderRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isInsideLayoutColumn = isNodeViewInsideLayoutColumn(editor, getPos);
  const uniqueId = useId();

  // Sync from node attrs
  useEffect(() => {
    setLocalCode(code || "");
  }, [code]);

  // Render mermaid diagram
  const renderDiagram = useCallback(
    async (mermaidCode: string, mermaidTheme: string) => {
      if (!mermaidCode.trim()) {
        setSvgOutput("");
        setError(null);
        return;
      }
      setIsRendering(true);
      setError(null);
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme as "default" | "dark" | "forest" | "neutral",
          securityLevel: "strict",
          fontFamily: "system-ui, sans-serif",
        });
        const id = `mermaid-${uniqueId.replace(/:/g, "")}-${++renderCounter}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        setSvgOutput(svg);
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not render diagram";
        setError(msg);
        setSvgOutput("");
      } finally {
        setIsRendering(false);
      }
    },
    [uniqueId],
  );

  // Initial render
  useEffect(() => {
    if (code) renderDiagram(code, theme);
  }, [code, theme, renderDiagram]);

  // Store a sandboxed public preview for the exact saved source, not the draft editor text.
  useEffect(() => {
    const source = JSON.stringify([code, theme]);
    if (!editor.isEditable || !code || (node.attrs.svg && node.attrs.svgSource === source)) return;
    let cancelled = false;
    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: theme as "default" | "dark" | "forest" | "neutral", securityLevel: "strict", fontFamily: "system-ui, sans-serif" });
        const { svg } = await mermaid.render(`mermaid-public-${++renderCounter}`, code);
        if (!cancelled) updateAttributes({ svg, svgSource: source });
      } catch { /* Keep source visible in the public post if it cannot render. */ }
    })();
    return () => { cancelled = true; };
  }, [code, theme, editor.isEditable, node.attrs.svg, node.attrs.svgSource, updateAttributes]);

  // Debounced live preview as user types
  useEffect(() => {
    if (!showCode) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      renderDiagram(localCode, theme);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localCode, theme, showCode, renderDiagram]);

  const handleApply = useCallback(() => {
    updateAttributes({ code: localCode });
    setShowCode(false);
    setShowTemplates(false);
  }, [localCode, updateAttributes]);

  const selectTemplate = useCallback(
    (templateCode: string) => {
      setLocalCode(templateCode);
      updateAttributes({ code: templateCode });
      setShowTemplates(false);
      setShowCode(false);
    },
    [updateAttributes],
  );

  const isReviewOnly = isEditorReviewOnly(editor);
  const isEditable = (editor?.isEditable ?? true) && !isReviewOnly;

  // Theme selector as header action
  const themeSelector = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded transition-colors"
        >
          {MERMAID_THEMES.find((t) => t.value === theme)?.label || "Default"}
          <ChevronDown className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {MERMAID_THEMES.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => updateAttributes({ theme: t.value })}
            className={cn(theme === t.value && "bg-accent")}
          >
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <BlockWrapper
      selected={selected}
      icon={<GitBranch className="size-3.5 text-cyan-500" />}
      label="Mermaid Diagram"
      editable={isEditable}
      onDelete={deleteNode}
      showSettings={showSettings}
      onToggleSettings={() => setShowSettings(!showSettings)}
      captionValue={caption || ""}
      onCaptionChange={(val) => updateAttributes({ caption: val })}
      dataType="mermaid-block"
      headerActions={themeSelector}
      layout={node.attrs.layout}
      blockWidth={node.attrs.blockWidth}
      onLayoutChange={isInsideLayoutColumn ? undefined : (l, w) => updateAttributes({ layout: l, blockWidth: w })}
    >
      {/* Content */}
      <div contentEditable={false} className="select-none">
        {/* Template picker (shown when empty, only in edit mode) */}
        {showTemplates && isEditable && (
          <div className="p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Choose a diagram template:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {MERMAID_TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.name}
                    type="button"
                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-background hover:bg-accent/50 transition-colors text-left"
                    onClick={() => selectTemplate(tpl.code)}
                  >
                    <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-medium">{tpl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rendered diagram */}
        {!showTemplates && (
          <>
            <div
              ref={renderRef}
              className="p-4 flex items-center justify-center overflow-x-auto min-h-[100px]"
            >
              {isRendering ? (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Rendering...
                </p>
              ) : svgOutput ? (
                <div
                  className="mermaid-svg-container w-full [&>svg]:mx-auto [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                />
              ) : error ? (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="line-clamp-3">{error}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No diagram
                </p>
              )}
            </div>

            {/* Code editor accordion (edit mode only) */}
            {isEditable && <div className="border-t">
              <button
                type="button"
                className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )}
                Edit code
              </button>
              {showCode && (
                <div className="px-3 pb-3 space-y-2">
                  <textarea
                    value={localCode}
                    onChange={(e) => setLocalCode(e.target.value)}
                    placeholder="graph TD\n  A --> B"
                    className="w-full min-h-[120px] rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleApply();
                      }
                      e.stopPropagation();
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApply}
                      className="h-7 text-xs"
                    >
                      Apply (Ctrl+Enter)
                    </Button>
                  </div>
                </div>
              )}
            </div>}
          </>
        )}
      </div>
    </BlockWrapper>
  );
}
