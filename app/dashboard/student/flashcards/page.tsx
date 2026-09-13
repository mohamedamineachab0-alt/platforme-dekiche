import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { FlashcardDeck } from "@/components/student/FlashcardDeck";
import { LessonBankPicker } from "@/components/student/LessonBankPicker";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Layers } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentFlashcardsPage({
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

  const lessonRows = await prisma.flashcard.findMany({
    where: { gradeLevel, stream },
    distinct: ["lessonTitle"],
    select: { lessonTitle: true },
    orderBy: { lessonTitle: "asc" },
  });
  const lessons = lessonRows.map((r) => r.lessonTitle);

  const cards =
    !lessonTitle || !lessons.includes(lessonTitle)
      ? []
      : await prisma.flashcard.findMany({
          where: { gradeLevel, stream, lessonTitle },
          orderBy: { createdAt: "asc" },
          take: 50,
          select: { id: true, frontText: true, backText: true },
        });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HeroBanner
        title="بطاقات الحفظ السريع"
        description="اختر اسم الدرس حسب مستواك وشعبتك ثم احفظ بالمراجعة السريعة"
        icon={Layers}
      />
      <Suspense fallback={null}>
        <LessonBankPicker lessons={lessons} selected={lessonTitle} />
      </Suspense>
      {lessonTitle && lessons.includes(lessonTitle) ? (
        <FlashcardDeck cards={cards} />
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#EDE9FE] bg-white p-8 text-center text-sm font-bold text-[#6B6480]">
          اختر اسم الدرس لعرض بطاقات الحفظ
        </div>
      )}
    </div>
  );
}
