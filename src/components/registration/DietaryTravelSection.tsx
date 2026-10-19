"use client";

import React from "react";
import { Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { UnstructuredRegistrationFormData } from "@/types";

interface DietaryTravelSectionProps {
  formData: UnstructuredRegistrationFormData;
  onChange: (next: UnstructuredRegistrationFormData) => void;
}

export function DietaryTravelSection({
  formData,
  onChange,
}: DietaryTravelSectionProps) {
  return (
    <Card>
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <Plane className="size-5 text-[#005496]" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Dietary Preferences & Travel Logistics
          </h3>
          <p className="text-xs text-slate-500">
            Catering and airport shuttle coordination in Ho Chi Minh City
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Dietary Preference</Label>
          <select
            value={formData.dietaryRequirement || "Normal"}
            onChange={(e) =>
              onChange({ ...formData, dietaryRequirement: e.target.value })
            }
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900"
          >
            <option value="Normal">Standard Menu</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Halal">Halal Certified</option>
            <option value="Vegan">Strict Vegan</option>
            <option value="Gluten-Free">Gluten-Free</option>
            <option value="Allergy">Food Allergy</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Allergy / Special Catering Notes</Label>
          <Input
            placeholder="Peanut allergy, lactose intolerance..."
            value={formData.allergyDetails || ""}
            onChange={(e) =>
              onChange({ ...formData, allergyDetails: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Arrival Flight Number</Label>
          <Input
            placeholder="VN210 / CZ3069"
            value={formData.arrivalFlight || ""}
            onChange={(e) =>
              onChange({ ...formData, arrivalFlight: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Arrival Date & Time</Label>
          <Input
            type="datetime-local"
            value={formData.arrivalDateTime || ""}
            onChange={(e) =>
              onChange({ ...formData, arrivalDateTime: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Hotel in Ho Chi Minh City</Label>
          <Input
            placeholder="Rex Hotel Saigon / Majestic Saigon..."
            value={formData.hotelName || ""}
            onChange={(e) =>
              onChange({ ...formData, hotelName: e.target.value })
            }
          />
        </div>

        <div className="flex items-end pb-2">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(formData.airportShuttleRequired)}
              onChange={(e) =>
                onChange({
                  ...formData,
                  airportShuttleRequired: e.target.checked,
                })
              }
              className="size-4 accent-[#005496] rounded"
            />
            Request Tan Son Nhat Airport Shuttle Info
          </label>
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label>Additional Travel Notes</Label>
          <Textarea
            placeholder="Any special accessibility or arrival notes..."
            value={formData.travelNotes || ""}
            onChange={(e) =>
              onChange({ ...formData, travelNotes: e.target.value })
            }
          />
        </div>
      </div>
    </Card>
  );
}
