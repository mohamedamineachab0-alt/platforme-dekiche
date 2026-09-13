import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/security";

export const dynamic = "force-dynamic";

function formatWatchTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return { hours, minutes, totalSeconds: safe };
}

async function resolveStudentId(viewerId: string, requestedStudentId?: string | null) {
  const viewer = await prisma.user.findUnique({
    where: { id: viewerId },
    select: { id: true, role: true },
  });
  if (!viewer) return { ok: false as const, status: 401, error: "يجب تسجيل الدخول" };

  if (viewer.role === "STUDENT") {
    return { ok: true as const, studentId: viewer.id };
  }

  if (viewer.role === "PARENT" && requestedStudentId) {
    const link = await prisma.parentStudentLink.findFirst({
      where: { parentId: viewer.id, studentId: requestedStudentId },
      select: { id: true },
    });
    if (!link) {
      return { ok: false as const, status: 403, error: "لا يمكن عرض إحصائيات هذا التلميذ" };
    }
    return { ok: true as const, studentId: requestedStudentId };
  }

  if (viewer.role === "ADMIN" && requestedStudentId) {
    return { ok: true as const, studentId: requestedStudentId };
  }

  return { ok: false as const, status: 403, error: "غير مصرح" };
}

export async function GET(req: Request) {
  try {
    const viewerId = await getSessionUserId();
    if (!viewerId) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get("studentId");
    const access = await resolveStudentId(viewerId, requestedStudentId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const studentId = access.studentId;

    const [
      watchAgg,
      enrollments,
      progressRows,
      quizAttempts,
      examSubmissions,
      recentWatch,
      recentProgress,
      recentSubmissions,
      recentQuizAttempts,
    ] = await Promise.all([
      prisma.watchHistory.aggregate({
        where: { studentId },
        _sum: { watchedSeconds: true },
      }),
      prisma.enrollment.findMany({
        where: { studentId },
        select: {
          subjectId: true,
          enrolledMonths: true,
          subject: { select: { id: true, title: true } },
        },
      }),
      prisma.courseProgress.findMany({
        where: { studentId, completed: true },
        select: { subjectId: true, lessonId: true, completedAt: true },
      }),
      prisma.quizAttempt.findMany({
        where: { studentId },
        select: { score: true, maxScore: true, createdAt: true, subjectId: true },
      }),
      prisma.studentSubmission.findMany({
        where: { studentId, score: { not: null } },
        select: {
          score: true,
          createdAt: true,
          exam: { select: { title: true, maxScore: true, subjectId: true, subject: { select: { title: true } } } },
        },
      }),
      prisma.watchHistory.findMany({
        where: { studentId },
        orderBy: { lastWatchedAt: "desc" },
        take: 5,
        select: {
          lastWatchedAt: true,
          watchedSeconds: true,
          lesson: { select: { title: true } },
          subject: { select: { title: true } },
        },
      }),
      prisma.courseProgress.findMany({
        where: { studentId, completed: true },
        orderBy: { completedAt: "desc" },
        take: 5,
        select: {
          completedAt: true,
          lesson: { select: { title: true } },
          subject: { select: { title: true } },
        },
      }),
      prisma.studentSubmission.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          createdAt: true,
          score: true,
          exam: { select: { title: true, subject: { select: { title: true } } } },
        },
      }),
      prisma.quizAttempt.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          createdAt: true,
          score: true,
          maxScore: true,
          subject: { select: { title: true } },
          exam: { select: { title: true } },
        },
      }),
    ]);

    const subjectIds = enrollments.map((e) => e.subjectId);
    const lessonsBySubject = subjectIds.length
      ? await prisma.lesson.groupBy({
          by: ["subjectId"],
          where: {
            subjectId: { in: subjectIds },
            isPublished: true,
          },
          _count: { _all: true },
        })
      : [];

    const lessonCountMap = new Map(
      lessonsBySubject.map((row) => [row.subjectId, row._count._all])
    );

    const completedBySubject = new Map<string, number>();
    for (const row of progressRows) {
      completedBySubject.set(
        row.subjectId,
        (completedBySubject.get(row.subjectId) || 0) + 1
      );
    }

    const subjectProgress = enrollments.map((enrollment) => {
      const totalLessons = lessonCountMap.get(enrollment.subjectId) || 0;
      const completedLessons = completedBySubject.get(enrollment.subjectId) || 0;
      const percent =
        totalLessons > 0
          ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
          : 0;
      return {
        subjectId: enrollment.subjectId,
        subjectTitle: enrollment.subject.title,
        completedLessons,
        totalLessons,
        completionPercent: percent,
      };
    });

    const officialScores: { score: number; maxScore: number }[] = [
      ...quizAttempts.map((q) => ({ score: q.score, maxScore: q.maxScore || 20 })),
      ...examSubmissions.map((s) => ({
        score: s.score ?? 0,
        maxScore: s.exam.maxScore || 20,
      })),
    ];

    const averageQuizScore =
      officialScores.length === 0
        ? null
        : Math.round(
            (officialScores.reduce(
              (sum, item) => sum + (item.score / Math.max(item.maxScore, 1)) * 20,
              0
            ) /
              officialScores.length) *
              10
          ) / 10;

    const watchTime = formatWatchTime(watchAgg._sum.watchedSeconds || 0);
    const completedLessonsTotal = progressRows.length;

    type TimelineItem = {
      id: string;
      type: "watch" | "lesson" | "quiz";
      title: string;
      subtitle: string;
      at: string;
    };

    const timeline: TimelineItem[] = [
      ...recentWatch.map((row, i) => ({
        id: `watch-${i}-${row.lastWatchedAt.toISOString()}`,
        type: "watch" as const,
        title: row.lesson.title,
        subtitle: `مشاهدة في ${row.subject.title}`,
        at: row.lastWatchedAt.toISOString(),
      })),
      ...recentProgress.map((row, i) => ({
        id: `lesson-${i}-${row.completedAt.toISOString()}`,
        type: "lesson" as const,
        title: row.lesson.title,
        subtitle: `إتمام درس في ${row.subject.title}`,
        at: row.completedAt.toISOString(),
      })),
      ...recentSubmissions.map((row, i) => ({
        id: `exam-${i}-${row.createdAt.toISOString()}`,
        type: "quiz" as const,
        title: row.exam.title,
        subtitle:
          row.score != null
            ? `نتيجة رسمية ${row.score} في ${row.exam.subject.title}`
            : `تسليم اختبار في ${row.exam.subject.title}`,
        at: row.createdAt.toISOString(),
      })),
      ...recentQuizAttempts.map((row, i) => ({
        id: `quiz-${i}-${row.createdAt.toISOString()}`,
        type: "quiz" as const,
        title: row.exam?.title || row.subject?.title || "اختبار رسمي",
        subtitle: `نتيجة ${row.score} من ${row.maxScore}`,
        at: row.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5);

    const parentSummary = {
      watchHours: watchTime.hours,
      watchMinutes: watchTime.minutes,
      completedLessons: completedLessonsTotal,
      averageQuizScore,
      efficiencyNote:
        watchTime.totalSeconds > 0 && averageQuizScore != null
          ? "مقارنة بين وقت المشاهدة ونتائج الاختبارات الرسمية"
          : "بانتظار مزيد من النشاط الدراسي الرسمي",
    };

    const hasAnyData =
      watchTime.totalSeconds > 0 ||
      completedLessonsTotal > 0 ||
      officialScores.length > 0 ||
      timeline.length > 0;

    return NextResponse.json({
      ok: true,
      studentId,
      watchTime,
      completedLessonsTotal,
      subjectProgress,
      averageQuizScore,
      timeline,
      parentSummary,
      hasAnyData,
    });
  } catch (error) {
    console.error("lms-stats error:", error);
    return NextResponse.json({ error: "تعذر تحميل الإحصائيات" }, { status: 500 });
  }
}
