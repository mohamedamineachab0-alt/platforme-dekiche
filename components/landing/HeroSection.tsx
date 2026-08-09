"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft, UserPlus, LogIn, ChevronLeft } from "lucide-react";

export function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="relative pt-32 pb-24 border-b border-slate-200/50 dark:border-slate-800/50">
      
      {/* Purple Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-sky-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-slate-950/30 text-sky-700 dark:text-sky-300 font-bold text-sm mb-8 animate-fade-in-up border border-sky-200 dark:border-sky-800/50 shadow-sm">
          <GraduationCap className="w-5 h-5" />
          <span>الصرح الرقمي الوطني الأضخم في الجزائر</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.2] mb-6 tracking-tight">
          منصة دقيش التعليمية <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">لتلاميذ التعليم الثانوي</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
          المنصة المصممة خصيصا لمرافقة تلاميذ السنة الثانية والثالثة ثانوي لضمان التفوق الساحق وتحقيق معدلات قياسية في شهادة البكالوريا والامتحانات الفصلية
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link 
              href="/dashboard/student" 
              className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-sky-500/20 hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10">الذهاب للوحة التحكم</span>
              <ChevronLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-sky-500/20 hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <UserPlus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">فتح حساب جديد</span>
              </Link>
              <Link 
                href="/login" 
                className="group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-lg transition-all shadow-sm hover:shadow-md hover:border-sky-500 dark:hover:border-sky-600 hover:-translate-y-1"
              >
                <LogIn className="w-6 h-6 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                <span>تسجيل الدخول</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
