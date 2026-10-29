"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Users, Edit2, Trash2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { CreateUserModal } from "@/components/admin/users/CreateUserModal";
import {
  EditUserModal,
  AdminUserRecord,
} from "@/components/admin/users/EditUserModal";
import { UserDeleteDialog } from "@/components/admin/users/UserDeleteDialog";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";

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
        throw new Error(json.error || "Không thể tải danh sách người dùng");
      }
      const list = json.users || json.data?.users || (Array.isArray(json) ? json : []);
      setUsers(list);
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi khi tải dữ liệu",
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
        throw new Error(json.error || "Không thể tạo người dùng mới");
      }
      setAlert({
        type: "success",
        text: `Đã tạo tài khoản cho ${payload.email} thành công!`,
      });
      setCreateOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Thao tác thất bại",
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
        throw new Error(json.error || "Không thể cập nhật người dùng");
      }
      setAlert({
        type: "success",
        text: "Đã cập nhật thông tin người dùng thành công!",
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Cập nhật thất bại",
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
      throw new Error(json.error || "Không thể xóa người dùng");
    }
    setAlert({ type: "success", text: "Đã xóa người dùng thành công!" });
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
        text: "Không thể xóa tài khoản bạn đang đăng nhập!",
      });
      return;
    }

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${safeToDelete.length} tài khoản đã chọn?`
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
        text: `Đã xóa ${safeToDelete.length} tài khoản thành công!`,
      });
      await fetchUsers();
    } catch {
      setAlert({ type: "error", text: "Xảy ra lỗi khi xóa tài khoản hàng loạt" });
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
          throw new Error(json.error || "Không thể cập nhật vai trò");
        }
        setAlert({
          type: "success",
          text: `Đã đổi vai trò thành ${
            newRole === "ADMIN" ? "Quản trị viên" : "Thành viên"
          } thành công!`,
        });
      } catch (err: unknown) {
        // Rollback on error
        await fetchUsers();
        setAlert({
          type: "error",
          text: err instanceof Error ? err.message : "Cập nhật vai trò thất bại",
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
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            className="size-4 rounded border-slate-300 text-[#005496] focus:ring-[#005496] cursor-pointer"
            aria-label="Chọn tất cả"
          />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isSelf = Boolean(
            currentUserEmail &&
            item.email.toLowerCase() === currentUserEmail.toLowerCase()
          );
          return (
            <input
              type="checkbox"
              disabled={isSelf}
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              className="size-4 rounded border-slate-300 text-[#005496] focus:ring-[#005496] cursor-pointer disabled:opacity-30"
              aria-label="Chọn dòng"
            />
          );
        },
        size: 36,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Người dùng",
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
                <div className="size-9 rounded-full bg-blue-50 text-[#005496] font-bold text-xs flex items-center justify-center shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 truncate">
                    {u.name}
                  </span>
                  {isSelf && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#005496]/10 text-[#005496]">
                      Bạn
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 truncate block">
                  {u.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => {
          const u = row.original;
          const role = (row.getValue("role") as string) || u.role;
          const isSelf = Boolean(
            currentUserEmail &&
            u.email.toLowerCase() === currentUserEmail.toLowerCase()
          );

          if (isSelf) {
            return (
              <span
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium px-2 py-1 select-none"
                title="Tài khoản của bạn"
              >
                <span className="size-2 rounded-full bg-blue-500" />
                Quản trị viên
              </span>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 -mx-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#005496] transition-colors cursor-pointer group"
                  title="Nhấn để đổi vai trò nhanh"
                >
                  {role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1.5 text-blue-700">
                      <span className="size-2 rounded-full bg-blue-500" />
                      <span>Quản trị viên</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <span className="size-2 rounded-full bg-slate-400" />
                      <span>Thành viên</span>
                    </span>
                  )}
                  <ChevronDown className="size-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 p-1">
                <DropdownMenuItem
                  onClick={() => handleQuickRoleChange(u.id, "ADMIN")}
                  className="flex items-center justify-between py-1.5 px-2.5 text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-blue-700 font-medium">
                    <span className="size-2 rounded-full bg-blue-500" />
                    Quản trị viên
                  </span>
                  {role === "ADMIN" && <Check className="size-3.5 text-blue-700" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleQuickRoleChange(u.id, "USER")}
                  className="flex items-center justify-between py-1.5 px-2.5 text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="size-2 rounded-full bg-slate-400" />
                    Thành viên
                  </span>
                  {role === "USER" && <Check className="size-3.5 text-slate-700" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "provider",
        header: "Đăng nhập qua",
        cell: ({ row }) => {
          const provider = (row.getValue("provider") as string) || "email";
          let label = "Email";
          if (provider.toLowerCase().includes("google")) label = "Google";
          if (provider.toLowerCase().includes("password")) label = "Mật khẩu";
          return <span className="text-slate-600 font-medium">{label}</span>;
        },
      },
      {
        id: "affiliation",
        header: "Đơn vị công tác",
        cell: ({ row }) => {
          const profile = row.original.profileData || {};
          const aff = profile.affiliation || "-";
          return (
            <span className="text-slate-500 truncate block max-w-xs font-medium">
              {String(aff)}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tham gia",
        cell: ({ row }) => {
          const val = row.getValue("createdAt") as string;
          if (!val) return <span className="text-slate-400">-</span>;
          const date = new Date(val);
          return (
            <span className="text-slate-500 font-medium">
              {date.toLocaleDateString("vi-VN")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = Boolean(
            currentUserEmail &&
            u.email.toLowerCase() === currentUserEmail.toLowerCase()
          );

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => setEditingUser(u)}
                className="p-1.5 text-slate-400 hover:text-[#005496] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Chỉnh sửa thông tin"
              >
                <Edit2 className="size-4" />
              </button>

              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setDeletingUser(u)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Xóa tài khoản"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 80,
      },
    ],
    [currentUserEmail, handleQuickRoleChange]
  );

  return (
    <div className="space-y-4 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="size-6 text-[#005496]" />
            Người dùng &amp; Phân quyền
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tài khoản thành viên và phân quyền quản trị hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 text-xs bg-[#005496] hover:bg-[#004276] text-white shadow-xs"
          >
            <Plus className="size-4 mr-1.5" />
            Thêm người dùng
          </Button>
        </div>
      </div>

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
        searchPlaceholder="Tìm theo tên, email, cơ quan..."
        filterColumns={[
          {
            id: "role",
            title: "Vai trò",
            options: [
              { label: "Quản trị viên", value: "ADMIN" },
              { label: "Thành viên", value: "USER" },
            ],
          },
        ]}
        batchActions={(selected, clear) => (
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => handleBatchDelete(selected, clear)}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
            >
              Xóa đã chọn
            </button>
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
