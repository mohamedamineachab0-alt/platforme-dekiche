import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAuth } from "@/lib/security";
import { QuizClient } from "@/components/student/QuizClient";

export default async function LessonQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await assertAuth({ requireRole: "STUDENT" });

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quiz: true,
      subject: true
    }
  });

  if (!lesson || !lesson.quiz) redirect(`/dashboard/student/lessons/${id}`);

  // Parse questions from JSON and ensure only non-empty questions are kept
  let rawQuestions: any[] = [];
  try {
    rawQuestions = typeof lesson.quiz.questions === 'string' 
      ? JSON.parse(lesson.quiz.questions) 
      : (lesson.quiz.questions as any[]);
  } catch (err) {
    rawQuestions = [];
  }

  const validQuestions = Array.isArray(rawQuestions)
    ? rawQuestions.filter((q: any) => q && q.question && String(q.question).trim().length > 0)
    : [];

  if (validQuestions.length === 0) {
    redirect(`/dashboard/student/lessons/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 font-arabic" dir="rtl">
      <QuizClient 
        lessonId={lesson.id} 
        lessonTitle={lesson.title} 
        quizId={lesson.quiz.id}
        questions={validQuestions}
      />
    </div>
  );
}
