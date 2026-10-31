"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { MilestoneTemplateItem } from "./MilestoneTemplateSelector";

interface MilestoneTemplateEditorProps {
  activeTemplate: MilestoneTemplateItem;
  previewMode: "HTML" | "SOURCE";
  editSubject: string;
  onSubjectChange: (val: string) => void;
  editHtml: string;
  onHtmlChange: (val: string) => void;
  editText: string;
  onTextChange: (val: string) => void;
}

export function MilestoneTemplateEditor({
  activeTemplate,
  previewMode,
  editSubject,
  onSubjectChange,
  editHtml,
  onHtmlChange,
  editText,
  onTextChange,
}: MilestoneTemplateEditorProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {activeTemplate.name}
          </h3>
          <p className="text-xs text-slate-500">
            Available Merge Variables:{" "}
            {(activeTemplate.variables || []).map((v) => (
              <code
                key={v}
                className="mx-1 px-1.5 py-0.5 rounded bg-slate-100 text-[#115eff] font-mono text-[11px]"
              >
                {`{{${v}}}`}
              </code>
            ))}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Email Subject Line</Label>
        <Input
          value={editSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
      </div>

      {previewMode === "HTML" ? (
        <div className="space-y-1.5">
          <Label>Branded HTML Email Preview</Label>
          <div
            className="rounded-2xl border border-slate-200 bg-slate-100 p-4 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: editHtml }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>HTML Template Content</Label>
            <Textarea
              rows={12}
              value={editHtml}
              onChange={(e) => onHtmlChange(e.target.value)}
              className="font-mono text-xs bg-slate-900 text-emerald-400"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Plain Text Fallback Content</Label>
            <Textarea
              rows={5}
              value={editText}
              onChange={(e) => onTextChange(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
