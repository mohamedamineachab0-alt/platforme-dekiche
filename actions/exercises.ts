"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDailyExercise(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const a4ImageUrl = formData.get("a4ImageUrl") as string;
  const maxScore = parseInt(formData.get("maxScore") as string) || 20;
  const level = formData.get("level") as any;
  const stream = formData.get("stream") as any;
  const month = parseInt(formData.get("month") as string);
  const subjectId = formData.get("subjectId") as string;
  const secondarySubjectId = formData.get("secondarySubjectId") as string || null;
  const quizType = formData.get("quizType") as string || "AI";
  
  let materialsData: { title: string, fileUrl: string }[] = [];
  const rawMaterials = formData.get("materials") as string;
  if (rawMaterials) {
    try {
      materialsData = JSON.parse(rawMaterials);
    } catch (e) {
      console.error("Failed to parse materials JSON");
    }
  }

  let questionsData: any = [];
  if (quizType === "MANUAL") {
    const rawQuestions = formData.get("manualQuestions") as string;
    if (rawQuestions) {
      try {
        const parsed = JSON.parse(rawQuestions);
        const pointsPerQuestion = 20 / parsed.length;
        questionsData = parsed.map((q: any) => ({
          ...q,
          points: pointsPerQuestion
        }));
      } catch (e) {
        throw new Error("Invalid manual questions JSON");
      }
    }
  }

  if (!title || !a4ImageUrl || !subjectId || !level || !stream) {
    throw new Error("Missing required fields");
  }

  await prisma.$transaction(async (tx) => {
    const ex = await tx.dailyExercise.create({
      data: {
        title,
        a4ImageUrl,
        maxScore,
        level,
        stream,
        month,
        subjectId,
        secondarySubjectId,
        materials: {
          create: materialsData.map(m => ({
            title: m.title,
            fileUrl: m.fileUrl,
          })),
        },
      },
    });

    await tx.quiz.create({
      data: {
        dailyExerciseId: ex.id,
        maxScore: 20,
        aiGenerated: quizType === "AI",
        questions: questionsData,
      }
    });
  });

  revalidatePath("/dashboard/admin/exercises");
}
