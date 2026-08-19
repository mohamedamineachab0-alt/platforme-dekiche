import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Download, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ExamSubmissionForm } from "@/components/student/ExamSubmissionForm";

export default async function ExamStudyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subject: true
    }
  });

  if (!exam) redirect("/dashboard/student/exams");

  const submission = await prisma.studentSubmission.findFirst({
    where: {
      examId: id,
      studentId: sessionId
    }
  });

  const hasSubmitted = !!submission;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-arabic" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/student/exams" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-700 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة إلى الاختبارات
        </Link>
        <span className="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 px-4 py-1.5 rounded-lg text-sm font-bold">
          {exam.maxScore} نقطة
        </span>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* 1. Exam A4 Image preview */}
        <div className="relative w-full rounded-[1.5rem] p-[3px] bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 shadow-sm mb-8">
          <div className="relative rounded-[1.3rem] overflow-hidden bg-white w-full flex items-center justify-center p-4">
             <img src={exam.a4ImageUrl} alt={exam.title} className="max-w-full h-auto max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
        
        {/* 2. Exam Header */}
        <div className="text-center md:text-right px-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-blue-950 mb-3 tracking-tight">{exam.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-3xl">مادة {exam.subject.title}</p>
        </div>

        {/* 3. Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Right Card (Quiz / Submit) */}
          <div className="bg-white rounded-3xl p-8 border border-sky-200 shadow-sm hover:shadow-md hover:shadow-sky-500/10 transition-all flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-all"></div>
            
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <GraduationCap className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <h3 className="text-xl font-black text-slate-900 mb-2">إرسال الحل</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">قم بإجراء الاختبار الرقمي أو رفع حلك المكتوب بخط اليد</p>
              
              <div className="mt-auto">
                {exam.quiz ? (
                  <Link 
                    href={`/dashboard/student/exams/${exam.id}/quiz`}
                    className="inline-flex w-full items-center justify-center bg-green-600 hover:bg-green-700 text-white font-black py-3.5 rounded-xl font-bold shadow-sm transition-all duration-300"
                  >
                    بدء الاختبار الآن
                  </Link>
                ) : (
                  <ExamSubmissionForm 
                    examId={exam.id}
                    studentId={sessionId}
                    hasSubmitted={hasSubmitted}
                    previousScore={submission?.score}
                    previousFeedback={submission?.feedback}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Left Card (Attachments) */}
          <div className="bg-white rounded-3xl p-8 border border-sky-200 shadow-sm hover:shadow-md transition-all flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all"></div>

            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <FileText className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-slate-900">المرفقات الإضافية</h3>
                {exam.materials.length > 0 && (
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                    {exam.materials.length} ملفات
                  </span>
                )}
              </div>
              
              <p className="text-slate-500 text-sm font-medium mb-6">ملفات، صور، أو ملحقات خاصة بالاختبار</p>
              
              <div className="mt-auto space-y-3">
                {exam.materials.length > 0 ? (
                  exam.materials.map(mat => (
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
