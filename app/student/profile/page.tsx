import { prisma } from "../../../lib/prisma";
import { User, Phone, MapPin, GraduationCap, BookOpen, Trophy, Target, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const user = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    include: { wilaya: true }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">حسابي الشخصي</h2>
        <p className="text-slate-500">متابعة إحصائياتك الأكاديمية ومعلوماتك الشخصية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex flex-col items-center mb-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
               <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{user?.name || "طالب"}</h3>
            <span className="text-xs font-bold text-[#6D28D9] bg-[#6D28D9]/10 px-3 py-1 rounded-full mt-2">
              حساب تلميذ
            </span>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">رقم الهاتف</p>
                <p className="text-sm font-bold text-slate-700" dir="ltr">{user?.phone || "غير محدد"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">الولاية</p>
                <p className="text-sm font-bold text-slate-700">{user?.wilaya?.name || "غير محدد"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <GraduationCap className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">المستوى الأكاديمي</p>
                <p className="text-sm font-bold text-slate-700">{user?.level || "غير محدد"}</p>
                {user?.track && <p className="text-xs text-slate-500 mt-0.5">{user.track}</p>}
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-white border-2 border-gray-100 text-slate-600 hover:text-[#6D28D9] hover:border-[#6D28D9]/30 hover:bg-[#6D28D9]/5 font-bold py-3 rounded-2xl transition-all">
            تعديل الملف الشخصي
          </button>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#6D28D9]/10 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-[#6D28D9]" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-1">12</h4>
              <p className="text-xs font-semibold text-gray-500">درس مكتمل</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#6D28D9]/10 flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-[#6D28D9]" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-1">2,450</h4>
              <p className="text-xs font-semibold text-gray-500">نقطة مكتسبة</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full bg-[#6D28D9]/10 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-[#6D28D9]" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-1">85%</h4>
              <p className="text-xs font-semibold text-gray-500">متوسط العلامات</p>
            </div>
          </div>

          {/* Progress Circles */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#6D28D9]" />
              <h3 className="font-bold text-lg text-slate-800">نسب الإنجاز الأكاديمي</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { label: "الرياضيات", percent: 75 },
                { label: "الفيزياء", percent: 45 },
                { label: "العلوم", percent: 90 },
              ].map((course, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-100"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#6D28D9] transition-all duration-1000"
                        strokeDasharray={`${course.percent}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xl font-extrabold text-slate-700">{course.percent}%</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-600">{course.label}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
