"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlayCircle, Download, CheckCircle2, ChevronRight, FileText, MessageSquare, AlertCircle, HelpCircle, Trophy, XCircle } from "lucide-react";
import Link from "next/link";

const BEM_LESSONS = [
  // Mathematics
  { 
    id: "1", 
    subject: "الرياضيات", 
    title: "الرابعة متوسط (BEM) - الدرس 1: التعرف على قاسم عدد طبيعي ومراجعة القسمة الإقليدية", 
    module: "أنشطة العددية", 
    summary: "القسمة الإقليدية للعدد a على b تعني إيجاد الحاصل q والباقي r بحيث: a = b × q + r (مع شرط r < b). ونقول أن b قاسم لـ a إذا كان الباقي r معدوماً (r = 0).", 
    videoId: "mock1", 
    youtubeId: "YN8UVvdLeM0",
    quiz: [
      {
        id: 1,
        question: "ما هو الباقي في القسمة الإقليدية للعدد 25 على 4؟",
        options: ["1", "2", "3"],
        correctIndex: 0,
        explanation: "لأن 25 = 4 × 6 + 1، إذن الباقي هو 1."
      },
      {
        id: 2,
        question: "في المساواة a = b × q + r، ماذا يمثل الحرف r؟",
        options: ["القاسم", "الحاصل", "الباقي"],
        correctIndex: 2,
        explanation: "يمثل a المقسوم، b القاسم، q الحاصل، و r الباقي."
      },
      {
        id: 3,
        question: "متى نقول عن العدد a أنه يقبل القسمة على b؟",
        options: ["إذا كان الباقي 0", "إذا كان الباقي 1", "إذا كان الحاصل 0"],
        correctIndex: 0,
        explanation: "يكون a يقبل القسمة على b إذا وفقط إذا كان باقي القسمة الإقليدية معدوماً (r = 0)."
      },
      {
        id: 4,
        question: "ما هو حاصل القسمة الإقليدية للعدد 45 على 7؟",
        options: ["5", "6", "7"],
        correctIndex: 1,
        explanation: "لأن 7 × 6 = 42، والباقي 3. إذن الحاصل هو 6."
      },
      {
        id: 5,
        question: "هل يمكن أن يكون الباقي r أكبر من أو يساوي القاسم b؟",
        options: ["نعم دائماً", "لا، يجب أن يكون r < b", "في بعض الأحيان"],
        correctIndex: 1,
        explanation: "شرط القسمة الإقليدية الأساسي هو أن يكون الباقي دائماً أصغر تماماً من القاسم (0 ≤ r < b)."
      }
    ]
  },
  { id: "2", subject: "الرياضيات", title: "الجذور التربيعية", module: "أنشطة العددية", summary: "تبسيط الجذور، العمليات على الجذور (الضرب والقسمة)، وتجذير مقام النسبة.", videoId: "mock2" },
  { id: "3", subject: "الرياضيات", title: "الحساب الحرفي والمعادلات", module: "أنشطة العددية", summary: "النشر والتبسيط، المتطابقات الشهيرة، وحل المعادلات من الدرجة الأولى.", videoId: "mock3" },
  { id: "4", subject: "الرياضيات", title: "المتراجحات من الدرجة الأولى", module: "أنشطة العددية", summary: "حل متراجحة بمجهول واحد وتمثيل حلولها بيانيا على مستقيم مدرج.", videoId: "mock4" },
  { id: "5", subject: "الرياضيات", title: "الدوال الخطية والتالفية", module: "الدوال", summary: "التعرف على الدالة الخطية والتالفية، وحساب الصور والسوابق والتمثيل البياني.", videoId: "mock5" },
  { id: "6", subject: "الرياضيات", title: "المعلم في المستوي", module: "الهندسة", summary: "قراءة إحداثيات نقطة وشعاع، وحساب المسافة بين نقطتين وإحداثيات منتصف قطعة.", videoId: "mock6" },
  { id: "7", subject: "الرياضيات", title: "نظرية طاليس وفيثاغورس", module: "الهندسة", summary: "حساب الأطوال باستعمال نظرية طاليس وفيثاغورس، واستعمال النظريات العكسية لإثبات التوازي أو التعامد.", videoId: "mock7" },
  { id: "8", subject: "الرياضيات", title: "الحساب المثلثي", module: "الهندسة", summary: "حساب جيب تمام زاوية حادة، الجيب والظل في المثلث القائم (Cos, Sin, Tan).", videoId: "mock8" },
  
  // Physics
  { id: "9", subject: "الفيزياء", title: "الشوارد والمحاليل الشاردية", module: "المادة وتحولاتها", summary: "تعريف الشاردة، تمييز المحاليل الشاردية والجزيئية، والتفاعلات الكيميائية.", videoId: "mock9" },
  { id: "10", subject: "الفيزياء", title: "الأمن الكهربائي", module: "الظواهر الكهربائية", summary: "مخاطر التيار الكهربائي، المأخذ الأرضي، المنصهرة، والقاطع التفاضلي.", videoId: "mock10" },
  { id: "11", subject: "الفيزياء", title: "دافعة أرخميدس", module: "الظواهر الميكانيكية", summary: "حساب شدة دافعة أرخميدس، شروط توازن جسم صلب خاضع لقوتين أو أكثر.", videoId: "mock11" },
  { id: "12", subject: "الفيزياء", title: "الظواهر الضوئية", module: "الظواهر الضوئية", summary: "انعكاس وانكسار الضوء، الخيال في المرآة المستوية، وشروط رؤية نقطة من جسم.", videoId: "mock12" },
  { id: "13", subject: "الفيزياء", title: "الحركة والسرعة والقوة", module: "الظواهر الميكانيكية", summary: "مفهوم السرعة، مبدأ العطالة، وتأثير القوة على الحالة الحركية للجسم.", videoId: "mock13" },

  // Natural Sciences
  { id: "14", subject: "العلوم الطبيعية", title: "الانقسام الخلوي", module: "التكاثر", summary: "مراحل الانقسام الخيطي المتساوي ودوره في التجديد الخلوي والنمو.", videoId: "mock14" },
  { id: "15", subject: "العلوم الطبيعية", title: "التنسيق العصبي", module: "الاتصال العصبي", summary: "الجهاز العصبي، الحركة الإرادية واللاإرادية (المنعكس الفطري).", videoId: "mock15" },
  { id: "16", subject: "العلوم الطبيعية", title: "المناعة والاستجابة المناعية", module: "الاستجابة المناعية", summary: "الخطوط الدفاعية للجسم، الاستجابة المناعية النوعية واللانوعية، واللقاحات.", videoId: "mock16" },
  { id: "17", subject: "العلوم الطبيعية", title: "انتقال الصفات الوراثية", module: "الوراثة", summary: "مفهوم الصبغي، النمط النووي، وتحديد الجنس عند الإنسان.", videoId: "mock17" },

  // Arabic
  { id: "18", subject: "اللغة العربية", title: "عطف النسق والبيان", module: "قواعد اللغة", summary: "تعريف عطف النسق وعطف البيان، أدوات العطف ومعانيها وإعرابها.", videoId: "mock18" },
  { id: "19", subject: "اللغة العربية", title: "البدل والاستثناء", module: "قواعد اللغة", summary: "أنواع البدل (مطابق، جزء من كل، اشتمال) وأحكام الاستثناء (بإلا، غير، سوى).", videoId: "mock19" },
  { id: "20", subject: "اللغة العربية", title: "الصور البيانية والمحسنات البديعية", module: "البلاغة", summary: "التشبيه، الاستعارة، الكناية، الطباق، المقابلة، السجع، والجناس.", videoId: "mock20" },
];

export default function LessonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const lesson = BEM_LESSONS.find(l => l.id === id);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Quiz State
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]" dir="rtl">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">الدرس غير موجود</h2>
        <p className="text-slate-500 mt-2">عذراً، لم نتمكن من العثور على الدرس المطلوب.</p>
        <button onClick={() => router.back()} className="mt-6 bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-[#6D28D9]/20">
          العودة للقائمة
        </button>
      </div>
    );
  }

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(answers).length < (lesson.quiz?.length || 0)) {
      alert("الرجاء الإجابة على جميع الأسئلة قبل التسليم.");
      return;
    }
    setIsQuizSubmitted(true);
  };

  const calculateScore = () => {
    if (!lesson.quiz) return 0;
    let score = 0;
    lesson.quiz.forEach(q => {
      if (answers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12" dir="rtl">
      
      {/* Breadcrumb / Nav */}
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <button onClick={() => router.back()} className="hover:text-[#6D28D9] transition-colors flex items-center gap-1">
          <ChevronRight className="w-4 h-4" /> القائمة
        </button>
        <span>/</span>
        <span>{lesson.subject}</span>
        <span>/</span>
        <span className="text-[#6D28D9]">{lesson.title}</span>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Video, Actions & Quiz (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video Player Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative group">
            {lesson.youtubeId ? (
              <div className="w-full aspect-video bg-black relative">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${lesson.youtubeId}`} 
                  title={lesson.title} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
            ) : isPlaying ? (
              <div className="w-full aspect-video bg-slate-900 flex items-center justify-center">
                 <p className="text-white font-bold animate-pulse flex items-center gap-2">
                   <PlayCircle className="w-5 h-5 animate-spin" /> جاري تحميل الفيديو...
                 </p>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 pointer-events-none" />
                
                {/* Mock Thumbnail Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6D28D9 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
                
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="z-20 w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#6D28D9] hover:scale-110 hover:bg-[#6D28D9] hover:text-white transition-all shadow-xl shadow-[#6D28D9]/20"
                >
                  <PlayCircle className="w-10 h-10 ml-1" />
                </button>
                
                <div className="absolute bottom-4 right-6 z-20 text-white">
                  <span className="bg-[#6D28D9] text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">
                    {lesson.module}
                  </span>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{lesson.title}</h3>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4">
             <div className="flex flex-col">
               <h2 className="text-xl font-extrabold text-slate-800">{lesson.title}</h2>
               <p className="text-sm font-semibold text-slate-500 mt-1">المادة: {lesson.subject} • المحور: {lesson.module}</p>
             </div>
             <button 
               onClick={() => setIsCompleted(!isCompleted)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                 isCompleted 
                   ? 'bg-green-50 border-2 border-green-200 text-green-600 shadow-green-500/10' 
                   : 'bg-white border-2 border-gray-200 text-slate-600 hover:border-[#6D28D9]/30 hover:text-[#6D28D9]'
               }`}
             >
               <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} /> 
               {isCompleted ? 'اكتمل الدرس' : 'تحديد كمكتمل'}
             </button>
          </div>

          {/* Interactive Quiz Section */}
          {lesson.quiz && (
            <div className="bg-white rounded-3xl shadow-xl border border-[#6D28D9]/10 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#6D28D9]/10 text-[#6D28D9] rounded-2xl">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">توليد تمرين تفاعلي</h3>
                    <p className="text-sm text-slate-500 font-semibold">اختبر فهمك للدرس واحصل على نقاط إضافية</p>
                  </div>
                </div>
                {isQuizSubmitted && (
                  <div className="flex items-center gap-2 bg-[#6D28D9]/10 text-[#6D28D9] px-4 py-2 rounded-xl font-extrabold">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    النتيجة: {calculateScore()} / {lesson.quiz.length}
                  </div>
                )}
              </div>

              <div className="space-y-8 relative z-10">
                {lesson.quiz.map((q, qIndex) => (
                  <div key={q.id} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="font-bold text-slate-800 mb-4 text-lg">
                      <span className="text-[#6D28D9] ml-1">{qIndex + 1}.</span> {q.question}
                    </h4>
                    
                    <div className="space-y-3">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = answers[q.id] === optIndex;
                        let optionStyle = "border-gray-200 hover:border-[#6D28D9]/30 hover:bg-white text-slate-600 bg-white";
                        let Icon = null;

                        if (isQuizSubmitted) {
                          if (optIndex === q.correctIndex) {
                            optionStyle = "border-green-500 bg-green-50 text-green-700 shadow-sm";
                            Icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                          } else if (isSelected) {
                            optionStyle = "border-red-500 bg-red-50 text-red-700 shadow-sm";
                            Icon = <XCircle className="w-5 h-5 text-red-500" />;
                          } else {
                            optionStyle = "border-gray-200 bg-gray-50/50 text-gray-400 opacity-70";
                          }
                        } else if (isSelected) {
                          optionStyle = "border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] font-bold shadow-sm";
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleOptionSelect(q.id, optIndex)}
                            disabled={isQuizSubmitted}
                            className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between font-semibold ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {Icon}
                          </button>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && (
                      <div className={`mt-4 p-4 rounded-xl text-sm font-semibold border ${answers[q.id] === q.correctIndex ? 'bg-green-50/50 border-green-100 text-green-800' : 'bg-orange-50/50 border-orange-100 text-orange-800'}`}>
                        <span className="font-bold mb-1 block">التصحيح والشرح:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isQuizSubmitted && (
                <button 
                  onClick={handleQuizSubmit}
                  className="w-full mt-8 bg-[#6D28D9] text-white px-6 py-4 rounded-xl font-extrabold text-lg hover:bg-[#5b21b6] transition-all shadow-lg shadow-[#6D28D9]/20"
                >
                  تأكيد الإجابات
                </button>
              )}
            </div>
          )}
          
        </div>

        {/* Right Column: Details & Summary */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
               <FileText className="w-5 h-5 text-[#6D28D9]" /> ملخص الدرس
             </h3>
             <p className="text-[15px] font-medium text-slate-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
               {lesson.summary}
             </p>
             
             <button className="w-full mt-6 flex items-center justify-center gap-2 bg-[#6D28D9] text-white px-5 py-3.5 rounded-xl font-bold hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20">
               <Download className="w-5 h-5" /> تحميل بصيغة PDF
             </button>
          </div>

          {/* Quick AI Help Link */}
          <Link href="/student/ai-tutor" className="block bg-gradient-to-br from-[#6D28D9] to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-[#6D28D9]/20 relative overflow-hidden hover:scale-[1.02] transition-transform">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <h4 className="font-extrabold text-lg flex items-center gap-2 mb-1">
                   <MessageSquare className="w-5 h-5" /> لم تفهم نقطة؟
                 </h4>
                 <p className="text-sm font-medium text-white/80">اسأل الأستاذ الذكي لمزيد من الشرح</p>
               </div>
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                 <ChevronRight className="w-5 h-5 rotate-180" />
               </div>
             </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
