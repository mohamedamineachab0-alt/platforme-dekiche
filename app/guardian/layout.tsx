"use client";

import { Bell, LogOut, Menu, X, Home, BookOpen, Settings, ChevronRight, ChevronLeft, LayoutDashboard, Calendar, FileText } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const sidebarLinks = [
    { name: "لوحة المتابعة", icon: LayoutDashboard, href: "/guardian/dashboard" },
    { name: "النتائج والتقارير", icon: FileText, href: "/guardian/reports" },
    { name: "الحضور والغياب", icon: Calendar, href: "/guardian/attendance" },
    { name: "الإعدادات", icon: Settings, href: "/guardian/settings" },
  ];

  return (
    <div dir="rtl" className="min-h-screen flex relative z-10 font-sans bg-[#F8FAFC]">
      
      {/* Persistent Desktop Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden md:flex fixed top-6 z-50 p-2.5 bg-white border border-gray-200 text-[#6D28D9] rounded-xl shadow-md hover:bg-gray-50 transition-all duration-300 ${
          isOpen ? "right-[260px]" : "right-6"
        }`}
        title={isOpen ? "غلق السايدبار" : "فتح السايدبار"}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* --- Desktop Sidebar Spacer --- */}
      <div className={`hidden md:block transition-all duration-300 ${isOpen ? "w-[280px]" : "w-0"}`}></div>

      {/* --- Desktop Sidebar --- */}
      <div 
        className={`hidden md:flex flex-col h-screen fixed right-0 top-0 bg-white shadow-[0_0_40px_rgba(0,0,0,0.04)] z-40 border-l border-gray-100 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-[280px]`}
      >

        <div className="p-8 bg-[#6D28D9] rounded-bl-[40px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex flex-col items-start relative z-10 mt-6">
            <h1 className="text-white font-bold text-xl leading-snug mb-3">أكاديمية دقيش</h1>
            <div className="mt-1">
              <span className="inline-flex items-center justify-center bg-white/10 rounded-full px-4 py-1.5 text-white text-xs font-semibold whitespace-nowrap shadow-sm backdrop-blur-md">
                النجاح ليس في بلوغ القمة بل الاستمرار في الصعود
              </span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto">
          {sidebarLinks.map((link, idx) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={idx} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 font-bold py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#6D28D9] text-white shadow-lg shadow-[#6D28D9]/25 scale-[1.02]' 
                    : 'text-slate-600 hover:bg-[#6D28D9]/10 hover:text-[#6D28D9] hover:scale-[1.02]'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
          <Link 
            href="/"
            onClick={() => { localStorage.clear(); sessionStorage.clear(); }}
            className="flex items-center justify-center gap-2 w-full text-slate-600 font-bold p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#6D28D9]/20 hover:bg-[#6D28D9]/10 hover:text-[#6D28D9] shadow-sm transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>خروج</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0">
        {/* Topbar */}
        <div className="hidden md:flex justify-end p-6 max-w-7xl mx-auto sticky top-0 z-30">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <button className="relative p-2 text-slate-700 hover:text-[#6D28D9] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        <main className="p-4 md:p-8 pt-6 md:pt-2 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
