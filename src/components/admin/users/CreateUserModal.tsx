"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";

interface CreateUserModalProps {
  open: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: (payload: {
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    password: string;
    avatar: string;
  }) => Promise<void>;
}

export function CreateUserModal({
  open,
  creating,
  onClose,
  onCreate,
}: CreateUserModalProps) {
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "USER" as "ADMIN" | "USER",
    password: "",
    avatar: "",
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(form);
    setForm({ email: "", name: "", role: "USER", password: "", avatar: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            Create Database User / Administrator
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploadField
            label="Avatar Photo"
            value={form.avatar}
            onChange={(url) => setForm((prev) => ({ ...prev, avatar: url }))}
            folder="public/avatars"
            accept="image/*"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email Address *</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@hcmute.edu.vn"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Database Role</Label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value as "ADMIN" | "USER",
                  }))
                }
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="USER">USER — Delegate</option>
                <option value="ADMIN">ADMIN — Full Console Access</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Optional Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Leave blank for OTP / Google only"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="ute" disabled={creating}>
              {creating ? <Loader2 className="size-4 animate-spin" /> : null}
              Create Account in DB
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
