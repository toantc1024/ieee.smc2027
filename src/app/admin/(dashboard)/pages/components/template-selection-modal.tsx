"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sliders,
  FileText,
  Users,
  CreditCard,
  Clock,
  MapPin,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeSlug } from "@/app/api/admin/pages/route";

export interface TemplatePreset {
  id: string;
  name: string;
  defaultSlug: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  initialBlocks: Array<{ id: string; type: string; props: Record<string, any>; hidden?: boolean }>;
}

export const CONFERENCE_TEMPLATES: TemplatePreset[] = [
  {
    id: "home",
    name: "Home Portal",
    defaultSlug: "home",
    badge: "Recommended",
    description: "Official conference landing portal with hero carousel, CFP announcement, committee preview, and critical milestones.",
    icon: Sliders,
    initialBlocks: [
      { id: "hero-1", type: "HeroCarousel", props: { autoplayDuration: 7 } },
      { id: "cfp-1", type: "CallForPapers", props: {} },
      { id: "dates-1", type: "ImportantDatesSection", props: {} },
      { id: "committees-1", type: "CommitteesSection", props: {} },
    ],
  },
  {
    id: "call-for-papers",
    name: "Call for Papers",
    defaultSlug: "call-for-papers",
    badge: "Academic",
    description: "Official CFP announcement with track list, paper templates, submission countdown, and author guidelines.",
    icon: FileText,
    initialBlocks: [
      { id: "cfp-1", type: "CallForPapers", props: {} },
      { id: "dates-1", type: "ImportantDatesSection", props: {} },
      { id: "tracks-1", type: "ConferenceTracksSection", props: {} },
      { id: "guidelines-1", type: "PaperSubmissionGuidelinesSection", props: {} },
      { id: "faq-1", type: "FaqAccordionSection", props: {} },
    ],
  },
  {
    id: "committees",
    name: "Committees & Leadership",
    defaultSlug: "committees",
    badge: "Organization",
    description: "Distinguished leadership, honorary chairs, organizing committee, and technical program committee.",
    icon: Users,
    initialBlocks: [
      { id: "committees-1", type: "CommitteesSection", props: {} },
      { id: "contact-1", type: "ContactSupportSection", props: {} },
    ],
  },
  {
    id: "registration",
    name: "Registration & Fees",
    defaultSlug: "registration",
    badge: "Delegate",
    description: "Author, member, and student fee schedule, payment methods, bank transfer details, and receipts.",
    icon: CreditCard,
    initialBlocks: [
      { id: "fees-1", type: "RegistrationFeesSection", props: {} },
      { id: "dates-1", type: "ImportantDatesSection", props: {} },
      { id: "faq-1", type: "FaqAccordionSection", props: {} },
      { id: "contact-1", type: "ContactSupportSection", props: {} },
    ],
  },
  {
    id: "program",
    name: "Technical Program",
    defaultSlug: "program",
    badge: "Schedule",
    description: "Plenary keynotes, technical tracks timeline, special sessions, workshops, and social banquet agenda.",
    icon: Clock,
    initialBlocks: [
      { id: "keynotes-1", type: "KeynoteSpeakersSection", props: {} },
      { id: "schedule-1", type: "ScheduleTimelineSection", props: {} },
      { id: "tracks-1", type: "ConferenceTracksSection", props: {} },
      { id: "workshops-1", type: "WorkshopTutorialSection", props: {} },
    ],
  },
  {
    id: "venue-travel",
    name: "Venue & Travel",
    defaultSlug: "venue-travel",
    badge: "Hospitality",
    description: "Sheraton Saigon Grand Opera Hotel venue, travel directions, hotel accommodations, and Vietnam e-Visa guide.",
    icon: MapPin,
    initialBlocks: [
      { id: "venue-1", type: "VenueLocationSection", props: {} },
      { id: "travel-1", type: "TravelAccommodationSection", props: {} },
      { id: "visa-1", type: "VisaInformationSection", props: {} },
      { id: "contact-1", type: "ContactSupportSection", props: {} },
    ],
  },
  {
    id: "blank",
    name: "Blank Page",
    defaultSlug: "new-page",
    badge: "Custom",
    description: "Start with an empty canvas and assemble sections using the block library and visual canvas dropzones.",
    icon: Plus,
    initialBlocks: [],
  },
];

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
  onPageCreated?: (page: any) => void;
}

export function TemplateSelectionModal({
  open,
  onOpenChange,
  parentId = null,
  onPageCreated,
}: TemplateSelectionModalProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset>(CONFERENCE_TEMPLATES[0]);
  const [title, setTitle] = useState(selectedTemplate.name);
  const [slug, setSlug] = useState(selectedTemplate.defaultSlug);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectTemplate = (tpl: TemplatePreset) => {
    setSelectedTemplate(tpl);
    setTitle(tpl.name);
    setSlug(tpl.id === "home" ? `page-${Date.now()}` : tpl.defaultSlug);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    const normalized = normalizeSlug(slug || title);
    if (!normalized) {
      toast.error("Please enter a valid slug");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: normalized,
          parentId,
          blocks: selectedTemplate.initialBlocks,
          content: {
            root: { title: title.trim(), slug: normalized },
            content: selectedTemplate.initialBlocks,
          },
          isPublished: true,
          metaTitle: `${title.trim()} | IEEE SMC 2027`,
          metaDescription: selectedTemplate.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create page");
      }

      toast.success("Page created successfully");
      onOpenChange(false);
      if (onPageCreated) {
        onPageCreated(data.page);
      }
      router.push(`/admin/pages/${data.page.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create page");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 gap-0">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Create New Conference Page
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Choose a conference layout preset or start with a blank page. You can customize all sections later in the Visual Studio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Conference Presets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONFERENCE_TEMPLATES.map((tpl) => {
                const IconComponent = tpl.icon;
                const isSelected = selectedTemplate.id === tpl.id;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {tpl.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {tpl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-3.5 right-3.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Page Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="page-title" className="text-xs font-medium text-slate-700">
                  Page Title
                </Label>
                <Input
                  id="page-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (selectedTemplate.id === "blank") {
                      setSlug(normalizeSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Call for Papers"
                  className="bg-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page-slug" className="text-xs font-medium text-slate-700">
                  URL Slug
                </Label>
                <div className="flex items-center rounded-md border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <span className="text-xs text-slate-400 select-none">/</span>
                  <input
                    id="page-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="call-for-papers"
                    className="w-full bg-transparent py-2 pl-1 text-sm outline-none text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create & Open Studio"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
