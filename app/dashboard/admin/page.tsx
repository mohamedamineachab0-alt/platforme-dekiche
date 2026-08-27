import { HeroBanner } from "@/components/shared/HeroBanner";
import { Video, Calendar, BellRing, ChevronLeft, BookOpen, Key, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const adminLinks = [
    {
      title: "إدارة المواد",
      description: "إضافة وتعديل المواد التعليمية والأساتذة",
      href: "/dashboard/admin/subjects",
      icon: BookOpen,
      color: "from-sky-500 to-blue-600",
      borderColor: "border-sky-500"
    },
    {
      title: "إدارة الدروس",
      description: "رفع وتصنيف دروس Vimeo وملحقاتها",
      href: "/dashboard/admin/lessons",
      icon: Video,
      color: "from-indigo-500 to-violet-600",
      borderColor: "border-indigo-500"
    },
    {
      title: "أكواد التفعيل",
      description: "توليد وتصدير أكواد التفعيل للطلاب",
      href: "/dashboard/admin/codes",
      icon: Key,
      color: "from-emerald-500 to-teal-600",
      borderColor: "border-emerald-500"
    },
    {
      title: "إدارة الطلاب",
      description: "متابعة تقدم الطلاب واشتراكاتهم",
      href: "/dashboard/admin/students",
      icon: Users,
      color: "from-pink-500 to-rose-600",
      borderColor: "border-pink-500"
    },
    {
      title: "الحصص المباشرة",
      description: "جدولة وبث الحصص للطلاب",
      href: "/dashboard/admin/live-classes",
      icon: Calendar,
      color: "from-orange-500 to-red-600",
      borderColor: "border-orange-500"
    },
    {
      title: "نظام المراقبة",
      description: "تنبيهات وإشعارات النظام",
      href: "/dashboard/admin/tenebati",
      icon: BellRing,
      color: "from-amber-500 to-yellow-600",
      borderColor: "border-amber-500"
    },
  ];

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      
      <HeroBanner 
        title="مرحباً بك في لوحة تحكم الإدارة"
        description="نظرة عامة على نشاط المنصة وتحكم كامل في جميع الأقسام"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link, idx) => (
          <Link key={idx} href={link.href} className={`bg-gradient-to-br ${link.color} rounded-3xl p-6 border ${link.borderColor} shadow-sm flex flex-col justify-between group transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 text-white shadow-inner">
                <link.icon className="w-7 h-7" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-white/90 text-sm font-bold mb-1 opacity-80">{link.description}</p>
              <h3 className="text-2xl font-black text-white">{link.title}</h3>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
