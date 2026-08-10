import { prisma } from "@/lib/prisma";
import { AlertTriangle, Search, Filter } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function AdminMistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; level?: string; stream?: string }>;
}) {
  const params = await searchParams;
  const { subject, level, stream } = params;

  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" }
  });

  const mistakes = await prisma.studentMistake.findMany({
    where: {
      lesson: {
        subject: {
          ...(subject ? { id: subject } : {}),
          ...(level ? { level: level as any } : {}),
          ...(stream ? { stream: stream as any } : {}),
        }
      }
    },
    include: {
      user: true,
      lesson: {
        include: { subject: true }
      },
      quiz: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit for performance in UI
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="أخطاء تلاميذي"
        description="مراقبة وتحليل أخطاء الطلاب في الاختبارات والتمارين اليومية لتوجيههم نحو الحلول الصحيحة"
        icon={AlertTriangle}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden">
        
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <h2 className="text-xl font-black text-slate-900 hidden md:block">سجل الأخطاء الشامل</h2>
          
          <form className="flex flex-wrap gap-3 w-full md:w-auto">
            <select name="subject" defaultValue={subject || ""} className="pr-8 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">كل المواد</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            
            <button type="submit" className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-4 py-2.5 rounded-xl transition-colors">
              <Filter className="w-4 h-4" />
              تصفية
            </button>
          </form>
        </div>

        {mistakes.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">لا توجد أخطاء حالياً</h3>
            <p className="text-slate-500 font-medium">لم يتم تسجيل أي أخطاء تتطابق مع معايير البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-y border-slate-100">
                <tr>
                  <th className="px-6 py-4 rounded-tr-xl">الطالب</th>
                  <th className="px-6 py-4">الدرس والمادة</th>
                  <th className="px-6 py-4">الخطأ المسجل</th>
                  <th className="px-6 py-4 rounded-tl-xl">الحل الصحيح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {mistakes.map((mistake) => (
                  <tr key={mistake.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-sky-700">{mistake.user.fullName}</div>
                      <div className="text-xs text-slate-400 mt-1" dir="ltr" style={{ textAlign: "right" }}>
                        {mistake.user.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-slate-900">{mistake.lesson.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{mistake.lesson.subject.title}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {mistake.createdAt.toLocaleDateString("en-GB")}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-[250px]">
                      <div className="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100 whitespace-pre-wrap">
                        {mistake.mistakeContent}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-[250px]">
                      <div className="bg-sky-50 text-sky-700 p-3 rounded-xl border border-sky-100 whitespace-pre-wrap">
                        {mistake.correctSolution}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
