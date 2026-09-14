import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redirect } from "next/navigation";
import { CheckCircle2, Award, Play, FileText } from "lucide-react";
import Link from "next/link";
import { HeroBanner } from "@/components/shared/HeroBanner";
import {
  IconLessons,
  IconCards,
  IconQuiz,
  IconExam,
  IconMistakes,
  IconLive,
} from "@/components/landing/PlayIcons";

function SectionCard({
  title,
  icon: Icon,
  iconBg,
  count,
  children,
}: {
  title: string;
  icon: (props: { size?: "xs" | "sm" | "md" | "lg" }) => React.ReactElement;
  iconBg: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#EDE9FE] bg-white p-6 transition hover:border-[#6D28D9]/30 hover:shadow-[0_12px_40px_rgba(109,40,217,0.1)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-xl font-black text-[#1E1B4B]">
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon size="sm" />
          </span>
          {title}
        </h2>
        <span className="flex items-center gap-1 rounded-full bg-[#6D28D9]/10 px-3 py-1 text-sm font-bold text-[#1E1B4B]">
          <CheckCircle2 className="h-4 w-4 text-[#6D28D9]" /> {count}
        </span>
      </div>
      {children}
    </div>
  );
}

export default async function SubjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) redirect("/dashboard/student/subjects");

  const allLessons = await prisma.lesson.findMany({
    where: { subjectId: id },
    include: { materials: true, quiz: true, subject: true },
    orderBy: { createdAt: "asc" },
  });

  let enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionUser.id,
        subjectId: id,
      },
    },
  });

  if (!enrollment) {
    if (subject.price === 0 || subject.price === null) {
      enrollment = await prisma.enrollment.create({
        data: {
          studentId: sessionUser.id,
          subjectId: id,
          enrolledMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
      });
    } else {
      redirect("/dashboard/student/subjects");
    }
  }

  if (enrollment.validUntil && enrollment.validUntil < new Date()) {
    redirect("/dashboard/student/subjects");
  }

  const enrolledMonths = enrollment.enrolledMonths;

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { studentProfile: true },
  });

  const gradeLevel = student?.studentProfile?.level;
  const stream = student?.studentProfile?.stream;

  const [reviewCards, dailyExercises, questLessons, questCount, exams, liveClasses, mistakes] =
    await Promise.all([
      prisma.reviewCard.findMany({
        where: { subjectId: id, month: { in: enrolledMonths } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.dailyExercise.findMany({
        where: {
          OR: [{ subjectId: id }, { secondarySubjectId: id }],
          month: { in: enrolledMonths },
        },
        orderBy: { createdAt: "desc" },
      }),
      gradeLevel && stream
        ? prisma.questExercise.findMany({
            where: { subjectId: id, gradeLevel, stream },
            distinct: ["lessonTitle"],
            select: { lessonTitle: true },
            orderBy: { lessonTitle: "asc" },
            take: 12,
          })
        : Promise.resolve([] as { lessonTitle: string }[]),
      gradeLevel && stream
        ? prisma.questExercise.count({
            where: { subjectId: id, gradeLevel, stream },
          })
        : Promise.resolve(0),
      prisma.exam.findMany({
        where: {
          OR: [{ subjectId: id }, { secondarySubjectId: id }],
          month: { in: enrolledMonths },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.liveClass.findMany({
        where: { subjectId: id, month: { in: enrolledMonths } },
        orderBy: { date: "asc" },
      }),
      prisma.studentMistake.findMany({
        where: {
          studentId: sessionUser.id,
          lesson: { subjectId: id, month: { in: enrolledMonths } },
        },
      }),
    ]);

  const dailyExerciseCount = Math.max(dailyExercises.length, questCount);

  const accessibleLessons = allLessons.filter((l) => {
    const isEnrolledInMonth = enrolledMonths.includes(l.month);
    const isPublished = (l as any).isPublished !== false;
    const studentLevel = student?.studentProfile?.level;
    const studentStream = student?.studentProfile?.stream;

    const matchesLevel =
      (l as any).levels.length === 0 || (studentLevel && (l as any).levels.includes(studentLevel));
    const matchesStream =
      (l as any).streams.length === 0 || (studentStream && (l as any).streams.includes(studentStream));

    return isEnrolledInMonth && isPublished && matchesLevel && matchesStream;
  });

  return (
    <div className="space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title={subject.title}
        description={subject.description || "دروس وتمارين وبطاقات مراجعة لهذه المادة"}
        iconSlot={<IconLessons size="sm" />}
      />

      <SectionCard
        title="الدروس المسجلة"
        icon={IconLessons}
        iconBg="bg-gradient-to-b from-[#EDE9FE] to-[#DDD6FE]"
        count={accessibleLessons.length}
      >
        {accessibleLessons.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accessibleLessons.map((lesson) => {
              const hasFiles = lesson.materials?.some((m) => !!m.fileUrl);
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
                  className="group flex flex-col rounded-2xl border border-[#EDE9FE] bg-white p-4 transition hover:border-[#6D28D9]/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-3.5">
                    <Link
                      href={`/dashboard/student/lessons/${lesson.id}`}
                      className="relative block aspect-video w-32 shrink-0 overflow-hidden rounded-xl border border-[#EDE9FE] bg-[#EEF1FF] sm:w-36"
                    >
                      {lesson.image ? (
                        <img
                          src={lesson.image}
                          alt={lesson.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#A8B4D6]">
                          <Play className="h-6 w-6 opacity-50" />
                        </div>
                      )}
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-[#6D28D9]/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Play className="h-2.5 w-2.5 fill-white" /> درس
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/student/lessons/${lesson.id}`}
                        className="block text-sm leading-snug font-bold text-[#1E1B4B] line-clamp-2 transition hover:text-[#6D28D9]"
                      >
                        {lesson.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {hasFiles && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#EDE9FE] bg-[#EEF1FF] px-2 py-0.5 text-[10px] font-bold text-[#6D28D9]">
                            <FileText className="h-3 w-3" />
                            وثيقة مرفقة
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-[#6B6480]">الشهر {lesson.month}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EDE9FE] pt-3">
                    <Link
                      href={`/dashboard/student/lessons/${lesson.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#6B6480] transition hover:text-[#6D28D9]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>مشاهدة الفيديو</span>
                    </Link>

                    {hasQuiz ? (
                      <Link
                        href={`/dashboard/student/lessons/${lesson.id}/quiz`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#6D28D9] px-3 py-1.5 text-xs font-black text-white transition hover:bg-[#1E1B4B]"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>حل الكويز ({qCount})</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] font-medium text-[#9B95B3]">
                        {hasFiles ? "الكويز قيد الإعداد" : "درس نظري"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#EDE9FE] bg-[#F7F5FF] py-8 text-center font-medium text-[#6B6480]">
            لا توجد دروس متاحة حالياً
          </p>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <SectionCard
          title="بطاقات المراجعة"
          icon={IconCards}
          iconBg="bg-gradient-to-b from-[#E8EDFF] to-[#EDE9FE]"
          count={reviewCards.length}
        >
          {reviewCards.length > 0 ? (
            <div className="space-y-3">
              <Link
                href={`/dashboard/student/subjects/${id}/review-quiz`}
                className="block rounded-xl bg-[#6D28D9] p-3.5 text-center text-sm font-black text-white transition hover:bg-[#1E1B4B]"
              >
                كويز المراجعة من 20
              </Link>
              <Link
                href="/dashboard/student/review-cards"
                className="block rounded-xl border border-[#EDE9FE] bg-[#F7F5FF] p-3.5 text-center text-sm font-bold text-[#1E1B4B] transition hover:border-[#6D28D9]/40"
              >
                تصفح البطاقات
              </Link>
            </div>
          ) : (
            <p className="py-4 text-center font-medium text-[#6B6480]">لا توجد بطاقات متاحة حالياً</p>
          )}
        </SectionCard>

        <SectionCard
          title="التمارين اليومية"
          icon={IconQuiz}
          iconBg="bg-gradient-to-b from-[#D6E4FF] to-[#DDD6FE]"
          count={dailyExerciseCount}
        >
          {questCount > 0 || dailyExercises.length > 0 ? (
            <div className="space-y-3">
              {questCount > 0 ? (
                <Link
                  href={`/dashboard/student/subjects/${id}/daily-quiz`}
                  className="block rounded-xl bg-[#6D28D9] p-3.5 text-center text-sm font-black text-white transition hover:bg-[#1E1B4B]"
                >
                  ابدأ التمرين من 20
                </Link>
              ) : null}
              {questLessons.slice(0, 3).map((row) => (
                <div
                  key={row.lessonTitle}
                  className="truncate rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-3.5 text-sm font-bold text-[#1E1B4B]"
                >
                  {row.lessonTitle}
                </div>
              ))}
              {dailyExercises.slice(0, questCount > 0 ? 0 : 3).map((ex) => (
                <Link
                  key={ex.id}
                  href={`/dashboard/student/exercises/${ex.id}`}
                  className="block truncate rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-3.5 text-sm font-bold text-[#1E1B4B] transition hover:border-[#6D28D9]/40 hover:text-[#6D28D9]"
                >
                  {ex.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center font-medium text-[#6B6480]">لا توجد تمارين متاحة حالياً</p>
          )}
        </SectionCard>

        <SectionCard
          title="الاختبارات والفروض"
          icon={IconExam}
          iconBg="bg-gradient-to-b from-[#FFE4C4] to-[#FFD0A3]"
          count={exams.length}
        >
          {exams.length > 0 ? (
            <div className="space-y-3">
              {exams.slice(0, 3).map((exam) => (
                <Link
                  key={exam.id}
                  href="/dashboard/student/exams"
                  className="block truncate rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4 font-bold text-[#1E1B4B] transition hover:border-[#6D28D9]/40 hover:bg-[#EEF1FF] hover:text-[#6D28D9]"
                >
                  {exam.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center font-medium text-[#6B6480]">لا توجد اختبارات متاحة حالياً</p>
          )}
        </SectionCard>

        <SectionCard
          title="أخطائي"
          icon={IconMistakes}
          iconBg="bg-gradient-to-b from-[#FFE0D4] to-[#FFB39A]"
          count={mistakes.length}
        >
          {mistakes.length > 0 ? (
            <Link
              href="/dashboard/student/mistakes"
              className="block rounded-full bg-[#6D28D9] p-4 text-center font-bold text-white transition hover:bg-[#1E1B4B]"
            >
              مراجعة الأخطاء
            </Link>
          ) : (
            <p className="py-4 text-center font-medium text-[#6B6480]">لم تقم بأي أخطاء في الكويزات بعد</p>
          )}
        </SectionCard>

        <SectionCard
          title="الحصص المباشرة"
          icon={IconLive}
          iconBg="bg-gradient-to-b from-[#FFD6E8] to-[#FFA8C8]"
          count={liveClasses.length}
        >
          {liveClasses.length > 0 ? (
            <div className="space-y-3">
              {liveClasses.slice(0, 3).map((live) => (
                <Link
                  key={live.id}
                  href="/dashboard/student/live-classes"
                  className="block truncate rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4 font-bold text-[#1E1B4B] transition hover:border-[#6D28D9]/40 hover:bg-[#EEF1FF] hover:text-[#6D28D9]"
                >
                  {live.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center font-medium text-[#6B6480]">لا توجد حصص مباشرة مجدولة</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
