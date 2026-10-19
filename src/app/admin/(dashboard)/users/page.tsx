"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Shield,
  Plus,
  Search,
  Trash2,
  Edit3,
  KeyRound,
  Code2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  provider?: string;
  hasPassword?: boolean;
  profileData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create User Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "USER" as "ADMIN" | "USER",
    password: "",
    avatar: "",
  });

  // Edit User & JSON Profile Modal
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "USER">("USER");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editProfileJsonText, setEditProfileJsonText] = useState("{}");
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create user");
      }
      setSuccessMsg(`Created ${newUser.role} account for ${newUser.email}`);
      setCreateOpen(false);
      setNewUser({ email: "", name: "", role: "USER", password: "", avatar: "" });
      await fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (u: AdminUserRecord) => {
    setEditingUser(u);
    setEditName(u.name || "");
    setEditRole(u.role);
    setEditAvatar(u.avatar || "");
    setEditPassword("");
    setEditProfileJsonText(JSON.stringify(u.profileData || {}, null, 2));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let parsedProfileData: Record<string, unknown> = {};
      try {
        parsedProfileData = JSON.parse(editProfileJsonText || "{}");
      } catch {
        throw new Error("Invalid JSON syntax in profileData editor.");
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          avatar: editAvatar || null,
          ...(editPassword.trim() ? { password: editPassword.trim() } : {}),
          profileData: parsedProfileData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update user");
      }

      setSuccessMsg(`Updated account ${editingUser.email}`);
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
        <Button type="button" variant="ute" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add User / Admin
        </Button>
      </ManagementPageHeader>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">User / Avatar</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Auth Provider</th>
                  <th className="py-3 px-3">JSON Profile Keys</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const profileKeys = Object.keys(u.profileData || {});
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="size-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="size-9 rounded-full bg-blue-50 text-[#005496] font-bold flex items-center justify-center">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-slate-500 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleQuickRoleToggle(u)}
                          title="Click to toggle ADMIN / USER role"
                          className="cursor-pointer"
                        >
                          <Badge variant={u.role === "ADMIN" ? "ute" : "secondary"}>
                            <Shield className="size-3" />
                            {u.role}
                          </Badge>
                        </button>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline">{u.provider || "email_link"}</Badge>
                          {u.hasPassword && (
                            <Badge variant="success">
                              <KeyRound className="size-2.5" />
                              Password Set
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {profileKeys.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {profileKeys.slice(0, 4).map((k) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]"
                              >
                                {k}
                              </span>
                            ))}
                            {profileKeys.length > 4 && (
                              <span className="text-[10px] text-slate-400">
                                +{profileKeys.length - 4} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Empty JSON</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(u)}
                          >
                            <Edit3 className="size-3.5" />
                            Manage / JSON
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE USER MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Create Database User / Administrator
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <ImageUploadField
                label="Avatar Photo"
                value={newUser.avatar}
                onChange={(url) => setNewUser((prev) => ({ ...prev, avatar: url }))}
                folder="public/avatars"
                accept="image/*"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="user@hcmute.edu.vn"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Database Role</Label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((prev) => ({
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
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Leave blank for OTP / Google only"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
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
      )}

      {/* EDIT USER & JSON PROFILE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Manage User & Unstructured JSON Profile
                </h3>
                <p className="text-xs text-slate-500">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <ImageUploadField
                label="User Avatar"
                value={editAvatar}
                onChange={setEditAvatar}
                folder="public/avatars"
                accept="image/*"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>System Role</Label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "ADMIN" | "USER")}
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
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
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
                  value={editProfileJsonText}
                  onChange={(e) => setEditProfileJsonText(e.target.value)}
                  className="font-mono text-xs bg-slate-900 text-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="ute" disabled={savingEdit}>
                  {savingEdit ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save Changes to DB
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
