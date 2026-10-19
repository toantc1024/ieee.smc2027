"use client";

import React from "react";
import {
  ExternalLink,
  Download,
  Calendar,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function SubmissionsPage() {
  const submissionPortals = [
    {
      name: "PaperCept Conference Management System",
      system: "PaperCept",
      badge: "Official Primary Portal",
      description:
        "Official manuscript submission system for IEEE SMC 2027. Submit Regular Papers, Special Session Papers, and Workshop Manuscripts, and obtain your PaperCept Paper ID for Author Registration.",
      url: "https://ras.papercept.net",
      primary: true,
    },
    {
      name: "IEEE PDF eXpress Verification",
      system: "PDF eXpress",
      badge: "Camera-Ready Check",
      description:
        "Mandatory IEEE Xplore compatibility verification tool for all accepted manuscripts prior to uploading the final camera-ready PDF to PaperCept.",
      url: "https://ieee-pdf-express.org",
      primary: false,
    },
    {
      name: "IEEE Electronic Copyright Form",
      system: "IEEE eCF",
      badge: "Copyright Transfer",
      description:
        "Completed directly through your PaperCept author workspace during final camera-ready manuscript submission.",
      url: "https://ras.papercept.net",
      primary: false,
    },
  ];

  const milestones = [
    {
      date: "April 08, 2027",
      event: "Full Manuscript Submission Deadline on PaperCept",
      status: "Upcoming",
    },
    {
      date: "May 30, 2027",
      event: "Notification of Paper Acceptance via PaperCept",
      status: "Upcoming",
    },
    {
      date: "July 15, 2027",
      event: "Final Camera-Ready Paper Submission Deadline",
      status: "Upcoming",
    },
    {
      date: "August 05, 2027",
      event: "Author Registration & Payoo Payment Deadline",
      status: "Upcoming",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20">
      <div className="bg-white border-b border-slate-200">
        <SectionContainer
          id="submissions-header"
          fullWidthBg="bg-white"
          className="py-10 sm:py-14"
        >
          <div className="max-w-4xl space-y-3">
            <Badge variant="ute" className="px-3 py-1">
              <BookOpen className="size-3.5" />
              Call For Papers & PaperCept Portal
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              PaperCept Submission & <span className="text-[#005496]">Author Guidelines</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Official IEEE double-column formatting instructions, LaTeX and Word templates, and direct access to the PaperCept submission portal.
            </p>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="submissions-body" fullWidthBg="transparent" className="pt-8">
        <div className="space-y-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              1. Official PaperCept Submission & Publication Workflow
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              All manuscripts submitted to IEEE SMC 2027 are managed exclusively via PaperCept. Accepted authors must reference their PaperCept Paper ID during conference registration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {submissionPortals.map((portal, idx) => (
                <Card
                  key={idx}
                  className={`justify-between ${
                    portal.primary
                      ? "border-2 border-[#005496] shadow-md"
                      : "border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={portal.primary ? "ute" : "secondary"}>
                        {portal.badge}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">
                        {portal.system}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {portal.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block pt-2"
                  >
                    <Button
                      variant={portal.primary ? "ute" : "outline"}
                      className="w-full"
                    >
                      <span>Open {portal.system}</span>
                      <ExternalLink className="size-4" />
                    </Button>
                  </a>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <Card>
                <h2 className="text-lg font-extrabold text-slate-900">
                  2. Manuscript Formatting & Page Length Rules
                </h2>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Standard Page Length:</strong> 6 pages in standard IEEE two-column conference format, including figures, tables, and references.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Extra Pages Surcharge:</strong> Up to 2 additional pages are permitted (maximum 8 pages total) with an extra page surcharge calculated automatically during registration.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Author Registration Requirement:</strong> Each accepted PaperCept manuscript must be covered by at least one paid Author Registration before the camera-ready deadline.
                    </span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="https://www.ieee.org/conferences/publishing/templates.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ute" size="sm">
                      <Download className="size-4" />
                      Download IEEE LaTeX & Word Templates
                    </Button>
                  </a>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card>
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-[#005496]" />
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Important Deadlines
                  </h2>
                </div>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-extrabold text-[#005496]">
                          {m.date}
                        </p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {m.event}
                        </p>
                      </div>
                      <Badge variant="secondary">{m.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}
