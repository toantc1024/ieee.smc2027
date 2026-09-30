"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  QrCode,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Check,
  X,
  CreditCard,
  Building,
  Mail,
  RefreshCw,
} from "lucide-react";
import { formatVND, formatUSD } from "@/lib/conference-registration";

interface RegistrationItem {
  id: string;
  registrationCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  affiliation: string;
  country: string;
  participantType: "AUTHOR" | "STUDENT" | "IEEE_MEMBER" | "REGULAR";
  paperId: string | null;
  paperTitle: string | null;
  passportNumber: string | null;
  needsVisaSupport: boolean;
  dietaryRequirement: string | null;
  travelNotes: string | null;
  feeAmount: number;
  currency: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string | null;
  transactionRef: string | null;
  paidAt: string | null;
  checkInStatus: boolean;
  checkedInAt: string | null;
  createdAt: string;
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registration?admin=true");
      const data = await res.json();
      if (data.registrations) {
        setRegistrations(data.registrations);
      }
    } catch (e) {
      console.error("Error loading registrations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUpdateStatus = async (id: string, paymentStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/registration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus,
          transactionRef: `VCB-${Date.now().toString().slice(-6)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? data.registration : r))
        );
        if (selectedReg?.id === id) {
          setSelectedReg(data.registration);
        }
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCheckin = async (id: string, currentStatus: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/registration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInStatus: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? data.registration : r))
        );
        if (selectedReg?.id === id) {
          setSelectedReg(data.registration);
        }
      }
    } catch (e) {
      console.error("Failed to toggle checkin:", e);
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = registrations.length;
    const paid = registrations.filter((r) => r.paymentStatus === "PAID");
    const pending = registrations.filter((r) => r.paymentStatus === "PENDING");
    const checkedIn = registrations.filter((r) => r.checkInStatus);

    const revenueVnd = paid
      .filter((r) => r.currency === "VND")
      .reduce((sum, r) => sum + r.feeAmount, 0);

    const revenueUsd = paid
      .filter((r) => r.currency === "USD")
      .reduce((sum, r) => sum + r.feeAmount, 0);

    return {
      total,
      paidCount: paid.length,
      pendingCount: pending.length,
      checkedInCount: checkedIn.length,
      revenueVnd,
      revenueUsd,
    };
  }, [registrations]);

  // Filtered List
  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (statusFilter !== "ALL" && r.paymentStatus !== statusFilter) return false;
      if (typeFilter !== "ALL" && r.participantType !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.registrationCode.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.affiliation.toLowerCase().includes(q) ||
          (r.paperId && r.paperId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [registrations, statusFilter, typeFilter, search]);

  // Export to CSV with UTF-8 BOM for Excel compatibility
  const handleExportCSV = () => {
    const headers = [
      "Mã đăng ký",
      "Họ và tên",
      "Email",
      "Số điện thoại",
      "Đơn vị",
      "Quốc gia",
      "Loại đại biểu",
      "Mã bài báo",
      "Tiêu đề bài báo",
      "Số hộ chiếu",
      "Hỗ trợ Visa",
      "Ăn uống",
      "Lệ phí",
      "Tiền tệ",
      "Trạng thái thanh toán",
      "Mã giao dịch",
      "Ngày thanh toán",
      "Điểm danh",
      "Ngày đăng ký",
    ];

    const rows = filtered.map((r) => [
      `"${r.registrationCode}"`,
      `"${r.fullName}"`,
      `"${r.email}"`,
      `"${r.phone || ""}"`,
      `"${r.affiliation}"`,
      `"${r.country}"`,
      `"${r.participantType}"`,
      `"${r.paperId || ""}"`,
      `"${(r.paperTitle || "").replace(/"/g, '""')}"`,
      `"${r.passportNumber || ""}"`,
      r.needsVisaSupport ? "Có" : "Không",
      `"${r.dietaryRequirement || "None"}"`,
      r.feeAmount,
      r.currency,
      r.paymentStatus,
      `"${r.transactionRef || ""}"`,
      r.paidAt ? new Date(r.paidAt).toLocaleDateString("vi-VN") : "",
      r.checkInStatus ? "Đã check-in" : "Chưa",
      new Date(r.createdAt).toLocaleDateString("vi-VN"),
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `IEEE_SMC_2027_Delegates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Đăng Ký & Đối Soát Thanh Toán
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi danh sách đại biểu, đối soát dòng tiền VietQR tự động & xuất báo cáo tài chính.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRegistrations}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel / CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng Đại Biểu
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#115eff] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{metrics.total}</div>
          <span className="text-[11px] text-slate-500">
            Đã đăng ký trên toàn hệ thống
          </span>
        </div>

        {/* Card 2: Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thu Ngân Sách (PAID)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-black text-emerald-600">
            {formatVND(metrics.revenueVnd)}
          </div>
          <span className="text-[11px] text-slate-500">
            {metrics.revenueUsd > 0 ? `+ ${formatUSD(metrics.revenueUsd)} USD` : "Đối soát Vietcombank"}
          </span>
        </div>

        {/* Card 3: Pending Invoices */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chờ Thanh Toán
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600">
            {metrics.pendingCount}
          </div>
          <span className="text-[11px] text-slate-500">Cần nhắc thanh toán / kiểm tra sao kê</span>
        </div>

        {/* Card 4: Checked-in */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Điểm Danh Hội Trường
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600">
            {metrics.checkedInCount} / {metrics.total}
          </div>
          <span className="text-[11px] text-slate-500">
            Tỷ lệ check-in: {metrics.total > 0 ? Math.round((metrics.checkedInCount / metrics.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Mã đăng ký, Họ tên, Email, Đơn vị, Mã bài báo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:bg-white"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff]"
          >
            <option value="ALL">Mọi trạng thái thanh toán</option>
            <option value="PAID">ĐÃ THANH TOÁN (PAID)</option>
            <option value="PENDING">CHỜ THANH TOÁN (PENDING)</option>
            <option value="REFUNDED">HOÀN TIỀN (REFUNDED)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff]"
          >
            <option value="ALL">Mọi loại đại biểu</option>
            <option value="AUTHOR">Tác giả (AUTHOR)</option>
            <option value="IEEE_MEMBER">Hội viên IEEE</option>
            <option value="STUDENT">Sinh viên</option>
            <option value="REGULAR">Đại biểu tự do</option>
          </select>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Mã Đăng Ký</th>
                <th className="py-3 px-4">Đại Biểu</th>
                <th className="py-3 px-4">Loại & Bài Báo</th>
                <th className="py-3 px-4">Lệ Phí</th>
                <th className="py-3 px-4">Thanh Toán</th>
                <th className="py-3 px-4">Điểm Danh</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Đang nạp dữ liệu đại biểu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Không tìm thấy đại biểu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#115eff]">
                      {item.registrationCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.email} • {item.affiliation}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                        {item.participantType}
                      </span>
                      {item.paperId && (
                        <div className="text-[11px] font-mono text-blue-600 mt-0.5">
                          Paper #{item.paperId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {item.currency === "VND" ? formatVND(item.feeAmount) : formatUSD(item.feeAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.paymentStatus === "PAID" ? "Đã đối soát" : "Chờ chuyển khoản"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleCheckin(item.id, item.checkInStatus)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          item.checkInStatus
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {item.checkInStatus ? "Đã Check-in" : "Chưa"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.paymentStatus === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, "PAID")}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer transition-colors"
                            title="Xác nhận đã nhận tiền vào tài khoản"
                          >
                            Duyệt Tiền
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedReg(item)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          title="Xem chi tiết hồ sơ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="font-mono text-xs font-black text-[#115eff]">
                  {selectedReg.registrationCode}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedReg.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Email:</span>
                <span className="font-semibold text-slate-900">{selectedReg.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Điện thoại:</span>
                <span className="font-semibold text-slate-900">{selectedReg.phone || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Đơn vị:</span>
                <span className="font-semibold text-slate-900">{selectedReg.affiliation}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Quốc gia:</span>
                <span className="font-semibold text-slate-900">{selectedReg.country}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Hộ chiếu / CCCD:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selectedReg.passportNumber || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Chế độ ăn:</span>
                <span className="font-semibold text-slate-900">
                  {selectedReg.dietaryRequirement || "Bình thường"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Hỗ trợ Visa:</span>
                <span className="font-semibold text-slate-900">
                  {selectedReg.needsVisaSupport ? "Có đăng ký Thư hỗ trợ" : "Không"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Trạng thái điểm danh:</span>
                <span className="font-semibold text-slate-900">
                  {selectedReg.checkInStatus ? "Đã check-in" : "Chưa"}
                </span>
              </div>
            </div>

            {selectedReg.paperId && (
              <div className="p-3 bg-blue-50 rounded-xl text-xs space-y-1">
                <span className="font-bold text-blue-900 block">Bài Báo Khoa Học</span>
                <div>Paper ID: <strong className="font-mono text-blue-700">{selectedReg.paperId}</strong></div>
                {selectedReg.paperTitle && <div className="italic text-slate-600">"{selectedReg.paperTitle}"</div>}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Lệ phí đăng ký:</span>
                <span className="text-base font-black text-[#115eff]">
                  {selectedReg.currency === "VND" ? formatVND(selectedReg.feeAmount) : formatUSD(selectedReg.feeAmount)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block">Trạng thái:</span>
                <span className="font-bold text-slate-900">{selectedReg.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Link
                href={`/portal?code=${selectedReg.registrationCode}`}
                target="_blank"
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Mở Thẻ Đại Biểu
              </Link>

              {selectedReg.paymentStatus === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedReg.id, "PAID")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Xác Nhận Đã Nhận Tiền
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedReg.id, "PENDING")}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Đặt lại Chờ thanh toán
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
