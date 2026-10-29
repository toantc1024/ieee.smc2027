"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

interface EditUserModalProps {
  user: AdminUserRecord | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    id: string;
    name: string;
    role: "ADMIN" | "USER";
    avatar: string | null;
    password?: string;
    profileData: Record<string, unknown>;
  }) => Promise<void>;
}

export function EditUserModal({
  user,
  saving,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role);
      setAvatar(user.avatar || "");
      setPassword("");
      const profile = user.profileData || {};
      setAffiliation(String(profile.affiliation || ""));
      setCountry(String(profile.country || ""));
      setError("");
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Họ và tên không được để trống");
      return;
    }

    setError("");
    try {
      await onSave({
        id: user.id,
        name: name.trim(),
        role,
        avatar: avatar.trim() || null,
        ...(password.trim() ? { password: password.trim() } : {}),
        profileData: {
          ...(user.profileData || {}),
          affiliation: affiliation.trim(),
          country: country.trim(),
        },
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật không thành công");
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={onClose}>
      <DialogContent className="max-w-md font-sans p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-base font-bold text-slate-900">
            Chỉnh sửa thông tin người dùng
          </DialogTitle>
          <p className="text-xs text-slate-500">{user.email}</p>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Họ và tên */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005496] bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* Vai trò */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Vai trò tài khoản</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005496] bg-slate-50 focus:bg-white cursor-pointer font-medium"
            >
              <option value="USER">Thành viên thông thường</option>
              <option value="ADMIN">Quản trị viên (Toàn quyền)</option>
            </select>
          </div>

          {/* Đơn vị công tác & Quốc gia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Đơn vị công tác</label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="VD: Trường ĐH Sư Phạm Kỹ Thuật"
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005496] bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Quốc gia</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="VD: Vietnam"
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005496] bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Đổi mật khẩu mới */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Đổi mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống nếu không thay đổi..."
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005496] bg-slate-50 focus:bg-white"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="h-8.5 px-3.5 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="h-8.5 px-4 text-xs bg-[#005496] hover:bg-[#004276] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
