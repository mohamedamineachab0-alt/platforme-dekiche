import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Download, FileText, CheckCircle2, UploadCloud } from "lucide-react";
import Link from "next/link";

export default async function ExerciseStudyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const exercise = await prisma.dailyExercise.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subject: true
    }
  });

  if (!exercise) redirect("/dashboard/student/exercises");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-arabic" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/student/exercises" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-700 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة إلى التمارين اليومية
        </Link>
        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-1.5 rounded-lg text-sm font-bold">
          {exercise.maxScore} نقطة
        </span>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* 1. Exercise A4 Image preview */}
        <div className="relative w-full rounded-[1.5rem] p-[3px] bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 shadow-sm mb-8">
          <div className="relative rounded-[1.3rem] overflow-hidden bg-white w-full flex items-center justify-center p-4">
             <img src={exercise.a4ImageUrl} alt={exercise.title} className="max-w-full h-auto max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
        
        {/* 2. Exercise Header */}
        <div className="text-center md:text-right px-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-blue-950 mb-3 tracking-tight">{exercise.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-3xl">مادة {exercise.subject.title}</p>
        </div>

        {/* 3. Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Right Card (Quiz / Submit) */}
          <div className="bg-white rounded-3xl p-8 border border-sky-200 shadow-sm hover:shadow-md hover:shadow-sky-500/10 transition-all flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all"></div>
            
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <h3 className="text-xl font-black text-slate-900 mb-2">إرسال الحل</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">قم بإجراء الاختبار الرقمي أو رفع حلك ليتم تقييمه</p>
              
              <div className="mt-auto">
                {exercise.quiz ? (
                  <Link 
                    href={`/dashboard/student/exercises/${exercise.id}/quiz`}
                    className="inline-flex w-full items-center justify-center bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3.5 rounded-xl font-bold shadow-sm transition-all duration-300"
                  >
                    بدء التمرين الآن
                  </Link>
                ) : (
                  <button className="flex w-full items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-3.5 rounded-xl transition-colors shadow-sm">
                    <UploadCloud className="w-5 h-5" />
                    إرسال الحل اليدوي
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Left Card (Attachments) */}
          <div className="bg-white rounded-3xl p-8 border border-sky-200 shadow-sm hover:shadow-md transition-all flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all"></div>

            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <FileText className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-slate-900">المرفقات الإضافية</h3>
                {exercise.materials.length > 0 && (
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                    {exercise.materials.length} ملفات
                  </span>
                )}
              </div>
              
              <p className="text-slate-500 text-sm font-medium mb-6">ملفات، صور، أو نصوص إضافية تساعدك في حل التمرين</p>
              
              <div className="mt-auto space-y-3">
                {exercise.materials.length > 0 ? (
                  exercise.materials.map(mat => (
                    <div key={mat.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="font-bold text-sm text-slate-700 line-clamp-1 pl-4 flex-1">
                        {mat.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <a 
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        >
                          عرض
                        </a>
                        <a 
                          href={`${mat.fileUrl}?download=`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 bg-sky-50 text-sky-700 hover:bg-sky-100 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تحميل
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center bg-slate-50 text-slate-400 py-3.5 rounded-xl font-bold border border-slate-100">
                    لا توجد مرفقات إضافية
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
