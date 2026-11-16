"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface SubmissionPortalItem {
  name: string;
  system: string;
  badge: string;
  description: string;
  url: string;
  buttonLabel?: string;
  primary?: boolean;
}

export const DEFAULT_SUBMISSION_PORTALS: SubmissionPortalItem[] = [
  {
    name: "PaperCept Conference Management System",
    system: "PaperCept",
    badge: "Official Primary Portal",
    description:
      "Official manuscript submission system for IEEE SMC 2027. Submit Regular Papers, Special Session Papers, and Workshop Manuscripts, and obtain your PaperCept Paper ID for Author Registration.",
    url: "https://ras.papercept.net",
    buttonLabel: "Open PaperCept",
    primary: true,
  },
  {
    name: "IEEE PDF eXpress Verification",
    system: "PDF eXpress",
    badge: "Camera-Ready Check",
    description:
      "Mandatory IEEE Xplore compatibility verification tool for all accepted manuscripts prior to uploading the final camera-ready PDF to PaperCept.",
    url: "https://ieee-pdf-express.org",
    buttonLabel: "Open PDF eXpress",
    primary: false,
  },
  {
    name: "IEEE Electronic Copyright Form",
    system: "IEEE eCF",
    badge: "Copyright Transfer",
    description:
      "Completed directly through your PaperCept author workspace during final camera-ready manuscript submission.",
    url: "https://ras.papercept.net",
    buttonLabel: "Open IEEE eCF",
    primary: false,
  },
];

export interface SubmissionPortalsBlockProps {
  title?: string;
  subtitle?: string;
  portals?: SubmissionPortalItem[];
}

export function SubmissionPortalsBlock({
  title = "Official PaperCept Submission & Publication Workflow",
  subtitle = "All manuscripts submitted to IEEE SMC 2027 are managed via PaperCept. Accepted authors must reference their PaperCept Paper ID during conference registration.",
  portals = DEFAULT_SUBMISSION_PORTALS,
}: SubmissionPortalsBlockProps) {
  const list = Array.isArray(portals) ? portals : [];

  return (
    <SectionContainer id="submission-portals" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />
        <div className="space-y-3 relative z-10 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2]">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-10 sm:pb-14 pt-4">
        {list.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No submission portals configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((portal, idx) => (
              <Card
                key={idx}
                {...subItemAttr(["portals", idx])}
                className={`justify-between p-6 rounded-md bg-white ${
                  portal.primary
                    ? "border-2 border-[#115eff] shadow-md"
                    : "border border-blue-100/90 hover:border-[#115eff]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={portal.primary ? "ute" : "secondary"}>
                      {portal.badge}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">
                      {portal.system}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#004776]">
                    {portal.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <a
                  href={portal.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block pt-4"
                >
                  <Button
                    variant={portal.primary ? "ute" : "outline"}
                    className="w-full"
                  >
                    <span>{portal.buttonLabel || `Open ${portal.system || "Portal"}`}</span>
                    <ExternalLink className="size-4" />
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
