"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  provider?: string;
  hasPassword?: boolean;
  profileData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

interface EditUserModalProps {
  user: AdminUserRecord | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    id: string;
    name: string;
    role: "ADMIN" | "USER";
    avatar: string | null;
    password?: string;
    profileData: Record<string, unknown>;
  }) => Promise<void>;
}

export function EditUserModal({
  user,
  saving,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role);
      setAvatar(user.avatar || "");
      setPassword("");
      const profile = user.profileData || {};
      setAffiliation(String(profile.affiliation || ""));
      setCountry(String(profile.country || ""));
      setError("");
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full name cannot be empty");
      return;
    }

    setError("");
    try {
      await onSave({
        id: user.id,
        name: name.trim(),
        role,
        avatar: avatar.trim() || null,
        ...(password.trim() ? { password: password.trim() } : {}),
        profileData: {
          ...(user.profileData || {}),
          affiliation: affiliation.trim(),
          country: country.trim(),
        },
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update user profile");
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={onClose}>
      <DialogContent className="max-w-md font-sans p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-base font-bold text-slate-900">
            Edit User Profile
          </DialogTitle>
          <p className="text-xs text-slate-500">{user.email}</p>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Account Role
            </Label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val as "ADMIN" | "USER")}
            >
              <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Regular User</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Affiliation & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Affiliation
              </Label>
              <Input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="e.g., HCMUTE"
                className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Country
              </Label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Vietnam"
                className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              New Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged..."
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="h-8.5 px-3.5 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="h-8.5 px-4 text-xs bg-[#115eff] hover:bg-[#0a4de6] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
