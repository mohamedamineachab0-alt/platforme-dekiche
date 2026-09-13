import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redirect } from "next/navigation";
import { PracticeQuizClient } from "@/components/student/PracticeQuizClient";
import { reviewCardsToQuestions } from "@/lib/practice";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Library } from "lucide-react";
import Link from "next/link";

export default async function SubjectReviewQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: subjectId } = await params;
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const [subject, enrollment] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true, title: true } }),
    prisma.enrollment.findUnique({
      where: { studentId_subjectId: { studentId: sessionUser.id, subjectId } },
      select: { enrolledMonths: true },
    }),
  ]);

  if (!subject || !enrollment) redirect("/dashboard/student/subjects");

  const cards = await prisma.reviewCard.findMany({
    where: {
      subjectId,
      month: { in: enrollment.enrolledMonths },
    },
    select: { question: true, answer: true, subjectId: true },
    take: 60,
    orderBy: { createdAt: "desc" },
  });

  const questions = reviewCardsToQuestions(cards, 10);
  const returnHref = `/dashboard/student/subjects/${subjectId}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
      <HeroBanner
        title={`كويز مراجعة ${subject.title}`}
        description="اختبر فهمك من بطاقات المراجعة مع تنقيط من 20"
        icon={Library}
      />
      {questions.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#EDE9FE] bg-white p-8 text-center">
          <p className="text-sm font-bold text-[#6B6480]">لا توجد بطاقات كافية لبدء الكويز</p>
          <Link
            href={returnHref}
            className="mt-4 inline-block rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-black text-white"
          >
            العودة للمادة
          </Link>
        </div>
      ) : (
        <PracticeQuizClient
          title={`كويز مراجعة ${subject.title}`}
          questions={questions}
          minutes={12}
          kind="SELF_TEST"
          subjectId={subjectId}
          returnHref={returnHref}
        />
      )}
    </div>
  );
}
