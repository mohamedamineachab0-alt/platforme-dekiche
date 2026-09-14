import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { languageSubjectsWhere, LANGUAGE_LEVEL, LANGUAGE_STREAM } from "@/lib/language-enrollment";
import { createSubject, deleteSubject } from "@/actions/subjects";
import { toggleLanguageSubjectPublished } from "../actions";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { LanguageSubjectForm } from "../LanguageSubjectForm";
import Link from "next/link";
import { BookOpen, Edit, Eye, EyeOff, Trash2, Image as ImageIcon } from "lucide-react";

export default async function AdminLanguagesSubjectsPage() {
  await assertAuth({ requireRole: "ADMIN" });

  const [subjects, teachers] = await Promise.all([
    prisma.subject.findMany({
      where: languageSubjectsWhere(),
      include: { teacher: true, _count: { select: { lessons: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function createLanguageSubject(formData: FormData) {
    "use server";
    formData.set("adminBranch", "LANGUAGES");
    formData.set("level", LANGUAGE_LEVEL);
    formData.set("stream", LANGUAGE_STREAM);
    formData.set("levels", LANGUAGE_LEVEL);
    formData.set("streams", LANGUAGE_STREAM);
    if (!formData.get("accessType")) formData.set("accessType", "YEARLY");
    if (!formData.get("price")) formData.set("price", "0");
    await createSubject(formData);
  }

  return (
    <div className="space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="مواد تعلّم اللغات"
        description="أنشئ الدورات مع غلاف 1920×1080. تبقى مخفية حتى تنشرها"
        icon={BookOpen}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-[28px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)] lg:col-span-1">
          <h2 className="mb-5 text-lg font-black">إضافة مادة لغات</h2>
          <LanguageSubjectForm
            teachers={teachers.map((t) => ({ id: t.id, name: t.name }))}
            action={createLanguageSubject}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-col overflow-hidden rounded-[28px] border border-[#EDE9FE] bg-white shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
            >
              <div className="relative aspect-video bg-[#F3EFFF]">
                {subject.image && subject.image !== "/placeholder.jpg" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={subject.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-[#C4B5FD]" />
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-black ${
                    subject.isPublished
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-[#6B6480]"
                  }`}
                >
                  {subject.isPublished ? "منشورة" : "مخفية"}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-lg font-black">{subject.title}</h3>
                <p className="line-clamp-2 text-xs font-medium text-[#6B6480]">{subject.description}</p>
                <p className="text-xs font-bold text-[#6D28D9]">
                  {subject._count.lessons} درس · {subject.teacherName}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-[#EDE9FE] pt-3">
                  <form action={toggleLanguageSubjectPublished}>
                    <input type="hidden" name="subjectId" value={subject.id} />
                    <input type="hidden" name="next" value={subject.isPublished ? "false" : "true"} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#6D28D9] px-3 py-2 text-xs font-black text-white"
                    >
                      {subject.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {subject.isPublished ? "إخفاء" : "نشر"}
                    </button>
                  </form>
                  <Link
                    href={`/dashboard/admin/subjects/${subject.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE9FE] bg-white px-3 py-2 text-xs font-black text-[#6D28D9]"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    تعديل
                  </Link>
                  <Link
                    href={`/dashboard/admin/languages/lessons?subjectId=${subject.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE9FE] bg-white px-3 py-2 text-xs font-black text-[#1E1B4B]"
                  >
                    الدروس
                  </Link>
                  <form action={deleteSubject.bind(null, subject.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {subjects.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-[#EDE9FE] bg-white py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-[#C4B5FD]" />
              <p className="mt-4 font-black">لا توجد مواد لغات بعد</p>
              <p className="mt-1 text-sm font-medium text-[#6B6480]">أنشئ أول مادة مع غلاف 1920×1080</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
