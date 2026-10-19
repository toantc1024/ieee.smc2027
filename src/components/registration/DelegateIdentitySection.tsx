"use client";

import React from "react";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";

export interface BasicIdentityState {
  fullName: string;
  email: string;
  phone: string;
  affiliation: string;
  country: string;
  avatarUrl: string;
  paymentMethod: "PAYOO_VIETQR" | "PAYOO_CARD";
}

interface DelegateIdentitySectionProps {
  value: BasicIdentityState;
  onChange: (next: BasicIdentityState) => void;
}

export function DelegateIdentitySection({
  value,
  onChange,
}: DelegateIdentitySectionProps) {
  return (
    <Card>
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <User className="size-5 text-[#005496]" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Core Delegate Identity & Badge Photo
          </h3>
          <p className="text-xs text-slate-500">
            Primary identity fields linked to your conference badge and user account
          </p>
        </div>
      </div>

      <ImageUploadField
        label="Delegate Badge Photo"
        description="Upload a portrait photo or select from the Media Library for your printed conference badge."
        value={value.avatarUrl}
        onChange={(url) => onChange({ ...value, avatarUrl: url })}
        folder="public/avatars"
        accept="image/*"
        aspect="square"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input
            required
            placeholder="Prof. Nguyen Van A"
            value={value.fullName}
            onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Email Address *</Label>
          <Input
            type="email"
            required
            placeholder="delegate@university.edu"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Phone / Mobile</Label>
          <Input
            placeholder="+84 901 234 567"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Country / Region *</Label>
          <Input
            required
            placeholder="Vietnam, China, Japan, USA..."
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label>University / Organization Affiliation *</Label>
          <Input
            required
            placeholder="Ho Chi Minh City University of Technology and Education"
            value={value.affiliation}
            onChange={(e) => onChange({ ...value, affiliation: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
}
