"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, Eye, Code2, Loader2 } from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import {
  MilestoneTemplateSelector,
  type MilestoneTemplateItem,
} from "@/components/admin/broadcast/MilestoneTemplateSelector";
import { MilestoneTemplateEditor } from "@/components/admin/broadcast/MilestoneTemplateEditor";

export default function AdminBroadcastPage() {
  const [templates, setTemplates] = useState<MilestoneTemplateItem[]>([]);
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
        const list: MilestoneTemplateItem[] = json.data.templates || [];
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

  const handleSelectTemplate = (tpl: MilestoneTemplateItem) => {
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
        <StatusAlertBanner
          variant={statusBanner.type}
          message={statusBanner.text}
          onDismiss={() => setStatusBanner(null)}
        />
      )}

      {loadingTemplates ? (
        <Card className="p-16 items-center justify-center text-slate-400">
          <Loader2 className="size-7 animate-spin text-[#005496]" />
          <span className="text-xs">Loading milestone email templates...</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <MilestoneTemplateSelector
              templates={templates}
              selectedSlug={selectedSlug}
              onSelectTemplate={handleSelectTemplate}
              targetGroup={targetGroup}
              onTargetGroupChange={setTargetGroup}
              sendingBroadcast={sendingBroadcast}
              onBroadcastTemplate={handleBroadcastTemplate}
            />
          </div>

          <div className="lg:col-span-8">
            {activeTemplate && (
              <MilestoneTemplateEditor
                activeTemplate={activeTemplate}
                previewMode={previewMode}
                editSubject={editSubject}
                onSubjectChange={setEditSubject}
                editHtml={editHtml}
                onHtmlChange={setEditHtml}
                editText={editText}
                onTextChange={setEditText}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
