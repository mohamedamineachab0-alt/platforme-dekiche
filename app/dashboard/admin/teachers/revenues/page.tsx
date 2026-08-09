import { HeroBanner } from "@/components/shared/HeroBanner";
import { getTeacherRevenues } from "@/actions/admin-financial";
import { ExportTableButton } from "@/components/admin/ExportTableButton";
import { Wallet, BookOpen, Users, TrendingUp } from "lucide-react";

export default async function AdminRevenuesPage() {
  const ledger = await getTeacherRevenues();

  const platformTotalRevenue = ledger.reduce((acc, t) => acc + t.totalGrossRevenue, 0);
  const platformTotalStudents = ledger.reduce((acc, t) => acc + t.totalStudents, 0);

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="إدارة المداخيل ومستحقات الأساتذة"
        description="تتبع شامل لمداخيل الأكاديمية والمستحقات الخاصة بكل أستاذ بناءً على الاشتراكات المفعلة والمواد المسندة"
        icon={Wallet}
        gradientClass="bg-gradient-to-r from-sky-600 to-sky-700"
        action={<ExportTableButton targetId="revenue-table-container" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي المداخيل الإجمالية</p>
            <p className="text-3xl font-black text-sky-600">{platformTotalRevenue.toLocaleString('ar-DZ')} دج</p>
          </div>
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي الاشتراكات المفعلة</p>
            <p className="text-3xl font-black text-slate-900">{platformTotalStudents.toLocaleString('ar-DZ')}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div id="revenue-table-container" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-xl text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-600" />
            سجل الأساتذة المالي
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-black text-slate-700">الأستاذ</th>
                <th className="px-6 py-4 text-sm font-black text-slate-700">المواد</th>
                <th className="px-6 py-4 text-sm font-black text-slate-700">التلاميذ</th>
                <th className="px-6 py-4 text-sm font-black text-slate-700">الدخل الإجمالي (دج)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold">
                    لا توجد بيانات مالية للعرض حالياً
                  </td>
                </tr>
              ) : (
                ledger.map((teacher, index) => (
                  <tr key={teacher.teacherId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">{teacher.teacherName}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1" dir="ltr">{teacher.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600 font-bold text-sm">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {teacher.subjectsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600 font-bold text-sm">
                        <Users className="w-4 h-4 text-slate-400" />
                        {teacher.totalStudents}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-sky-100 text-sky-800 font-black px-3 py-1.5 rounded-lg">
                        {teacher.totalGrossRevenue.toLocaleString('ar-DZ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Watermark/Signature for exported images */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs font-bold px-4">
          <span>تم التوليد تلقائياً من نظام منصة دقيش</span>
          <span dir="ltr">{new Date().toLocaleString('ar-DZ')}</span>
        </div>
      </div>
    </div>
  );
}
