"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Users,
  PanelTop,
  ExternalLink,
  LogOut,
  Shield,
  KeyRound,
  Globe,
  CreditCard,
  QrCode,
  Send,
  FolderOpen,
  ChevronsUpDown,
  Laptop,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SessionUser } from "@/lib/auth";

interface AdminSidebarProps {
  user: SessionUser;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Delegate Operations",
    items: [
      {
        title: "Registrations & Payoo",
        url: "/admin/registrations",
        icon: CreditCard,
        badge: "Payoo",
      },
      {
        title: "QR Check-in",
        url: "/admin/checkin",
        icon: QrCode,
      },
      {
        title: "Milestone Emails",
        url: "/admin/broadcast",
        icon: Send,
        badge: "Templates",
      },
    ],
  },
  {
    title: "Content & Assets",
    items: [
      {
        title: "Media Library",
        url: "/admin/media",
        icon: FolderOpen,
        badge: "MinIO",
      },
      {
        title: "Page Hierarchy",
        url: "/admin/pages",
        icon: Layers,
        badge: "Tree",
      },
      {
        title: "Posts & News",
        url: "/admin/posts",
        icon: FileText,
      },
      {
        title: "Header & Navigation",
        url: "/admin/header",
        icon: PanelTop,
      },
    ],
  },
  {
    title: "System & RBAC",
    items: [
      {
        title: "Users & Roles",
        url: "/admin/users",
        icon: Users,
        badge: "RBAC",
      },
      {
        title: "OAuth & AI Agent",
        url: "/admin/oauth",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Portals",
    items: [
      {
        title: "Conference Website",
        url: "/",
        icon: Globe,
        external: true,
      },
      {
        title: "Delegate Portal",
        url: "/portal",
        icon: Laptop,
        external: true,
      },
    ],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      {/* ── Brand Header ── */}
      <SidebarHeader className="border-b border-slate-100 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-slate-50">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-[#115eff] text-white shadow-xs">
                  <Shield className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-black text-[#115eff] tracking-tight">
                    IEEE SMC 2027
                  </span>
                  <span className="truncate text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    HCMUTE Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav Groups ── */}
      <SidebarContent className="px-2 py-2">
        {NAV_SECTIONS.map((section, idx) => (
          <SidebarGroup key={section.title} className="py-1">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.url
                    : !item.external && pathname.startsWith(item.url);

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={
                          isActive
                            ? "bg-[#115eff] text-white font-semibold hover:bg-[#0a4de6] hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }
                      >
                        <Link
                          href={item.url}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noreferrer" : undefined}
                        >
                          <item.icon
                            className={
                              isActive
                                ? "text-white"
                                : "text-slate-500 group-hover:text-[#115eff]"
                            }
                          />
                          <span className="truncate text-xs">{item.title}</span>
                          {item.external && (
                            <ExternalLink className="ml-auto size-3 text-slate-400" />
                          )}
                        </Link>
                      </SidebarMenuButton>

                      {item.badge && (
                        <SidebarMenuBadge
                          className={
                            isActive
                              ? "bg-white/20 text-white font-mono text-[10px]"
                              : "bg-blue-50 text-[#115eff] font-mono text-[10px]"
                          }
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {idx < NAV_SECTIONS.length - 1 && <SidebarSeparator className="my-2" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── User Profile Footer ── */}
      <SidebarFooter className="border-t border-slate-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-slate-100 hover:bg-slate-50"
                >
                  <Avatar className="size-8 rounded-lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-[#115eff] text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-slate-900">
                      {user.name}
                    </span>
                    <span className="truncate text-[10px] text-slate-500">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-left text-xs">
                    <Avatar className="size-8 rounded-lg">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-[#115eff] text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-bold text-slate-900">
                        {user.name}
                      </span>
                      <span className="truncate text-[10px] text-[#115eff] font-semibold">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/" target="_blank" className="flex items-center gap-2">
                      <Globe className="size-4 text-slate-500" />
                      <span>Conference Homepage</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal" target="_blank" className="flex items-center gap-2">
                      <Shield className="size-4 text-slate-500" />
                      <span>Delegate Portal</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/logout" method="POST" className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* ── Desktop Rail Drag/Expand Handle ── */}
      <SidebarRail />
    </Sidebar>
  );
}

export default AdminSidebar;
