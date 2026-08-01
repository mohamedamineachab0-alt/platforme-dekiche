import { prisma } from "../../../lib/prisma";
import { BookOpen, UserCircle2 } from "lucide-react";
import Link from "next/link";

export default async function StudentSubjectsPage() {
  // Fetch current user's level (using first student as placeholder)
  const user = await prisma.user.findFirst({
    where: { role: "STUDENT" }
  });

  const level = user?.level || "الثانية ثانوي";

  // Fetch subjects matching the level (or all if none specified)
  const subjects = await prisma.subject.findMany({
    where: { level },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">المواد الدراسية</h2>
          <p className="text-slate-500">اختر المادة لتبدأ التعلم في {level}</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد مواد حالياً</h3>
          <p className="text-gray-500">لم يتم إضافة مواد دراسية لهذا المستوى بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link href={`/student/subjects/${subject.id}`} key={subject.id}>
              <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col relative overflow-hidden border border-gray-100 cursor-pointer hover:-translate-y-1 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#6D28D9]/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                    <BookOpen className="w-7 h-7 text-[#6D28D9]" strokeWidth={2} />
                  </div>
                  {/* Floating decorative elements */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#6D28D9]/5 rounded-full -ml-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-1">{subject.name}</h3>
                {subject.description && (
                  <p className="text-sm text-gray-500 mb-6 flex-grow">{subject.description}</p>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    الأستاذ: {subject.teacherName}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
