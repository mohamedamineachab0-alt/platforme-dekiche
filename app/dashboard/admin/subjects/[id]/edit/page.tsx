import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateSubject } from "@/actions/subjects";
import { SubjectEditClient } from "@/components/admin/SubjectEditClient";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function EditSubjectPage({ params }: { params: { id: string } }) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.id },
    include: { teacher: true }
  });

  if (!subject) {
    notFound();
  }

  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-arabic" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/admin/subjects"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800">تعديل المادة</h1>
          <p className="text-sm text-slate-500 font-bold mt-1">تحديث بيانات ومستويات مادة {subject.title}</p>
        </div>
      </div>
      
      <SubjectEditClient 
        subject={subject}
        teachers={teachers.map(t => ({ id: t.id, name: t.name }))} 
        action={updateSubject}
      />
    </div>
  );
}
