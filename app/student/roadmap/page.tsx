import { Lightbulb, MapPin, Flag, Circle, CheckCircle2 } from "lucide-react";

const MOCK_ROADMAP = [
  { id: 1, title: "أساسيات الرياضيات", description: "مراجعة شاملة لدروس السنة الثالثة", status: "completed" },
  { id: 2, title: "الدوال الخطية", description: "فهم وتمثيل الدوال بيانياً", status: "current" },
  { id: 3, title: "الميكانيك والسرعة", description: "الدرس الأول في الفيزياء", status: "locked" },
  { id: 4, title: "التقويم الأول", description: "اختبار شامل لتقييم المكتسبات", status: "locked" },
];

export default function StudentRoadmapPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
          <Lightbulb className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">خطتي الذكية</h2>
          <p className="text-slate-500">مسار مخصص لك للوصول إلى التفوق والنجاح</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-md border border-gray-100 relative">
        {/* Vertical Line precisely aligned with markers */}
        <div className="absolute right-[4.5rem] md:right-[5.5rem] top-12 bottom-12 w-0.5 bg-gray-100 z-0 hidden md:block" />
        
        <div className="space-y-8 relative z-10">
          {MOCK_ROADMAP.map((step, index) => (
            <div key={step.id} className="flex flex-col md:flex-row gap-6 relative group items-start">
              {/* Timeline marker */}
              <div className="hidden md:flex flex-col items-center shrink-0 w-12 pt-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-300 ${
                  step.status === 'completed' ? 'bg-green-500 text-white shadow-green-500/20' :
                  step.status === 'current' ? 'bg-[#6D28D9] text-white shadow-[#6D28D9]/30 ring-4 ring-[#6D28D9]/20' :
                  'bg-gray-100 text-gray-300'
                }`}>
                  {step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                   step.status === 'current' ? <MapPin className="w-6 h-6 animate-bounce" /> :
                   <Circle className="w-4 h-4" strokeWidth={3} />}
                </div>
              </div>

              {/* Content Card */}
              <div className={`flex-1 rounded-3xl p-6 md:p-8 transition-all duration-300 ${
                step.status === 'completed' ? 'bg-gray-50/50 border border-gray-100 opacity-80' :
                step.status === 'current' ? 'bg-white border-2 border-[#6D28D9]/20 shadow-xl shadow-[#6D28D9]/5 scale-[1.02]' :
                'bg-white border border-gray-100 opacity-60 hover:opacity-100'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-extrabold text-xl ${step.status === 'current' ? 'text-[#6D28D9]' : 'text-slate-800'}`}>
                    {index + 1}. {step.title}
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-sm ${
                    step.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                    step.status === 'current' ? 'bg-[#6D28D9] text-white border-[#6D28D9]' :
                    'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {step.status === 'completed' ? 'مكتمل' : step.status === 'current' ? 'الآن' : 'مغلق'}
                  </span>
                </div>
                <p className={`text-sm md:text-base font-medium mb-5 ${step.status === 'current' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.description}
                </p>
                
                {step.status === 'current' && (
                  <button className="bg-[#6D28D9] text-white font-bold px-8 py-3 rounded-2xl text-sm hover:bg-[#5b21b6] transition-colors shadow-lg shadow-[#6D28D9]/20 flex items-center justify-center gap-2 w-full sm:w-auto">
                    ابدأ التعلم الآن
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Goal Marker */}
          <div className="flex flex-col md:flex-row gap-6 relative items-start mt-12">
            <div className="hidden md:flex flex-col items-center shrink-0 w-12 pt-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center border-4 border-white shadow-md">
                <Flag className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-1 rounded-3xl p-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-center shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <h3 className="font-black text-orange-700 text-2xl mb-2 relative z-10">شهادة التعليم المتوسط</h3>
              <p className="text-base font-bold text-orange-600/80 relative z-10">هدفك النهائي لنجاح هذا المسار - نحن نؤمن بك!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
