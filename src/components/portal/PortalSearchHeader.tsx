"use client";

import React from "react";
import { User, Search } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PortalSearchHeaderProps {
  searchCode: string;
  loading: boolean;
  onChangeSearchCode: (code: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function PortalSearchHeader({
  searchCode,
  loading,
  onChangeSearchCode,
  onSearchSubmit,
}: PortalSearchHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <SectionContainer id="portal-header" fullWidthBg="bg-white" className="py-10 sm:py-12">
        <div className="max-w-4xl space-y-3">
          <Badge variant="ute" className="px-3 py-1">
            <User className="size-3.5" />
            Delegate Portal & Digital Badge
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Delegate Profile & <span className="text-[#115eff]">Digital Badge Portal</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage your JSON-based delegate profile, complete Payoo checkout, print your QR conference badge, and download your Official Receipt or Visa Support Letter.
          </p>

          <form
            onSubmit={onSearchSubmit}
            className="pt-3 flex flex-col sm:flex-row gap-3 max-w-xl"
          >
            <div className="relative grow">
              <Search className="size-4 text-slate-400 absolute left-3.5 top-3" />
              <Input
                type="text"
                placeholder="Enter registration code, e.g. SMC27-A8B9C2..."
                value={searchCode}
                onChange={(e) => onChangeSearchCode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="ute" disabled={loading}>
              {loading ? "Loading..." : "Look Up"}
            </Button>
          </form>
        </div>
      </SectionContainer>
    </div>
  );
}
