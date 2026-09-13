import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAuth } from "@/lib/security";
import { QuizClient } from "@/components/student/QuizClient";

export default async function ExerciseQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await assertAuth({ requireRole: "STUDENT" });

  const exercise = await prisma.dailyExercise.findUnique({
    where: { id },
    include: {
      quiz: true,
      subject: true
    }
  });

  if (!exercise || !exercise.quiz) redirect(`/dashboard/student/exercises`);

  const questions = typeof exercise.quiz.questions === 'string' 
    ? JSON.parse(exercise.quiz.questions) 
    : (exercise.quiz.questions as any[]);

  return (
    <div className="max-w-4xl mx-auto py-8 font-arabic" dir="rtl">
      <QuizClient 
        lessonId={undefined} 
        lessonTitle={exercise.title} 
        quizId={exercise.quiz.id}
        questions={questions}
        contextType="exercise"
      />
    </div>
  );
}
