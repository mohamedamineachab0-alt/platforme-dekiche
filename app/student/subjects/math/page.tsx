import { Calculator, LineChart, Shapes, PlayCircle, Download, CheckCircle2, CircleDashed } from "lucide-react";

const MODULES = [
  {
    id: "module-1",
    title: "أولاً: أنشطة العددية (Arithmetic & Algebra)",
    icon: Calculator,
    lessons: [
      { id: 1, title: "قاسم عدد طبيعي، القاسم المشترك الأكبر (PGCD)", isCompleted: true },
      { id: 2, title: "الكسور غير القابلة للاختزال", isCompleted: true },
      { id: 3, title: "الحساب على الجذور التربيعية", isCompleted: false },
      { id: 4, title: "نشر وتبسيط عبارة جبرية، المعادلات من الدرجة الأولى بمجهول واحد", isCompleted: false },
      { id: 5, title: "المتراجحات من الدرجة الأولى بمجهول واحد، جمل معادلتين خطيتين", isCompleted: false },
    ]
  },
  {
    id: "module-2",
    title: "ثانياً: الدوال (Functions)",
    icon: LineChart,
    lessons: [
      { id: 6, title: "مفهوم دالة، الدالة التالفية، والدالة الخطية", isCompleted: false },
      { id: 7, title: "قراءة بيانية لخصائص الدوال", isCompleted: false },
    ]
  },
  {
    id: "module-3",
    title: "ثالثاً: الهندسة (Geometry)",
    icon: Shapes,
    lessons: [
      { id: 8, title: "طاليس في المثلث، نظرية فيثاغورس", isCompleted: false },
      { id: 9, title: "الحساب المثلثي في المثلث القائم (الجيب، تمام الجيب، الظل)", isCompleted: false },
      { id: 10, title: "المعلم في المستوي (إحداثيات نقطة، إحداثيات شعاع، المسافة بين نقطتين)", isCompleted: false },
      { id: 11, title: "الدوران والزوايا، الانسحاب", isCompleted: false },
    ]
  }
];

export default function MathLessonsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12" dir="rtl">
      
      {/* HEADER & OVERVIEW */}
      <div className="mb-10 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="w-20 h-20 bg-[#6D28D9]/10 rounded-2xl flex items-center justify-center shrink-0 border border-[#6D28D9]/20 shadow-sm z-10">
          <Calculator className="w-10 h-10 text-[#6D28D9]" />
        </div>
        <div className="z-10 text-center md:text-right">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">مادة الرياضيات - السنة الرابعة متوسط</h1>
          <p className="text-slate-600 font-medium">أستاذ المادة: الأستاذ دقيش علي | دروس مفصلة، أمثلة تطبيقية، وتمارين شاملة (تحضير BEM)</p>
        </div>
      </div>

      {/* LESSONS MODULES */}
      <div className="space-y-12">
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.id} className="space-y-6">
              
              <div className="flex items-center gap-3 px-2">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                  <Icon className="w-6 h-6 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{module.title}</h2>
              </div>

              <div className="space-y-4">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-white rounded-3xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {lesson.isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                             <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                             <CircleDashed className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${lesson.isCompleted ? 'text-slate-700' : 'text-slate-800'} mb-1 leading-relaxed`}>
                          {lesson.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-400">
                          {lesson.isCompleted ? "اكتملت مراجعة هذا الدرس" : "لم يتم إنجاز هذا الدرس بعد"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
                      <button className="flex items-center gap-2 bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20 text-sm">
                        <PlayCircle className="w-4 h-4" /> شاهد الدرس
                      </button>
                      
                      <button className="flex items-center gap-2 bg-gray-50 text-slate-700 border border-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 hover:text-slate-900 transition-colors shadow-sm text-sm">
                        <Download className="w-4 h-4" /> تحميل الملخص PDF
                      </button>
                      
                      {!lesson.isCompleted && (
                        <button className="flex items-center gap-2 bg-white text-green-600 border border-green-200 px-4 py-2.5 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-sm text-sm">
                          <CheckCircle2 className="w-4 h-4" /> تم الإنجاز
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
