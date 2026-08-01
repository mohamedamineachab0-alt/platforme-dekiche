"use client";

import { useState } from "react";
import { 
  Megaphone, BellRing, Key, Users, GraduationCap, 
  DollarSign, TrendingUp, Wallet, ShieldCheck, CheckCircle2,
  BookOpen, PlusCircle, LayoutDashboard, Search, FileDown
} from "lucide-react";

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"publishing" | "users" | "financials">("publishing");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleGenerateCode = () => {
    setIsGeneratingCode(true);
    setTimeout(() => {
      setIsGeneratingCode(false);
      setGeneratedCode("BEM-" + Math.random().toString(36).substring(2, 8).toUpperCase());
    }, 1000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12" dir="rtl">
      
      {/* Header & Navigation */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#6D28D9]" /> مركز الإدارة العامة
          </h2>
          <p className="text-slate-500 font-medium">التحكم الكامل في المنصة، المستخدمين، والموارد المالية.</p>
        </div>
        
        {/* Top Tab Navigation */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab("publishing")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold active:scale-95 touch-manipulation transition-all whitespace-nowrap ${activeTab === "publishing" ? 'bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20' : 'text-slate-600 hover:bg-gray-50'}`}
          >
            <Megaphone className="w-5 h-5" /> نشر المحتوى والتنبيهات
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold active:scale-95 touch-manipulation transition-all whitespace-nowrap ${activeTab === "users" ? 'bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20' : 'text-slate-600 hover:bg-gray-50'}`}
          >
            <Users className="w-5 h-5" /> إدارة المستخدمين
          </button>
          <button 
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold active:scale-95 touch-manipulation transition-all whitespace-nowrap ${activeTab === "financials" ? 'bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20' : 'text-slate-600 hover:bg-gray-50'}`}
          >
            <DollarSign className="w-5 h-5" /> المالية والمداخيل
          </button>
        </div>
      </div>

      {/* ----------------- TAB 1: PUBLISHING & BROADCAST ----------------- */}
      {activeTab === "publishing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">
          
          {/* نشر إعلانات (Broadcast Announcements) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-[#6D28D9]" /> نشر إعلانات عامة
            </h3>
            <div className="space-y-4 relative z-10">
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20">
                <option>إلى جميع المستخدمين</option>
                <option>إلى الأساتذة فقط</option>
                <option>إلى الأولياء فقط</option>
              </select>
              <input type="text" placeholder="عنوان الإعلان (مثال: تحديث المنصة)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20" />
              <textarea placeholder="محتوى الإعلان التفصيلي..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 resize-none"></textarea>
              <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-2 shadow-lg">
                 بث الإعلان الآن
              </button>
            </div>
          </div>

          {/* توليد أكواد اشتراك (Generate Subscription Keys) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#6D28D9]/20 relative overflow-hidden bg-gradient-to-br from-white to-[#6D28D9]/5">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Key className="w-6 h-6 text-[#6D28D9]" /> توليد أكواد اشتراك
            </h3>
            <div className="space-y-6 relative z-10">
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                توليد أكواد سريعة لتفعيل حسابات التلاميذ (VIP) بضغطة زر وتوزيعها كنقاط وصول.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20">
                  <option>شهر واحد</option>
                  <option>فصل دراسي</option>
                  <option>سنة كاملة</option>
                </select>
                <select className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20">
                  <option>رابعة متوسط (BEM)</option>
                  <option>ثالثة متوسط</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#6D28D9]/10">
                <button 
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className="flex-1 bg-[#6D28D9] text-white font-bold py-4 rounded-xl hover:bg-[#5b21b6] active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6D28D9]/20"
                >
                  {isGeneratingCode ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "توليد كود تفعيل"}
                </button>
                {generatedCode && (
                  <div className="flex-1 bg-white border-2 border-green-500 rounded-xl px-4 flex items-center justify-center text-green-600 font-extrabold text-xl tracking-widest shadow-sm">
                    {generatedCode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* نشر المواد وإرسال الإشعارات (Publishing & Push) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <BookOpen className="w-6 h-6 text-[#6D28D9]" /> إدارة ونشر المواد
               </h3>
               <button className="w-full bg-gray-50 border-2 border-dashed border-gray-300 text-slate-600 font-bold py-6 rounded-2xl hover:bg-[#6D28D9]/5 hover:border-[#6D28D9]/40 hover:text-[#6D28D9] active:scale-95 touch-manipulation transition-all flex flex-col items-center justify-center gap-3">
                 <PlusCircle className="w-8 h-8" />
                 إضافة مادة أو وحدة جديدة
               </button>
             </div>
             
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <BellRing className="w-6 h-6 text-amber-500" /> إرسال إشعار مباشر (Push)
               </h3>
               <div className="flex items-center gap-4">
                 <input type="text" placeholder="محتوى الإشعار السريع..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                 <button className="bg-amber-500 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-amber-600 active:scale-95 touch-manipulation transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap">
                   إرسال التنبيه
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: USER MANAGEMENT ----------------- */}
      {activeTab === "users" && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#6D28D9]/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-8 h-8 text-[#6D28D9]" />
              </div>
              <div>
                <h3 className="text-slate-500 font-bold mb-1">إجمالي التلاميذ</h3>
                <p className="text-3xl font-extrabold text-slate-800">4,250 <span className="text-sm font-semibold text-green-500 ml-2">نشط</span></p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/10 flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-slate-800" />
              </div>
              <div>
                <h3 className="text-slate-500 font-bold mb-1">هيئة التدريس</h3>
                <p className="text-3xl font-extrabold text-slate-800">12 <span className="text-sm font-semibold text-[#6D28D9] ml-2">أستاذ معتمد</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#6D28D9]" /> قاعدة بيانات المستخدمين
              </h3>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="البحث عن تلميذ أو أستاذ..." className="w-full md:w-80 bg-gray-50 border border-gray-200 rounded-xl pr-12 pl-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20" />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-gray-400 font-bold text-sm">
                    <th className="pb-4 pr-4">الاسم الكامل</th>
                    <th className="pb-4">الدور</th>
                    <th className="pb-4">المستوى / المادة</th>
                    <th className="pb-4">حالة الحساب</th>
                    <th className="pb-4">حساب الولي</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "محمد الأمين", role: "تلميذ", level: "4 متوسط", status: "نشط", parent: "مربوط (معتمد)" },
                    { name: "الأستاذ دقيش علي", role: "أستاذ", level: "الرياضيات", status: "نشط", parent: "-" },
                    { name: "سارة بن علي", role: "تلميذ", level: "3 متوسط", status: "نشط", parent: "غير مربوط" },
                  ].map((user, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pr-4 text-sm font-bold text-slate-800">{user.name}</td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${user.role === 'أستاذ' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-600">{user.level}</td>
                      <td className="py-4">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {user.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`text-xs font-bold ${user.parent === 'غير مربوط' ? 'text-amber-500' : 'text-slate-500'}`}>
                          {user.parent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: FINANCIALS ----------------- */}
      {activeTab === "financials" && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Dashboard */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" /> المداخيل (هذا الشهر)
                </h3>
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg">+12%</span>
              </div>
              <div className="relative z-10">
                <p className="text-5xl font-extrabold tracking-tight mb-2">450,000 <span className="text-2xl font-semibold text-white/60">DZD</span></p>
                <p className="text-sm text-white/60 font-medium">من الاشتراكات والتسجيلات الجديدة للمنصة.</p>
              </div>
              <button className="mt-8 w-full bg-white/10 hover:bg-white/20 active:scale-95 touch-manipulation transition-all py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm relative z-10">
                 <FileDown className="w-4 h-4" /> تحميل الكشف التفصيلي
              </button>
            </div>

            {/* Operational Costs */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-rose-500" /> ميزانية تشغيل المنصة (تكاليف)
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-600">استضافة الخوادم (Vercel/Supabase)</span>
                    <span className="text-rose-600">12,000 DZD</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-600">خدمات الذكاء الاصطناعي (AI API)</span>
                    <span className="text-rose-600">8,500 DZD</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-rose-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-600">بث الفيديو المباشر (Zoom API)</span>
                    <span className="text-rose-600">15,000 DZD</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-rose-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-slate-500">الإجمالي الشهري المقدر</span>
                <span className="text-xl font-extrabold text-slate-800">35,500 DZD</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
