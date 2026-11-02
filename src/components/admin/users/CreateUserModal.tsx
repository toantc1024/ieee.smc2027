"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Mail,
  User,
  Shield,
  Building2,
  KeyRound,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";

export interface CreateUserPayload {
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  password?: string;
  avatar?: string;
  sendInviteEmail: boolean;
  profileData?: {
    conferenceRole: "SUBMITTER" | "SPEAKER" | "ATTENDEE";
    affiliation: string;
  };
}

interface CreateUserModalProps {
  open: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: (payload: CreateUserPayload) => Promise<void>;
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
  const [conferenceRole, setConferenceRole] = useState<
    "SUBMITTER" | "SPEAKER" | "ATTENDEE"
  >("SUBMITTER");
  const [affiliation, setAffiliation] = useState("");
  const [password, setPassword] = useState("");
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setEmail("");
    setName("");
    setRole("USER");
    setConferenceRole("SUBMITTER");
    setAffiliation("");
    setPassword("");
    setSendInviteEmail(true);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName) {
      setError("Please provide both email address and full name");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    try {
      await onCreate({
        email: cleanEmail,
        name: cleanName,
        role,
        ...(password.trim() ? { password: password.trim() } : {}),
        sendInviteEmail,
        profileData: {
          conferenceRole,
          affiliation: affiliation.trim(),
        },
      });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md font-sans p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 text-[#115eff] flex items-center justify-center shrink-0">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Add New User
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Register a conference attendee, presenter, or administrator
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="size-3.5 text-slate-400" />
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nguyen Van A"
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
              disabled={creating}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="size-3.5 text-slate-400" />
              Email Address <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="user@example.com"
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
              disabled={creating}
            />
          </div>

          {/* System Role & Conference Role Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* System Role */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Shield className="size-3.5 text-slate-400" />
                System Role
              </Label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val as "ADMIN" | "USER")}
                disabled={creating}
              >
                <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Regular User</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conference Track */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="size-3.5 text-slate-400" />
                Conference Track
              </Label>
              <Select
                value={conferenceRole}
                onValueChange={(val) =>
                  setConferenceRole(
                    val as "SUBMITTER" | "SPEAKER" | "ATTENDEE"
                  )
                }
                disabled={creating}
              >
                <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTER">Author / Submitter</SelectItem>
                  <SelectItem value="SPEAKER">Presenter / Speaker</SelectItem>
                  <SelectItem value="ATTENDEE">Attendee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Affiliation */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="size-3.5 text-slate-400" />
              Affiliation
            </Label>
            <Input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="e.g. HCMUTE, IEEE SMC Society"
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              disabled={creating}
            />
          </div>

          {/* Initial Password */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-slate-400" />
              Initial Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to use email code / invitation"
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              disabled={creating}
            />
          </div>

          {/* Send Invitation Email Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="space-y-0.5 pr-2">
              <Label
                htmlFor="create-send-email-switch"
                className="text-xs font-semibold text-slate-800 cursor-pointer block"
              >
                Send invitation email
              </Label>
              <p className="text-[11px] text-slate-500">
                Send an account activation link and login instructions
              </p>
            </div>
            <Switch
              id="create-send-email-switch"
              checked={sendInviteEmail}
              onCheckedChange={setSendInviteEmail}
              disabled={creating}
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={creating}
              className="h-8.5 px-3.5 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creating}
              className="h-8.5 px-4 text-xs font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white rounded-lg shadow-none"
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
