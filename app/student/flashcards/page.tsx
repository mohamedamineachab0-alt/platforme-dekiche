import { Layers, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";

const MOCK_FLASHCARDS = [
  { id: 1, front: "ما هي عاصمة الجزائر؟", back: "مدينة الجزائر", subject: "الجغرافيا" },
  { id: 2, front: "القوة = الكتلة × ...", back: "التسارع (الجاذبية)", subject: "الفيزياء" },
  { id: 3, front: "متى اندلعت الثورة التحريرية؟", back: "1 نوفمبر 1954", subject: "التاريخ" },
];

export default function StudentFlashcardsPage() {
  const card = MOCK_FLASHCARDS[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto flex flex-col items-center">
      <div className="mb-8 md:mb-10 flex items-center gap-3 w-full">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-sm">
          <Layers className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">بطاقات المراجعة</h2>
          <p className="text-slate-500">طريقة سريعة وفعالة لحفظ المعلومات والمصطلحات</p>
        </div>
      </div>

      <div className="w-full max-w-xl aspect-[4/3] [perspective:1000px] mb-10 group cursor-pointer">
        <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          
          {/* Front */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-[2rem] shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
            <span className="absolute top-6 right-6 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">{card.subject}</span>
            <h3 className="text-3xl font-extrabold text-slate-800 leading-relaxed px-6">{card.front}</h3>
            <div className="absolute bottom-8 flex items-center gap-2 text-gray-400 text-sm font-semibold bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <RotateCcw className="w-4 h-4" /> انقر للقلب
            </div>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-rose-50 to-white rounded-[2rem] shadow-md border border-rose-200 p-8 flex flex-col items-center justify-center text-center">
            <span className="absolute top-6 right-6 text-xs font-bold text-white bg-rose-500 px-3 py-1.5 rounded-lg shadow-sm">الإجابة</span>
            <h3 className="text-4xl font-black text-rose-700 leading-relaxed px-6 drop-shadow-sm">{card.back}</h3>
          </div>
          
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6 w-full max-w-xl">
        <button className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm group">
          <ThumbsDown className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> لم أحفظها
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#6D28D9] border-2 border-[#6D28D9] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#5b21b6] hover:border-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20 group">
          <ThumbsUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> حفظتها
        </button>
      </div>

      <div className="mt-10 text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
        البطاقة 1 من {MOCK_FLASHCARDS.length}
      </div>
      
    </div>
  );
}
