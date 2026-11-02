"use client";

import React from "react";
import { BookOpen, Calendar, Mail, FileCheck, ArrowRight } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

interface WorkshopTutorialProps {
  title?: string;
  subtitle?: string;
  proposalDeadline?: string;
  contactEmail?: string;
}

export function WorkshopTutorialSection({
  title = "Workshops & Tutorial Proposals",
  subtitle = "Propose hands-on tutorials and specialized workshops preceding the main technical conference program",
  proposalDeadline = "February 15, 2027",
  contactEmail = "smc2027@hcmute.edu.vn",
}: WorkshopTutorialProps) {
  return (
    <SectionContainer id="workshops" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Special Sessions & Tutorials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workshop Proposal Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Technical Workshop Proposals</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Workshops provide an informal setting where researchers discuss emerging topics, share preliminary findings, and establish interdisciplinary research collaborations.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Format: Half-day (3.5 hours) or Full-day (7 hours)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Includes invited talks and peer-reviewed contributed presentations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Indexed in IEEE Xplore digital library
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Proposal Deadline</span>
              <span className="font-bold text-indigo-600">{proposalDeadline}</span>
            </div>
          </div>

          {/* Hands-On Tutorial Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hands-On Tutorials</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Tutorials deliver state-of-the-art educational overviews and software training on contemporary algorithms, robotics toolkits, and machine intelligence architectures.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Format: 2-hour or 3-hour focused instruction
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Targeted at graduate students and industry practitioners
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Interactive code notebooks and hardware demonstration
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Submission Contact</span>
              <a href={`mailto:${contactEmail}`} className="font-bold text-indigo-600 hover:underline">
                {contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
