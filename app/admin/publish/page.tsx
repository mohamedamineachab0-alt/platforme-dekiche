"use client";

import { UploadCloud, CheckCircle2, ArrowRight, RefreshCw, FileText } from "lucide-react";
import { useState } from "react";

export default function AdminPublishPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">النشر والمزامنة</h2>
          <p className="text-slate-500">مزامنة قاعدة البيانات ونشر التحديثات للمنصة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sync Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-2xl -ml-16 -mt-16 pointer-events-none" />
          
          <div className="w-24 h-24 bg-[#6D28D9]/10 rounded-full flex items-center justify-center mb-6">
            <RefreshCw className={`w-10 h-10 text-[#6D28D9] ${isSyncing ? "animate-spin" : ""}`} />
          </div>
          
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">مزامنة البيانات الحية</h3>
          <p className="text-slate-500 mb-8 max-w-xs">
            قم بمزامنة بيانات الطلاب الجدد وتحديثات قاعدة البيانات مع الخادم الرئيسي (Prisma Sync).
          </p>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full max-w-xs bg-[#6D28D9] text-white font-bold py-4 rounded-2xl hover:bg-[#5b21b6] transition-all shadow-lg shadow-[#6D28D9]/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSyncing ? "جاري المزامنة..." : "بدء المزامنة الآن"}
          </button>
          
          {isSyncing && (
             <p className="mt-4 text-xs font-bold text-[#6D28D9] animate-pulse">يتم تحديث الجداول... يرجى الانتظار.</p>
          )}
        </div>

        {/* Database Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <DatabaseIcon /> إحصائيات الجداول الحالية
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <span className="font-bold text-slate-700">جدول المستخدمين (Users)</span>
                <span className="font-extrabold text-[#6D28D9]">1,250 سجل</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <span className="font-bold text-slate-700">جدول المواد (Subjects)</span>
                <span className="font-extrabold text-[#6D28D9]">14 سجل</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <span className="font-bold text-slate-700">جدول الدروس (Lessons)</span>
                <span className="font-extrabold text-[#6D28D9]">142 سجل</span>
              </div>
            </div>
          </div>

          <div className="bg-[#6D28D9] text-white rounded-3xl shadow-lg p-8 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 relative z-10">
               <UploadCloud className="w-5 h-5" /> نشر المنصة (Production)
            </h3>
            <p className="text-sm text-white/80 mb-6 relative z-10">
              قم بدفع التغييرات إلى بيئة الإنتاج ليراها الطلاب والأساتذة.
            </p>
            <button className="w-full bg-white text-[#6D28D9] font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 relative z-10">
              دفع التحديثات (Push) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  );
}
