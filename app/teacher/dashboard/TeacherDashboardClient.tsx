"use client";

import { useState } from "react";
import { BarChart3, Users, Mail, Video, Calendar, Clock, BookOpen, Layers, Send, TrendingUp, CheckCircle2 } from "lucide-react";

export default function TeacherDashboardClient() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      setScheduleSuccess(true);
      setTimeout(() => setScheduleSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12" dir="rtl">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">لوحة تحكم الأستاذ</h2>
          <p className="text-slate-500 font-medium">مرحباً بك أستاذ، نظرة عامة على أداء تلاميذك وبرمجة حصصك.</p>
        </div>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6D28D9]/5 rounded-full blur-xl -mr-10 -mt-10" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-3 bg-[#6D28D9]/10 text-[#6D28D9] rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700">إجمالي التلاميذ</h3>
          </div>
          <div className="text-4xl font-extrabold text-slate-800 mb-2 relative z-10">1,204</div>
          <p className="text-sm font-semibold text-gray-500 relative z-10">في جميع الأفواج</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl -mr-10 -mt-10" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700">متوسط الحضور</h3>
          </div>
          <div className="text-4xl font-extrabold text-slate-800 mb-2 relative z-10">92%</div>
          <p className="text-sm font-semibold text-gray-500 relative z-10">معدل ممتاز هذا الشهر</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-10 -mt-10" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700">الدروس المنشورة</h3>
          </div>
          <div className="text-4xl font-extrabold text-slate-800 mb-2 relative z-10">42</div>
          <p className="text-sm font-semibold text-gray-500 relative z-10">دروس وتمارين تفاعلية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* فضاء تلاميذه (Students Analytics & Progress) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <BarChart3 className="w-6 h-6 text-[#6D28D9]" /> تقدم الأفواج الأكاديمي
               </h3>
               <select className="bg-gray-50 border border-gray-200 text-sm font-bold text-slate-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 touch-manipulation">
                 <option>الرياضيات - رابعة متوسط</option>
                 <option>الفيزياء - رابعة متوسط</option>
               </select>
            </div>
            
            {/* CSS Mock Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-2 md:gap-6 px-2 md:px-8 relative z-10">
               {[
                 { label: "الفوج أ", score: 85 },
                 { label: "الفوج ب", score: 72 },
                 { label: "الفوج ج", score: 91 },
                 { label: "الفوج د", score: 64 },
                 { label: "الفوج هـ", score: 88 },
               ].map((data, idx) => (
                 <div key={idx} className="flex flex-col items-center flex-1 group/bar h-full">
                   <div className="w-full relative flex justify-center h-full items-end group-hover/bar:bg-gray-50 rounded-t-xl transition-colors pb-2">
                      <span className="absolute -top-8 text-xs font-bold text-[#6D28D9] opacity-0 group-hover/bar:opacity-100 transition-opacity bg-[#6D28D9]/10 px-2 py-1 rounded-md">
                        {data.score}%
                      </span>
                      <div 
                        className="w-10 md:w-16 bg-gradient-to-t from-[#6D28D9] to-purple-400 rounded-lg shadow-sm group-hover/bar:brightness-110 transition-all touch-manipulation cursor-pointer" 
                        style={{ height: `${data.score}%` }} 
                      />
                   </div>
                   <span className="text-sm font-bold text-slate-600 mt-3">{data.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* برمجة حصة زوم / مباشر (Live Zoom Class Scheduler) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />
            
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
              <Video className="w-6 h-6 text-[#6D28D9]" /> برمجة حصة زوم / بث مباشر
            </h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الحصة (Title)</label>
                  <input type="text" required placeholder="مثال: مراجعة شاملة للقسمة الإقليدية..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all touch-manipulation" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#6D28D9]"/> اليوم (Date)</label>
                  <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all touch-manipulation" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#6D28D9]"/> التوقيت (Time)</label>
                  <input type="time" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all touch-manipulation" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Layers className="w-4 h-4 text-[#6D28D9]"/> الشعبة (Stream)</label>
                  <select required defaultValue="" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all appearance-none touch-manipulation">
                    <option value="" disabled>اختر الشعبة...</option>
                    <option>جذع مشترك علوم وتكنولوجيا</option>
                    <option>التعليم المتوسط (عام)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Users className="w-4 h-4 text-[#6D28D9]"/> المستوى (Level)</label>
                  <select required defaultValue="" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all appearance-none touch-manipulation">
                    <option value="" disabled>اختر المستوى...</option>
                    <option>الرابعة متوسط (BEM)</option>
                    <option>الثالثة متوسط</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-[#6D28D9]"/> المادة (Subject)</label>
                  <select required defaultValue="" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all appearance-none touch-manipulation">
                    <option value="" disabled>اختر المادة...</option>
                    <option>الرياضيات</option>
                    <option>الفيزياء</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isScheduling}
                  className={`w-full text-white font-bold py-4 rounded-xl active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-2 ${
                    scheduleSuccess 
                      ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" 
                      : "bg-[#6D28D9] hover:bg-[#5b21b6] shadow-lg shadow-[#6D28D9]/20"
                  }`}
                >
                  {isScheduling ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : scheduleSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> تم جدولة الحصة وإرسال الإشعار بنجاح!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> جدولة وبث إشعار للتلاميذ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* بريد الإدارة (Admin Messages Inbox) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
              <Mail className="w-6 h-6 text-[#6D28D9]" /> بريد الإدارة المركزي
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-[#6D28D9]/5 rounded-2xl border border-[#6D28D9]/20 relative active:scale-95 touch-manipulation hover:bg-[#6D28D9]/10 transition-all cursor-pointer">
                <span className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-[#6D28D9] animate-pulse" />
                <h4 className="font-bold text-[#6D28D9] mb-1.5 text-sm">تأكيد مواعيد الامتحانات</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">الأساتذة الكرام، يرجى إرسال مواضيع الاختبارات التجريبية قبل نهاية الأسبوع عبر المنصة ليتم برمجتها.</p>
                <span className="text-[10px] font-bold text-gray-400 mt-3 block">اليوم • الإدارة العامة</span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 active:scale-95 touch-manipulation transition-all cursor-pointer">
                <h4 className="font-bold text-slate-700 mb-1.5 text-sm">تحديث نظام الحضور</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">تم تفعيل ميزة التنبيه التلقائي للأولياء في حال تجاوز غياب التلميذ حصتين متتاليتين.</p>
                <span className="text-[10px] font-bold text-gray-400 mt-3 block">أمس • الدعم التقني</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 active:scale-95 touch-manipulation transition-all cursor-pointer">
                <h4 className="font-bold text-slate-700 mb-1.5 text-sm">اجتماع الأساتذة الشهري</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">نعلمكم أن الاجتماع التنسيقي الشهري سيعقد يوم السبت القادم لمناقشة تقدم البرنامج.</p>
                <span className="text-[10px] font-bold text-gray-400 mt-3 block">منذ 3 أيام • الإدارة العامة</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 font-bold text-[#6D28D9] bg-white border-2 border-[#6D28D9]/20 rounded-xl hover:bg-[#6D28D9]/5 active:scale-95 touch-manipulation transition-all text-sm relative z-10">
              عرض كل الرسائل
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
