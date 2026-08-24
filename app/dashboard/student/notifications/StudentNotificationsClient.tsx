"use client";

import { Bell } from "lucide-react";
import { LEVELS, STREAMS } from "@/lib/constants";

type Notification = {
  id: string;
  title: string;
  content: string;
  levels: string[];
  streams: string[];
  subjectIds: string[];
  createdAt: Date;
};

type Subject = {
  id: string;
  title: string;
};

export function StudentNotificationsClient({ 
  notifications,
  subjects 
}: { 
  notifications: Notification[];
  subjects: Subject[];
}) {
  return (
    <div className="space-y-12 font-arabic relative min-h-screen" dir="rtl">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 z-[-1] pointer-events-none opacity-30 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9333ea 1px, transparent 1px),
            linear-gradient(to bottom, #9333ea 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>

      <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <h1 className="text-3xl font-black text-black inline-flex items-center gap-4 bg-purple-200 px-6 py-3 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
          <Bell className="w-8 h-8" />
          إشعاراتي
        </h1>
        <p className="text-lg font-bold text-slate-700 bg-yellow-50 p-4 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-fit mt-4">
          تلقى أحدث التنبيهات و رسائل الأساتذة و ومستجدات المنصة الخاصة بك هنا
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
          <Bell className="w-20 h-20 text-black mx-auto mb-6 opacity-20" />
          <h3 className="font-black text-3xl text-black">لا توجد إشعارات حالياً</h3>
          <p className="font-bold text-slate-600 mt-4 text-xl">ستظهر الإشعارات المهمة من الأساتذة أو الإدارة هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {notifications.map(notification => {
            const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={notification.id} className="bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-black border-2 p-8 flex flex-col relative group transition-transform hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] duration-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-200 border-black border-2 flex items-center justify-center text-black shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-black text-2xl leading-tight">{notification.title}</h3>
                      <p className="text-sm font-bold text-slate-600 mt-2 bg-slate-100 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-fit">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 bg-purple-50 p-5 border-black border-2 text-black text-lg font-bold leading-relaxed shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] flex-1 whitespace-pre-wrap">
                  {notification.content}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-black flex flex-wrap gap-3">
                  {notification.levels.length === 0 && notification.streams.length === 0 && notification.subjectIds.length === 0 && (
                    <span className="bg-purple-600 text-white text-sm font-black px-4 py-2 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      إشعار عام
                    </span>
                  )}
                  {notification.subjectIds.map(sid => (
                    <span key={sid} className="bg-sky-200 text-black text-sm font-black px-4 py-2 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      مادة: {subjects.find(sub => sub.id === sid)?.title || "مجهولة"}
                    </span>
                  ))}
                  {notification.levels.map(l => (
                    <span key={l} className="bg-amber-200 text-black text-sm font-black px-4 py-2 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      مستوى: {LEVELS.find(lvl => lvl.value === l)?.label || l}
                    </span>
                  ))}
                  {notification.streams.map(s => (
                    <span key={s} className="bg-rose-200 text-black text-sm font-black px-4 py-2 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      شعبة: {STREAMS.find(st => st.value === s)?.label || s}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
