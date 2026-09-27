"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Trash2,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: "ADMIN" | "USER";
  provider: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "USER">("USER");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch {
      setStatusMessage({ type: "error", text: "Không thể tải danh sách người dùng" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, targetRole: "ADMIN" | "USER") => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi cập nhật vai trò");
      }
      setStatusMessage({
        type: "success",
        text: `Đã cập nhật vai trò thành công sang ${targetRole}!`,
      });
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi cập nhật";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${email}"?`)) return;

    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi xóa người dùng");
      }
      setStatusMessage({ type: "success", text: "Đã xóa người dùng thành công!" });
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi xóa";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, name: newName, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi tạo người dùng");
      }
      setStatusMessage({
        type: "success",
        text: `Đã thêm người dùng "${newEmail}" (${newRole}) thành công!`,
      });
      setShowAddModal(false);
      setNewEmail("");
      setNewName("");
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi tạo người dùng";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#004776] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#115eff]" />
            <span>Quản Lý Người Dùng & Phân Quyền</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị tài khoản hội nghị, phân quyền vai trò (chỉ gồm <strong>ADMIN</strong> và <strong>USER</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-[0.26rem] shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Người Dùng</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo email hoặc họ tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Lọc vai trò:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] text-[#004776]"
          >
            <option value="ALL">Tất cả ({users.length})</option>
            <option value="ADMIN">ADMIN ({users.filter((u) => u.role === "ADMIN").length})</option>
            <option value="USER">USER ({users.filter((u) => u.role === "USER").length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-[#004776] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Người dùng</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Vai trò (Role)</th>
                <th className="py-3.5 px-4">Phương thức</th>
                <th className="py-3.5 px-4">Ngày tham gia</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#115eff]" />
                      <span>Đang tải danh sách người dùng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isMainAdmin = item.email.toLowerCase() === "tctoan1024@gmail.com";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#115eff] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-[#004776] flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {isMainAdmin && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-100 text-[#115eff] text-[10px] font-extrabold uppercase" title="Primary Administrator">
                                  <ShieldCheck className="w-3 h-3 text-[#115eff]" />
                                  <span>Super</span>
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ID: {item.id.slice(0, 14)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                        {item.email}
                      </td>

                      <td className="py-3.5 px-4">
                        {isMainAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#115eff] text-white text-xs font-bold uppercase shadow-2xs">
                            <Shield className="w-3 h-3" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <select
                            value={item.role}
                            disabled={actionLoading}
                            onChange={(e) =>
                              handleRoleChange(
                                item.id,
                                e.target.value as "ADMIN" | "USER"
                              )
                            }
                            className={`px-2.5 py-1 text-xs font-bold uppercase rounded border transition-colors cursor-pointer ${
                              item.role === "ADMIN"
                                ? "bg-[#115eff] text-white border-[#115eff]"
                                : "bg-slate-100 text-slate-700 border-slate-200 hover:border-[#115eff]"
                            }`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="USER">USER</option>
                          </select>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-slate-600">
                          {item.provider}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {!isMainAdmin && (
                          <button
                            onClick={() => handleDeleteUser(item.id, item.email)}
                            disabled={actionLoading}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#004776] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#115eff]" />
                <span>Thêm Người Dùng Mới</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Vai trò (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole("USER")}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      newRole === "USER"
                        ? "border-[#115eff] bg-blue-50/50 text-[#115eff] font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs uppercase">USER</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Thành viên thông thường
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole("ADMIN")}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      newRole === "ADMIN"
                        ? "border-[#115eff] bg-blue-50/50 text-[#115eff] font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs uppercase flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>ADMIN</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Toàn quyền quản trị CMS
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Đang xử lý..." : "Lưu Người Dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
