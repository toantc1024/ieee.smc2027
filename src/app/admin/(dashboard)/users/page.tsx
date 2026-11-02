"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  ChevronDown,
  Check,
  Mail,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { CreateUserModal } from "@/components/admin/users/CreateUserModal";
import {
  EditUserModal,
  AdminUserRecord,
} from "@/components/admin/users/EditUserModal";
import { UserDeleteDialog } from "@/components/admin/users/UserDeleteDialog";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { cn } from "@/lib/utils";



export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null);

  // Fetch current user email to protect active account
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email) setCurrentUserEmail(data.user.email);
      })
      .catch(() => null);
  }, []);

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
        text: err instanceof Error ? err.message : "Error loading data",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create user handler
  const handleCreateUser = async (payload: {
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    password: string;
    avatar: string;
    profileData?: Record<string, unknown>;
  }) => {
    setCreating(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create user");
      }
      setAlert({
        type: "success",
        text: `Created account for ${payload.email} successfully!`,
      });
      setCreateOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Operation failed",
      });
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Edit user handler
  const handleSaveEdit = async (payload: {
    id: string;
    name: string;
    role: "ADMIN" | "USER";
    avatar: string | null;
    password?: string;
    profileData: Record<string, unknown>;
  }) => {
    setSavingEdit(true);
    setAlert(null);
    try {
      const res = await fetch(`/api/admin/users/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update user");
      }
      setAlert({
        type: "success",
        text: "User profile updated successfully!",
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Update failed",
      });
      throw err;
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete user handler
  const handleDeleteConfirm = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to delete user");
    }
    setAlert({ type: "success", text: "User deleted successfully!" });
    setDeletingUser(null);
    await fetchUsers();
  };

  // Batch delete handler
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
      setAlert({
        type: "error",
        text: "You cannot delete your own active administrator account!",
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${safeToDelete.length} selected account(s)?`
      )
    )
      return;

    try {
      await Promise.all(
        safeToDelete.map((u) =>
          fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
        )
      );
      clearSelection();
      setAlert({
        type: "success",
        text: `Deleted ${safeToDelete.length} account(s) successfully!`,
      });
      await fetchUsers();
    } catch {
      setAlert({ type: "error", text: "Error deleting accounts in batch" });
    }
  };

  // Quick role change handler with optimistic update
  const handleQuickRoleChange = useCallback(
    async (userId: string, newRole: "ADMIN" | "USER") => {
      // Optimistic update
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
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to update role");
        }
        setAlert({
          type: "success",
          text: `Role changed to ${
            newRole === "ADMIN" ? "Admin" : "User"
          } successfully!`,
        });
      } catch (err: unknown) {
        // Rollback on error
        await fetchUsers();
        setAlert({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to change role",
        });
      }
    },
    [fetchUsers]
  );

  // Table columns definition
  const columns = useMemo<ColumnDef<AdminUserRecord, any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
            <div className="flex items-center gap-3 min-w-[200px]">
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="size-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="size-9 rounded-full bg-blue-50 text-[#115eff] font-bold text-xs flex items-center justify-center shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 text-sm truncate">
                    {u.name}
                  </span>
                  {isSelf && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#115eff]/10 text-[#115eff] border border-[#115eff]/20">
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
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const u = row.original;
          const role = (row.getValue("role") as string) || u.role;
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
                <DropdownMenuContent align="center" className="w-36 p-1.5 rounded-2xl shadow-xl border border-slate-200">
                  <DropdownMenuItem
                    onClick={() => handleQuickRoleChange(u.id, "ADMIN")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-[#115eff] font-semibold">
                      <span className="size-1.5 rounded-full bg-[#115eff]" />
                      Admin
                    </span>
                    {role === "ADMIN" && <Check className="size-3.5 text-[#115eff]" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickRoleChange(u.id, "USER")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <span className="size-1.5 rounded-full bg-slate-400" />
                      User
                    </span>
                    {role === "USER" && <Check className="size-3.5 text-slate-700" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
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
      },
      {
        id: "affiliation",
        header: "Affiliation",
        cell: ({ row }) => {
          const profile = row.original.profileData || {};
          const aff = profile.affiliation || "-";
          return (
            <div className="text-center">
              <span className="text-sm text-slate-600 truncate block max-w-xs font-medium mx-auto">
                {String(aff)}
              </span>
            </div>
          );
        },
      },
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
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = Boolean(
            currentUserEmail &&
            u.email.toLowerCase() === currentUserEmail.toLowerCase()
          );

          return (
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setEditingUser(u)}
                className="p-1.5 text-slate-400 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Edit user"
              >
                <Edit2 className="size-4" />
              </button>

              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setDeletingUser(u)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete user"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 90,
      },
    ],
    [currentUserEmail, handleQuickRoleChange]
  );

  return (
    <div className="space-y-4 font-sans">
      {/* ── Page Header ── */}
      <ManagementPageHeader
        title="Users & Access Roles"
        description="Manage administrative users, delegates, credentials, and access roles"
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-8 px-3.5 text-xs font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-none"
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

      {/* ── Advanced Table ── */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search by name, email, affiliation..."
        filterColumns={[
          {
            id: "role",
            title: "Role",
            options: [
              { label: "Admin", value: "ADMIN" },
              { label: "User", value: "USER" },
            ],
          },
        ]}
        batchActions={(selected, clear) => (
          <div className="flex items-center gap-1.5 ml-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleBatchDelete(selected, clear)}
              className="h-7 px-2.5 text-xs font-semibold"
            >
              Delete selected
            </Button>
          </div>
        )}
      />

      {/* ── Dialogs ── */}
      <CreateUserModal
        open={createOpen}
        creating={creating}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateUser}
      />

      <EditUserModal
        user={editingUser}
        saving={savingEdit}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEdit}
      />

      <UserDeleteDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        user={deletingUser}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
