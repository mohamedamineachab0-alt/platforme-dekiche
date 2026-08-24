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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-arabic" dir="rtl">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-30 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9333ea 1px, transparent 1px),
            linear-gradient(to bottom, #9333ea 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>

      {/* Creation Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-black border-2 p-6 sticky top-6">
          <h2 className="text-xl font-black text-black mb-6 flex items-center gap-2 bg-purple-200 px-3 py-1 border-black border-2 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Send className="w-5 h-5" />
            إرسال إشعار جديد
          </h2>
          
          {error && (
            <div className="mb-4 bg-red-200 text-black font-bold p-3 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-wider">عنوان الإشعار</label>
              <input 
                type="text" 
                name="title" 
                required 
                className="w-full p-3 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-yellow-50" 
                placeholder="مثال: إضافة ملخص جديد" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-wider">نص الإشعار</label>
              <textarea 
                name="content" 
                rows={4} 
                required 
                className="w-full p-3 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white resize-none" 
                placeholder="اكتب رسالتك هنا.." 
              />
            </div>

            <div className="pt-6 border-t-2 border-black space-y-6">
              <p className="text-sm font-bold text-slate-700 bg-slate-100 p-2 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                تحديد الفئة المستهدفة (اتركها فارغة للإرسال للجميع)
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-black uppercase bg-emerald-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">المواد المستهدفة</label>
                  <div className="max-h-48 overflow-y-auto p-2 border-black border-2 bg-slate-50">
                    <NeoMultiSelect
                      name="subjectIds"
                      options={subjectOptions}
                      selectedValues={selectedSubjects}
                      onChange={setSelectedSubjects}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-black uppercase bg-sky-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">المستويات المستهدفة</label>
                  <NeoMultiSelect
                    name="levels"
                    options={levelOptions}
                    selectedValues={selectedLevels}
                    onChange={setSelectedLevels}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-black uppercase bg-amber-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">الشعب المستهدفة</label>
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
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-black text-lg py-4 border-black border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all mt-4 uppercase tracking-widest"
            >
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {pending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-6">
          {notifications.map(notification => {
            const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={notification.id} className="bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-black border-2 p-6 flex flex-col relative group transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-200 border-black border-2 flex items-center justify-center text-black shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Bell className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-black text-xl">{notification.title}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-1">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <form action={async () => { await deleteNotification(notification.id); }}>
                    <button type="submit" className="p-2 bg-red-400 text-black border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform" title="حذف الإشعار">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                <div className="mt-4 bg-yellow-50 p-4 border-black border-2 text-black text-sm font-bold leading-relaxed shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                  {notification.content}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-black flex flex-wrap gap-2">
                  {notification.levels.length === 0 && notification.streams.length === 0 && notification.subjectIds.length === 0 && (
                    <span className="bg-purple-600 text-white text-xs font-black px-3 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      الجميع (عام)
                    </span>
                  )}
                  {notification.levels.map(l => (
                    <span key={l} className="bg-sky-200 text-black text-xs font-black px-3 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      مستوى: {LEVELS.find(lvl => lvl.value === l)?.label || l}
                    </span>
                  ))}
                  {notification.streams.map(s => (
                    <span key={s} className="bg-amber-200 text-black text-xs font-black px-3 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      شعبة: {STREAMS.find(st => st.value === s)?.label || s}
                    </span>
                  ))}
                  {notification.subjectIds.map(sid => (
                    <span key={sid} className="bg-emerald-200 text-black text-xs font-black px-3 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      مادة: {subjects.find(sub => sub.id === sid)?.title || "مجهولة"}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
          {notifications.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-50 border-black border-2 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
              <span className="font-black text-slate-500 text-xl">لا توجد إشعارات مرسلة بعد</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
