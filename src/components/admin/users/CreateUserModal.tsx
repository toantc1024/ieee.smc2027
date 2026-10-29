"use client";

import React, { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError("Please provide both email and full name");
      return;
    }

    setError("");
    try {
      await onCreate({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        password: password.trim(),
        avatar: avatar.trim(),
      });
      setEmail("");
      setName("");
      setRole("USER");
      setPassword("");
      setAvatar("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md font-sans p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-base font-bold text-slate-900">
            Add New User
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Email */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Email Address <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Role
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

          {/* Initial Password */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Login Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter initial password (optional)..."
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400">
              If left empty, the user can log in via Google or Email OTP.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={creating}
              className="h-8.5 px-3.5 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creating}
              className="h-8.5 px-4 text-xs bg-[#005496] hover:bg-[#004276] text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
