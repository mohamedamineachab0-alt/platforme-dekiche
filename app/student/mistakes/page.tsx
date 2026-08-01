import { Target, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const MOCK_MISTAKES = [
  { id: 1, subject: "الرياضيات", question: "ما هو حل المعادلة 2x + 4 = 10؟", wrongAnswer: "x = 4", correctAnswer: "x = 3", date: "منذ يومين", status: "needs_review" },
  { id: 2, subject: "الفيزياء", question: "ما هي وحدة قياس القوة؟", wrongAnswer: "الجول", correctAnswer: "النيوتن", date: "منذ أسبوع", status: "reviewed" },
  { id: 3, subject: "العلوم", question: "أين يتم تركيب البروتين في الخلية؟", wrongAnswer: "النواة", correctAnswer: "الريبوزومات", date: "منذ أسبوعين", status: "needs_review" },
];

export default function StudentMistakesPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-[#6D28D9]/10 text-[#6D28D9] rounded-2xl">
          <Target className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">أخطائي ومراجعاتي</h2>
          <p className="text-slate-500">تعلم من أخطائك السابقة لتحسين مستواك</p>
        </div>
      </div>

      <div className="space-y-5">
        {MOCK_MISTAKES.map((mistake) => (
          <div key={mistake.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            
            {/* Subtle left accent line for unreviewed items */}
            {mistake.status === 'needs_review' && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6D28D9] rounded-l-3xl" />
            )}

            <div className="flex-1 space-y-4 relative z-10 w-full">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg shadow-sm border border-gray-200">
                  {mistake.subject}
                </span>
                <span className="text-xs font-semibold text-gray-400">{mistake.date}</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-800 leading-tight">{mistake.question}</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full md:w-auto">
                <div className="flex items-center gap-2.5 text-sm font-bold bg-red-50 text-red-600 px-4 py-3 rounded-2xl flex-1 border border-red-100 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>إجابتك: {mistake.wrongAnswer}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-bold bg-green-50 text-green-700 px-4 py-3 rounded-2xl flex-1 border border-green-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>الصحيح: {mistake.correctAnswer}</span>
                </div>
              </div>
            </div>

            <button className={`shrink-0 px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 w-full md:w-auto ${
              mistake.status === 'reviewed' 
                ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed' 
                : 'bg-[#6D28D9] text-white hover:bg-[#5b21b6] shadow-lg shadow-[#6D28D9]/20 hover:-translate-x-1'
            }`}>
              {mistake.status === 'reviewed' ? 'تمت المراجعة' : 'راجع الدرس'}
              {mistake.status !== 'reviewed' && <ArrowRight className="w-5 h-5 rtl:rotate-180" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
