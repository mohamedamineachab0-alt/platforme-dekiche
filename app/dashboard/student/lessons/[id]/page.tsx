import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Download, FileText, CheckCircle2, Lock, PlayCircle, ListVideo } from "lucide-react";
import { UniversalFileViewer } from "@/components/shared/UniversalFileViewer";
import Link from "next/link";

export default async function LessonStudyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subject: true
    }
  });

  if (!lesson) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: lesson.subjectId,
      }
    }
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const isUnlocked = enrollment.enrolledMonths.includes(lesson.month);
  
  const student = await prisma.studentProfile.findUnique({
    where: { userId: sessionId }
  });

  const nextLessonsRaw = await prisma.lesson.findMany({
    where: {
      subjectId: lesson.subjectId,
      isPublished: true,
      createdAt: {
        gt: lesson.createdAt
      }
    },
    orderBy: { createdAt: 'asc' },
    include: { subject: true }
  });

  let nextLessons = nextLessonsRaw;
  if (student) {
    const studentLevel = student.level;
    const studentStream = student.stream;
    nextLessons = nextLessonsRaw.filter(l => {
      const matchesLevel = l.levels.length === 0 || (l.levels as any[]).includes(studentLevel);
      const matchesStream = l.streams.length === 0 || (l.streams as any[]).includes(studentStream);
      return matchesLevel && matchesStream;
    }).slice(0, 4);
  } else {
    nextLessons = nextLessonsRaw.slice(0, 4);
  }
  
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <Lock className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-blue-950">الدرس مغلق</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">هذا الدرس ينتمي إلى الشهر {lesson.month} وهو غير مفعل في اشتراكك الحالي</p>
        </div>
        <Link 
          href={`/dashboard/student/subjects/${lesson.subjectId}`}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
        >
          العودة للمادة
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-arabic" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex justify-between items-center w-full mt-4 px-4">
        <Link 
          href={`/dashboard/student/subjects/${lesson.subjectId}`} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-700 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة إلى دروس المادة
        </Link>
        <span className="bg-sky-100 text-sky-700 dark:bg-slate-950/30 dark:text-sky-400 px-4 py-1.5 rounded-lg text-sm font-bold">
          الشهر {lesson.month}
        </span>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* 1. Full-Width Video Player */}
        <div className="relative w-full rounded-[1.5rem] p-[3px] bg-gradient-to-br from-slate-900 via-sky-400 to-slate-950 shadow-[0_10px_40px_rgba(14,165,233,0.3)] mb-8">
          <div className="relative rounded-[1.3rem] overflow-hidden bg-black/5 backdrop-blur-sm w-full aspect-video flex items-center justify-center">
            <iframe 
              src={`https://player.vimeo.com/video/${lesson.vimeoVideoId}?title=0&byline=0&portrait=0`}
              className="w-full h-full absolute top-0 left-0"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        
        {/* 2. Lesson Header */}
        <div className="text-center md:text-right px-4">
          <h1 className="text-lg md:text-2xl lg:text-3xl leading-snug font-black text-slate-900 dark:text-blue-950 mb-3 tracking-tight">{lesson.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg max-w-3xl leading-relaxed">استمتع بمشاهدة الدرس ولا تتردد في تحميل الملحقات وحل الكويز لاختبار فهمك</p>
        </div>

        {/* 3. Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Right Card (Quiz) */}
          <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm hover:shadow-md hover:shadow-amber-500/10 hover:border-sky-300 dark:hover:border-sky-800/50 hover:shadow-md transition-all flex flex-col items-start relative overflow-hidden group">
            {/* Subtle glow effect on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-500/10 dark:group-hover:bg-sky-500/20 transition-all"></div>
            
            <div className="w-14 h-14 bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <h3 className="text-xl font-black text-slate-900 dark:text-blue-950 mb-2">اختبر معلوماتك</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">قم بإجراء الاختبار لتقييم استيعابك لهذا الدرس ومدى فهمك للمحتوى</p>
              
              <div className="mt-auto">
                {lesson.quiz ? (
                  <Link 
                    href={`/dashboard/student/lessons/${lesson.id}/quiz`}
                    className="inline-flex w-full items-center justify-center bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3.5 rounded-xl font-bold shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.6)] transition-all duration-300"
                  >
                    بدء الاختبار الآن
                  </Link>
                ) : (
                  <div className="w-full text-center bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 py-3.5 rounded-xl font-bold border border-slate-100 dark:border-slate-700">
                    لا يوجد كويز متاح
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Card (Attachments) */}
          <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm hover:shadow-md hover:shadow-amber-500/10 hover:border-sky-300 dark:hover:border-sky-800/50 hover:shadow-md transition-all flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-500/10 dark:group-hover:bg-sky-500/20 transition-all"></div>

            <div className="w-14 h-14 bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <FileText className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-blue-950">ملحقات الدرس</h3>
                {lesson.materials.length > 0 && (
                  <span className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
                    {lesson.materials.length} ملفات
                  </span>
                )}
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">حمل الملفات والملخصات الخاصة بهذا الدرس للمراجعة لاحقاً</p>
              
              <div className="mt-auto space-y-3">
                {lesson.materials.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {lesson.materials.map(mat => (
                      <UniversalFileViewer
                        key={mat.id}
                        title={mat.title}
                        fileUrl={mat.fileUrl}
                        fileType={(mat as any).fileType}
                        variant="compact"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full text-center bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 py-3.5 rounded-xl font-bold border border-slate-100 dark:border-slate-700">
                    لا توجد ملحقات إضافية
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
        
        {/* 4. Up Next Section */}
        {nextLessons.length > 0 && (
          <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6 px-4">
              <ListVideo className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-blue-950">الدروس القادمة</h2>
            </div>
            <div className="flex flex-col gap-4 px-4">
              {nextLessons.map((nextLesson) => (
                <Link
                  href={`/dashboard/student/lessons/${nextLesson.id}`}
                  key={nextLesson.id}
                  className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-sky-200 dark:hover:border-sky-800/50 hover:shadow-md transition-all group"
                >
                  <div className="relative w-32 md:w-40 aspect-video rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={nextLesson.image || nextLesson.subject.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                      alt={nextLesson.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center py-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm md:text-base leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {nextLesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">الشهر {nextLesson.month}</span>
                      <span>•</span>
                      <span>{nextLesson.subject.teacherName}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
