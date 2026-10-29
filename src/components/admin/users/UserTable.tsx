"use client";

import React from "react";
import { Shield, KeyRound, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminUserRecord {
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

interface UserTableProps {
  users: AdminUserRecord[];
  onToggleRole: (user: AdminUserRecord) => void;
  onEditUser: (user: AdminUserRecord) => void;
  onDeleteUser: (user: AdminUserRecord) => void;
}

export function UserTable({
  users,
  onToggleRole,
  onEditUser,
  onDeleteUser,
}: UserTableProps) {
  return (
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
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((u) => {
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
                    onClick={() => onToggleRole(u)}
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
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]"
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
                      onClick={() => onEditUser(u)}
                    >
                      <Edit3 className="size-3.5" />
                      Manage / JSON
                    </Button>
                    <button
                      type="button"
                      onClick={() => onDeleteUser(u)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete user"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
        </tbody>
      </table>
    </div>
  );
}
