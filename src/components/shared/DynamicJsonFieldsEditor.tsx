"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DynamicJsonFieldsEditorProps {
  label?: string;
  fields?: Record<string, string>;
  onChange: (nextFields: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function DynamicJsonFieldsEditor({
  label = "Additional Unstructured JSON Attributes",
  fields = {},
  onChange,
  keyPlaceholder = "Attribute key, e.g. GrantNumber",
  valuePlaceholder = "Value, e.g. NSFC-2027-8821",
}: DynamicJsonFieldsEditorProps) {
  const [customKey, setCustomKey] = useState("");
  const [customVal, setCustomVal] = useState("");

  const handleAdd = () => {
    const k = customKey.trim();
    if (!k) return;
    onChange({
      ...fields,
      [k]: customVal.trim(),
    });
    setCustomKey("");
    setCustomVal("");
  };

  const handleRemove = (key: string) => {
    const next = { ...fields };
    delete next[key];
    onChange(next);
  };

  const entries = Object.entries(fields);

  return (
    <div className="pt-4 border-t border-slate-100 space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={keyPlaceholder}
          value={customKey}
          onChange={(e) => setCustomKey(e.target.value)}
          className="sm:w-1/3"
        />
        <Input
          placeholder={valuePlaceholder}
          value={customVal}
          onChange={(e) => setCustomVal(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Field
        </Button>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs"
            >
              <span className="font-bold text-slate-700">{k}:</span>
              <span className="text-slate-600">{v}</span>
              <button
                type="button"
                onClick={() => handleRemove(k)}
                className="text-slate-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
