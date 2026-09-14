"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Role } from "@/generated/prisma";
import { Menu, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function DashboardLayoutWrapper({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isRootDashboard = pathname === `/dashboard/${role.toLowerCase()}`;

  return (
    <div className="academy-page-grid flex min-h-dvh w-full max-w-full overflow-x-hidden overscroll-x-none font-sans touch-pan-y text-[#1E1B4B] dark:text-[#F3EFFF]" dir="rtl">
      <Sidebar
        role={role}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`flex min-h-dvh min-w-0 flex-1 flex-col transition-all duration-300 ${isCollapsed ? "md:mr-20" : "md:mr-64"}`}>
        <header className="flex shrink-0 items-center justify-between bg-[#6D28D9] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-full p-2 text-white hover:bg-white/10"
              aria-label="فتح القائمة"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="truncate text-base font-black text-white sm:text-lg">
              منصة دقيش التعليمية
            </h1>
          </div>

          {!isRootDashboard && (
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6D28D9]"
              aria-label="رجوع"
            >
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          )}
        </header>

        <main className="w-full min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-8">
          {!isRootDashboard && (
            <div className="mx-auto mb-6 hidden max-w-7xl justify-end md:flex">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#6D28D9] hover:bg-[#F3EFFF]"
              >
                رجوع
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </div>
          )}

          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
