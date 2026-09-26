"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Globe,
  Phone,
  Send,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export interface ContactCardsProps {
  title?: string;
  subtitle?: string;
  email?: string;
  location?: string;
  venue?: string;
  website?: string;
}

export function ContactCards({
  title = "Contact Us",
  subtitle = "Have questions regarding paper submissions, proposals, or conference participation? We are here to assist you.",
  email = "IEEESMC2026@gmail.com",
  location = "Bellevue, WA, USA",
  venue = "Bellevue, WA, USA",
  website = "www.ieeesmc2026.org",
}: ContactCardsProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleCopy = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.message) {
      setFormSubmitted(true);
    }
  };

  return (
    <SectionContainer id="contact" fullWidthBg="bg-slate-50/50">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Contact Us</span>
            <span className="block text-[#115eff]">& Get in Touch</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        {/* 3 Prominent Cards matching IEEE SMC format */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Email */}
          <div className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns on Card Hover */}
            <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
            <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-[#115eff] rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <Mail className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                E-mail
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Official Support Desk
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                For questions regarding paper submission, proposals, registration, or partner sponsorships.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 break-all mb-2">
                {email}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${email}`}
                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
              >
                <span>Compose Email</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCopy("email", email)}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "email" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Location & Venue */}
          <div className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns on Card Hover */}
            <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
            <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-[#115eff] rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <MapPin className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Location
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {location}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Host destination featuring dynamic technology ecosystems and scenic Pacific Northwest beauty.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 leading-relaxed">
                <strong>{location}</strong>
                <span className="block text-slate-500 mt-1">
                  Washington State, United States of America
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-xs text-slate-400">Host City</span>
            </div>
          </div>

          {/* Card 3: Website & Digital Services */}
          <div className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns on Card Hover */}
            <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
            <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-[#115eff] rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <Globe className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Website
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Official Web Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Access official announcements, author guidelines, hotel booking discounts, and schedule updates.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 break-all">
                {website.startsWith("http") ? website : `https://${website}`}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCopy("website", website.startsWith("http") ? website : `https://${website}`)}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "website" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Quick Message Form Strip */}
        <div className="mt-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#115eff] uppercase tracking-wider mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Send Direct Inquiry to Secretariat</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Need Assistance or Have a Question?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mb-6">
            Our organizing committee will review your query and reply within 1-2 business days.
          </p>

          {formSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-sm text-emerald-900">
                <span className="font-bold block">Inquiry Submitted Successfully!</span>
                Thank you for contacting the IEEE SMC 2027 Secretariat. We will respond to <em>{formData.email}</em> shortly.
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#115eff] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#115eff] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topic / Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#115eff] focus:bg-white"
                  >
                    <option value="">Select a topic...</option>
                    <option value="submission">Paper Submission / CFP</option>
                    <option value="special-sessions">Special Sessions Proposal</option>
                    <option value="visa">Visa Invitation Letter</option>
                    <option value="registration">Registration & Fees</option>
                    <option value="partnership">Sponsorship & Exhibition</option>
                    <option value="other">Other Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#115eff] focus:bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-md transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
