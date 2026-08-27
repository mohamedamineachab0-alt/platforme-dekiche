import { HeroBanner } from "@/components/shared/HeroBanner";
import { Video, Calendar, BellRing, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      
      <HeroBanner 
        title="مرحباً بك في لوحة تحكم المدير"
        description="نظرة عامة على نشاط المنصة"
        icon={Video}
        action={
          <Link href="/dashboard/admin/live" className="bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            إدارة الحصص المباشرة
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/admin/tenebati" className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 border border-amber-600 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 text-white">
              <BellRing className="w-6 h-6" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-white/80 text-sm font-bold mb-1">نظام المراقبة</p>
            <p className="text-xl font-black text-white">تنبيهاتي</p>
          </div>
        </Link>
      </div>

    </div>
  );
}
