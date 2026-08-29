import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Library, Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { createReviewCard } from "@/actions/review-cards";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MonthSelect } from "@/components/shared/MonthSelect";

export default async function AdminReviewCardsPage() {
  const cards = await prisma.reviewCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true }
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, level: true, stream: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="بطاقات المراجعة (Flashcards)"
        description="أنشئ بطاقات مراجعة سريعة تفاعلية لمساعدة التلاميذ على تذكر المعلومات الأساسية"
        icon={Library}
        gradientClass="bg-gradient-to-r from-slate-900 to-fuchsia-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-600" />
              إضافة بطاقة جديدة
            </h2>
            
            <form action={async (formData) => { "use server"; await createReviewCard(formData); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">عنوان البطاقة</label>
                <input type="text" name="title" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="مثال: تعريف الخلية" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">السؤال (الوجه الأمامي)</label>
                <textarea name="question" rows={3} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" placeholder="اكتب السؤال هنا.." />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">الجواب (الوجه الخلفي)</label>
                <textarea name="answer" rows={3} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" placeholder="اكتب الجواب هنا.." />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">المادة الدراسية</label>
                    <select name="subjectId" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
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
                      <select name="level" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="">اختر المستوى</option>
                        {LEVELS.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">الشعبة</label>
                      <select name="stream" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="">اختر الشعبة</option>
                        {STREAMS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">الشهر</label>
                    <MonthSelect name="month" required className="!p-2.5 !text-sm" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">مرجع التمرين (اختياري)</label>
                    <input type="text" name="exerciseRef" className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="مثال: الوحدة الأولى - تمرين 4" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black font-bold py-3 rounded-xl transition-colors mt-2">
                <Plus className="w-4 h-4" />
                إضافة البطاقة
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map(card => {
              const levelStr = LEVELS.find(l => l.value === card.level)?.label;
              const streamStr = STREAMS.find(s => s.value === card.stream)?.label;

              return (
                <div key={card.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-slate-950 text-lg">{card.title}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Link href={`/dashboard/admin/review-cards/${card.id}/edit`} className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await prisma.reviewCard.delete({ where: { id: card.id } });
                      }}>
                        <button type="submit" className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-2 flex-1">
                    <div>
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider mb-1 block">السؤال</span>
                      <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{card.question}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-sky-500 uppercase tracking-wider mb-1 block">الجواب</span>
                      <p className="text-sm font-medium text-sky-900 bg-sky-50 p-3 rounded-xl border border-sky-100">{card.answer}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                    <span className="bg-sky-50 text-sky-700 text-[10px] font-black px-2 py-1 rounded-md">
                      {card.subject.title}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                      {levelStr} • {streamStr}
                    </span>
                    {card.exerciseRef && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        {card.exerciseRef}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {cards.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                لا توجد بطاقات مراجعة مسجلة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
