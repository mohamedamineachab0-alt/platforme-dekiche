import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAuth } from "@/lib/security";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Video, Calendar, Link as LinkIcon, Clock } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function StudentLiveClassesPage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      enrollments: true,
      studentProfile: true
    }
  });

  if (!user || !user.studentProfile) redirect("/login");

  const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);

  // Fetch only upcoming or recent live classes for enrolled subjects
  const liveClasses = await prisma.liveClass.findMany({
    where: {
      subjectId: { in: enrolledSubjectIds }
    },
    orderBy: { date: "asc" },
    include: {
      subject: true,
    }
  });

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="حصصي المباشرة"
        description="تابع حصص البث المباشر مع أساتذتك و المراجعات والتطبيقات التفاعلية لجميع المواد المسجل بها"
        icon={Video}
      />

      {liveClasses.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-[28px] border border-[#EDE9FE] shadow-sm">
          <Video className="w-16 h-16 text-[#A8B4D6] mx-auto mb-4" />
          <h3 className="font-black text-xl text-[#1E1B4B]">لا توجد حصص مبرمجة حالياً</h3>
          <p className="text-[#6B6480] font-medium mt-2">ستظهر هنا الحصص الخاصة بالمواد التي سجلت فيها فور برمجتها من طرف أساتذتك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map(liveClass => {
            const levelStr = LEVELS.find(l => l.value === liveClass.subject.level)?.label || liveClass.subject.level;
            const formattedDate = new Date(liveClass.date).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const formattedTime = new Date(liveClass.date).toLocaleString('ar-DZ', { 
              hour: '2-digit', minute: '2-digit'
            });

            const startTime = new Date(liveClass.date);
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration assumed
            const currentTime = new Date();

            let status = 'upcoming';
            if (currentTime >= startTime && currentTime <= endTime) {
              status = 'live';
            } else if (currentTime > endTime) {
              status = 'ended';
            }

            return (
              <div key={liveClass.id} className="bg-white rounded-[28px] shadow-sm border border-[#EDE9FE] p-6 flex flex-col relative overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Video className="w-6 h-6" />
                  </div>
                  {status === 'upcoming' && (
                    <span className="bg-[#EEF1FF] text-[#6D28D9] text-[10px] font-black px-2 py-1 rounded-full border border-[#EDE9FE]">
                      قادمة
                    </span>
                  )}
                  {status === 'live' && (
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-full border border-[#6D28D9]/20 animate-pulse">
                      جارية الآن
                    </span>
                  )}
                  {status === 'ended' && (
                    <span className="bg-slate-50 text-[#6B6480] text-[10px] font-black px-2 py-1 rounded-full border border-slate-200">
                      منتهية
                    </span>
                  )}
                </div>

                <h3 className="font-black text-[#1E1B4B] text-lg mb-2">{liveClass.title}</h3>
                <div className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg inline-block mb-4 border border-slate-200 w-fit">
                  {liveClass.subject.title}
                </div>

                <div className="space-y-3 flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Clock className="w-4 h-4 text-amber-500" />
                    الساعة {formattedTime}
                  </div>
                </div>

                {status !== 'ended' ? (
                  <a 
                    href={liveClass.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-xl font-bold rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    <LinkIcon className="w-4 h-4" />
                    دخول الحصة
                  </a>
                ) : (
                  <div className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl border border-slate-200">
                    الحصة منتهية
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
