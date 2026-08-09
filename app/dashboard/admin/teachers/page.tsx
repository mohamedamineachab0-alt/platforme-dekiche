import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Users, Plus, Phone, BookOpen } from "lucide-react";
import { createTeacher } from "@/actions/admin";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      subjects: true,
    }
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إدارة الأساتذة"
        description="تسجيل أساتذة جدد وتعيين مستويات وشعب التدريس الخاصة بهم"
        icon={Users}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-600" />
              إضافة أستاذ جديد
            </h2>
            
            <form action={async (formData) => { "use server"; await createTeacher(formData); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                <input type="text" name="fullName" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="مثال: الأستاذ كمال" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">رقم الهاتف (للدخول)</label>
                <input type="tel" name="phoneNumber" required dir="ltr" className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="05XXXXXXXX" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
                <input type="password" name="password" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="6 أحرف على الأقل" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المستويات الدراسية الموكلة</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEVELS.map(l => (
                    <label key={l.value} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" name="levels" value={l.value} className="accent-sky-600" />
                      <span className="text-xs font-bold text-slate-700">{l.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الشعب الموكلة</label>
                <div className="grid grid-cols-2 gap-2">
                  {STREAMS.map(s => (
                    <label key={s.value} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" name="streams" value={s.value} className="accent-sky-600" />
                      <span className="text-xs font-bold text-slate-700">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">المواد المسندة</label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-2">
                  {subjects.length === 0 && <span className="text-xs text-slate-400">لا توجد مواد بعد</span>}
                  {subjects.map(subj => (
                    <label key={subj.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" name="subjectIds" value={subj.id} className="accent-sky-600" />
                      <span className="text-xs font-bold text-slate-700">{subj.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black font-bold py-3 rounded-xl transition-colors mt-2">
                <Users className="w-4 h-4" />
                إنشاء حساب الأستاذ
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teachers.map(teacher => (
              <div key={teacher.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-black text-xl shrink-0">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{teacher.name}</h3>
                    <p className="text-sm text-slate-500 font-mono flex items-center gap-1 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {teacher.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-2 flex-1">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">المستويات:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.levels.map(l => (
                        <span key={l} className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {LEVELS.find(lvl => lvl.value === l)?.label || l}
                        </span>
                      ))}
                      {teacher.levels.length === 0 && <span className="text-xs text-slate-400">-</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">الشعب:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.streams.map(s => (
                        <span key={s} className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {STREAMS.find(st => st.value === s)?.label || s}
                        </span>
                      ))}
                      {teacher.streams.length === 0 && <span className="text-xs text-slate-400">-</span>}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  {teacher.subjects.length} مواد مسندة
                </div>
              </div>
            ))}
            {teachers.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                لا يوجد أساتذة مضافين بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
