import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { BookOpen, Plus, Image as ImageIcon } from "lucide-react";
import { createSubject, deleteSubject } from "@/actions/subjects";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SubjectCreationClient } from "@/components/admin/SubjectCreationClient";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "desc" },
    include: { teacher: true },
  });

  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      <HeroBanner 
        title="إدارة المواد التعليمية"
        description="قم بإضافة مواد جديدة و تحديد الأساتذة و وتسعير الاشتراكات الخاصة بها"
        icon={BookOpen}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <SubjectCreationClient 
            teachers={teachers.map(t => ({ id: t.id, name: t.name }))} 
            action={createSubject}
          />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map(subject => (
              <div key={subject.id} className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="aspect-[16/9] w-full relative bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-50">
                  {subject.image ? (
                    <img src={subject.image} alt={subject.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-sky-600 shadow-sm border border-white/20">
                      {subject.price === 0 ? "مجاناً" : `${subject.price} دج`}
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2 transition-opacity">
                    <Link href={`/dashboard/admin/subjects/${subject.id}/edit`} className="bg-white/95 hover:bg-white p-2 rounded-lg text-slate-700 shadow-sm transition-colors" title="تعديل">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={deleteSubject.bind(null, subject.id)}>
                      <button type="submit" className="bg-red-500/95 hover:bg-red-500 p-2 rounded-lg text-white shadow-sm transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-slate-800 text-lg line-clamp-1 mb-2">{subject.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">{subject.description}</p>
                  
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg">
                      {subject.teacherName}
                    </span>
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg">
                      {subject.accessType === "YEARLY" ? "سنوي" : "شهري"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">لا توجد مواد تعليمية منشورة بعد</p>
                <p className="text-slate-400 text-sm mt-1">قم بإضافة مادة جديدة من النموذج</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
