"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  ShieldCheck,
  Calendar,
  Save,
  Clock,
  LogOut,
  Mail,
  Building2,
  GraduationCap,
  Network,
  KeyRound,
  Check,
  AlertTriangle,
  Globe,
  Upload,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────────────
export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  provider: string;
  profileData?: {
    affiliation?: string;
    academicTitle?: string;
    degree?: string;
    conferenceRole?: string;
    country?: string;
    bio?: string;
    [key: string]: unknown;
  };
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────
function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Skeleton Loader ───────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[480px] w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable Form fields
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [conferenceRole, setConferenceRole] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

  // Avatar Modal State
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatarInput, setTempAvatarInput] = useState("");

  // Password Update Modal State (for password-based accounts)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Fetch Current Profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load profile");
      }

      const userData: ProfileUser = data.user || data.data?.user || data;
      setUser(userData);

      // Populate form fields
      setFullName(userData.name || "");
      setAvatarUrl(userData.avatar || "");

      const pData = userData.profileData || {};
      setAcademicTitle(String(pData.academicTitle || pData.degree || ""));
      setAffiliation(String(pData.affiliation || ""));
      setConferenceRole(String(pData.conferenceRole || ""));
      setCountry(String(pData.country || ""));
      setBio(String(pData.bio || ""));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error loading profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Save Profile Changes
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: fullName.trim(),
        avatar: avatarUrl.trim() || null,
        profileData: {
          academicTitle: academicTitle.trim(),
          affiliation: affiliation.trim(),
          conferenceRole: conferenceRole.trim() || user?.profileData?.conferenceRole || "DELEGATE",
          country: country.trim(),
          bio: bio.trim(),
        },
      };

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser: ProfileUser = data.user || data.data?.user;
      if (updatedUser) {
        setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
      }

      toast.success("Profile information saved successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle Avatar Modal Apply
  const handleApplyAvatar = () => {
    setAvatarUrl(tempAvatarInput.trim());
    setAvatarModalOpen(false);
    toast.success("Avatar preview updated. Click 'Save Changes' to commit.");
  };

  // Handle Password Update
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      toast.success("Password changed successfully");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="size-10 text-amber-500" />
        <h2 className="text-xl font-semibold text-foreground">Profile Not Accessible</h2>
        <p className="text-sm text-muted-foreground">
          Unable to retrieve your authentication session. Please sign in again.
        </p>
        <Button onClick={() => router.push("/admin/login")} className="gap-2">
          <LogOut className="size-4" />
          Go to Sign In
        </Button>
      </div>
    );
  }

  const isPasswordProvider = user.provider === "password";

  return (
    <div className="relative w-full space-y-6 pb-12 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Account Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal credentials, contact information, and conference profile
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/25 shrink-0 self-start sm:self-auto cursor-pointer shadow-none text-xs font-semibold gap-2"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* ── Main Layout Grid (2 Columns, 2:1 ratio) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left Column: Personal Information (2 Spans) ── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-[#115eff]/10 p-1.5 text-[#115eff]">
                  <User className="size-4" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your identity details, academic title, and organizational affiliation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Avatar & Header Preview */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-2">
                <Avatar className="size-24 border-2 border-border shadow-xs shrink-0">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={user.name} /> : null}
                  <AvatarFallback className="text-2xl font-bold bg-[#115eff]/10 text-[#115eff]">
                    {getInitials(fullName || user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {fullName || user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempAvatarInput(avatarUrl);
                        setAvatarModalOpen(true);
                      }}
                      className="text-xs font-medium h-8 cursor-pointer shadow-none"
                    >
                      <Upload className="size-3.5 mr-1.5" />
                      Change Avatar
                    </Button>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAvatarUrl("")}
                        className="text-xs text-muted-foreground hover:text-destructive h-8 cursor-pointer"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name" className="text-xs font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="profile-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full display name..."
                      className="text-xs h-9 bg-background shadow-none"
                      required
                    />
                  </div>

                  {/* Academic Title / Degree */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-academic" className="text-xs font-medium">
                      Academic Title & Degree
                    </Label>
                    <Input
                      id="profile-academic"
                      value={academicTitle}
                      onChange={(e) => setAcademicTitle(e.target.value)}
                      placeholder="e.g. Prof. Dr., Ph.D., M.Sc."
                      className="text-xs h-9 bg-background shadow-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Affiliation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-affiliation" className="text-xs font-medium">
                      Affiliation / Organization
                    </Label>
                    <Input
                      id="profile-affiliation"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      placeholder="e.g. HCMUTE / IEEE Systems, Man, and Cybernetics Society"
                      className="text-xs h-9 bg-background shadow-none"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-country" className="text-xs font-medium">
                      Country / Region
                    </Label>
                    <Input
                      id="profile-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Vietnam, United States"
                      className="text-xs h-9 bg-background shadow-none"
                    />
                  </div>
                </div>

                {/* Email Address (Read-Only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="profile-email" className="text-xs font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="profile-email"
                    value={user.email}
                    disabled
                    className="text-xs h-9 bg-muted/60 text-muted-foreground shadow-none cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email is managed by your authentication provider and cannot be altered directly
                  </p>
                </div>

                {/* Conference Track / Role */}
                <div className="space-y-1.5">
                  <Label htmlFor="profile-conf-role" className="text-xs font-medium">
                    Conference Track
                  </Label>
                  <Input
                    id="profile-conf-role"
                    value={conferenceRole}
                    onChange={(e) => setConferenceRole(e.target.value)}
                    placeholder="e.g. Keynote Speaker, Session Chair, Author, Attendee"
                    className="text-xs h-9 bg-background shadow-none"
                  />
                </div>

                {/* Biography */}
                <div className="space-y-1.5">
                  <Label htmlFor="profile-bio" className="text-xs font-medium">
                    Biography & Research Interests
                  </Label>
                  <Textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief overview of your academic background or research interests..."
                    rows={4}
                    className="text-xs bg-background shadow-none resize-y"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-semibold px-5 h-9 shadow-none cursor-pointer"
                  >
                    {saving ? (
                      <RefreshCw className="mr-2 size-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-3.5" />
                    )}
                    <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Role, Overview & Security (1 Span) ── */}
        <div className="space-y-6">
          {/* Card 1: Role & Privileges */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                </div>
                Role & Privileges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#115eff]/10 text-[#115eff] border-[#115eff]/30 font-semibold text-xs">
                  {user.role === "ADMIN" ? "Administrator" : "User"}
                </Badge>
                {user.profileData?.conferenceRole && (
                  <Badge variant="outline" className="text-xs font-medium capitalize">
                    {String(user.profileData.conferenceRole)}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {user.role === "ADMIN"
                  ? "You have full administrator access to manage users, website pages, analytics, broadcast emails, and conference registrations."
                  : "Standard delegate privileges to browse conference proceedings and access portal features."}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Account Overview */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-slate-500/10 p-1.5 text-slate-700 dark:text-slate-300">
                  <Calendar className="size-4" />
                </div>
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 divide-y divide-border/60">
              <div className="flex items-center gap-3 pb-2.5">
                <User className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Display Name</p>
                  <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2.5">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Joined Date</p>
                  <p className="text-xs font-medium text-foreground">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2.5">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Last Login</p>
                  <p className="text-xs font-medium text-foreground">{formatDateTime(user.lastLoginAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2.5">
                <Network className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Current Session IP</p>
                  <p className="text-xs font-mono text-foreground">{user.lastLoginIp || "127.0.0.1"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Security & Credentials */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="size-4" />
                </div>
                Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Sign-In Method</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <Badge variant="outline" className="capitalize text-xs font-medium">
                    {user.provider || "password"}
                  </Badge>
                </div>
              </div>

              {isPasswordProvider ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    You can change your portal access password at any time.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordModalOpen(true)}
                    className="w-full text-xs font-semibold cursor-pointer shadow-none"
                  >
                    <KeyRound className="mr-1.5 size-3.5" />
                    Change Password
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your credentials and authentication security are managed via your Google OAuth conference identity.
                </p>
              )}

              <Separator />

              <div className="pt-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="mr-1.5 size-3.5" />
                  Sign Out of Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Avatar URL Modal ── */}
      <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Change Avatar</DialogTitle>
            <DialogDescription className="text-xs">
              Provide a valid image URL for your profile picture.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="avatar-url-input" className="text-xs font-medium">
              Image URL
            </Label>
            <Input
              id="avatar-url-input"
              value={tempAvatarInput}
              onChange={(e) => setTempAvatarInput(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="text-xs h-9 bg-background shadow-none"
            />
            {tempAvatarInput && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                <Avatar className="size-12 border">
                  <AvatarImage src={tempAvatarInput} alt="Preview" />
                  <AvatarFallback className="text-xs">Preview</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">Image Preview</p>
                  <p className="text-[11px] text-muted-foreground truncate">{tempAvatarInput}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAvatarModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApplyAvatar}
              className="bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-semibold"
            >
              Apply Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Modal ── */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4 text-[#115eff]" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update your account password. Choose a strong password with at least 8 characters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label htmlFor="curr-pass" className="text-xs font-medium">
                Current Password
              </Label>
              <Input
                id="curr-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="text-xs h-9 bg-background shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="new-pass" className="text-xs font-medium">
                New Password
              </Label>
              <Input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 8 characters..."
                className="text-xs h-9 bg-background shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="conf-pass" className="text-xs font-medium">
                Confirm New Password
              </Label>
              <Input
                id="conf-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="text-xs h-9 bg-background shadow-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordModalOpen(false)}
              disabled={updatingPassword}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdatePassword}
              disabled={updatingPassword || !newPassword || !confirmPassword}
              className="bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-semibold"
            >
              {updatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
