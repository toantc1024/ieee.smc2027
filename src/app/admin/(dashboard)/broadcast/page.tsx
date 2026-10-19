"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Code2,
  Loader2,
} from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MilestoneTemplate {
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

export default function AdminBroadcastPage() {
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [previewMode, setPreviewMode] = useState<"HTML" | "SOURCE">("HTML");

  // Editable fields for the selected DB template
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [editText, setEditText] = useState("");

  // Broadcast Dispatch Controls
  const [targetGroup, setTargetGroup] = useState<string>("ALL");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const json = await res.json();
      if (res.ok && json.success) {
        const list: MilestoneTemplate[] = json.data.templates || [];
        setTemplates(list);
        if (list.length > 0 && !selectedSlug) {
          const first = list[0];
          setSelectedSlug(first.slug);
          setEditSubject(first.subject);
          setEditHtml(first.htmlContent);
          setEditText(first.textContent);
        }
      }
    } catch {
      setStatusBanner({
        type: "error",
        text: "Failed to load milestone email templates from PostgreSQL.",
      });
    } finally {
      setLoadingTemplates(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSelectTemplate = (tpl: MilestoneTemplate) => {
    setSelectedSlug(tpl.slug);
    setEditSubject(tpl.subject);
    setEditHtml(tpl.htmlContent);
    setEditText(tpl.textContent);
    setStatusBanner(null);
  };

  const handleSaveTemplate = async () => {
    if (!selectedSlug) return;
    setSavingTemplate(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedSlug,
          subject: editSubject,
          htmlContent: editHtml,
          textContent: editText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save template");
      }
      setStatusBanner({
        type: "success",
        text: `Saved milestone template "${selectedSlug}" in PostgreSQL.`,
      });
      await loadTemplates();
    } catch (err: unknown) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleBroadcastTemplate = async () => {
    setSendingBroadcast(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/registration/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGroup,
          templateSlug: selectedSlug,
          subject: editSubject,
          message: editText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Broadcast dispatch failed");
      }
      setStatusBanner({
        type: "success",
        text:
          json.data?.message ||
          `Dispatched milestone email to ${json.data?.sentCount || 0} delegate(s).`,
      });
    } catch (err: unknown) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Broadcast failed",
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const activeTemplate = templates.find((t) => t.slug === selectedSlug);

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        imageIcon="/assets/3d-icons/article-management__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-utilities-bg.jpg"
        title="Milestone Email Templates & Broadcasts"
        description="Customize PostgreSQL-backed HTML email templates for every IEEE SMC 2027 conference milestone and broadcast personalized notifications."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setPreviewMode((m) => (m === "HTML" ? "SOURCE" : "HTML"))
          }
        >
          {previewMode === "HTML" ? (
            <>
              <Code2 className="size-4" />
              Edit HTML Source
            </>
          ) : (
            <>
              <Eye className="size-4" />
              Live Branded Preview
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ute"
          size="sm"
          disabled={savingTemplate || !selectedSlug}
          onClick={handleSaveTemplate}
        >
          {savingTemplate ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Template to DB
        </Button>
      </ManagementPageHeader>

      {statusBanner && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            statusBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {statusBanner.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{statusBanner.text}</span>
        </div>
      )}

      {loadingTemplates ? (
        <Card className="p-16 items-center justify-center text-slate-400">
          <Loader2 className="size-7 animate-spin text-[#005496]" />
          <span className="text-xs">Loading milestone email templates...</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Milestone List & Broadcast Trigger */}
          <div className="lg:col-span-4 space-y-6">
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
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#005496] bg-blue-50/70 shadow-2xs"
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

            {/* Broadcast Campaign Sender */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-[#005496]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Dispatch Milestone Broadcast
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Send the currently selected milestone template with automatic merge tags to a delegate group.
              </p>

              <div className="space-y-1.5">
                <Label>Target Delegate Group</Label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
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
                onClick={handleBroadcastTemplate}
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

          {/* Right Column: Template Editor & Branded HTML Preview */}
          <div className="lg:col-span-8 space-y-6">
            {activeTemplate && (
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
                          className="mx-1 px-1.5 py-0.5 rounded bg-slate-100 text-[#005496] font-mono text-[11px]"
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
                    onChange={(e) => setEditSubject(e.target.value)}
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
                        onChange={(e) => setEditHtml(e.target.value)}
                        className="font-mono text-xs bg-slate-900 text-emerald-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Plain Text Fallback Content</Label>
                      <Textarea
                        rows={5}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
