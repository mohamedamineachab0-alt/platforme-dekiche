"use client";

import { useState } from "react";
import { Send, Bell, Trash2, Loader2, CheckCircle2 } from "lucide-react";
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
      setSelectedLevels([]);
      setSelectedStreams([]);
      setSelectedSubjects([]);
      (e.target as HTMLFormElement).reset();
    }
    setPending(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-arabic" dir="rtl">
      {/* Creation Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800">إرسال إشعار جديد</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">عنوان الإشعار</label>
              <input 
                type="text" 
                name="title" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-700" 
                placeholder="مثال: إضافة ملخص جديد" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">نص الإشعار</label>
              <textarea 
                name="content" 
                rows={4} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none text-slate-700" 
                placeholder="اكتب رسالتك هنا.." 
              />
            </div>

            <div className="pt-5 border-t border-slate-100 space-y-4">
              <span className="text-sm font-bold text-slate-600">
                تحديد الفئة المستهدفة (خياري)
              </span>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">المواد المستهدفة</label>
                  <div className="max-h-48 overflow-y-auto">
                    <NeoMultiSelect
                      name="subjectIds"
                      options={subjectOptions}
                      selectedValues={selectedSubjects}
                      onChange={setSelectedSubjects}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">المستويات المستهدفة</label>
                  <NeoMultiSelect
                    name="levels"
                    options={levelOptions}
                    selectedValues={selectedLevels}
                    onChange={setSelectedLevels}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">الشعب المستهدفة</label>
                  <NeoMultiSelect
                    name="streams"
                    options={streamOptions}
                    selectedValues={selectedStreams}
                    onChange={setSelectedStreams}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl transition-colors mt-2"
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
              <div key={notification.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col relative group transition-colors hover:border-slate-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{notification.title}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <form action={async () => { await deleteNotification(notification.id); }}>
                    <button type="submit" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="حذف الإشعار">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                <div className="mt-2 bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-700 text-sm font-bold leading-relaxed whitespace-pre-wrap">
                  {notification.content}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {notification.levels.length === 0 && notification.streams.length === 0 && notification.subjectIds.length === 0 && (
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                      إشعار عام للجميع
                    </span>
                  )}
                  {notification.levels.map(l => (
                    <span key={l} className="bg-sky-50 text-sky-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-sky-100">
                      مستوى: {LEVELS.find(lvl => lvl.value === l)?.label || l}
                    </span>
                  ))}
                  {notification.streams.map(s => (
                    <span key={s} className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-100">
                      شعبة: {STREAMS.find(st => st.value === s)?.label || s}
                    </span>
                  ))}
                  {notification.subjectIds.map(sid => (
                    <span key={sid} className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100">
                      مادة: {subjects.find(sub => sub.id === sid)?.title || "مجهولة"}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
          {notifications.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
              <span className="font-bold text-slate-400 text-lg">لا توجد إشعارات مرسلة بعد</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
