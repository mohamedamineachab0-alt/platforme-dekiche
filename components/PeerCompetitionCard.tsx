"use client";

import { Copy, Trophy, Swords, Check } from "lucide-react";
import { useState } from "react";

export default function PeerCompetitionCard() {
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const studentCode = "AMINE-26";

  const handleCopy = () => {
    navigator.clipboard.writeText(studentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-200" dir="rtl">
      {/* Graph Notebook Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-60 z-0 pointer-events-none"></div>

      <div className="relative z-10 p-6 md:p-8 flex flex-col gap-8">
        
        {/* Section 1: Code & Invitation */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Swords className="w-6 h-6 text-[#6D28D9]" />
            <h2 className="text-xl font-bold text-slate-800">تحدي الأصدقاء</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Code */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">كود التحدي الخاص بك</p>
                <p className="text-lg font-black text-[#6D28D9] tracking-wider font-mono" dir="ltr">{studentCode}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="p-2.5 rounded-lg bg-white border border-gray-200 text-slate-600 hover:text-[#6D28D9] hover:bg-purple-50 transition-colors shadow-sm"
                title="نسخ الكود"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Invite Friend */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input 
                type="text" 
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="أدخل كود صديقك للمنافسة..."
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:border-[#6D28D9] shadow-sm font-medium text-slate-700"
              />
              <button className="px-6 py-3 bg-[#6D28D9] text-white font-bold rounded-xl shadow-sm hover:bg-[#5b21b6] transition-colors active:scale-95 whitespace-nowrap">
                ابدأ التحدي
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Section 2: Competition Status */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-slate-800">المنافسة الجارية</h3>
          </div>

          <div className="flex flex-col gap-6">
            {/* Student 1 (Me) */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-700">محمد أمين <span className="text-xs font-semibold text-[#6D28D9] bg-[#6D28D9]/10 px-2 py-0.5 rounded-md mr-2">أنت</span></span>
                <span className="font-extrabold text-[#6D28D9] text-lg">1250 <span className="text-xs text-gray-500 font-semibold">نقطة</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3.5 shadow-inner border border-gray-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-[#6D28D9] to-[#8b5cf6] rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Student 2 (Peer) */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-600">علي أحمد</span>
                <span className="font-extrabold text-orange-500 text-lg">1100 <span className="text-xs text-gray-500 font-semibold">نقطة</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3.5 shadow-inner border border-gray-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-orange-500 to-orange-400 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
