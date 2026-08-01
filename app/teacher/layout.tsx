"use client";

import { useState } from "react";
import { LogOut, Menu, X, LayoutDashboard, Users, BookOpen, Settings, ShieldCheck, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/teacher/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "إدارة الأفواج", icon: Users },
    { href: "/teacher/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div dir="rtl" className="min-h-screen flex flex-col md:flex-row relative z-10 font-sans bg-gray-50/30">
      
      {/* --- Mobile Header --- */}
      <div className="md:hidden bg-[#6D28D9] rounded-b-3xl p-5 flex items-center justify-between shadow-lg z-50 sticky top-0">
        <div className="flex items-center gap-4">
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors">
             <Menu className="w-7 h-7" />
           </button>
           <div className="flex flex-col">
             <h1 className="text-white font-bold text-lg leading-tight">بوابة الأستاذ</h1>
             <p className="text-white/80 text-xs mt-0.5">أكاديمية دقيش علي</p>
           </div>
        </div>
        <div className="flex items-center">
          <NotificationsDropdown 
            buttonClassName="text-white hover:bg-white/10"
            iconClassName="w-6 h-6"
          />
        </div>
      </div>

      {/* --- Mobile Drawer Overlay --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
              <h2 className="text-[#6D28D9] font-bold text-xl">القائمة</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                      isActive ? "bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20" : "text-slate-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-6 h-6" /> {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-gray-100 pt-6">
              <Link 
                href="/"
                onClick={() => { localStorage.clear(); sessionStorage.clear(); }}
                className="flex items-center gap-4 p-4 text-slate-600 font-bold hover:bg-[#6D28D9]/10 hover:text-[#6D28D9] bg-white border border-gray-100 hover:border-[#6D28D9]/20 shadow-sm rounded-2xl transition-all w-full"
              >
                <LogOut className="w-6 h-6" /> تسجيل الخروج
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- Desktop Sidebar --- */}
      <div className="hidden md:flex flex-col w-[280px] bg-white border-l border-gray-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)] sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="w-16 h-16 bg-[#6D28D9]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#6D28D9]/20">
            <ShieldCheck className="w-8 h-8 text-[#6D28D9]" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">بوابة الأستاذ</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">إدارة المحتوى والطلاب</p>
        </div>

        <div className="px-6 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-bold text-slate-400 mb-4 px-2 uppercase tracking-wider">الرئيسية</p>
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${
                    isActive 
                      ? "bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20 translate-x-1" 
                      : "text-slate-500 hover:bg-gray-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" /> {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100 mt-auto">
          <Link 
            href="/"
            onClick={() => { localStorage.clear(); sessionStorage.clear(); }}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white text-slate-600 font-bold rounded-2xl border border-gray-100 hover:border-[#6D28D9]/20 hover:bg-[#6D28D9]/10 hover:text-[#6D28D9] transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" /> خروج
          </Link>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 w-full min-w-0 transition-all duration-300">
        
        {/* Desktop Top Nav */}
        <div className="hidden md:flex justify-end p-6 max-w-7xl mx-auto sticky top-0 z-30">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <NotificationsDropdown />
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-8 pt-6 md:pt-2 w-full max-w-7xl mx-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
