import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { DailyQuest } from "@/components/student/DailyQuest";
import { LessonBankPicker } from "@/components/student/LessonBankPicker";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { algeriaDayIndex } from "@/lib/content-bank";
import { Target } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentQuestPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string }>;
}) {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { studentProfile: true },
  });
  if (!user?.studentProfile) redirect("/login");

  const { level: gradeLevel, stream } = user.studentProfile;
  const sp = await searchParams;
  const lessonTitle = sp.lesson?.trim();

  const lessonRows = await prisma.questExercise.findMany({
    where: { gradeLevel, stream },
    distinct: ["lessonTitle"],
    select: { lessonTitle: true },
    orderBy: { lessonTitle: "asc" },
  });
  const lessons = lessonRows.map((r) => r.lessonTitle);

  const pool =
    !lessonTitle || !lessons.includes(lessonTitle)
      ? []
      : await prisma.questExercise.findMany({
          where: { gradeLevel, stream, lessonTitle },
          orderBy: { createdAt: "asc" },
          take: 200,
          select: {
            id: true,
            question: true,
            options: true,
            correctAnswer: true,
            explanation: true,
          },
        });

  const day = algeriaDayIndex();
  const start = pool.length ? day % pool.length : 0;
  const rotated = pool.length
    ? [...pool.slice(start), ...pool.slice(0, start)].slice(0, 10)
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HeroBanner
        title="تحدي اليوم"
        description="اختر اسم الدرس حسب مستواك وشعبتك ثم حل التمارين مع التصحيح الفوري"
        icon={Target}
      />
      <Suspense fallback={null}>
        <LessonBankPicker lessons={lessons} selected={lessonTitle} />
      </Suspense>
      {lessonTitle && lessons.includes(lessonTitle) ? (
        <DailyQuest exercises={rotated} />
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#EDE9FE] bg-white p-8 text-center text-sm font-bold text-[#6B6480]">
          اختر اسم الدرس لبدء تحدي اليوم
        </div>
      )}
    </div>
  );
}
