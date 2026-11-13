"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { triggerAutoLogout } from "@/lib/session-guard";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Eye,
  Trash2,
  ChevronDown,
  Check,
  Mail,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MoreHorizontal,
  LogOut,
  Lock,
  Unlock,
  RotateCcw,
  Search,
  X,
  Filter,
  List,
  Shield,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { CreateUserModal, type CreateUserPayload } from "@/components/admin/users/CreateUserModal";
import { ResetPasswordModal } from "@/components/admin/users/ResetPasswordModal";
import { UserDeleteDialog } from "@/components/admin/users/UserDeleteDialog";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Types ───────────────────────────────────────────────────────────
export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | string;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
  sessionVersion?: number;
  provider?: string;
  hasPassword?: boolean;
  profileData?: {
    conferenceRole?: "SUBMITTER" | "SPEAKER" | "ATTENDEE" | string;
    affiliation?: string;
    country?: string;
    bio?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    posts?: number;
    registrations?: number;
  };
}

export type AccountStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

// ── Status Normalizer & Badge Config ────────────────────────────────
export function normalizeAccountStatus(status?: string | null): AccountStatus {
  if (!status) return "ACTIVE";
  const val = String(status).trim().toUpperCase();
  if (val === "ACTIVE" || val === "1") return "ACTIVE";
  if (val === "INACTIVE" || val === "PENDING" || val === "0") return "INACTIVE";
  if (val === "BLOCKED" || val === "SUSPENDED" || val === "-1") return "BLOCKED";
  return "ACTIVE";
}

export function getStatusBadgeConfig(status?: string | null) {
  const norm = normalizeAccountStatus(status);
  switch (norm) {
    case "ACTIVE":
      return {
        label: "Active",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        icon: <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      };
    case "INACTIVE":
      return {
        label: "Inactive",
        className:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        icon: <ShieldAlert className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />,
      };
    case "BLOCKED":
      return {
        label: "Blocked",
        className:
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        icon: <ShieldX className="size-3 text-rose-600 dark:text-rose-400 shrink-0" />,
      };
  }
}

// ── Last Login Formatter ────────────────────────────────────────────
export function formatLastLogin(
  lastLoginAt?: string | null,
  lastLoginIp?: string | null
): { formattedDate: string; ip: string | null } {
  if (!lastLoginAt) {
    return { formattedDate: "Never", ip: null };
  }
  const date = new Date(lastLoginAt);
  if (isNaN(date.getTime())) {
    return { formattedDate: "Never", ip: null };
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return { formattedDate, ip: lastLoginIp || null };
}

// ── Main Page Component ─────────────────────────────────────────────
export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modal Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<AdminUserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null);
  const [revokeSessionsUser, setRevokeSessionsUser] = useState<AdminUserRecord | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch current user email for self-protection guards
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email) setCurrentUserEmail(data.user.email);
      })
      .catch(() => null);
  }, []);

  // Fetch users from API (callable from action callbacks)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to load users");
      }
      const list = json.users || json.data?.users || (Array.isArray(json) ? json : []);
      setUsers(list);
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Error loading users",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to load users");
        const list = json.users || json.data?.users || (Array.isArray(json) ? json : []);
        if (isMounted) setUsers(list);
      } catch (err: unknown) {
        if (isMounted) {
          setAlert({
            type: "error",
            text: err instanceof Error ? err.message : "Error loading users",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts = { ALL: users.length, ACTIVE: 0, INACTIVE: 0, BLOCKED: 0 };
    for (const u of users) {
      const norm = normalizeAccountStatus(u.status);
      counts[norm] = (counts[norm] || 0) + 1;
    }
    return counts;
  }, [users]);

  // Filtered users for table display
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Status filter
      if (statusFilter !== "ALL") {
        if (normalizeAccountStatus(u.status) !== statusFilter) return false;
      }
      // Role filter
      if (roleFilter !== "ALL") {
        if (u.role !== roleFilter) return false;
      }
      // Search query (name, email, affiliation, conference role)
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const nameMatch = u.name.toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        const affMatch = String(u.profileData?.affiliation || "")
          .toLowerCase()
          .includes(q);
        const trackMatch = String(u.profileData?.conferenceRole || "")
          .toLowerCase()
          .includes(q);
        if (!nameMatch && !emailMatch && !affMatch && !trackMatch) {
          return false;
        }
      }
      return true;
    });
  }, [users, statusFilter, roleFilter, debouncedSearch]);

  // Create User Handler
  const handleCreateUser = async (payload: CreateUserPayload) => {
    setCreating(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to create user");
      }
      toast.success(`Account created for ${payload.email} successfully`);
      setCreateOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Quick Role Change Handler with optimistic update
  const handleQuickRoleChange = useCallback(
    async (userId: string, newRole: "ADMIN" | "USER") => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || "Failed to update role");
        }
        toast.success(`Role updated to ${newRole === "ADMIN" ? "Admin" : "User"}`);
      } catch (err: unknown) {
        await fetchUsers();
        toast.error(err instanceof Error ? err.message : "Failed to change role");
      }
    },
    [fetchUsers]
  );

  // Status Toggle Handler (Block / Unblock)
  const handleToggleBlockStatus = useCallback(
    async (targetUser: AdminUserRecord, newStatus: AccountStatus) => {
      const isSelf = Boolean(
        currentUserEmail &&
          targetUser.email.toLowerCase() === currentUserEmail.toLowerCase()
      );
      if (isSelf) {
        toast.error("You cannot change the status of your own account");
        return;
      }

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, status: newStatus } : u
        )
      );

      try {
        const res = await fetch(`/api/admin/users/${targetUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || "Failed to update user status");
        }
        toast.success(
          newStatus === "BLOCKED"
            ? `Account for ${targetUser.name} has been blocked`
            : `Account for ${targetUser.name} has been unblocked`
        );
      } catch (err: unknown) {
        await fetchUsers();
        toast.error(
          err instanceof Error ? err.message : "Failed to update user status"
        );
      }
    },
    [currentUserEmail, fetchUsers]
  );

  // Resend Invitation Handler
  const handleResendInvitation = async (user: AdminUserRecord) => {
    try {
      let res = await fetch(`/api/admin/users/${user.id}/resend-invitation`, {
        method: "POST",
      });

      if (!res.ok && res.status === 404) {
        // Fallback to resend-invite or auth otp endpoint if needed
        res = await fetch(`/api/admin/users/${user.id}/resend-invite`, {
          method: "POST",
        });
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok && json.error) {
        throw new Error(json.error);
      }
      toast.success(`Invitation email resent to ${user.email}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invitation email"
      );
    }
  };

  // Revoke Sessions Handler
  const handleConfirmRevokeSessions = async () => {
    if (!revokeSessionsUser) return;
    setRevoking(true);
    try {
      const res = await fetch(
        `/api/admin/users/${revokeSessionsUser.id}/revoke-sessions`,
        { method: "POST" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok && json.error) {
        throw new Error(json.error);
      }
      const isRevokingSelf = Boolean(
        currentUserEmail &&
          revokeSessionsUser.email.toLowerCase() === currentUserEmail.toLowerCase()
      );
      setRevokeSessionsUser(null);
      if (isRevokingSelf) {
        triggerAutoLogout(
          "/admin/login",
          "Your sessions were revoked. Redirecting to sign in..."
        );
        return;
      }
      toast.success(
        `All active sessions for ${revokeSessionsUser.name} have been revoked`
      );
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke active sessions"
      );
    } finally {
      setRevoking(false);
    }
  };

  // Delete User Confirmation Handler
  const handleDeleteConfirm = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || "Failed to delete user");
    }
    toast.success("User account deleted successfully");
    setDeletingUser(null);
    await fetchUsers();
  };

  // Batch Delete Handler
  const handleBatchDelete = async (
    selected: AdminUserRecord[],
    clearSelection: () => void
  ) => {
    const safeToDelete = selected.filter(
      (u) =>
        !currentUserEmail ||
        u.email.toLowerCase() !== currentUserEmail.toLowerCase()
    );

    if (safeToDelete.length === 0) {
      toast.error("You cannot delete your own active administrator account");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${safeToDelete.length} selected account(s)?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        safeToDelete.map((u) =>
          fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
        )
      );
      clearSelection();
      toast.success(`Deleted ${safeToDelete.length} account(s) successfully`);
      await fetchUsers();
    } catch {
      toast.error("Error deleting accounts in batch");
    }
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || statusFilter !== "ALL" || roleFilter !== "ALL"
  );

  // ── Table Columns Definition ──────────────────────────────────────
  const columns = useMemo<ColumnDef<AdminUserRecord, unknown>[]>(
    () => [
      // Select Checkbox
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isSelf = Boolean(
            currentUserEmail &&
              item.email.toLowerCase() === currentUserEmail.toLowerCase()
          );
          return (
            <div className="flex items-center justify-center">
              <Checkbox
                disabled={isSelf}
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          );
        },
        size: 40,
        enableSorting: false,
      },

      // User Column (Avatar + Name + Email)
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = Boolean(
            currentUserEmail &&
              u.email.toLowerCase() === currentUserEmail.toLowerCase()
          );

          return (
            <div className="flex items-center gap-3 min-w-[210px]">
              {u.avatar ? (
                <Image
                  src={u.avatar}
                  alt={u.name}
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="size-9 rounded-full bg-blue-50 text-[#115eff] font-bold text-xs flex items-center justify-center shrink-0">
                  {u.name ? (
                    u.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 text-sm truncate">
                    {u.name}
                  </span>
                  {isSelf && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#115eff]/10 text-[#115eff] border border-[#115eff]/20">
                      You
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 truncate block">
                  {u.email}
                </span>
              </div>
            </div>
          );
        },
      },

      // Status Column
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const config = getStatusBadgeConfig(row.original.status);
          return (
            <div className="flex items-center justify-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold border transition-colors select-none",
                  config.className
                )}
              >
                {config.icon}
                <span>{config.label}</span>
              </span>
            </div>
          );
        },
        size: 110,
      },

      // Role Column (Admin / User Quick Toggle)
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const u = row.original;
          const role = u.role;
          const isSelf = Boolean(
            currentUserEmail &&
              u.email.toLowerCase() === currentUserEmail.toLowerCase()
          );

          if (isSelf) {
            return (
              <div className="flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold border border-[#115eff]/30 bg-[#115eff]/10 text-[#115eff] select-none"
                  title="Your active account"
                >
                  <span className="size-1.5 rounded-full bg-[#115eff]" />
                  <span>Admin</span>
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-between gap-1.5 h-7 px-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer shadow-2xs group focus:outline-none focus:ring-1 focus:ring-[#115eff]",
                      role === "ADMIN"
                        ? "bg-[#115eff]/10 text-[#115eff] border-[#115eff]/30 hover:bg-[#115eff]/20"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/80"
                    )}
                    title="Click to quick-change role"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          role === "ADMIN" ? "bg-[#115eff]" : "bg-slate-400"
                        )}
                      />
                      <span>{role === "ADMIN" ? "Admin" : "User"}</span>
                    </span>
                    <ChevronDown className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-36 p-1.5 rounded-xl shadow-xl border border-slate-200"
                >
                  <DropdownMenuItem
                    onClick={() => handleQuickRoleChange(u.id, "ADMIN")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-lg cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[#115eff] font-semibold">
                      <span className="size-1.5 rounded-full bg-[#115eff]" />
                      Admin
                    </span>
                    {role === "ADMIN" && (
                      <Check className="size-3.5 text-[#115eff]" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickRoleChange(u.id, "USER")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-lg cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <span className="size-1.5 rounded-full bg-slate-400" />
                      User
                    </span>
                    {role === "USER" && (
                      <Check className="size-3.5 text-slate-700" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 110,
      },

      // Conference Track Column
      {
        id: "conferenceRole",
        header: "Conference Track",
        cell: ({ row }) => {
          const profile = row.original.profileData || {};
          const confRole = String(profile.conferenceRole || "").toUpperCase();

          if (confRole === "SPEAKER") {
            return (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Speaker
                </span>
              </div>
            );
          }

          if (confRole === "SUBMITTER") {
            return (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  Submitter
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Attendee
              </span>
            </div>
          );
        },
        size: 130,
      },

      // Last Login Column
      {
        id: "lastLogin",
        accessorKey: "lastLoginAt",
        header: "Last Login",
        cell: ({ row }) => {
          const u = row.original;
          const { formattedDate, ip } = formatLastLogin(
            u.lastLoginAt,
            u.lastLoginIp
          );

          if (formattedDate === "Never") {
            return (
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium italic">
                  Never
                </span>
              </div>
            );
          }

          return (
            <div
              className="flex items-center justify-center gap-1.5 text-xs text-slate-700 font-medium"
              title={
                u.lastLoginDevice
                  ? `Device: ${u.lastLoginDevice}`
                  : undefined
              }
            >
              <span>{formattedDate}</span>
              {ip && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-mono">
                    {ip}
                  </span>
                </>
              )}
            </div>
          );
        },
        size: 210,
      },

      // Joined Date Column
      {
        accessorKey: "createdAt",
        header: "Joined Date",
        cell: ({ row }) => {
          const val = row.getValue("createdAt") as string;
          if (!val) return <div className="text-center text-slate-400">-</div>;
          const date = new Date(val);
          return (
            <div className="text-center text-xs text-slate-500 font-medium">
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
        size: 110,
      },

      // Actions Column
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = Boolean(
            currentUserEmail &&
              u.email.toLowerCase() === currentUserEmail.toLowerCase()
          );
          const isBlocked = normalizeAccountStatus(u.status) === "BLOCKED";

          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                    aria-label={`Actions for ${u.name}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1.5 rounded-xl shadow-xl border border-slate-200"
                >
                  {/* View Profile */}
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                    className="flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-slate-700 focus:bg-slate-100"
                  >
                    <Eye className="size-4 text-slate-500" />
                    <span>View Profile</span>
                  </DropdownMenuItem>

                  {/* Resend Invitation */}
                  <DropdownMenuItem
                    onClick={() => handleResendInvitation(u)}
                    className="flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                  >
                    <Mail className="size-4" />
                    <span>Resend Invitation</span>
                  </DropdownMenuItem>

                  {/* Reset Password */}
                  <DropdownMenuItem
                    onClick={() => setPasswordResetUser(u)}
                    className="flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                  >
                    <KeyRound className="size-4" />
                    <span>Reset Password</span>
                  </DropdownMenuItem>

                  {/* Revoke Active Sessions */}
                  <DropdownMenuItem
                    onClick={() => setRevokeSessionsUser(u)}
                    className="flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50"
                  >
                    <LogOut className="size-4" />
                    <span>Revoke Active Sessions</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 border-slate-100" />

                  {/* Block / Unblock Account */}
                  {isBlocked ? (
                    <DropdownMenuItem
                      onClick={() => handleToggleBlockStatus(u, "ACTIVE")}
                      className="flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                    >
                      <Unlock className="size-4" />
                      <span>Unblock Account</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled={isSelf}
                      onClick={() => handleToggleBlockStatus(u, "BLOCKED")}
                      className={cn(
                        "flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50",
                        isSelf && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Lock className="size-4" />
                      <span>Block Account</span>
                    </DropdownMenuItem>
                  )}

                  {/* Delete Account (Guarded) */}
                  <DropdownMenuItem
                    disabled={isSelf}
                    onClick={() => setDeletingUser(u)}
                    className={cn(
                      "flex items-center gap-2 py-2 px-2.5 text-xs rounded-lg cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50",
                      isSelf && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        size: 70,
      },
    ],
    [currentUserEmail, handleQuickRoleChange, handleToggleBlockStatus, router]
  );

  return (
    <div className="space-y-4 font-sans">
      {/* ── Page Header ── */}
      <ManagementPageHeader
        title="Users & Access Roles"
        description="Manage conference participants, speakers, delegates, credentials, and access permissions"
        image3d="/assets/3d-icons/users__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-users-bg.jpg"
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-8.5 px-3.5 text-xs font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-none rounded-lg"
          >
            <Plus className="size-4 mr-1.5" />
            Add User
          </Button>
        }
      />

      {/* Alert Banner */}
      {alert && (
        <StatusAlertBanner
          variant={alert.type}
          message={alert.text}
          onDismiss={() => setAlert(null)}
        />
      )}

      {/* ── Filter Toolbar ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Left Toolbar: Search Box & Status Filter Pills */}
          <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
            {/* Search Box */}
            <div className="relative w-full sm:w-64 md:w-72 min-w-[200px] shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, affiliation..."
                className="pl-8 pr-8 h-9 text-xs bg-white border-slate-200 rounded-xl focus:bg-white focus:border-[#115eff] focus:ring-1 focus:ring-[#115eff]"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-5 rounded-full inline-flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Button
                variant={statusFilter === "ALL" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2.5 sm:px-3 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  statusFilter === "ALL"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setStatusFilter("ALL")}
              >
                <List className="mr-1.5 size-3.5" />
                All ({statusCounts.ALL})
              </Button>

              <Button
                variant={statusFilter === "ACTIVE" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2.5 sm:px-3 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/30"
                    : "text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setStatusFilter("ACTIVE")}
              >
                <ShieldCheck className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
                Active ({statusCounts.ACTIVE})
              </Button>

              <Button
                variant={statusFilter === "INACTIVE" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2.5 sm:px-3 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  statusFilter === "INACTIVE"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/30"
                    : "text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setStatusFilter("INACTIVE")}
              >
                <ShieldAlert className="mr-1.5 size-3.5 text-amber-600 dark:text-amber-400" />
                Inactive ({statusCounts.INACTIVE})
              </Button>

              <Button
                variant={statusFilter === "BLOCKED" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2.5 sm:px-3 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  statusFilter === "BLOCKED"
                    ? "bg-rose-500/15 text-rose-800 dark:text-rose-300 font-semibold border border-rose-500/30"
                    : "text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setStatusFilter("BLOCKED")}
              >
                <ShieldX className="mr-1.5 size-3.5 text-rose-600 dark:text-rose-400" />
                Blocked ({statusCounts.BLOCKED})
              </Button>
            </div>
          </div>

          {/* Right Toolbar: Role Filter Select & Refresh Button */}
          <div className="flex shrink-0 items-center gap-2 self-start lg:self-auto ml-auto">
            <div className="w-[160px] sm:w-[180px]">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 text-xs bg-white border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 truncate">
                    <Shield className="size-3.5 text-[#115eff] shrink-0" />
                    <SelectValue placeholder="Role: All" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="USER">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="h-9 px-3 text-xs rounded-xl bg-white hover:bg-slate-50 border-slate-200 font-medium gap-1.5 shadow-2xs shrink-0 cursor-pointer"
              title="Reload user list"
            >
              <RotateCcw
                className={cn(
                  "size-3.5 text-[#115eff]",
                  loading && "animate-spin"
                )}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Active Applied Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-2 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 shrink-0 mr-1 select-none">
              <Filter className="size-3.5 text-[#115eff]" />
              <span>Applied filters:</span>
            </div>

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                <span className="text-slate-400">Search:</span>
                <span className="font-semibold truncate max-w-[150px]">
                  {searchQuery}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="size-3.5 rounded-full inline-flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                  title="Remove search filter"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {statusFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold">{statusFilter}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className="size-3.5 rounded-full inline-flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                  title="Remove status filter"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {roleFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold">{roleFilter}</span>
                <button
                  type="button"
                  onClick={() => setRoleFilter("ALL")}
                  className="size-3.5 rounded-full inline-flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                  title="Remove role filter"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-6 px-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 rounded-md cursor-pointer ml-auto"
            >
              <RotateCcw className="size-3" />
              <span>Clear all</span>
            </Button>
          </div>
        )}
      </div>

      {/* ── Data Table ── */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        searchPlaceholder="Search table..."
        batchActions={(selected, clear) => (
          <div className="flex items-center gap-1.5 ml-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleBatchDelete(selected, clear)}
              className="h-7 px-2.5 text-xs font-semibold rounded-lg"
            >
              <Trash2 className="size-3.5 mr-1" />
              Delete selected
            </Button>
          </div>
        )}
      />

      {/* ── Dialogs ── */}
      {/* Create User Modal */}
      <CreateUserModal
        open={createOpen}
        creating={creating}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={Boolean(passwordResetUser)}
        user={passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
        onSuccess={fetchUsers}
      />

      {/* User Delete Dialog */}
      <UserDeleteDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        user={deletingUser}
        currentUserEmail={currentUserEmail}
        onConfirm={handleDeleteConfirm}
      />

      {/* Revoke Sessions Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(revokeSessionsUser)}
        onOpenChange={(open) => !open && setRevokeSessionsUser(null)}
      >
        <AlertDialogContent className="max-w-md font-sans p-6 rounded-2xl">
          <AlertDialogHeader className="space-y-3">
            <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <LogOut className="size-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Revoke All Active Sessions
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600 leading-relaxed mt-1">
                Are you sure you want to revoke all active sessions for{" "}
                <strong className="text-slate-900 font-semibold">
                  {revokeSessionsUser?.name} ({revokeSessionsUser?.email})
                </strong>
                ? All existing login cookies, access tokens, and device sessions
                will be invalidated immediately.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <AlertDialogCancel
              disabled={revoking}
              className="h-8.5 px-3.5 text-xs rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevokeSessions}
              disabled={revoking}
              className="h-8.5 px-4 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-none"
            >
              {revoking ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Revoking...
                </>
              ) : (
                <>
                  <LogOut className="size-3.5 mr-1.5" />
                  Revoke Sessions
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
