import { Users, Filter, MoreHorizontal, UserPlus, Search } from "lucide-react";

export default function TeacherClassesPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">إدارة الأفواج والطلاب</h2>
          <p className="text-slate-500">تتبع تقدم طلابك وإدارة المجموعات الدراسية.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-slate-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> تصفية
          </button>
          <button className="flex items-center gap-2 bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20">
            <UserPlus className="w-4 h-4" /> إضافة طالب
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ابحث عن طالب، بريد إلكتروني، أو مجموعة..."
              className="w-full bg-white border border-gray-200 rounded-xl pr-11 pl-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20">
               <option>جميع الأفواج</option>
               <option>السنة الرابعة - فوج أ</option>
               <option>السنة الرابعة - فوج ب</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-500 font-bold text-sm">
                <th className="p-5 font-bold">اسم الطالب</th>
                <th className="p-5 font-bold">المستوى / الفوج</th>
                <th className="p-5 font-bold">نسبة الحضور</th>
                <th className="p-5 font-bold">التقدم في الدروس</th>
                <th className="p-5 font-bold">التقييم</th>
                <th className="p-5 font-bold w-16"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "محمد الأمين دقيش", group: "فوج أ - رابعة متوسط", attendance: "98%", progress: 85, grade: "ممتاز" },
                { name: "ياسين ب.", group: "فوج أ - رابعة متوسط", attendance: "92%", progress: 70, grade: "جيد جداً" },
                { name: "فاطمة الزهراء ع.", group: "فوج ب - رابعة متوسط", attendance: "100%", progress: 95, grade: "ممتاز" },
                { name: "عبد النور س.", group: "فوج ب - رابعة متوسط", attendance: "75%", progress: 40, grade: "يحتاج متابعة", warn: true },
                { name: "أحمد ر.", group: "فوج أ - رابعة متوسط", attendance: "88%", progress: 65, grade: "جيد" },
              ].map((student, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6D28D9]/10 flex items-center justify-center text-[#6D28D9] font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-semibold text-gray-600">
                    {student.group}
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                       {student.attendance}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.warn ? 'bg-red-500' : 'bg-[#6D28D9]'}`} 
                          style={{ width: `${student.progress}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500 w-8">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                      student.warn ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#6D28D9]/10 text-[#6D28D9]'
                    }`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button className="p-2 text-gray-400 hover:text-[#6D28D9] hover:bg-[#6D28D9]/10 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white text-sm font-medium text-gray-500">
          <span>يعرض 5 من أصل 42 طالب</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">السابق</button>
            <button className="px-3 py-1.5 bg-[#6D28D9] text-white rounded-lg shadow-sm">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">3</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
}
