import { prisma } from "@/lib/prisma";
import { Video, FileText, Download, CheckCircle2, AlertTriangle, Layers, BookOpen } from "lucide-react";
import { createLesson, updateLesson, deleteLesson } from "@/actions/lessons";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SubjectFilterForm } from "@/components/admin/SubjectFilterForm";
import { PublishLessonClient } from "@/components/admin/PublishLessonClient";
import { EditLessonClient } from "@/components/admin/EditLessonClient";
import { BatchQuizGeneratorModal } from "@/components/admin/BatchQuizGeneratorModal";
import { QuizPreviewModal } from "@/components/admin/QuizPreviewModal";

export default async function AdminLessonsPage(props: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const selectedSubjectId = searchParams.subjectId || (subjects.length > 0 ? subjects[0].id : null);

  const selectedSubject = selectedSubjectId
    ? await prisma.subject.findUnique({
        where: { id: selectedSubjectId },
        include: {
          lessons: {
            include: {
              materials: true,
              quiz: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : null;

  // Compute subject-level file and quiz statistics
  const totalLessons = selectedSubject?.lessons.length ?? 0;
  const lessonsWithFiles =
    selectedSubject?.lessons.filter((l) => l.materials && l.materials.some((m) => !!m.fileUrl)).length ?? 0;
  const lessonsWithQuiz =
    selectedSubject?.lessons.filter(
      (l) =>
        !!l.quiz &&
        Array.isArray(l.quiz.questions) &&
        (l.quiz.questions as any[]).length > 0 &&
        (l.quiz.questions as any[]).some((q: any) => q && q.question && q.question.trim().length > 0)
    ).length ?? 0;
  const pendingLessonsWithFiles =
    selectedSubject?.lessons.filter(
      (l) => l.materials && l.materials.some((m) => !!m.fileUrl) && !l.quiz
    ).length ?? 0;
  const lessonsWithoutFiles = totalLessons - lessonsWithFiles;

  return (
    <div className="space-y-6 pb-12">
      <HeroBanner
        title="إدارة الدروس والكويزات"
        description="ارفع الدروس والفيديوهات (Vimeo)، ولّد كويزات الذكاء الاصطناعي التلقائية، ونظّم محتوى كل مادة"
        icon={Video}
      />

      {/* Control Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Batch AI Generator Trigger */}
        <div>
          <BatchQuizGeneratorModal
            currentSubjectId={selectedSubjectId || undefined}
            currentSubjectTitle={selectedSubject?.title}
          />
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700 whitespace-nowrap">اختر المادة:</label>
          <SubjectFilterForm
            subjects={subjects.map((s) => ({ id: s.id, title: s.title }))}
            selectedSubjectId={selectedSubjectId || undefined}
          />
        </div>
      </div>

      {!selectedSubject && (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 font-bold">
          الرجاء اختيار مادة من القائمة أعلاه أو إضافة مادة جديدة أولاً
        </div>
      )}

      {selectedSubject && (
        <>
          {/* Subject Overview & Quality Metrics Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>مادة: {selectedSubject.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    نظرة شاملة على حالة الدروس والملفات المرفقة وتوفر الكويزات
                  </p>
                </div>
              </div>

              {/* Stat Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  إجمالي الدروس: <span className="font-black font-mono">{totalLessons}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/30">
                  تملك ملفات (PDF): <span className="font-black font-mono">{lessonsWithFiles}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                  كويزات مكتملة: <span className="font-black font-mono">{lessonsWithQuiz}</span>
                </div>
                {lessonsWithoutFiles > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20" title="هذه الدروس لا يتم توليد كويز لها لعدم وجود ملفات تعليمية مرفقة">
                    بدون ملفات (مستثناة): <span className="font-black font-mono">{lessonsWithoutFiles}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Creation Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-2">
                  <Video className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900">إضافة درس جديد</h2>
                <p className="text-slate-500 text-sm font-medium">
                  قم بإضافة درس جديد مع كويز وملحقات إضافية عبر الواجهة المخصصة للنشر
                </p>

                <PublishLessonClient
                  subjectId={selectedSubject.id}
                  subjectTitle={selectedSubject.title}
                  action={createLesson}
                />
              </div>
            </div>

            {/* List of Lessons */}
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                const monthLessons = selectedSubject.lessons.filter((l) => l.month === month);
                if (monthLessons.length === 0) return null;

                return (
                  <div key={month} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        الشهر {month}
                      </h3>
                      <span className="text-xs font-bold text-slate-400">
                        {monthLessons.length} {monthLessons.length === 1 ? "درس" : "دروس"}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {monthLessons.map((lesson) => {
                        const hasFiles = lesson.materials && lesson.materials.some((m) => !!m.fileUrl);
                        const hasQuiz =
                          !!lesson.quiz &&
                          Array.isArray(lesson.quiz.questions) &&
                          (lesson.quiz.questions as any[]).length > 0 &&
                          (lesson.quiz.questions as any[]).some((q: any) => q && q.question && q.question.trim().length > 0);
                        const qCount = hasQuiz ? (lesson.quiz!.questions as any[]).length : 0;

                        return (
                          <div key={lesson.id} className="border border-slate-100 rounded-2xl p-4 flex flex-col relative bg-white hover:border-slate-200 transition-all">
                            <EditLessonClient
                              lesson={lesson}
                              subjectTitle={selectedSubject.title}
                              action={updateLesson}
                              deleteAction={deleteLesson}
                            />

                            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-3">
                              <img
                                src={
                                  lesson.image ||
                                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop"
                                }
                                alt={lesson.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Quiz Status Badge & Preview Action */}
                            <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                              {hasQuiz ? (
                                <>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    كويز متوفر ({qCount} أسئلة)
                                  </span>
                                  <QuizPreviewModal
                                    lessonId={lesson.id}
                                    lessonTitle={lesson.title}
                                    questionCount={qCount}
                                  />
                                </>
                              ) : hasFiles ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  ملف متوفر - بانتظار الكويز
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200" title="لا يمكن إنشاء كويز لدرس لا يحتوي على ملفات مرفقة">
                                  بدون ملف (لا يتطلب كويز)
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-slate-900 mb-1">{lesson.title}</h4>
                            <p className="text-xs text-slate-500 font-mono mb-3">Vimeo: {lesson.vimeoVideoId || "غير محدد"}</p>

                            {lesson.materials.length > 0 ? (
                              <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-100">
                                {lesson.materials.map((mat) => (
                                  <div
                                    key={mat.id}
                                    className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs font-bold text-slate-700"
                                  >
                                    <span className="truncate flex-1 ml-2">{mat.title}</span>
                                    <a
                                      href={mat.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sky-600 hover:text-sky-800 bg-sky-50 p-1.5 rounded-md"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-auto pt-3 border-t border-slate-100 text-xs font-bold text-slate-400">
                                لا توجد ملحقات
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
