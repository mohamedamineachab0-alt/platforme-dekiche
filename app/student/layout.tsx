"use client";

import { useState, useEffect } from "react";
import { LogOut, Menu, X, Home, Settings, User, ShieldCheck, ChevronRight, ChevronLeft, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const sidebarLinks = [
    { name: "الرئيسية", icon: Home, href: "/student" },
    { name: "حسابي", icon: User, href: "/student/profile" },
    { name: "النتائج والتقارير", icon: FileText, href: "/student/reports" },
    { name: "الحضور والغياب", icon: Calendar, href: "/student/attendance" },
    { name: "ربط حساب الولي", icon: ShieldCheck, href: "/student/guardian" },
    { name: "الإعدادات", icon: Settings, href: "/student/settings" },
  ];



  return (
    <div dir="rtl" className="min-h-screen flex flex-col md:flex-row relative z-10 font-sans">
      
      {/* --- Mobile Header --- */}
      <div className="md:hidden bg-[#6D28D9] rounded-b-3xl p-5 flex items-center justify-between shadow-lg z-50 sticky top-0">
        <div className="flex items-center gap-4">
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors">
             <Menu className="w-7 h-7" />
           </button>
           <div className="flex flex-col">
             <h1 className="text-white font-bold text-lg leading-tight">أكاديمية دقيش</h1>
             <div className="mt-2">
               <span className="bg-white/10 rounded-full px-4 py-1.5 text-white text-[10px] font-medium whitespace-nowrap">النجاح ليس في بلوغ القمة بل الاستمرار في الصعود</span>
             </div>
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
            <nav className="flex-1 space-y-3">
              {sidebarLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={idx} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`flex items-center gap-3 font-bold p-4 rounded-2xl transition-all ${
                      isActive ? 'bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20' : 'text-slate-600 hover:bg-[#6D28D9]/10 hover:text-[#6D28D9]'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <Link 
              href="/"
              onClick={() => { localStorage.clear(); sessionStorage.clear(); }}
              className="flex items-center justify-center gap-2 text-slate-600 font-bold p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#6D28D9]/20 hover:bg-[#6D28D9]/10 hover:text-[#6D28D9] shadow-sm transition-all mt-auto"
            >
              <LogOut className="w-5 h-5" />
              خروج
            </Link>
          </div>
        </div>
      )}

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
        {/* Sidebar Header */}
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
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
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

        {/* Sidebar Footer */}
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
