"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminSession } from "@/lib/admin/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isLogin = pathname.startsWith("/admin/login");
  const router = useRouter();
  const { session, hydrated } = useAdminSession();

  useEffect(() => {
    if (isLogin) return;
    if (hydrated && !session) router.replace("/admin/login");
  }, [hydrated, session, isLogin, router]);

  // Login page renders standalone, no shell.
  if (isLogin) return <>{children}</>;

  // While hydrating, render an empty shell to avoid flash.
  if (!hydrated || !session) {
    return <div className="min-h-screen bg-[#fbfdfb]" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfdfb]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
