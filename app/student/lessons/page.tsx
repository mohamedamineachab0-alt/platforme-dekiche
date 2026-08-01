import { BookOpen, UserCircle2, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";

const MOCK_SUBJECTS = [
  { id: 1, name: "الرياضيات", description: "الجبر، الهندسة، والدوال", teacher: "الأستاذ دقيش علي", color: "text-purple-600", bg: "bg-purple-50", lessonsCount: 24, hours: 32 },
  { id: 2, name: "الفيزياء", description: "الميكانيك والكهرباء", teacher: "الأستاذ دقيش علي", color: "text-indigo-600", bg: "bg-indigo-50", lessonsCount: 18, hours: 24 },
  { id: 3, name: "العلوم الطبيعية", description: "الخلية والـ DNA", teacher: "الأستاذ دقيش علي", color: "text-emerald-600", bg: "bg-emerald-50", lessonsCount: 20, hours: 26 },
  { id: 4, name: "اللغة العربية", description: "الأدب والقواعد", teacher: "الأستاذ دقيش علي", color: "text-amber-600", bg: "bg-amber-50", lessonsCount: 30, hours: 40 },
];

export default function StudentLessonsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">الدروس والمواد</h2>
        <p className="text-slate-500">تابع دروسك المسجلة مع أفضل الأساتذة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_SUBJECTS.map((subject) => (
          <Link href={`/student/lessons/${subject.id}`} key={subject.id}>
            <div className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-8 flex flex-col relative overflow-hidden border border-gray-100 cursor-pointer hover:-translate-y-1 h-full">
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${subject.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm border border-white`}>
                  <BookOpen className={`w-8 h-8 ${subject.color}`} strokeWidth={2} />
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                     <PlayCircle className="w-4 h-4 text-slate-400" />
                     {subject.lessonsCount} درس
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                     <Clock className="w-4 h-4 text-slate-400" />
                     {subject.hours} ساعة
                   </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2 relative z-10">{subject.name}</h3>
              <p className="text-sm font-medium text-gray-500 mb-8 flex-grow relative z-10">{subject.description}</p>
              
              <div className="mt-auto pt-5 border-t border-gray-50 flex items-center gap-3 relative z-10">
                <div className="p-1.5 bg-[#6D28D9]/10 rounded-full">
                  <UserCircle2 className="w-5 h-5 text-[#6D28D9]" />
                </div>
                <span className="text-sm font-bold text-[#6D28D9]">
                  {subject.teacher}
                </span>
              </div>
              
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#6D28D9]/5 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
