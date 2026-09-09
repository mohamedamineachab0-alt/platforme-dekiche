import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redirect } from "next/navigation";
import { 
  ChevronLeft, 
  Library, 
  CheckCircle2, 
  FileText, 
  BrainCircuit, 
  AlertCircle, 
  Video, 
  Award,
  Play
} from "lucide-react";
import Link from "next/link";

export default async function SubjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  // Fetch subject and enrollment first to get enrolledMonths
  const subject = await prisma.subject.findUnique({
    where: { id }
  });

  if (!subject) redirect("/dashboard/student/subjects");

  const allLessons = await prisma.lesson.findMany({
    where: { subjectId: id },
    include: { materials: true, quiz: true, subject: true },
    orderBy: { createdAt: "asc" }
  });

  let enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionUser.id,
        subjectId: id,
      }
    }
  });

  if (!enrollment) {
    if (subject.price === 0 || subject.price === null) {
      // Auto-enroll in free subject with all months unlocked
      enrollment = await prisma.enrollment.create({
        data: {
          studentId: sessionUser.id,
          subjectId: id,
          enrolledMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }
      });
    } else {
      redirect("/dashboard/student/subjects");
    }
  }

  if (enrollment.validUntil && enrollment.validUntil < new Date()) {
    // Access has expired
    redirect("/dashboard/student/subjects");
  }

  const enrolledMonths = enrollment.enrolledMonths;

  // Concurrent fetching of all categories using Promise.all
  // Strictly filtering by published status implicitly via enrolledMonths
  const [
    reviewCards,
    dailyExercises,
    exams,
    liveClasses,
    mistakes
  ] = await Promise.all([
    prisma.reviewCard.findMany({ 
      where: { subjectId: id, month: { in: enrolledMonths } }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.dailyExercise.findMany({ 
      where: { 
        OR: [{ subjectId: id }, { secondarySubjectId: id }], 
        month: { in: enrolledMonths } 
      }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.exam.findMany({ 
      where: { 
        OR: [{ subjectId: id }, { secondarySubjectId: id }], 
        month: { in: enrolledMonths } 
      }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.liveClass.findMany({ 
      where: { subjectId: id, month: { in: enrolledMonths } }, 
      orderBy: { date: 'asc' } 
    }),
    prisma.studentMistake.findMany({ 
      where: { 
        studentId: sessionUser.id, 
        lesson: { subjectId: id, month: { in: enrolledMonths } } 
      } 
    }),
  ]);

  const student = await prisma.user.findUnique({ 
    where: { id: sessionUser.id },
    include: { studentProfile: true }
  });

  // Lessons filtered by enrolled months, publish status, stream and level
  const accessibleLessons = allLessons.filter(l => {
    const isEnrolledInMonth = enrolledMonths.includes(l.month);
    const isPublished = (l as any).isPublished !== false;
    const studentLevel = student?.studentProfile?.level;
    const studentStream = student?.studentProfile?.stream;
    
    const matchesLevel = (l as any).levels.length === 0 || (studentLevel && (l as any).levels.includes(studentLevel));
    const matchesStream = (l as any).streams.length === 0 || (studentStream && (l as any).streams.includes(studentStream));
    
    return isEnrolledInMonth && isPublished && matchesLevel && matchesStream;
  });

  return (
    <div className="font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        


        {/* Lessons Section (Full Width) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                الدروس المسجلة
              </h2>
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-sky-100">
                <CheckCircle2 className="w-4 h-4" /> {accessibleLessons.length}
              </span>
            </div>
            {accessibleLessons.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {accessibleLessons.map((lesson) => {
                    const hasFiles =
                      lesson.materials && lesson.materials.some((m) => !!m.fileUrl);
                    const hasQuiz =
                      !!lesson.quiz &&
                      Array.isArray(lesson.quiz.questions) &&
                      (lesson.quiz.questions as any[]).length > 0 &&
                      (lesson.quiz.questions as any[]).some(
                        (q: any) => q && q.question && q.question.trim().length > 0
                      );
                    const qCount = hasQuiz ? (lesson.quiz!.questions as any[]).length : 0;

                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-md transition-all group"
                      >
                        <div className="flex gap-3.5 items-start">
                          <Link
                            href={`/dashboard/student/lessons/${lesson.id}`}
                            className="w-32 sm:w-36 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 relative shadow-sm group-hover:shadow transition-all border border-slate-100 dark:border-slate-800 block"
                          >
                            {lesson.image ? (
                              <img
                                src={lesson.image}
                                alt={lesson.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Play className="w-6 h-6 opacity-50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-white" /> درس
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/dashboard/student/lessons/${lesson.id}`}
                              className="font-bold text-slate-800 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 line-clamp-2 text-sm leading-snug block"
                            >
                              {lesson.title}
                            </Link>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {hasFiles && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                                  <FileText className="w-3 h-3" />
                                  وثيقة مرفقة
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-bold">
                                الشهر {lesson.month}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions: Video & Quiz */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <Link
                            href={`/dashboard/student/lessons/${lesson.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>مشاهدة الفيديو</span>
                          </Link>

                          {hasQuiz ? (
                            <Link
                              href={`/dashboard/student/lessons/${lesson.id}/quiz`}
                              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all hover:scale-105 shadow-xs"
                            >
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              <span>حل الكويز ({qCount})</span>
                            </Link>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">
                              {hasFiles ? "الكويز قيد الإعداد" : "درس نظري"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">لا توجد دروس متاحة حالياً</p>
            )}
          </div>
        {/* Dashboard Grid (Other Sections) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Review Cards (بطاقات المراجعة) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Library className="w-5 h-5" />
                </div>
                بطاقات المراجعة
              </h2>
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-sky-100">
                <CheckCircle2 className="w-4 h-4" /> {reviewCards.length}
              </span>
            </div>
            {reviewCards.length > 0 ? (
              <Link href={`/dashboard/student/review-cards`} className="block bg-sky-600 text-white text-center p-4 rounded-2xl hover:bg-sky-700 transition-colors font-bold shadow-md shadow-amber-500/20">
                تصفح البطاقات
              </Link>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد بطاقات متاحة حالياً</p>
            )}
          </div>

          {/* Daily Exercises (التمارين اليومية) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                التمارين اليومية
              </h2>
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-sky-100">
                <CheckCircle2 className="w-4 h-4" /> {dailyExercises.length}
              </span>
            </div>
            {dailyExercises.length > 0 ? (
              <div className="space-y-3">
                {dailyExercises.slice(0, 3).map(ex => (
                  <Link key={ex.id} href={`/dashboard/student/exercises`} className="block bg-slate-50 p-4 rounded-2xl hover:bg-sky-50 hover:text-sky-700 transition-colors border border-slate-100 font-bold text-slate-700 truncate">
                    {ex.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد تمارين متاحة حالياً</p>
            )}
          </div>

          {/* Exams & Assignments (الاختبارات والفروض) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                الاختبارات والفروض
              </h2>
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-sky-100">
                <CheckCircle2 className="w-4 h-4" /> {exams.length}
              </span>
            </div>
            {exams.length > 0 ? (
              <div className="space-y-3">
                {exams.slice(0, 3).map(exam => (
                  <Link key={exam.id} href={`/dashboard/student/exams`} className="block bg-slate-50 p-4 rounded-2xl hover:bg-sky-50 hover:text-sky-700 transition-colors border border-slate-100 font-bold text-slate-700 truncate">
                    {exam.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد اختبارات متاحة حالياً</p>
            )}
          </div>

          {/* My Mistakes (أخطائي) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                أخطائي
              </h2>
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-sky-100">
                <CheckCircle2 className="w-4 h-4" /> {mistakes.length}
              </span>
            </div>
            {mistakes.length > 0 ? (
              <Link href={`/dashboard/student/mistakes`} className="block bg-sky-50 text-sky-700 text-center p-4 rounded-2xl hover:bg-sky-100 transition-colors font-bold border border-sky-200">
                مراجعة الأخطاء
              </Link>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لم تقم بأي أخطاء في الكويزات بعد!</p>
            )}
          </div>

          {/* Live Sessions (الحصص المباشرة) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                الحصص المباشرة
              </h2>
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-sky-100">
                <CheckCircle2 className="w-4 h-4" /> {liveClasses.length}
              </span>
            </div>
            {liveClasses.length > 0 ? (
              <div className="space-y-3">
                {liveClasses.slice(0, 3).map(live => (
                  <Link key={live.id} href={`/dashboard/student/live-classes`} className="block bg-slate-50 p-4 rounded-2xl hover:bg-sky-50 hover:text-sky-700 transition-colors border border-slate-100 font-bold text-slate-700 truncate">
                    {live.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد حصص مباشرة مجدولة</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
