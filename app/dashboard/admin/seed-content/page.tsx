import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { LEVELS } from "@/lib/constants";
import { AdminSeedContentClient } from "@/components/admin/AdminSeedContentClient";
import { resolveLessonAudience } from "@/lib/academy/seed-lesson-bank";

export default async function AdminSeedContentPage() {
  await assertAuth({ requireRole: "ADMIN" });

  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      month: true,
      subjectId: true,
      levels: true,
      streams: true,
      description: true,
      subject: {
        select: {
          title: true,
          level: true,
          stream: true,
          levels: true,
          streams: true,
        },
      },
    },
    orderBy: [{ title: "asc" }],
  });

  return (
    <AdminSeedContentClient
      lessons={lessons.map((lesson) => {
        const audience = resolveLessonAudience(lesson);
        return {
          id: lesson.id,
          title: lesson.title,
          subjectId: lesson.subjectId,
          subjectTitle: lesson.subject.title,
          levels: audience.levels,
          streams: audience.streams,
          description: lesson.description,
          month: lesson.month,
        };
      })}
      levels={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
    />
  );
}
