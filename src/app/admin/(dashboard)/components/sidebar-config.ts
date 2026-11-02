import {
  LayoutDashboard,
  BarChart3,
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
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    id: "analytics",
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export const sidebarMenuGroups: SidebarMenuGroup[] = [
  // ── 1. Content Management ──
  {
    id: "contentManagement",
    title: "Content Management",
    icon: FileText,
    defaultOpen: true,
    items: [
      {
        id: "posts",
        title: "Posts & News",
        href: "/admin/posts",
        icon: FileText,
      },
      {
        id: "media",
        title: "Media Library",
        href: "/admin/media",
        icon: ImageIcon,
      },
    ],
  },

  // ── 2. Website Builder ──
  {
    id: "websiteManagement",
    title: "Website",
    icon: Globe,
    defaultOpen: false,
    items: [
      {
        id: "pages",
        title: "Pages",
        href: "/admin/pages",
        icon: FileStack,
      },
      {
        id: "header",
        title: "Header & Navigation",
        href: "/admin/header",
        icon: LayoutTemplate,
      },
    ],
  },

  // ── 3. Conference & Registrations ──
  {
    id: "conferenceManagement",
    title: "Conference & Finance",
    icon: ShieldCheck,
    defaultOpen: false,
    items: [
      {
        id: "registrations",
        title: "Registrations & Payoo",
        href: "/admin/registrations",
        icon: CreditCard,
      },
      {
        id: "broadcast",
        title: "Broadcast Emails",
        href: "/admin/broadcast",
        icon: Mail,
      },
    ],
  },

  // ── 4. System Administration ──
  {
    id: "administration",
    title: "Administration",
    icon: Settings,
    defaultOpen: false,
    items: [
      {
        id: "users",
        title: "Users & Roles",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
];

export const sidebarFooterItems = {
  logout: {
    id: "logout",
    title: "Log out",
    href: "/api/auth/logout",
  },
};
