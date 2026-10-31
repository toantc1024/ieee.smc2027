import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Globe,
  FileStack,
  LayoutTemplate,
  ShieldCheck,
  CreditCard,
  Mail,
  Settings,
  Users,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface SidebarMenuItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

export interface SidebarMenuGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SidebarMenuItem[];
  defaultOpen?: boolean;
}

export const quickNavItems: SidebarMenuItem[] = [
  {
    id: "dashboard",
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
];

export const sidebarMenuGroups: SidebarMenuGroup[] = [
  // ── 1. Quản lý nội dung ──
  {
    id: "contentManagement",
    title: "Quản lý nội dung",
    icon: FileText,
    defaultOpen: true,
    items: [
      {
        id: "posts",
        title: "Văn bản và bài viết",
        href: "/admin/posts",
        icon: FileText,
      },
      {
        id: "media",
        title: "Đa phương tiện",
        href: "/admin/media",
        icon: ImageIcon,
      },
    ],
  },

  // ── 2. Website ──
  {
    id: "websiteManagement",
    title: "Website",
    icon: Globe,
    defaultOpen: false,
    items: [
      {
        id: "pages",
        title: "Trang",
        href: "/admin/pages",
        icon: FileStack,
      },
      {
        id: "header",
        title: "Header & Mega Menu",
        href: "/admin/header",
        icon: LayoutTemplate,
      },
    ],
  },

  // ── 3. Hội nghị & Đăng ký ──
  {
    id: "conferenceManagement",
    title: "Hội nghị & Đăng ký",
    icon: ShieldCheck,
    defaultOpen: false,
    items: [
      {
        id: "registrations",
        title: "Đăng ký & Payoo",
        href: "/admin/registrations",
        icon: CreditCard,
      },
      {
        id: "broadcast",
        title: "Gửi thư thông báo",
        href: "/admin/broadcast",
        icon: Mail,
      },
    ],
  },

  // ── 4. Quản trị hệ thống ──
  {
    id: "administration",
    title: "Quản trị hệ thống",
    icon: Settings,
    defaultOpen: false,
    items: [
      {
        id: "users",
        title: "Tài khoản & Phân quyền",
        href: "/admin/users",
        icon: Users,
      },
      {
        id: "oauth",
        title: "Cấu hình Google OAuth",
        href: "/admin/oauth",
        icon: KeyRound,
      },
    ],
  },
];

export const sidebarFooterItems = {
  logout: {
    id: "logout",
    title: "Đăng xuất",
    href: "/api/auth/logout",
  },
};
