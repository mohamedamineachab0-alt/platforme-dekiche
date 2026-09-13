import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { AlertTriangle } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { StudentMistakesClient, type MistakeRecord } from "@/components/student/StudentMistakesClient";

export default async function StudentMistakesPage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const rawMistakes = await prisma.studentMistake.findMany({
    where: { studentId: sessionUser.id },
    include: {
      lesson: {
        include: { subject: true },
      },
      quiz: {
        include: {
          lesson: { include: { subject: true } },
          dailyExercise: { include: { subject: true } },
          exam: { include: { subject: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mistakes: MistakeRecord[] = rawMistakes.map((m) => {
    const title =
      m.lesson?.title ||
      m.quiz?.lesson?.title ||
      m.quiz?.dailyExercise?.title ||
      m.quiz?.exam?.title ||
      "اختبار تقييمي";

    const subjectTitle =
      m.lesson?.subject?.title ||
      m.quiz?.lesson?.subject?.title ||
      m.quiz?.dailyExercise?.subject?.title ||
      m.quiz?.exam?.subject?.title ||
      "عام";

    let contextType: "lesson" | "exercise" | "exam" | "general" = "general";
    let quizUrl: string | undefined;

    if (m.lesson?.id || m.quiz?.lesson?.id) {
      contextType = "lesson";
      const lid = m.lesson?.id || m.quiz?.lesson?.id;
      quizUrl = `/dashboard/student/lessons/${lid}/quiz`;
    } else if (m.quiz?.dailyExercise?.id) {
      contextType = "exercise";
      quizUrl = `/dashboard/student/exercises/${m.quiz.dailyExercise.id}/quiz`;
    } else if (m.quiz?.exam?.id) {
      contextType = "exam";
      quizUrl = `/dashboard/student/exams/${m.quiz.exam.id}/quiz`;
    }

    return {
      id: m.id,
      mistakeContent: m.mistakeContent,
      correctSolution: m.correctSolution,
      createdAt: m.createdAt.toISOString(),
      title,
      subjectTitle,
      contextType,
      quizUrl,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <HeroBanner
        title="أخطائي (بنك الأخطاء)"
        description="تتبع ومراجعة كل الأخطاء التي قمت بها أثناء حل الاختبارات والتمارين مع الحلول النموذجية لتطوير مستواك"
        icon={AlertTriangle}
      />

      <StudentMistakesClient initialMistakes={mistakes} />
    </div>
  );
}
