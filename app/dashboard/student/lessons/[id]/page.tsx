import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  CheckCircle2,
  Lock,
  PlayCircle,
  ListVideo,
  AlertTriangle,
} from "lucide-react";
import { UniversalFileViewer } from "@/components/shared/UniversalFileViewer";
import { LessonAiTools } from "@/components/student/LessonAiTools";
import { LessonOpinionForm } from "@/components/student/LessonOpinionForm";
import { LessonMaterialsWidget } from "@/components/student/LessonMaterialsWidget";
import { LessonProgressPanel } from "@/components/student/LessonProgressPanel";
import { LEVELS, STREAMS } from "@/lib/constants";
import Link from "next/link";

export default async function LessonStudyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subject: true,
    },
  });

  if (!lesson) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionUser.id,
        subjectId: lesson.subjectId,
      },
    },
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const isUnlocked = enrollment.enrolledMonths.includes(lesson.month);

  const userWithProfile = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      fullName: true,
      studentProfile: true,
    },
  });
  const student = userWithProfile?.studentProfile ?? null;

  const nextLessonsRaw = await prisma.lesson.findMany({
    where: {
      subjectId: lesson.subjectId,
      isPublished: true,
      createdAt: { gt: lesson.createdAt },
    },
    orderBy: { createdAt: "asc" },
    include: { subject: true },
  });

  const prevLessonsRaw = await prisma.lesson.findMany({
    where: {
      subjectId: lesson.subjectId,
      isPublished: true,
      createdAt: { lt: lesson.createdAt },
    },
    orderBy: { createdAt: "desc" },
    include: { subject: true },
  });

  let nextLessons = nextLessonsRaw;
  let prevLessons = prevLessonsRaw;
  if (student) {
    const studentLevel = student.level;
    const studentStream = student.stream;

    const filterFn = (l: (typeof nextLessonsRaw)[number]) => {
      const matchesLevel = l.levels.length === 0 || l.levels.includes(studentLevel);
      const matchesStream = l.streams.length === 0 || l.streams.includes(studentStream);
      return matchesLevel && matchesStream;
    };

    nextLessons = nextLessonsRaw.filter(filterFn).slice(0, 4);
    prevLessons = prevLessonsRaw.filter(filterFn).slice(0, 4);
  } else {
    nextLessons = nextLessonsRaw.slice(0, 4);
    prevLessons = prevLessonsRaw.slice(0, 4);
  }

  const lessonMistakes = await prisma.studentMistake.findMany({
    where: {
      studentId: sessionUser.id,
      lessonId: lesson.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const existingOpinion = await prisma.lessonOpinion.findUnique({
    where: {
      studentId_lessonId: {
        studentId: sessionUser.id,
        lessonId: lesson.id,
      },
    },
  });

  const subjectLessonsRaw = await prisma.lesson.findMany({
    where: {
      subjectId: lesson.subjectId,
      isPublished: true,
      month: { in: enrollment.enrolledMonths },
    },
    select: { id: true, levels: true, streams: true },
  });

  const subjectLessons = student
    ? subjectLessonsRaw.filter((l) => {
        const matchesLevel = l.levels.length === 0 || l.levels.includes(student.level);
        const matchesStream = l.streams.length === 0 || l.streams.includes(student.stream);
        return matchesLevel && matchesStream;
      })
    : subjectLessonsRaw;

  const subjectLessonIds = subjectLessons.map((l) => l.id);

  const [completedProgress, watchRow] = await Promise.all([
    subjectLessonIds.length
      ? prisma.courseProgress.findMany({
          where: {
            studentId: sessionUser.id,
            completed: true,
            lessonId: { in: subjectLessonIds },
          },
          select: { lessonId: true },
        })
      : Promise.resolve([] as { lessonId: string }[]),
    prisma.watchHistory.findUnique({
      where: {
        studentId_lessonId: {
          studentId: sessionUser.id,
          lessonId: lesson.id,
        },
      },
      select: { watchedSeconds: true },
    }),
  ]);

  const completedLessonIds = new Set(completedProgress.map((p) => p.lessonId));
  const lessonCompleted = completedLessonIds.has(lesson.id);
  const completedCount = completedLessonIds.size;
  const totalLessons = subjectLessonIds.length;

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5 px-4">
        <div className="w-20 h-20 bg-[#F7F5FF] rounded-full flex items-center justify-center text-[#A8B4D6]">
          <Lock className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">الدرس مغلق</h2>
          <p className="text-[#6B6480] font-medium mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            هذا الدرس ينتمي إلى الشهر {lesson.month} وهو غير مفعّل في اشتراكك الحالي
          </p>
        </div>
        <Link
          href={`/dashboard/student/subjects/${lesson.subjectId}`}
          className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-black px-6 py-3 rounded-xl transition-colors"
        >
          العودة للمادة
        </Link>
      </div>
    );
  }

  const hasValidQuiz =
    !!lesson.quiz &&
    Array.isArray(lesson.quiz.questions) &&
    (lesson.quiz.questions as any[]).length > 0 &&
    (lesson.quiz.questions as any[]).some(
      (q: any) => q && q.question && q.question.trim().length > 0
    );
  const qCount = hasValidQuiz ? (lesson.quiz!.questions as any[]).length : 0;
  const hasFiles = lesson.materials.length > 0;

  return (
    <div
      className="mx-auto w-full max-w-6xl min-w-0 space-y-4 sm:space-y-6 md:space-y-8 pb-8 sm:pb-12 font-arabic"
      dir="rtl"
      style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <Link
          href={`/dashboard/student/subjects/${lesson.subjectId}`}
          className="inline-flex items-center gap-1.5 text-[#6B6480] hover:text-[#6D28D9] font-bold text-sm min-w-0"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className="truncate">العودة للمادة</span>
        </Link>
        <span className="bg-[#EEF1FF] text-[#6D28D9] px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold shrink-0">
          الشهر {lesson.month}
        </span>
      </div>

      <LessonProgressPanel
        lessonId={lesson.id}
        vimeoVideoId={lesson.vimeoVideoId}
        lessonTitle={lesson.title}
        subjectTitle={lesson.subject.title}
        completedCount={completedCount}
        totalLessons={totalLessons}
        initiallyCompleted={lessonCompleted}
        initialWatchedSeconds={watchRow?.watchedSeconds ?? 0}
      />

      {/* Title */}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-3xl lg:text-4xl leading-snug font-black text-[#1E1B4B] break-words">
          {lesson.title}
        </h1>
        <p className="text-[#6B6480] font-medium text-sm sm:text-base mt-1.5 leading-relaxed">
          شاهد الدرس، حمّل الملحقات، واختبر فهمك
        </p>
      </div>

      {/* Quiz + attachments */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="bg-white rounded-2xl border border-[#EDE9FE] shadow-sm p-3.5 sm:p-4 flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#EEF1FF] text-[#6D28D9] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-[#1E1B4B] text-sm truncate">اختبر معلوماتك</h3>
            <p className="text-[11px] font-medium text-[#6B6480] mt-0.5 line-clamp-1">
              اختبر استيعابك لهذا الدرس
            </p>
          </div>
          {hasValidQuiz ? (
            <Link
              href={`/dashboard/student/lessons/${lesson.id}/quiz`}
              className="shrink-0 inline-flex items-center justify-center bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-black text-xs px-3 py-2.5 rounded-xl whitespace-nowrap"
            >
              بدء ({qCount})
            </Link>
          ) : (
            <span className="shrink-0 text-[10px] font-bold text-[#A8B4D6] bg-[#F7F5FF] border border-[#EDE9FE] px-2.5 py-2 rounded-xl whitespace-nowrap">
              {hasFiles ? "قريباً" : "غير متاح"}
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9FE] shadow-sm p-3.5 sm:p-4 space-y-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EEF1FF] text-[#6D28D9] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-[#1E1B4B] text-sm truncate">ملحقات الدرس</h3>
              <p className="text-[11px] font-medium text-[#6B6480] mt-0.5 line-clamp-1">
                {hasFiles ? `${lesson.materials.length} ملف للمراجعة` : "لا توجد ملحقات"}
              </p>
            </div>
          </div>
          {hasFiles && (
            <div className="grid grid-cols-1 gap-2 w-full min-w-0">
              {lesson.materials.map((mat, index) => (
                <UniversalFileViewer
                  key={mat.id}
                  title={
                    lesson.materials.length > 1
                      ? `${lesson.title} - ملحق ${index + 1}`
                      : lesson.title
                  }
                  fileUrl={mat.fileUrl}
                  fileType={(mat as { fileType?: string }).fileType}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <LessonAiTools
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        subjectTitle={lesson.subject.title}
        description={lesson.description}
        materialTitles={lesson.materials.map((m) => m.title)}
        studentName={userWithProfile?.fullName}
        studentLevel={
          student
            ? LEVELS.find((l) => l.value === student.level)?.label || student.level
            : undefined
        }
        studentStream={
          student
            ? STREAMS.find((s) => s.value === student.stream)?.label || student.stream
            : undefined
        }
        studentPoints={student?.totalPoints}
        studentMistakes={
          lessonMistakes.length > 0
            ? lessonMistakes.map((m) => m.mistakeContent).join("، ")
            : undefined
        }
      />

      {student ? (
        <LessonMaterialsWidget
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          gradeLevel={student.level}
          branch={student.stream}
        />
      ) : null}

      <LessonOpinionForm
        lessonId={lesson.id}
        initialRating={existingOpinion?.rating || 0}
        initialComment={existingOpinion?.comment || ""}
      />

      {/* Mistakes */}
      {lessonMistakes.length > 0 && (
        <section className="pt-4 sm:pt-6 border-t border-[#EDE9FE] space-y-3 sm:space-y-4 min-w-0">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-[#1E1B4B]">أخطائي في هذا الدرس</h2>
              <p className="text-xs sm:text-sm text-[#6B6480] font-medium mt-0.5">
                راجع أخطاء الكويز لتفاديها لاحقاً
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lessonMistakes.map((mistake) => (
              <div
                key={mistake.id}
                className="bg-white rounded-2xl border border-[#EDE9FE] p-3.5 sm:p-5 shadow-sm min-w-0"
              >
                <div className="mb-3">
                  <span className="text-[10px] font-black text-amber-500 block mb-1">خطأك كان:</span>
                  <p className="text-xs sm:text-sm font-bold text-[#1E1B4B] bg-amber-50 p-2.5 sm:p-3 rounded-xl border border-amber-100 break-words">
                    {mistake.mistakeContent}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-500 block mb-1">الصواب هو:</span>
                  <p className="text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 p-2.5 sm:p-3 rounded-xl border border-emerald-100 break-words">
                    {mistake.correctSolution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next lessons */}
      {nextLessons.length > 0 && (
        <section className="pt-4 sm:pt-6 border-t border-[#EDE9FE] space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-[#6D28D9] shrink-0" />
            <h2 className="text-base sm:text-xl font-black text-[#1E1B4B]">الدروس القادمة</h2>
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {nextLessons.map((nextLesson) => (
              <Link
                href={`/dashboard/student/lessons/${nextLesson.id}`}
                key={nextLesson.id}
                className="flex items-center gap-3 p-2.5 sm:p-3 bg-white rounded-2xl border border-[#EDE9FE] hover:border-[#6D28D9]/40 hover:shadow-sm transition-all group min-w-0"
              >
                <div className="relative w-24 sm:w-32 md:w-40 aspect-video rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-[#EEF1FF]">
                  <img
                    src={
                      nextLesson.image ||
                      nextLesson.subject.image ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={nextLesson.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex flex-col justify-center min-w-0 py-0.5">
                  <h3 className="font-bold text-[#1E1B4B] line-clamp-2 text-xs sm:text-sm md:text-base leading-snug group-hover:text-[#6D28D9]">
                    {nextLesson.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#6B6480] mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="bg-[#F7F5FF] px-2 py-0.5 rounded-md font-bold">
                      الشهر {nextLesson.month}
                    </span>
                    <span className="truncate">{nextLesson.subject.teacherName}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Previous lessons */}
      {prevLessons.length > 0 && (
        <section className="pt-4 sm:pt-6 border-t border-[#EDE9FE] space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-[#A8B4D6] shrink-0" />
            <h2 className="text-base sm:text-xl font-black text-[#1E1B4B]">الدروس السابقة</h2>
          </div>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {prevLessons.map((prevLesson) => (
              <Link
                href={`/dashboard/student/lessons/${prevLesson.id}`}
                key={prevLesson.id}
                className="flex items-center gap-3 p-2.5 sm:p-3 bg-white rounded-2xl border border-[#EDE9FE] hover:border-[#EDE9FE] hover:shadow-sm transition-all group min-w-0 opacity-85 hover:opacity-100"
              >
                <div className="relative w-24 sm:w-32 md:w-40 aspect-video rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-[#EEF1FF]">
                  <img
                    src={
                      prevLesson.image ||
                      prevLesson.subject.image ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={prevLesson.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0 py-0.5">
                  <h3 className="font-bold text-[#1E1B4B] line-clamp-2 text-xs sm:text-sm md:text-base leading-snug">
                    {prevLesson.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#6B6480] mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="bg-[#F7F5FF] px-2 py-0.5 rounded-md font-bold">
                      الشهر {prevLesson.month}
                    </span>
                    <span className="truncate">{prevLesson.subject.teacherName}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
