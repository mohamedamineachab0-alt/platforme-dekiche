import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redirect } from "next/navigation";
import { PracticeQuizClient } from "@/components/student/PracticeQuizClient";
import { questExercisesToQuestions } from "@/lib/practice";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Target } from "lucide-react";
import Link from "next/link";

export default async function SubjectDailyExercisesQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: subjectId } = await params;
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const [subject, enrollment, profile] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true, title: true } }),
    prisma.enrollment.findUnique({
      where: { studentId_subjectId: { studentId: sessionUser.id, subjectId } },
      select: { id: true },
    }),
    prisma.studentProfile.findUnique({
      where: { userId: sessionUser.id },
      select: { level: true, stream: true },
    }),
  ]);

  if (!subject || !enrollment || !profile) redirect("/dashboard/student/subjects");

  const pool = await prisma.questExercise.findMany({
    where: {
      subjectId,
      gradeLevel: profile.level,
      stream: profile.stream,
    },
    take: 80,
    orderBy: { createdAt: "asc" },
    select: {
      question: true,
      options: true,
      correctAnswer: true,
      explanation: true,
      lessonId: true,
      lessonTitle: true,
      subjectId: true,
    },
  });

  const questions = questExercisesToQuestions(pool, 10);
  const returnHref = `/dashboard/student/subjects/${subjectId}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
      <HeroBanner
        title={`تمارين ${subject.title}`}
        description="تمرين يومي من بنك المادة مع تنقيط من 20"
        icon={Target}
      />
      {questions.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#EDE9FE] bg-white p-8 text-center">
          <p className="text-sm font-bold text-[#6B6480]">لا توجد تمارين جاهزة لهذه المادة بعد</p>
          <Link
            href={returnHref}
            className="mt-4 inline-block rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-black text-white"
          >
            العودة للمادة
          </Link>
        </div>
      ) : (
        <PracticeQuizClient
          title={`تمارين ${subject.title}`}
          questions={questions}
          minutes={15}
          kind="DAILY_CHALLENGE"
          subjectId={subjectId}
          returnHref={returnHref}
        />
      )}
    </div>
  );
}
