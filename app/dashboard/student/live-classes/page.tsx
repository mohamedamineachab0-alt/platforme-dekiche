import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Video, Calendar, Link as LinkIcon, Clock } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function StudentLiveClassesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
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
        gradientClass="bg-gradient-to-r from-amber-500 to-pink-600"
      />

      {liveClasses.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-black text-xl text-slate-800">لا توجد حصص مبرمجة حالياً</h3>
          <p className="text-slate-500 font-medium mt-2">ستظهر هنا الحصص الخاصة بالمواد التي سجلت فيها فور برمجتها من طرف أساتذتك</p>
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
              <div key={liveClass.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Video className="w-6 h-6" />
                  </div>
                  {status === 'upcoming' && (
                    <span className="bg-sky-50 text-sky-600 text-[10px] font-black px-2 py-1 rounded-full border border-sky-100">
                      قادمة
                    </span>
                  )}
                  {status === 'live' && (
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-full border border-amber-100 animate-pulse">
                      جارية الآن
                    </span>
                  )}
                  {status === 'ended' && (
                    <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-full border border-slate-200">
                      منتهية
                    </span>
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-lg mb-2">{liveClass.title}</h3>
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
