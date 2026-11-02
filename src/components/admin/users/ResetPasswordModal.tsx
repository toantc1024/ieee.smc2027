"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";

export interface ResetPasswordTarget {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

interface ResetPasswordModalProps {
  open: boolean;
  user: ResetPasswordTarget | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordModal({
  open,
  user,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendNotificationEmail, setSendNotificationEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to generate secure random password
  const generateRandomPassword = () => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghjkmnpqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*";
    const all = uppercase + lowercase + numbers + symbols;

    let pwd = "";
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 16; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle characters
    pwd = pwd
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setNewPassword(pwd);
    setError(null);
  };

  const handleClose = () => {
    setNewPassword("");
    setShowPassword(false);
    setCopied(false);
    setSendNotificationEmail(true);
    setError(null);
    onClose();
  };

  if (!user) return null;

  const handleCopy = async () => {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success("Password copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError("Please enter or generate a new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Attempt dedicated reset-password endpoint first, fallback to PATCH user
      let res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword,
          sendEmail: sendNotificationEmail,
        }),
      });

      if (!res.ok && res.status === 404) {
        // Fallback to PATCH /api/admin/users/[id]
        res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: newPassword,
          }),
        });
      }

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to reset password");
      }

      toast.success(`Password updated successfully for ${user.email}`);
      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-md font-sans p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <KeyRound className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-slate-900">
                  Reset Password
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5 truncate">
                  Set a temporary or custom password for this user
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* User Preview Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={36}
                height={36}
                unoptimized
                className="size-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="size-9 rounded-full bg-blue-50 text-[#115eff] font-bold text-xs flex items-center justify-center shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <Mail className="size-3" />
                {user.email}
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Password Input & Generation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                New Password <span className="text-rose-500">*</span>
              </Label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-semibold text-[#115eff] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="size-3" />
                Generate Random
              </button>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter or generate secure password"
                className="h-9 px-3 pr-20 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                disabled={submitting}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {newPassword && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
                    title="Copy password"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Email Notification Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="space-y-0.5 pr-2">
              <Label
                htmlFor="reset-send-email-switch"
                className="text-xs font-semibold text-slate-800 cursor-pointer block"
              >
                Send notification email
              </Label>
              <p className="text-[11px] text-slate-500">
                Email the new credentials to the user
              </p>
            </div>
            <Switch
              id="reset-send-email-switch"
              checked={sendNotificationEmail}
              onCheckedChange={setSendNotificationEmail}
              disabled={submitting}
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={submitting}
              className="h-8.5 px-3.5 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-8.5 px-4 text-xs font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white rounded-lg shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
