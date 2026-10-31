import React from "react";
import Link from "next/link";
import { prisma, withTimeout } from "@/lib";
import { authService, cmsService } from "@/services";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Layers,
  ArrowRight,
  ExternalLink,
  Database,
  Globe,
  SlidersHorizontal,
  CreditCard,
  QrCode,
  Send,
  Users,
  FolderOpen,
} from "lucide-react";

interface AdminPageSummary {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  block_count?: number;
  updated_at?: string;
}

export default async function AdminDashboardPage() {
  const user = await authService.getCurrentUser();
  const pages = (await withTimeout(
    cmsService.getAllPages().catch(() => []),
    2500,
    []
  )) as AdminPageSummary[];

  const [totalRegs, paidRegs, checkedInRegs, totalUsers, totalMedia] = await Promise.all([
    withTimeout(prisma.registration.count().catch(() => 0), 2500, 0),
    withTimeout(
      prisma.registration.count({ where: { paymentStatus: "PAID" } }).catch(() => 0),
      2500,
      0
    ),
    withTimeout(
      prisma.registration.count({ where: { checkInStatus: true } }).catch(() => 0),
      2500,
      0
    ),
    withTimeout(prisma.user.count().catch(() => 0), 2500, 0),
    withTimeout(prisma.mediaFile.count().catch(() => 0), 2500, 0),
  ]);

  return (
    <div className="space-y-6 font-sans">
      <ManagementPageHeader
        imageIcon="/assets/3d-icons/dashboard__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-dashboard-bg.jpg"
        title={`Welcome back, ${user?.name || "Administrator"}`}
        description="Manage JSON-based delegate registrations, Payoo payment reconciliation, Visa Support Letter approvals, Milestone Email Templates, Media Library assets, and PostgreSQL RBAC."
      >
        <Link href="/admin/registrations">
          <Button variant="ute" size="sm">
            <CreditCard className="size-4" />
            Registrations & Payoo
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <Users className="size-4" />
            Users & Roles
          </Button>
        </Link>
        <Link href="/admin/media">
          <Button variant="outline" size="sm">
            <FolderOpen className="size-4" />
            Media Library
          </Button>
        </Link>
      </ManagementPageHeader>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">
              Total Delegates
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalRegs}</div>
            <Link
              href="/admin/registrations"
              className="text-xs text-[#115eff] font-semibold hover:underline mt-1 block"
            >
              Inspect JSON formData →
            </Link>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 text-[#115eff] flex items-center justify-center">
            <CreditCard className="size-5" />
          </div>
        </Card>

        <Card className="p-5 flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">
              Payoo Verified Paid
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{paidRegs}</div>
            <span className="text-xs text-slate-400 mt-1 block">
              Checked-in: {checkedInRegs}
            </span>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode className="size-5" />
          </div>
        </Card>

        <Card className="p-5 flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">
              Database Users
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</div>
            <Link
              href="/admin/users"
              className="text-xs text-[#115eff] font-semibold hover:underline mt-1 block"
            >
              Manage ADMIN / USER roles →
            </Link>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 text-[#115eff] flex items-center justify-center">
            <Users className="size-5" />
          </div>
        </Card>

        <Card className="p-5 flex-row items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">
              Media Library Files
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalMedia}</div>
            <Link
              href="/admin/media"
              className="text-xs text-[#115eff] font-semibold hover:underline mt-1 block"
            >
              Open Media Manager →
            </Link>
          </div>
          <div className="size-11 rounded-xl bg-blue-50 text-[#115eff] flex items-center justify-center">
            <FolderOpen className="size-5" />
          </div>
        </Card>
      </div>

      {/* Quick Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="justify-between">
          <div className="space-y-2">
            <Badge variant="ute">Milestone Emails</Badge>
            <h2 className="text-base font-bold text-slate-900">
              Email Templates & Broadcasts
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customize HTML templates for Email Link OTP, CFP, PaperCept Acceptance, Registration, Payoo Receipt, and Visa Support Letters.
            </p>
          </div>
          <Link href="/admin/broadcast">
            <Button variant="outline" size="sm" className="w-full">
              <Send className="size-3.5" />
              Open Milestone Templates
            </Button>
          </Link>
        </Card>

        <Card className="justify-between">
          <div className="space-y-2">
            <Badge variant="ute">MinIO + DB Catalog</Badge>
            <h2 className="text-base font-bold text-slate-900">
              Media Upload Library
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Centralized storage for delegate avatars, passport scans, IEEE/student proofs, and CMS news graphics.
            </p>
          </div>
          <Link href="/admin/media">
            <Button variant="outline" size="sm" className="w-full">
              <FolderOpen className="size-3.5" />
              Browse Media Library
            </Button>
          </Link>
        </Card>

        <Card className="justify-between">
          <div className="space-y-2">
            <Badge variant="ute">CMS Hierarchy</Badge>
            <h2 className="text-base font-bold text-slate-900">
              Page Tree & Visual Builder
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage {pages.length} hierarchical conference pages and dynamic content blocks stored in PostgreSQL.
            </p>
          </div>
          <Link href="/admin/pages">
            <Button variant="outline" size="sm" className="w-full">
              <Layers className="size-3.5" />
              Open Page Hierarchy
            </Button>
          </Link>
        </Card>
      </div>

      {/* Pages Table Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Website Pages</h3>
            <p className="text-xs text-slate-400">Active pages in PostgreSQL CMS</p>
          </div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#115eff] hover:underline"
          >
            <span>Open Tree View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {pages.map((p: AdminPageSummary) => (
            <div
              key={p.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{p.title}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    /{p.slug === "home" ? "" : p.slug}
                  </span>
                  {p.is_published && (
                    <Badge variant="success" className="text-[10px]">
                      Published
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {p.block_count || 0} components · Updated:{" "}
                  {p.updated_at
                    ? new Date(p.updated_at).toLocaleDateString("en-US")
                    : "Today"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/pages/${p.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold rounded-lg transition-colors text-[11px]"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Edit Builder</span>
                </Link>

                <Link
                  href={p.slug === "home" ? "/" : `/${p.slug}`}
                  target="_blank"
                  className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Preview live page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              PostgreSQL Database: <strong className="text-slate-800">Online</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#115eff]" />
            <span>HCMUTE Branding System Active</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          IEEE SMC 2027 · Ho Chi Minh City University of Technology and Education
        </div>
      </div>
    </div>
  );
}
