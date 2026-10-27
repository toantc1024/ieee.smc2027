import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SimpleAdminLayout } from "./components/SimpleAdminLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/portal");
  }

  return (
    <SimpleAdminLayout user={user}>
      {children}
    </SimpleAdminLayout>
  );
}
