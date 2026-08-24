"use client";

import { useState } from "react";
import { Send, Bell, Trash2, Loader2 } from "lucide-react";
import { NeoMultiSelect } from "@/components/shared/NeoMultiSelect";
import { LEVELS, STREAMS } from "@/lib/constants";
import { createNotification, deleteNotification } from "@/actions/notifications";

type Subject = {
  id: string;
  title: string;
  level: string;
  stream: string;
};

type Notification = {
  id: string;
  title: string;
  content: string;
  levels: string[];
  streams: string[];
  subjectIds: string[];
  createdAt: Date;
};

export function SendNotificationClient({ 
  subjects, 
  notifications 
}: { 
  subjects: Subject[]; 
  notifications: Notification[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const subjectOptions = subjects.map(s => {
    const levelStr = LEVELS.find(l => l.value === s.level)?.label || s.level;
    const streamStr = STREAMS.find(st => st.value === s.stream)?.label || s.stream;
    return {
      value: s.id,
      label: s.title,
      subLabel: `${levelStr} - ${streamStr}`
    };
  });

  const levelOptions = LEVELS.map(l => ({ value: l.value, label: l.label }));
  const streamOptions = STREAMS.map(s => ({ value: s.value, label: s.label }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createNotification(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Reset selections on success
      setSelectedLevels([]);
      setSelectedStreams([]);
      setSelectedSubjects([]);
      (e.target as HTMLFormElement).reset();
    }
    setPending(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-arabic bg-slate-50 min-h-screen p-4 md:p-8 rounded-3xl" dir="rtl">
      {/* Creation Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Send className="w-5 h-5" />
            </div>
            إرسال إشعار جديد
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 font-medium p-4 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">عنوان الإشعار</label>
              <input 
                type="text" 
                name="title" 
                required 
                className="w-full p-4 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow border-none" 
                placeholder="مثال: إضافة ملخص جديد" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">نص الإشعار</label>
              <textarea 
                name="content" 
                rows={4} 
                required 
                className="w-full p-4 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow resize-none border-none" 
                placeholder="اكتب رسالتك هنا.." 
              />
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-5">
              <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full">
                تحديد الفئة المستهدفة
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block">المواد المستهدفة</label>
                  <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                    <NeoMultiSelect
                      name="subjectIds"
                      options={subjectOptions}
                      selectedValues={selectedSubjects}
                      onChange={setSelectedSubjects}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full inline-block">المستويات المستهدفة</label>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <NeoMultiSelect
                      name="levels"
                      options={levelOptions}
                      selectedValues={selectedLevels}
                      onChange={setSelectedLevels}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full inline-block">الشعب المستهدفة</label>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <NeoMultiSelect
                      name="streams"
                      options={streamOptions}
                      selectedValues={selectedStreams}
                      onChange={setSelectedStreams}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-base py-4 rounded-xl transition-colors mt-2"
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {pending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-4">
          {notifications.map(notification => {
            const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={notification.id} className="bg-white shadow-sm rounded-3xl p-6 flex flex-col relative group transition-all hover:shadow-md border border-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{notification.title}</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <form action={async () => { await deleteNotification(notification.id); }}>
                    <button type="submit" className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="حذف الإشعار">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                <div className="mt-2 bg-slate-50 p-4 rounded-xl text-slate-600 text-sm font-medium leading-relaxed">
                  {notification.content}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {notification.levels.length === 0 && notification.streams.length === 0 && notification.subjectIds.length === 0 && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      الجميع (عام)
                    </span>
                  )}
                  {notification.levels.map(l => (
                    <span key={l} className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      مستوى: {LEVELS.find(lvl => lvl.value === l)?.label || l}
                    </span>
                  ))}
                  {notification.streams.map(s => (
                    <span key={s} className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      شعبة: {STREAMS.find(st => st.value === s)?.label || s}
                    </span>
                  ))}
                  {notification.subjectIds.map(sid => (
                    <span key={sid} className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      مادة: {subjects.find(sub => sub.id === sid)?.title || "مجهولة"}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
          {notifications.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl shadow-sm border border-slate-50">
              <span className="font-semibold text-slate-400 text-lg">لا توجد إشعارات مرسلة بعد</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
