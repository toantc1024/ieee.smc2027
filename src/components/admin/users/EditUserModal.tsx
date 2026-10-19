"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import type { AdminUserRecord } from "./UserTable";

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
  const [jsonText, setJsonText] = useState("{}");
  const [syntaxError, setSyntaxError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role);
      setAvatar(user.avatar || "");
      setPassword("");
      setJsonText(JSON.stringify(user.profileData || {}, null, 2));
      setSyntaxError("");
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyntaxError("");
    try {
      const parsed = JSON.parse(jsonText || "{}");
      await onSave({
        id: user.id,
        name,
        role,
        avatar: avatar || null,
        ...(password.trim() ? { password: password.trim() } : {}),
        profileData: parsed,
      });
    } catch {
      setSyntaxError("Invalid JSON syntax in profileData editor.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Manage User & Unstructured JSON Profile
            </h3>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <ImageUploadField
            label="User Avatar"
            value={avatar}
            onChange={setAvatar}
            folder="public/avatars"
            accept="image/*"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>System Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Set / Reset Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Code2 className="size-3.5 text-[#005496]" />
              Unstructured JSON `User.profileData`
            </Label>
            <Textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="font-mono text-xs bg-slate-900 text-emerald-400"
            />
          </div>

          {syntaxError && (
            <p className="text-xs font-semibold text-red-600">{syntaxError}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="ute" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Changes to DB
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
