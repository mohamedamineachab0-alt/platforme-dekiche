import { Share2, Copy, Gift, Users } from "lucide-react";

export default function StudentReferralPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-2xl">
          <Share2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">شارك المنصة</h2>
          <p className="text-slate-500">ادعُ أصدقاءك واكسب هدايا ونقاط إضافية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-r from-[#6D28D9] to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
          
          <Gift className="w-12 h-12 mb-4 text-purple-200 relative z-10" />
          <h3 className="text-2xl font-bold mb-2 relative z-10 leading-snug">شارك رابطك واربح شهراً مجانياً!</h3>
          <p className="text-purple-100 mb-8 max-w-md relative z-10 text-sm leading-relaxed">
            عندما يسجل 5 من أصدقائك عبر رابطك ويشتركون في الباقة، ستحصل أنت وهم على شهر إضافي مجاني للتحضير للشهادة.
          </p>
          
          <div className="flex items-center gap-2 bg-white/20 p-2 rounded-2xl backdrop-blur-sm border border-white/30 relative z-10 shadow-inner">
            <input 
              type="text" 
              readOnly 
              value="https://dekiche.com/invite/amin2026" 
              className="flex-1 bg-transparent border-none text-white font-mono text-sm px-4 focus:outline-none placeholder-white/50"
            />
            <button className="bg-white text-[#6D28D9] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
              <Copy className="w-4 h-4" /> نسخ
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex flex-col justify-center items-center text-center h-full">
          <div className="w-20 h-20 bg-fuchsia-50 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-fuchsia-500" />
          </div>
          <h4 className="font-bold text-slate-800 text-lg mb-2">أصدقاؤك المسجلون</h4>
          <div className="flex items-baseline gap-2 mb-2">
             <span className="text-4xl font-extrabold text-[#6D28D9]">2</span>
             <span className="text-xl font-bold text-gray-300">/ 5</span>
          </div>
          <p className="text-sm text-gray-500 font-semibold mt-auto pt-4 border-t border-gray-50 w-full">باقي 3 أصدقاء للشهر المجاني</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100">
        <h4 className="font-bold text-slate-800 mb-6 text-center lg:text-right">كيف تعمل الدعوة؟</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#6D28D9] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-sm">1</div>
            <p className="text-sm text-slate-700 font-semibold leading-relaxed">انسخ رابط الدعوة الخاص بك وشاركه مع أصدقائك</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#6D28D9] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-sm">2</div>
            <p className="text-sm text-slate-700 font-semibold leading-relaxed">يسجل صديقك باستخدام الرابط ويشترك في الأكاديمية</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#6D28D9] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-sm">3</div>
            <p className="text-sm text-slate-700 font-semibold leading-relaxed">مبروك! تحصلان كليكما على مكافآت ونقاط</p>
          </div>
        </div>
      </div>
    </div>
  );
}
