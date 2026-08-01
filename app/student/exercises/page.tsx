import { CalendarDays, CheckCircle2, Circle, Trophy } from "lucide-react";

const MOCK_EXERCISES = [
  { id: 1, title: "حل 5 معادلات من الدرجة الثانية", subject: "الرياضيات", points: 50, isCompleted: true },
  { id: 2, title: "مراجعة قوانين نيوتن", subject: "الفيزياء", points: 40, isCompleted: false },
  { id: 3, title: "إعراب جملتين مفيدتين", subject: "اللغة العربية", points: 30, isCompleted: false },
  { id: 4, title: "حفظ 10 مصطلحات علمية", subject: "العلوم الطبيعية", points: 20, isCompleted: false },
];

export default function StudentExercisesPage() {
  const completedCount = MOCK_EXERCISES.filter(e => e.isCompleted).length;
  const progress = (completedCount / MOCK_EXERCISES.length) * 100;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
          <CalendarDays className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">تمارين يومية</h2>
          <p className="text-slate-500">أنجز مهامك اليومية واكسب النقاط</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 mb-8 relative overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
        
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <h3 className="font-extrabold text-slate-800 text-xl mb-1.5">التقدم اليومي</h3>
            <p className="text-sm font-semibold text-gray-500">أنجزت {completedCount} من أصل {MOCK_EXERCISES.length} مهام</p>
          </div>
          <div className="text-4xl font-black text-[#6D28D9]">{progress}%</div>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-4 mb-2 relative z-10 overflow-hidden shadow-inner">
          <div className="bg-[#6D28D9] h-4 rounded-full transition-all duration-1000 shadow-md relative" style={{ width: `${progress}%` }}>
             <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {MOCK_EXERCISES.map((exercise) => (
          <div key={exercise.id} className={`bg-white rounded-3xl p-5 md:p-6 shadow-sm border ${exercise.isCompleted ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200 hover:border-[#6D28D9]/30'} flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden`}>
            
            {exercise.isCompleted && <div className="absolute inset-0 bg-green-50/30 pointer-events-none" />}

            <button className={`shrink-0 transition-colors z-10 ${exercise.isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-[#6D28D9]'}`}>
              {exercise.isCompleted ? (
                <CheckCircle2 className="w-9 h-9 drop-shadow-sm" />
              ) : (
                <Circle className="w-9 h-9" />
              )}
            </button>
            
            <div className="flex-1 z-10">
              <h4 className={`font-bold text-lg mb-1 transition-colors ${exercise.isCompleted ? 'text-gray-400 line-through' : 'text-slate-800 group-hover:text-[#6D28D9]'}`}>
                {exercise.title}
              </h4>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">{exercise.subject}</span>
            </div>
            
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm z-10 shadow-sm border ${exercise.isCompleted ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:scale-105 transition-transform'}`}>
              <Trophy className="w-4 h-4" />
              +{exercise.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
