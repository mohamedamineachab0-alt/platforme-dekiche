import { Search, UserPlus, Settings, Filter, CheckCircle2, XCircle } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">إدارة المستخدمين</h2>
          <p className="text-slate-500">تحكم كامل في حسابات الطلاب، الأساتذة، وأولياء الأمور.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20">
          <UserPlus className="w-5 h-5" /> مستخدم جديد
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الهاتف، أو الرمز السري..."
              className="w-full bg-white border border-gray-200 rounded-xl pr-11 pl-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 bg-white text-slate-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm shadow-sm">
              <Filter className="w-4 h-4" /> فلاتر
            </button>
            <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 shadow-sm">
               <option>الدور: الجميع</option>
               <option>الطلاب</option>
               <option>الأساتذة</option>
               <option>أولياء الأمور</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-500 font-bold text-sm">
                <th className="p-5">المستخدم</th>
                <th className="p-5">الدور</th>
                <th className="p-5">الهاتف</th>
                <th className="p-5">تاريخ التسجيل</th>
                <th className="p-5">الحالة</th>
                <th className="p-5 w-24 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "محمد الأمين دقيش", role: "طالب", roleColor: "bg-[#6D28D9]/10 text-[#6D28D9]", phone: "0555 12 34 56", date: "12 أكتوبر 2026", active: true },
                { name: "علي دقيش", role: "أستاذ", roleColor: "bg-orange-50 text-orange-600", phone: "0770 99 88 77", date: "01 سبتمبر 2025", active: true },
                { name: "أحمد بن علي", role: "ولي أمر", roleColor: "bg-blue-50 text-blue-600", phone: "0661 22 33 44", date: "15 أكتوبر 2026", active: true },
                { name: "يوسف م.", role: "طالب", roleColor: "bg-[#6D28D9]/10 text-[#6D28D9]", phone: "0554 11 22 33", date: "20 أكتوبر 2026", active: false },
                { name: "سامية غ.", role: "طالب", roleColor: "bg-[#6D28D9]/10 text-[#6D28D9]", phone: "0772 44 55 66", date: "21 أكتوبر 2026", active: true },
              ].map((user, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{user.name}</div>
                  </td>
                  <td className="p-5">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${user.roleColor}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 font-semibold text-slate-600 font-mono" dir="ltr">
                    {user.phone}
                  </td>
                  <td className="p-5 text-sm font-medium text-gray-500">
                    {user.date}
                  </td>
                  <td className="p-5">
                    {user.active ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-max border border-green-100">
                        <CheckCircle2 className="w-3.5 h-3.5" /> نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg w-max border border-red-100">
                        <XCircle className="w-3.5 h-3.5" /> محظور
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <button className="p-2 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white text-sm font-medium text-gray-500">
          <span>يعرض 5 من أصل 1,250 مستخدم</span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold">السابق</button>
            <button className="px-4 py-2 bg-[#6D28D9] text-white rounded-xl shadow-sm font-bold">1</button>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold">2</button>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold">3</button>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
}
