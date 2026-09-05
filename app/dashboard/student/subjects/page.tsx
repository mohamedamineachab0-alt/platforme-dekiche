import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redeemAccessCode } from "@/actions/subjects";
import { Key, Unlock, Lock, PlayCircle, BookOpen, GraduationCap, Sparkles, CreditCard } from "lucide-react";
import { LEVELS, STREAMS } from "@/lib/constants";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentSubjectsPage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { studentProfile: true, enrollments: true },
  });

  if (!user || !user.studentProfile) {
    redirect("/login");
  }

  const { level, stream } = user.studentProfile;
  const levelLabel = LEVELS.find(l => l.value === level)?.label || level;
  const streamLabel = STREAMS.find(s => s.value === stream)?.label || stream;

  // Find subjects strictly for this level and stream
  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      AND: [
        {
          OR: [
            { level },
            { levels: { has: level } }
          ]
        },
        {
          OR: [
            { stream },
            { stream: "ALL" },
            { stream: "COMMON_TRUNK" },
            { streams: { has: stream } },
            { streams: { has: "ALL" as any } }
          ]
        }
      ]
    },
    include: { teacher: true },
    orderBy: { createdAt: "desc" }
  });

  const enrollments = user.enrollments;
  const enrolledSubjectIds = new Set(enrollments.map(e => e.subjectId));

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 px-2 sm:px-4" dir="rtl">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">موادي الدراسية</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl">
                تصفح الدروس والتمارين الخاصة بالمواد المقررة لشعبتك مع إمكانية الدخول للدروس وتفعيل الاشتراكات.
              </p>
            </div>
          </div>

          {/* Academic Info & Quick Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-sky-50 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 rounded-2xl p-4 shrink-0 flex flex-col gap-1 min-w-[200px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <GraduationCap className="w-4 h-4 text-sky-500" />
                <span>المستوى والشعبة</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{levelLabel}</p>
              <p className="text-xs font-bold text-sky-600 dark:text-sky-400">{streamLabel}</p>
            </div>

            <Link
              href="/dashboard/student/subscription-request"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-all shadow-md shadow-orange-500/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>طلب بطاقة اشتراك</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map(subject => {
          const enrollment = enrollments.find(e => e.subjectId === subject.id);
          const isExpired = enrollment?.validUntil ? enrollment.validUntil < new Date() : false;
          const isEnrolled = enrolledSubjectIds.has(subject.id) && !isExpired;
          const isFree = !subject.price || subject.price === 0;

          return (
            <div
              key={subject.id}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col group transition-all hover:shadow-md hover:border-sky-300 dark:hover:border-slate-700"
            >
              {/* Subject Cover Image */}
              <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {subject.image ? (
                  <img
                    src={subject.image}
                    alt={subject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-12 h-12 opacity-40" />
                  </div>
                )}
                
                {/* Status Badge Over Image */}
                <div className="absolute top-3 left-3">
                  {isEnrolled ? (
                    <span className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                      <Unlock className="w-3 h-3" /> مفعّلة
                    </span>
                  ) : isFree ? (
                    <span className="bg-sky-500/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                      <PlayCircle className="w-3 h-3" /> مجانية
                    </span>
                  ) : isExpired ? (
                    <span className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                      <Lock className="w-3 h-3" /> منتهية الصلاحية
                    </span>
                  ) : (
                    <span className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                      <Lock className="w-3 h-3 text-amber-400" /> مغلقة
                    </span>
                  )}
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {subject.title}
                  </h3>
                  {subject.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {subject.description}
                    </p>
                  )}
                  {subject.teacherName && (
                    <div className="pt-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg inline-block">
                        الأستاذ: {subject.teacherName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {isEnrolled || isFree ? (
                    <Link 
                      href={`/dashboard/student/subjects/${subject.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-sky-500/20"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>الدخول للمادة</span>
                    </Link>
                  ) : (
                    <form action={redeemAccessCode} className="space-y-2.5">
                      <input type="hidden" name="subjectId" value={subject.id} />
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Key className="w-4 h-4" />
                        </span>
                        <input 
                          type="text" 
                          name="code" 
                          placeholder="أدخل كود الاشتراك" 
                          required
                          className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>تفعيل المادة</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">لا توجد مواد منشورة حالياً</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-md mx-auto">
              لم يتم العثور على مواد منشورة متوافقة مع شعبتك ({streamLabel}) ومستواك الدراسي ({levelLabel}). يرجى التحقق لاحقاً.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
