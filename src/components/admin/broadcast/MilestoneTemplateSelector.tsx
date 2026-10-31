"use client";

import React from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface MilestoneTemplateItem {
  id: string;
  slug: string;
  name: string;
  milestone: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isActive: boolean;
}

interface MilestoneTemplateSelectorProps {
  templates: MilestoneTemplateItem[];
  selectedSlug: string;
  onSelectTemplate: (tpl: MilestoneTemplateItem) => void;
  targetGroup: string;
  onTargetGroupChange: (val: string) => void;
  sendingBroadcast: boolean;
  onBroadcastTemplate: () => void;
}

export function MilestoneTemplateSelector({
  templates,
  selectedSlug,
  onSelectTemplate,
  targetGroup,
  onTargetGroupChange,
  sendingBroadcast,
  onBroadcastTemplate,
}: MilestoneTemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-2">
        <h3 className="text-sm font-extrabold text-slate-900 px-1">
          Conference Milestone Templates
        </h3>
        <div className="space-y-1.5">
          {templates.map((tpl) => {
            const isSelected = tpl.slug === selectedSlug;
            return (
              <button
                key={tpl.slug}
                type="button"
                onClick={() => onSelectTemplate(tpl)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#115eff] bg-blue-50/70 shadow-2xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isSelected ? "ute" : "secondary"}>
                    {tpl.milestone}
                  </Badge>
                  <span className="font-mono text-[10px] text-slate-400">
                    {tpl.slug}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1.5">
                  {tpl.name}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-[#115eff]" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Dispatch Milestone Broadcast
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Send the currently selected milestone template with automatic merge
          tags to a delegate group.
        </p>

        <div className="space-y-1.5">
          <Label>Target Delegate Group</Label>
          <select
            value={targetGroup}
            onChange={(e) => onTargetGroupChange(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold"
          >
            <option value="ALL">All Registered Delegates</option>
            <option value="PAID">Paid Delegates Only</option>
            <option value="PENDING">Pending Payment Delegates</option>
            <option value="AUTHOR">PaperCept Authors</option>
            <option value="STUDENT">Student Delegates</option>
          </select>
        </div>

        <Button
          type="button"
          variant="ute"
          className="w-full"
          disabled={sendingBroadcast || !selectedSlug}
          onClick={onBroadcastTemplate}
        >
          {sendingBroadcast ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Broadcast Selected Template
        </Button>
      </Card>
    </div>
  );
}
