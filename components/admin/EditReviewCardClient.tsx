"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateReviewCard } from "@/actions/review-cards";
import { STREAMS, LEVELS } from "@/lib/constants";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { useRouter } from "next/navigation";

export function EditReviewCardClient({ card, subjects }: { card: any, subjects: any[] }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateReviewCard(card.id, formData);
      if (res?.success) {
        alert("تم الحفظ بنجاح!");
        router.push("/dashboard/admin/review-cards");
      }
    } catch (err: any) {
      alert(err.message || "فشل في حفظ التعديلات");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700">عنوان البطاقة</label>
        <input type="text" name="title" required defaultValue={card.title} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="مثال: تعريف الخلية" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700">السؤال (الوجه الأمامي)</label>
        <textarea name="question" rows={3} required defaultValue={card.question} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" placeholder="اكتب السؤال هنا.." />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-700">الجواب (الوجه الخلفي)</label>
        <textarea name="answer" rows={3} required defaultValue={card.answer} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" placeholder="اكتب الجواب هنا.." />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">المادة الدراسية</label>
            <select name="subjectId" required defaultValue={card.subjectId} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">اختر المادة</option>
              {subjects.map(s => {
                const levelStr = LEVELS.find(l => l.value === s.level)?.label || s.level;
                const streamStr = STREAMS.find(st => st.value === s.stream)?.label || s.stream;
                return (
                  <option key={s.id} value={s.id}>
                    {s.title} ({levelStr} - {streamStr})
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">المستوى</label>
              <select name="level" required defaultValue={card.level} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">اختر المستوى</option>
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">الشعبة</label>
              <select name="stream" required defaultValue={card.stream} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">اختر الشعبة</option>
                {STREAMS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">الشهر</label>
            <MonthSelect name="month" required defaultValue={card.month} className="!p-2.5 !text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">مرجع التمرين (اختياري)</label>
            <input type="text" name="exerciseRef" defaultValue={card.exerciseRef || ""} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="مثال: الوحدة الأولى - تمرين 4" />
          </div>

          <button type="submit" disabled={pending} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]">
            {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {pending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </form>
  );
}
