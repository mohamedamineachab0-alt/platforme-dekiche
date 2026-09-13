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
      filled: false,
    },
    {
      title: "إدارة الدروس",
      description: "رفع وتصنيف دروس Vimeo وملحقاتها",
      href: "/dashboard/admin/lessons",
      icon: Video,
      filled: true,
    },
    {
      title: "أكواد التفعيل",
      description: "توليد وتصدير أكواد التفعيل للطلاب",
      href: "/dashboard/admin/codes",
      icon: Key,
      filled: false,
    },
    {
      title: "إدارة الطلاب",
      description: "متابعة تقدم الطلاب واشتراكاتهم",
      href: "/dashboard/admin/students",
      icon: Users,
      filled: true,
    },
    {
      title: "الحصص المباشرة",
      description: "جدولة وبث الحصص للطلاب",
      href: "/dashboard/admin/live-classes",
      icon: Calendar,
      filled: false,
    },
    {
      title: "نظام المراقبة",
      description: "تنبيهات وإشعارات النظام",
      href: "/dashboard/admin/tenebati",
      icon: BellRing,
      filled: true,
    },
  ];

  return (
    <div className="space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="مرحباً بك في لوحة تحكم الإدارة"
        description="نظرة عامة على نشاط المنصة وتحكم كامل في جميع الأقسام"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex h-full flex-col justify-between rounded-[32px] p-6 ${
              link.filled
                ? "bg-[#6D28D9] text-white shadow-[0_16px_40px_rgba(109,40,217,0.22)]"
                : "bg-white text-[#1E1B4B] shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  link.filled ? "bg-white/15 text-white" : "bg-[#F3EFFF] text-[#6D28D9]"
                }`}
              >
                <link.icon className="h-6 w-6" />
              </span>
              <ChevronLeft
                className={`h-5 w-5 transition group-hover:-translate-x-1 ${link.filled ? "text-white/70" : "text-[#6D28D9]"}`}
              />
            </div>
            <div>
              <h3 className="text-xl font-black">{link.title}</h3>
              <p className={`mt-2 text-sm font-medium ${link.filled ? "text-white/80" : "text-[#6B6480]"}`}>
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
