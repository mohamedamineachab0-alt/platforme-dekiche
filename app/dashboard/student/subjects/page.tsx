import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redeemAccessCode } from "@/actions/subjects";
import { Key, Unlock, Lock, PlayCircle, CreditCard, BookOpen } from "lucide-react";
import { LEVELS, STREAMS, subjectAudienceWhere } from "@/lib/constants";
import { languageSubjectsWhere } from "@/lib/language-enrollment";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { IconLessons } from "@/components/landing/PlayIcons";

export default async function StudentSubjectsPage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { studentProfile: true, enrollments: true },
  });

  if (!user || !user.studentProfile) {
    redirect("/login");
  }

  const { level, stream, branch } = user.studentProfile;
  const isLanguages =
    branch === "LANGUAGES" || user.accountBranch === "LANGUAGES";
  const levelLabel = LEVELS.find((l) => l.value === level)?.label || level;
  const streamLabel = STREAMS.find((s) => s.value === stream)?.label || stream;

  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      ...(isLanguages
        ? languageSubjectsWhere()
        : subjectAudienceWhere(level, stream)),
    },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  const enrollments =
    isLanguages
      ? await prisma.enrollment.findMany({ where: { studentId: user.id } })
      : user.enrollments;
  const enrolledSubjectIds = new Set(enrollments.map((e) => e.subjectId));

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title={isLanguages ? "فصلي الدراسي — تعلّم اللغات" : "موادي الدراسية"}
        description={
          isLanguages
            ? "المواد المنشورة من الإدارة تظهر هنا. إذا كانت القائمة فارغة، لم يُنشر محتوى بعد."
            : "تصفح الدروس والتمارين الخاصة بالمواد المقررة لشعبتك مع إمكانية الدخول وتفعيل الاشتراكات"
        }
        iconSlot={<IconLessons size="sm" />}
        action={
          isLanguages ? undefined : (
          <Link
            href="/dashboard/student/subscription-request"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
          >
            <CreditCard className="h-4 w-4" />
            <span>طلب بطاقة اشتراك</span>
          </Link>
          )
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject) => {
          const enrollment = enrollments.find((e) => e.subjectId === subject.id);
          const isExpired = enrollment?.validUntil ? enrollment.validUntil < new Date() : false;
          const isEnrolled = enrolledSubjectIds.has(subject.id) && !isExpired;
          const isFree = !subject.price || subject.price === 0;

          return (
            <div
              key={subject.id}
              className="group flex flex-col overflow-hidden rounded-[28px] border border-[#EDE9FE] bg-white transition hover:border-[#6D28D9]/40 hover:shadow-[0_12px_40px_rgba(109,40,217,0.12)]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[#EEF1FF]">
                {subject.image ? (
                  <img
                    src={subject.image}
                    alt={subject.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#A8B4D6]">
                    <BookOpen className="h-12 w-12 opacity-40" />
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  {isEnrolled || isFree ? (
                    <span className="flex items-center gap-1 rounded-xl bg-emerald-500/90 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
                      <PlayCircle className="h-3 w-3" />{" "}
                      {isLanguages || isEnrolled ? "مسجّلة" : "مجانية"}
                    </span>
                  ) : isExpired ? (
                    <span className="flex items-center gap-1 rounded-xl bg-red-500/90 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
                      <Lock className="h-3 w-3" /> منتهية الصلاحية
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-xl bg-[#6D28D9]/90 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
                      <Lock className="h-3 w-3 text-[#C4B5FD]" /> مغلقة
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <h3 className="line-clamp-1 text-lg font-black text-[#1E1B4B] transition group-hover:text-[#6D28D9]">
                    {subject.title}
                  </h3>
                  {subject.description && (
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-[#6B6480]">
                      {subject.description}
                    </p>
                  )}
                  {subject.teacherName && (
                    <span className="inline-block rounded-lg bg-[#EEF1FF] px-2.5 py-1 text-xs font-bold text-[#6D28D9]">
                      {subject.teacherName}
                    </span>
                  )}
                </div>

                <div className="border-t border-[#EDE9FE] pt-2">
                  {isEnrolled || isFree ? (
                    <Link
                      href={`/dashboard/student/subjects/${subject.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6D28D9] py-3 font-bold text-white transition hover:bg-[#1E1B4B]"
                    >
                      <PlayCircle className="h-5 w-5" />
                      <span>الدخول للمادة</span>
                    </Link>
                  ) : (
                    <form action={redeemAccessCode} className="space-y-2.5">
                      <input type="hidden" name="subjectId" value={subject.id} />
                      <div className="relative">
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[#9B95B3]">
                          <Key className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          name="code"
                          placeholder="أدخل كود الاشتراك"
                          required
                          className="w-full rounded-xl border border-[#EDE9FE] bg-[#F7F5FF] py-2.5 pr-10 pl-3 font-mono text-xs font-bold text-[#1E1B4B] outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#6D28D9] py-2.5 text-xs font-bold text-white transition hover:bg-[#1E1B4B]"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        <span>تفعيل المادة</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="col-span-full space-y-3 rounded-[28px] border border-[#EDE9FE] bg-white p-8 py-20 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#A8B4D6]" />
            <h3 className="text-lg font-black text-[#1E1B4B]">لا توجد مواد منشورة حالياً</h3>
            <p className="mx-auto max-w-md text-sm font-medium text-[#6B6480]">
              لم يتم العثور على مواد منشورة متوافقة مع شعبتك ({streamLabel}) ومستواك الدراسي ({levelLabel})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
