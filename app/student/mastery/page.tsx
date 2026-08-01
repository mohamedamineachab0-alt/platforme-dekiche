import { Map, Zap, CheckCircle, AlertTriangle } from "lucide-react";

const MOCK_MASTERY = [
  { topic: "الدوال الخطية", subject: "الرياضيات", level: 90, status: "strong" },
  { topic: "القوة والحركة", subject: "الفيزياء", level: 45, status: "weak" },
  { topic: "الجملة العصبية", subject: "العلوم", level: 75, status: "medium" },
  { topic: "المحسنات البديعية", subject: "اللغة العربية", level: 100, status: "strong" },
];

export default function StudentMasteryPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Map className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">خريطة الإتقان</h2>
          <p className="text-slate-500">حدد نقاط قوتك وضعفك وركز على ما يحتاج تحسيناً</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_MASTERY.map((node, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex items-center gap-6 md:gap-8 group hover:shadow-lg transition-shadow">
            
            {/* Circular Progress Perfectly Centered */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    node.status === 'strong' ? 'text-green-500' :
                    node.status === 'medium' ? 'text-yellow-500' :
                    'text-red-500'
                  } transition-all duration-1000 ease-out`}
                  strokeDasharray={`${node.level}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-lg font-black text-slate-700 tracking-tight">{node.level}%</span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-extrabold text-xl text-slate-800 mb-1.5">{node.topic}</h3>
              <p className="text-sm text-gray-500 font-semibold mb-4 bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-100">{node.subject}</p>
              
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
                  node.status === 'strong' ? 'bg-green-50 text-green-700 border-green-100' :
                  node.status === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                  'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {node.status === 'strong' ? <CheckCircle className="w-4 h-4" /> :
                   node.status === 'medium' ? <Zap className="w-4 h-4" /> :
                   <AlertTriangle className="w-4 h-4" />}
                   
                  {node.status === 'strong' ? 'متقن جيداً' :
                   node.status === 'medium' ? 'مستوى متوسط' :
                   'يحتاج مراجعة'}
                </div>
              </div>
            </div>
            
            {node.status === 'weak' && (
              <button className="hidden sm:flex shrink-0 bg-white border-2 border-[#6D28D9]/20 text-[#6D28D9] font-bold px-5 py-2.5 rounded-2xl hover:bg-[#6D28D9] hover:text-white transition-all shadow-sm items-center gap-2 group-hover:-translate-x-1 duration-300">
                راجع الآن
              </button>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}
