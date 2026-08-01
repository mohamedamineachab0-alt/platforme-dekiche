import { FileText, Download, Play, Clock, CheckCircle } from "lucide-react";

const MOCK_EXAMS = [
  { id: 1, title: "الفرض الأول في الرياضيات", type: "فرض", date: "أكتوبر 2026", duration: "1 ساعة", status: "available" },
  { id: 2, title: "اختبار الفصل الأول في العلوم", type: "اختبار", date: "ديسمبر 2026", duration: "2 ساعة", status: "locked" },
  { id: 3, title: "BEM 2025 - رياضيات", type: "شهادة", date: "جوان 2025", duration: "2 ساعة", status: "completed" },
];

export default function StudentExamsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">اختبارات وفروض</h2>
          <p className="text-slate-500">تدرب على مواضيع سابقة وقيم مستواك الفعلي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EXAMS.map((exam) => (
          <div key={exam.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            
            <div className="flex justify-between items-start mb-6">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-sm ${
                exam.type === 'فرض' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                exam.type === 'اختبار' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                'bg-green-50 text-green-600 border-green-100'
              }`}>
                {exam.type}
              </span>
              
              {exam.status === 'completed' && (
                <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                  <CheckCircle className="w-4 h-4" /> تم الإنجاز
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-800 mb-3 leading-snug">{exam.title}</h3>
            
            <div className="flex items-center gap-5 text-sm font-semibold text-gray-500 mb-8">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" /> {exam.duration}
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <FileText className="w-4 h-4 text-gray-400" /> {exam.date}
              </div>
            </div>
            
            <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
              <button className={`py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                exam.status === 'locked' ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200' :
                'bg-[#6D28D9] text-white hover:bg-[#5b21b6] hover:shadow-md hover:shadow-[#6D28D9]/20'
              }`}>
                <Play className="w-4 h-4" /> ابدأ الآن
              </button>
              
              <button className="py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-gray-50 transition-colors border-2 border-gray-100 hover:border-gray-200">
                <Download className="w-4 h-4" /> PDF تحميل
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
