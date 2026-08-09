"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { Role } from "@/generated/prisma";
import { Menu, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function DashboardLayoutWrapper({ 
  children, 
  role 
}: { 
  children: React.ReactNode; 
  role: Role;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on the root dashboard page of the current role
  const isRootDashboard = pathname === `/dashboard/${role.toLowerCase()}`;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] bg-notebook-grid font-arabic overflow-x-hidden" dir="rtl">
      
      <Sidebar 
        role={role} 
        isMobileOpen={isMobileOpen} 
        onMobileClose={() => setIsMobileOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -mr-2 rounded-lg text-slate-500 hover:bg-slate-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-black text-lg text-slate-900">أكاديمية دقيش</h1>
          </div>
          
          {!isRootDashboard && (
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors duration-200"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 relative">
          
          {/* Desktop Global Back Button */}
          {!isRootDashboard && (
            <div className="hidden md:flex justify-end mb-6 max-w-7xl mx-auto">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors duration-200"
              >
                رجوع
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav role={role} />
    </div>
  );
}
