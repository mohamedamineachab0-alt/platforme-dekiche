export const dynamic = "force-dynamic";

import { ShieldCheck, CalendarCheck, TrendingUp, AlertCircle, FileText, UserCircle2, Mail, Clock, BarChart3 } from "lucide-react";

export default function GuardianDashboardPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12" dir="rtl">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">لوحة المتابعة الشاملة</h2>
          <p className="text-slate-500 font-medium">مرحباً بك، يمكنك هنا تتبع وتقييم أداء أبنائك الأكاديمي.</p>
        </div>
      </div>

      {/* أقسام أبنائي (My Children Overview) */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6D28D9] to-purple-500 p-1 shadow-lg shadow-[#6D28D9]/20">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <UserCircle2 className="w-10 h-10 text-[#6D28D9]" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">التلميذ: محمد الأمين دقيش</h3>
            <p className="text-sm font-bold text-[#6D28D9] mt-1 bg-[#6D28D9]/10 px-3 py-1 rounded-full inline-block">السنة الرابعة متوسط (BEM)</p>
          </div>
        </div>

        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 flex-1 md:flex-none text-center">
             <div className="text-2xl font-extrabold text-slate-800">16.50</div>
             <div className="text-xs font-bold text-gray-500">المعدل العام</div>
          </div>
          <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 flex-1 md:flex-none text-center">
             <div className="text-2xl font-extrabold text-slate-800">95%</div>
             <div className="text-xs font-bold text-gray-500">نسبة الحضور</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* تقدم أبنائي - رسومات وأعمدة بيانية (Progress Charts) */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <BarChart3 className="w-6 h-6 text-[#6D28D9]" /> تقدم المستوى الأكاديمي
               </h3>
               <select className="bg-gray-50 border border-gray-200 text-sm font-bold text-slate-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 touch-manipulation">
                 <option>الرياضيات</option>
                 <option>الفيزياء</option>
                 <option>العلوم الطبيعية</option>
               </select>
            </div>
            
            {/* CSS Mock Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2 md:gap-4 px-2">
               {[
                 { label: "الأسبوع 1", score: 60 },
                 { label: "الأسبوع 2", score: 75 },
                 { label: "الأسبوع 3", score: 65 },
                 { label: "الأسبوع 4", score: 85 },
                 { label: "الأسبوع 5", score: 95 },
               ].map((data, idx) => (
                 <div key={idx} className="flex flex-col items-center flex-1 group/bar h-full justify-end">
                   <div className="w-full relative flex justify-center h-full items-end group-hover/bar:bg-gray-50 rounded-t-xl transition-colors pb-0">
                      <span className="absolute -top-6 text-xs font-bold text-[#6D28D9] opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {data.score}%
                      </span>
                      <div 
                        className="w-8 md:w-12 bg-[#6D28D9] rounded-t-md shadow-sm transition-all" 
                        style={{ height: `${data.score}%` }} 
                      />
                   </div>
                   <span className="text-xs font-semibold text-gray-400 mt-2">{data.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* غيابات أبنائي (Attendance & Absence Log) */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-orange-500" /> سجل الغيابات والتأخر
            </h3>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold text-sm">
                    <th className="pb-4 pr-2">التاريخ</th>
                    <th className="pb-4">النوع</th>
                    <th className="pb-4">المادة</th>
                    <th className="pb-4">المبرر</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: "15 أكتوبر 2026", type: "غياب", subject: "الرياضيات", justified: false },
                    { date: "02 أكتوبر 2026", type: "تأخر (15 دقيقة)", subject: "الفيزياء", justified: true },
                    { date: "18 سبتمبر 2026", type: "غياب", subject: "العلوم الطبيعية", justified: true },
                  ].map((log, idx) => (
                    <tr key={idx} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pr-2 text-sm font-bold text-slate-700">{log.date}</td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                          log.type.includes('تأخر') ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-gray-600">{log.subject}</td>
                      <td className="py-4">
                        {log.justified ? (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> مبرر
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> بانتظار التبرير
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* بريد الإدارة (Admin Messages Inbox) */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#6D28D9]" /> بريد الإدارة
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#6D28D9]/5 rounded-2xl border border-[#6D28D9]/10 relative">
                <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#6D28D9] animate-pulse" />
                <h4 className="font-bold text-[#6D28D9] mb-1 text-sm">تذكير باجتماع الأولياء</h4>
                <p className="text-xs text-slate-600 leading-relaxed">نعلمكم أن اجتماع أولياء التلاميذ للفصل الأول سيعقد يوم الخميس القادم على الساعة 14:00.</p>
                <span className="text-[10px] font-bold text-gray-400 mt-2 block">منذ ساعتين</span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-slate-700 mb-1 text-sm">جدول الاختبارات التجريبية</h4>
                <p className="text-xs text-slate-500 leading-relaxed">تم نشر جدول الاختبارات التجريبية لشهادة التعليم المتوسط (BEM) في المنصة.</p>
                <span className="text-[10px] font-bold text-gray-400 mt-2 block">أمس</span>
              </div>
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> ملاحظات الأساتذة
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-sm text-amber-800 font-semibold leading-relaxed">
                  هناك تراجع طفيف في إنجاز التمارين اليومية لمادة الفيزياء هذا الأسبوع. نرجو المتابعة.
                </p>
                <span className="text-[10px] font-bold text-amber-600/70 mt-2 block">- أستاذ الفيزياء</span>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#6D28D9] text-white font-bold py-4 rounded-2xl hover:bg-[#5b21b6] active:scale-95 touch-manipulation transition-all shadow-lg shadow-[#6D28D9]/20 flex items-center justify-center gap-2 relative z-10">
             تحميل التقرير الشهري الكلي (PDF)
          </button>

        </div>
      </div>
    </div>
  );
}
