import type { Level, Prisma, Stream } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const LANGUAGE_LEVEL = "LANG_BEGINNER" as const;
export const LANGUAGE_STREAM = "ALL" as const;

const LANGUAGE_COURSE = {
  title: "تعلّم اللغات — A1",
  description: "دورة تعلّم اللغات للمستوى A1. دروسك المسجّلة تظهر هنا.",
};

/** Only true languages subjects — not every stream=ALL row. */
export function languageSubjectsWhere(): Prisma.SubjectWhereInput {
  return {
    OR: [
      { level: LANGUAGE_LEVEL },
      { levels: { has: LANGUAGE_LEVEL } },
      { stream: { in: ["ENGLISH", "FRENCH"] } },
      { streams: { hasSome: ["ENGLISH", "FRENCH"] } },
    ],
  };
}

/**
 * Ensure a draft (unpublished) languages catalog subject exists for admin editing.
 * Does NOT enroll students and does NOT publish.
 */
export async function ensureLanguageCatalogSubjects() {
  const level = LANGUAGE_LEVEL as Level;
  const stream = LANGUAGE_STREAM as Stream;

  let subject = await prisma.subject.findFirst({
    where: {
      OR: [{ level }, { levels: { has: level } }],
    },
  });

  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        title: LANGUAGE_COURSE.title,
        description: LANGUAGE_COURSE.description,
        teacherName: "منصة دقيش",
        image: "/placeholder.jpg",
        price: 0,
        accessType: "YEARLY",
        level,
        stream,
        levels: [level],
        streams: [stream],
        isPublished: false,
      },
    });
  }

  return [subject];
}

/** Hide any previously auto-published languages courses from students. */
export async function unpublishAutoLanguageCourses() {
  await prisma.subject.updateMany({
    where: {
      ...languageSubjectsWhere(),
      title: LANGUAGE_COURSE.title,
      isPublished: true,
    },
    data: { isPublished: false },
  });
}
