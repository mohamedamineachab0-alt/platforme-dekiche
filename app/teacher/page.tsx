"use client";

import { Lightbulb, CheckCircle2 } from "lucide-react";

const TEACHER_TIPS = [
  { id: 1, title: "التخطيط الاستباقي", desc: "إعداد المحتوى التعليمي مسبقاً وقبل موعد الحصة لضمان سير الدرس بسلاسة." },
  { id: 2, title: "تحديد الأهداف", desc: "صياغة أهداف تعليمية واضحة وقابلة للقياس لكل درس." },
  { id: 3, title: "التفاعل النشط", desc: "تشجيع الطلاب على طرح الأسئلة والمشاركة الفعالة طوال الجلسة." },
  { id: 4, title: "التنويع البيداغوجي", desc: "استخدام وسائل إيضاح متنوعة تناسب مختلف أنماط التعلم لدى الطلاب." },
  { id: 5, title: "التقييم المستمر", desc: "إجراء اختبارات قصيرة متكررة لقياس استيعاب الطلاب للدروس." },
  { id: 6, title: "المتابعة الفردية", desc: "إيلاء اهتمام خاص بالطلاب المتعثرين وتقديم دعم إضافي لهم." },
  { id: 7, title: "إدارة الوقت", desc: "الالتزام بالوقت المخصص لكل محور في الحصة التعليمية." },
  { id: 8, title: "تحفيز الإيجابية", desc: "مكافأة التميز والجهد المبذول لرفع معنويات الطلاب باستمرار." },
  { id: 9, title: "التواصل مع الأولياء", desc: "إطلاع أولياء الأمور دورياً على تقدم مستويات أبنائهم عبر المنصة." },
  { id: 10, title: "تنظيم الواجبات", desc: "إعطاء واجبات منزلية هادفة ومناسبة لحجم المحتوى المدروس." },
  { id: 11, title: "الاستثمار التقني", desc: "الاستفادة القصوى من ميزات المنصة الرقمية في العرض والشرح." },
  { id: 12, title: "خلق بيئة آمنة", desc: "تشجيع بيئة صفية خالية من التوتر ومبنية على الاحترام المتبادل." },
  { id: 13, title: "تلخيص الدروس", desc: "تقديم خلاصة مركزة في نهاية كل حصة لتثبيت المعلومات الأساسية." },
  { id: 14, title: "توجيه الذات", desc: "حث الطلاب على الاعتماد على النفس وتطوير مهارات البحث والتعلم الذاتي." },
  { id: 15, title: "مراجعة الأخطاء", desc: "مناقشة الأخطاء الشائعة في الاختبارات بشكل جماعي للاستفادة منها." },
  { id: 16, title: "المرونة البيداغوجية", desc: "التكيف السريع مع وتيرة استيعاب الطلاب وتعديل خطة الشرح عند الحاجة." },
  { id: 17, title: "التشجيع المستمر", desc: "بناء ثقة الطالب بنفسه من خلال التعزيز اللفظي والمعنوي الإيجابي." },
  { id: 18, title: "تطوير الكفاءة", desc: "الاطلاع الدائم على أحدث الطرق والمناهج التعليمية الحديثة." },
  { id: 19, title: "تنظيم السجلات", desc: "تدوين ملاحظات دقيقة حول حضور وغياب ومستوى كل طالب أولاً بأول." },
  { id: 20, title: "العدالة والشفافية", desc: "التعامل بمساواة وشفافية مطلقة مع جميع الطلاب في التقييم والدرجات." }
];

export default function TeacherRootPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12" dir="rtl">
      {/* Header Section */}
      <div className="mb-10 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] font-bold text-sm mb-4 border border-[#6D28D9]/20">
            <Lightbulb className="w-4 h-4" />
            <span>تطوير مهني مستمر</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 leading-tight">
            نصائح ومنهجية عمل <br className="hidden md:block" /> الأستاذ المحترف
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">
            عشرون نصيحة ذهبية ومنهجية أكاديمية متكاملة لضمان تجربة تعليمية رائدة، تفاعلية، وناجحة لجميع طلابك.
          </p>
        </div>
      </div>

      {/* Grid of Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TEACHER_TIPS.map((tip) => (
          <div 
            key={tip.id} 
            className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-[#6D28D9]/5 hover:border-[#6D28D9]/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
          >
            {/* Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-xl text-slate-300 group-hover:text-[#6D28D9] group-hover:bg-[#6D28D9]/10 transition-colors border border-gray-100 group-hover:border-[#6D28D9]/20 font-mono">
              {tip.id}
            </div>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6D28D9]/10 rounded-xl flex items-center justify-center text-[#6D28D9]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#6D28D9] transition-colors leading-tight pl-10">
              {tip.title}
            </h3>
            
            <p className="text-slate-500 font-medium leading-relaxed text-sm flex-grow">
              {tip.desc}
            </p>
            
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-[#6D28D9] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
          </div>
        ))}
      </div>
    </div>
  );
}
