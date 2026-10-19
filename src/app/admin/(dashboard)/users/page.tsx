"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import {
  UserTable,
  AdminUserRecord,
} from "@/components/admin/users/UserTable";
import { CreateUserModal } from "@/components/admin/users/CreateUserModal";
import { EditUserModal } from "@/components/admin/users/EditUserModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load users");
      }
      setUsers(json.data.users || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (payload: {
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    password: string;
    avatar: string;
  }) => {
    setCreating(true);
    setErrorMsg("");
    setSuccessMsg("");
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
      setSuccessMsg(`Created ${payload.role} account for ${payload.email}`);
      setCreateOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (payload: {
    id: string;
    name: string;
    role: "ADMIN" | "USER";
    avatar: string | null;
    password?: string;
    profileData: Record<string, unknown>;
  }) => {
    setSavingEdit(true);
    setErrorMsg("");
    setSuccessMsg("");
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
      setSuccessMsg(`Updated user account in PostgreSQL.`);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickRoleToggle = async (u: AdminUserRecord) => {
    const nextRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to change role");
      }
      setSuccessMsg(`Changed role for ${u.email} to ${nextRole}`);
      await fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Role update failed");
    }
  };

  const handleDeleteUser = async (u: AdminUserRecord) => {
    if (!window.confirm(`Delete user ${u.email} from PostgreSQL?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to delete user");
      }
      setSuccessMsg(`Deleted user ${u.email}`);
      await fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        JSON.stringify(u.profileData || {}).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        imageIcon="/assets/3d-icons/users__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-users-bg.jpg"
        title="User & Role Management"
        description="Manage ADMIN and USER accounts directly in PostgreSQL. No .env credentials required — configure roles, passwords, avatars, and unstructured JSON profileData."
      >
        <Button
          type="button"
          variant="ute"
          size="sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Add User / Admin
        </Button>
      </ManagementPageHeader>

      <StatusAlertBanner
        variant="error"
        message={errorMsg}
        onDismiss={() => setErrorMsg("")}
      />

      <StatusAlertBanner
        variant="success"
        message={successMsg}
        onDismiss={() => setSuccessMsg("")}
      />

      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(["ALL", "ADMIN", "USER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#005496] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r === "ALL" ? `All (${users.length})` : r}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, JSON..."
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="size-6 animate-spin text-[#005496]" />
            <span className="text-xs">Loading PostgreSQL users...</span>
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
            onToggleRole={handleQuickRoleToggle}
            onEditUser={setEditingUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </Card>

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
    </div>
  );
}
