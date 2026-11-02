"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Globe,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  Users,
  User,
  Network,
  RefreshCw,
  Copy,
  Check,
  Building2,
  GraduationCap,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ─────────────────────────────────────────────────────────────
export interface UserProfileData {
  affiliation?: string;
  academicTitle?: string;
  degree?: string;
  conferenceRole?: string;
  country?: string;
  bio?: string;
  [key: string]: unknown;
}

export interface UserSessionView {
  id: string;
  ipAddress?: string | null;
  device?: string | null;
  lastAccess?: string | number | null;
  isCurrent?: boolean;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | string;
  provider: string;
  profileData?: UserProfileData;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
  sessionVersion?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts?: number;
    registrations?: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────
function normalizeStatus(status?: string | null): "ACTIVE" | "INACTIVE" | "BLOCKED" {
  const s = String(status || "").toUpperCase();
  if (s === "BLOCKED" || s === "-1") return "BLOCKED";
  if (s === "INACTIVE" || s === "0" || s === "PENDING") return "INACTIVE";
  return "ACTIVE";
}

function getStatusBadge(status?: string | null) {
  const norm = normalizeStatus(status);
  switch (norm) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1.5 font-semibold">
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Active
        </Badge>
      );
    case "BLOCKED":
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 gap-1.5 font-semibold">
          <ShieldX className="size-3.5 text-rose-600 dark:text-rose-400" />
          Blocked
        </Badge>
      );
    case "INACTIVE":
    default:
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 gap-1.5 font-semibold">
          <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
          Inactive
        </Badge>
      );
  }
}

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
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString?: string | number | null): string {
  if (!dateString) return "Never logged in";
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

function generateRandomPassword(length = 14): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// ── Info Row Component ────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 py-3 ${className ?? ""}`}>
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="font-medium text-sm mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────
function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────
export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [sessions, setSessions] = useState<UserSessionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);

  // Status & Role change
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Password reset dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [tempPasswordToggle, setTempPasswordToggle] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Danger zone action states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Fetch current logged-in user for self-protection
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => null);
  }, []);

  // Fetch target user data for refreshes
  const fetchUserData = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load user details");
        }

        const userData: AdminUserDetail = data.user || data.data?.user || data;
        setUser(userData);

        // Derive or populate sessions
        if (Array.isArray(data.sessions) && data.sessions.length > 0) {
          setSessions(data.sessions);
        } else if (userData.lastLoginIp || userData.lastLoginAt) {
          setSessions([
            {
              id: `sess-${userData.id}`,
              ipAddress: userData.lastLoginIp,
              device: userData.lastLoginDevice || "Standard Web Client",
              lastAccess: userData.lastLoginAt,
              isCurrent: true,
            },
          ]);
        } else {
          setSessions([]);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error loading user details");
      } finally {
        if (showLoader) setLoading(false);
        else setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load user details");
        if (!isMounted) return;
        const userData: AdminUserDetail = data.user || data.data?.user || data;
        setUser(userData);
        if (Array.isArray(data.sessions) && data.sessions.length > 0) {
          setSessions(data.sessions);
        } else if (userData.lastLoginIp || userData.lastLoginAt) {
          setSessions([
            {
              id: `sess-${userData.id}`,
              ipAddress: userData.lastLoginIp,
              device: userData.lastLoginDevice || "Standard Web Client",
              lastAccess: userData.lastLoginAt,
              isCurrent: true,
            },
          ]);
        } else {
          setSessions([]);
        }
      } catch (err: unknown) {
        if (isMounted) {
          toast.error(err instanceof Error ? err.message : "Error loading user details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Is current logged in admin inspecting themselves?
  const isSelf = useMemo(() => {
    if (!currentUser || !user) return false;
    return Boolean(
      (currentUser.id && currentUser.id === user.id) ||
      (currentUser.email &&
        user.email &&
        currentUser.email.toLowerCase() === user.email.toLowerCase())
    );
  }, [currentUser, user]);

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: "ACTIVE" | "INACTIVE" | "BLOCKED") => {
    if (!user || user.status === newStatus) return;

    // Self-protection: cannot block oneself
    if (isSelf && newStatus === "BLOCKED") {
      toast.error("You cannot block your own active administrator account");
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update account status");
      }

      setUser((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(`Account status changed to ${newStatus}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Quick Role Change
  const handleRoleChange = async (newRole: "ADMIN" | "USER") => {
    if (!user || user.role === newRole) return;

    if (isSelf && newRole !== "ADMIN") {
      toast.error("You cannot downgrade your own active administrator role");
      return;
    }

    setUpdatingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
      toast.success(`Role updated to ${newRole === "ADMIN" ? "Administrator" : "User"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Role update failed");
    } finally {
      setUpdatingRole(false);
    }
  };

  // Open Password Reset Modal
  const handleOpenPasswordModal = () => {
    setNewPassword(generateRandomPassword());
    setCopied(false);
    setPasswordDialogOpen(true);
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Password Reset
  const handleResetPasswordSubmit = async () => {
    if (!newPassword.trim()) {
      toast.error("Password cannot be empty");
      return;
    }

    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword.trim(),
          temporary: tempPasswordToggle,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success("Temporary password applied successfully");
      setPasswordDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setResettingPassword(false);
    }
  };

  // Revoke Sessions
  const handleRevokeSessions = async () => {
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke sessions");
      }

      toast.success("All active sessions revoked successfully");
      setConfirmRevokeOpen(false);
      await fetchUserData(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke sessions");
    } finally {
      setRevoking(false);
    }
  };

  // Delete User Confirmation
  const handleDeleteUser = async () => {
    if (isSelf) {
      toast.error("You cannot delete your own active administrator account");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User account deleted successfully");
      setConfirmDeleteOpen(false);
      router.push("/admin/users");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <UserDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="size-10 text-amber-500" />
        <h2 className="text-xl font-semibold text-foreground">User Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested user account does not exist or has been removed.
        </p>
        <Button variant="outline" onClick={() => router.push("/admin/users")} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to User List
        </Button>
      </div>
    );
  }

  const profile = user.profileData || {};
  const currentStatus = normalizeStatus(user.status);

  return (
    <div className="relative w-full space-y-6 pb-12 font-sans">
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>All Users</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUserData(false)}
          disabled={refreshing}
          className="gap-2 cursor-pointer shadow-none"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── Profile Header Card ── */}
      <Card className="overflow-hidden border bg-card/90 shadow-none rounded-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center items-start gap-6">
            <Avatar className="size-24 border-2 border-border shadow-xs shrink-0">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="text-2xl font-bold bg-[#115eff]/10 text-[#115eff]">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {user.name}
                </h1>
                {getStatusBadge(user.status)}
                {isSelf && (
                  <Badge className="bg-[#115eff]/10 text-[#115eff] border-[#115eff]/30 font-semibold text-xs">
                    You
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" className="gap-1.5 text-xs font-medium">
                  <Shield className="size-3 text-muted-foreground" />
                  {user.role === "ADMIN" ? "Administrator" : "Standard User"}
                </Badge>

                {profile.conferenceRole && (
                  <Badge variant="outline" className="text-xs font-medium capitalize">
                    {String(profile.conferenceRole)}
                  </Badge>
                )}

                <Badge variant="outline" className="text-xs font-mono text-muted-foreground capitalize">
                  Provider: {user.provider || "Standard"}
                </Badge>
              </div>
            </div>

            {/* Quick Role Select */}
            <div className="w-full sm:w-auto flex flex-col gap-1.5 shrink-0 sm:self-center">
              <Label className="text-xs text-muted-foreground">Change Role</Label>
              <Select
                value={user.role}
                onValueChange={(val) => handleRoleChange(val as "ADMIN" | "USER")}
                disabled={updatingRole || isSelf}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs font-medium bg-background shadow-none">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2-Column Inspection Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left Column (2 Parts) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Account Information */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-[#115eff]/10 p-1.5 text-[#115eff]">
                  <KeyRound className="size-4" />
                </div>
                Account Details & Identity
              </CardTitle>
              <CardDescription>
                System credential specifications, registration timestamp, and authentication provider
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              <InfoRow
                icon={<Mail className="size-4" />}
                label="Primary Email"
                value={user.email}
                className="px-6"
              />
              <InfoRow
                icon={<User className="size-4" />}
                label="Full Display Name"
                value={user.name}
                className="px-6"
              />
              <InfoRow
                icon={<Globe className="size-4" />}
                label="Authentication Provider"
                value={
                  <span className="capitalize font-mono text-xs px-2 py-0.5 rounded bg-muted">
                    {user.provider || "password"}
                  </span>
                }
                className="px-6"
              />
              <InfoRow
                icon={<KeyRound className="size-4" />}
                label="System Identifier"
                value={<span className="font-mono text-xs text-muted-foreground select-all">{user.id}</span>}
                className="px-6"
              />
              <InfoRow
                icon={<Calendar className="size-4" />}
                label="Registration Date"
                value={formatDate(user.createdAt)}
                className="px-6"
              />
              <InfoRow
                icon={<Clock className="size-4" />}
                label="Last Login Timestamp"
                value={formatDateTime(user.lastLoginAt)}
                className="px-6"
              />
              <InfoRow
                icon={<Network className="size-4" />}
                label="Last Login IP Address"
                value={
                  user.lastLoginIp ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {user.lastLoginIp}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">No IP recorded</span>
                  )
                }
                className="px-6"
              />
            </CardContent>
          </Card>

          {/* Card 2: Conference & Affiliation Information */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="size-4" />
                </div>
                Conference Profile & Affiliation
              </CardTitle>
              <CardDescription>
                Academic credentials, organization membership, and conference delegate details
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              <InfoRow
                icon={<Building2 className="size-4" />}
                label="Affiliation / Organization"
                value={profile.affiliation ? String(profile.affiliation) : "Not specified"}
                className="px-6"
              />
              <InfoRow
                icon={<GraduationCap className="size-4" />}
                label="Academic Title & Degree"
                value={
                  profile.academicTitle || profile.degree
                    ? `${profile.academicTitle || ""} ${profile.degree || ""}`.trim()
                    : "Not specified"
                }
                className="px-6"
              />
              <InfoRow
                icon={<Users className="size-4" />}
                label="Conference Track"
                value={
                  profile.conferenceRole ? (
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {String(profile.conferenceRole)}
                    </Badge>
                  ) : (
                    "Attendee / Delegate"
                  )
                }
                className="px-6"
              />
              {profile.country && (
                <InfoRow
                  icon={<Globe className="size-4" />}
                  label="Country / Region"
                  value={String(profile.country)}
                  className="px-6"
                />
              )}
              {profile.bio && (
                <InfoRow
                  icon={<User className="size-4" />}
                  label="Biography"
                  value={<p className="text-xs text-muted-foreground whitespace-pre-wrap">{String(profile.bio)}</p>}
                  className="px-6"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column (1 Part) ── */}
        <div className="space-y-6">
          {/* Card 3: Active Sessions Card */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
                    <Network className="size-4" />
                  </div>
                  Active Sessions
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {sessions.length}
                </Badge>
              </div>
              <CardDescription>
                Client IP address, user agent, and session invalidation controls
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {sessions.length > 0 ? (
                <div className="space-y-2.5">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded-xl border border-border/70 bg-muted/30 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Network className="size-3.5 text-[#115eff]" />
                          <span>{sess.ipAddress || "Unknown IP"}</span>
                        </div>
                        {sess.isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Recent
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate" title={sess.device || ""}>
                        {sess.device || "Web Client"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Last access: {formatDateTime(sess.lastAccess)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No active session records found for this account.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRevokeOpen(true)}
                className="w-full justify-center text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer shadow-none text-xs font-semibold"
              >
                <LogOut className="mr-1.5 size-3.5" />
                Revoke All Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Card 4: Password & Security Card */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="size-4" />
                </div>
                Password & Security
              </CardTitle>
              <CardDescription>
                Credential reset, temporary access password, and sign-in policy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-muted-foreground">
                Set a temporary or administrative password for this account. The user will be required to change it upon first login.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPasswordModal}
                className="w-full justify-center text-xs font-semibold cursor-pointer shadow-none"
              >
                <KeyRound className="mr-1.5 size-3.5" />
                Reset Password
              </Button>
            </CardContent>
          </Card>

          {/* Card 5: Account Status Management Card */}
          <Card className="border bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-slate-500/10 p-1.5 text-slate-700 dark:text-slate-300">
                  <Shield className="size-4" />
                </div>
                Account Status
              </CardTitle>
              <CardDescription>
                Suspend or restore conference portal access privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
                <div className="space-y-0.5 pr-2">
                  <p className="text-xs font-semibold text-foreground">
                    {currentStatus === "BLOCKED" ? "Account Blocked" : "Account Active"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {currentStatus === "BLOCKED"
                      ? "User cannot sign in or access portal APIs"
                      : "User has full access to permitted modules"}
                  </p>
                </div>
                <Switch
                  checked={currentStatus === "ACTIVE"}
                  disabled={updatingStatus || (isSelf && currentStatus === "ACTIVE")}
                  onCheckedChange={(checked) => {
                    handleStatusChange(checked ? "ACTIVE" : "BLOCKED");
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingStatus || currentStatus === "ACTIVE"}
                  onClick={() => handleStatusChange("ACTIVE")}
                  className="flex-1 text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 cursor-pointer shadow-none"
                >
                  <Unlock className="size-3.5 mr-1.5" />
                  Unblock
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingStatus || currentStatus === "BLOCKED" || isSelf}
                  onClick={() => handleStatusChange("BLOCKED")}
                  className="flex-1 text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 cursor-pointer shadow-none"
                >
                  <Lock className="size-3.5 mr-1.5" />
                  Block
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Danger Zone Card */}
          <Card className="border border-rose-200/80 dark:border-rose-900/40 bg-card shadow-none rounded-2xl">
            <CardHeader className="pb-3 border-b border-rose-100 dark:border-rose-950/40">
              <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-destructive" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible account deletion and credential purge
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-muted-foreground">
                Permanently purge this user account, stored sessions, and authorization credentials.
              </p>

              {isSelf ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block cursor-not-allowed">
                        <Button
                          variant="outline"
                          disabled
                          className="w-full justify-center text-xs font-semibold border-rose-200 text-destructive opacity-50 pointer-events-none"
                        >
                          <Trash2 className="mr-1.5 size-3.5" />
                          Delete User Account
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">You cannot delete your own active administrator account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="w-full justify-center text-xs font-semibold border-rose-200 text-destructive hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/30 cursor-pointer shadow-none"
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  Delete User Account
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Password Reset Dialog ── */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4 text-[#115eff]" />
              Reset User Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate or enter a temporary password for {user.name} ({user.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="temp-password" className="text-xs font-medium">
                  Temporary Password
                </Label>
                <button
                  type="button"
                  onClick={() => setNewPassword(generateRandomPassword())}
                  className="text-xs text-[#115eff] hover:underline cursor-pointer"
                >
                  Generate New
                </button>
              </div>

              <div className="relative flex items-center">
                <Input
                  id="temp-password"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10 font-mono text-xs tracking-wider"
                  placeholder="Enter temporary password..."
                />
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="absolute right-2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded"
                  title="Copy password"
                >
                  {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/20">
              <div className="space-y-0.5 pr-2">
                <Label htmlFor="force-reset" className="text-xs font-medium">
                  Require Password Change
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  User will be forced to update password at their next portal login
                </p>
              </div>
              <Switch
                id="force-reset"
                checked={tempPasswordToggle}
                onCheckedChange={setTempPasswordToggle}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordDialogOpen(false)}
              disabled={resettingPassword}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleResetPasswordSubmit}
              disabled={resettingPassword || !newPassword.trim()}
              className="bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-semibold"
            >
              {resettingPassword ? "Applying..." : "Apply New Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Revoke Sessions Confirmation Dialog ── */}
      <AlertDialog open={confirmRevokeOpen} onOpenChange={setConfirmRevokeOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="size-4 text-amber-600" />
              Revoke All Active Sessions?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will immediately invalidate all active JWT tokens and session cookies for{" "}
              <strong className="text-foreground">{user.email}</strong>. The user will be required to re-authenticate on all devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeSessions}
              disabled={revoking}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
            >
              {revoking ? "Revoking..." : "Revoke Sessions"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete User Confirmation Dialog ── */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4" />
              Permanently Delete User?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete <strong className="text-foreground">{user.name}</strong> ({user.email})?
              This operation is permanent and cannot be undone. All role assignments, conference track privileges, and sessions will be destroyed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
            >
              {deleting ? "Deleting..." : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
