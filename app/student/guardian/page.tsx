import { ShieldCheck, Copy, CheckCircle2 } from "lucide-react";

export default function StudentGuardianLinkingPage() {
  const linkingCode = "DEKICHE-PARRENT-8842"; // This would normally be fetched from the DB

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto mt-4 md:mt-12">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-md border border-gray-100 relative overflow-hidden text-center group hover:shadow-xl transition-shadow duration-500">
        
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110 duration-700" />

        <div className="w-24 h-24 bg-[#6D28D9]/10 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 border-4 border-white shadow-sm">
          <ShieldCheck className="w-12 h-12 text-[#6D28D9]" />
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 relative z-10 leading-tight">ربط حساب الولي</h2>
        <p className="text-slate-500 mb-10 leading-relaxed max-w-md mx-auto relative z-10 font-medium text-[15px]">
          أعطِ هذا الكود لولي أمرك أو أدخله في منصة الولي لربط الحساب ومتابعة التقدم الخاص بك بشكل فوري وآمن.
        </p>

        <div className="bg-gray-50/80 rounded-2xl p-8 border border-gray-200 mb-8 relative z-10 shadow-inner">
          <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest bg-white inline-block px-3 py-1 rounded-md border border-gray-100 shadow-sm">كود الربط الخاص بك</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl md:text-3xl font-mono font-black tracking-wider text-[#6D28D9] select-all bg-white px-6 py-3 rounded-xl border border-[#6D28D9]/20 shadow-sm" dir="ltr">
              {linkingCode}
            </span>
          </div>
        </div>

        <button className="w-full bg-[#6D28D9] text-white font-bold py-4 rounded-2xl hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20 flex items-center justify-center gap-3 relative z-10 text-lg hover:-translate-y-0.5">
          <Copy className="w-6 h-6" />
          نسخ الكود
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-green-600 font-bold relative z-10 bg-green-50 px-5 py-2.5 rounded-xl mx-auto w-max border border-green-100 shadow-sm">
           <CheckCircle2 className="w-5 h-5" />
           نظام آمن ومشفر بالكامل
        </div>
      </div>
    </div>
  );
}
