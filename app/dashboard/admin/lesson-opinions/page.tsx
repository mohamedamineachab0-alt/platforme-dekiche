import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MessageSquare, Star } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "آراء التلاميذ حول الدروس",
};

export const dynamic = "force-dynamic";

export default async function AdminLessonOpinionsPage() {
  await assertAuth({ requireRole: "ADMIN" });

  const opinions = await prisma.lessonOpinion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          fullName: true,
          phoneNumber: true,
          studentProfile: {
            select: { level: true, stream: true },
          },
        },
      },
      lesson: {
        select: {
          title: true,
          month: true,
          subject: { select: { title: true, teacherName: true } },
        },
      },
    },
    take: 200,
  });

  return (
    <div className="space-y-8 pb-12" dir="rtl" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>
      <HeroBanner
        title="آراء التلاميذ حول الدروس"
        description="تعليقات وتقييمات التلاميذ على الدروس المنشورة"
        icon={MessageSquare}
      />

      {opinions.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-[#EDE9FE] p-10 text-center shadow-sm">
          <p className="font-black text-xl text-[#1E1B4B]">لا توجد آراء بعد</p>
          <p className="text-[#6B6480] font-medium mt-2">
            ستظهر هنا آراء التلاميذ عندما يقيّمون الدروس
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {opinions.map((op) => (
            <article
              key={op.id}
              className="bg-white rounded-[24px] border border-[#EDE9FE] shadow-sm p-5 md:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#1E1B4B] text-lg">{op.lesson.title}</h3>
                  <p className="text-sm font-medium text-[#6B6480] mt-1">
                    {op.lesson.subject.title} • الشهر {op.lesson.month} • {op.lesson.subject.teacherName}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#F3EFFF] border border-[#6D28D9]/20 rounded-full px-3 py-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < op.rating
                          ? "fill-[#A78BFA] text-[#C4B5FD]"
                          : "text-[#EDE9FE]"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-black text-[#1E1B4B] mr-1">{op.rating}/5</span>
                </div>
              </div>

              <p className="text-[#1E1B4B] font-medium leading-relaxed whitespace-pre-wrap bg-[#F7F5FF] border border-[#EDE9FE] rounded-2xl px-4 py-3">
                {op.comment}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#6B6480]">
                <span>
                  {op.student.fullName}
                  {op.student.studentProfile
                    ? ` • ${op.student.studentProfile.level} / ${op.student.studentProfile.stream}`
                    : ""}
                </span>
                <span>
                  {new Date(op.createdAt).toLocaleString("ar-DZ", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
