import { HeroBanner } from "@/components/shared/HeroBanner";
import {
  Activity,
  AlertTriangle,
  Bell,
  BellRing,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  CreditCard,
  FileText,
  GraduationCap,
  Key,
  Languages,
  LayoutDashboard,
  Library,
  MessageSquare,
  Sprout,
  Star,
  Trophy,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const adminLinks = [
    {
      title: "تعلّم اللغات",
      description: "إدارة فرع اللغات بشكل منفصل",
      href: "/dashboard/admin/languages",
      icon: Languages,
      filled: true,
    },
    {
      title: "الأساتذة",
      description: "تسجيل الأساتذة وتعيين الشعب والمستويات",
      href: "/dashboard/admin/teachers",
      icon: Users,
      filled: false,
    },
    {
      title: "التلاميذ والأولياء",
      description: "متابعة التلاميذ واشتراكاتهم وربط الأولياء",
      href: "/dashboard/admin/students",
      icon: GraduationCap,
      filled: true,
    },
    {
      title: "مداخيل الأساتذة",
      description: "متابعة مداخيل الأساتذة",
      href: "/dashboard/admin/teachers/revenues",
      icon: Wallet,
      filled: false,
    },
    {
      title: "المواد",
      description: "إضافة وتعديل المواد التعليمية",
      href: "/dashboard/admin/subjects",
      icon: BookOpen,
      filled: true,
    },
    {
      title: "الدروس",
      description: "رفع دروس Vimeo والكويزات والملحقات",
      href: "/dashboard/admin/lessons",
      icon: Video,
      filled: false,
    },
    {
      title: "رموز الدخول",
      description: "توليد وتصدير أكواد التفعيل",
      href: "/dashboard/admin/codes",
      icon: Key,
      filled: true,
    },
    {
      title: "طلبات الاشتراك",
      description: "مراجعة طلبات بطاقات الاشتراك",
      href: "/dashboard/admin/subscription-requests",
      icon: CreditCard,
      filled: false,
    },
    {
      title: "دردشة القسم",
      description: "إدارة منتديات الأقسام",
      href: "/dashboard/admin/forums",
      icon: MessageSquare,
      filled: true,
    },
    {
      title: "رسائل الأولياء",
      description: "الرد على استفسارات الأولياء",
      href: "/dashboard/admin/parent-messages",
      icon: MessageSquare,
      filled: false,
    },
    {
      title: "آراء التلاميذ حول الدروس",
      description: "ملاحظات التلاميذ على الدروس",
      href: "/dashboard/admin/lesson-opinions",
      icon: Star,
      filled: true,
    },
    {
      title: "تمارين يومية",
      description: "إضافة تحديات وتمارين يومية",
      href: "/dashboard/admin/exercises",
      icon: CheckCircle,
      filled: false,
    },
    {
      title: "توليد بنك الحفظ والتمارين",
      description: "توليد محتوى الحفظ والتمارين",
      href: "/dashboard/admin/seed-content",
      icon: Sprout,
      filled: true,
    },
    {
      title: "الإختبارات والفروض",
      description: "رفع وتصحيح الاختبارات بالذكاء الاصطناعي",
      href: "/dashboard/admin/exams",
      icon: FileText,
      filled: false,
    },
    {
      title: "بطاقات المراجعة",
      description: "إدارة بطاقات مراجعة الدروس",
      href: "/dashboard/admin/review-cards",
      icon: Library,
      filled: true,
    },
    {
      title: "أخطاء تلاميذي",
      description: "متابعة أخطاء التلاميذ",
      href: "/dashboard/admin/mistakes",
      icon: AlertTriangle,
      filled: false,
    },
    {
      title: "مراقبة التلاميذ",
      description: "نشاط وتقدّم التلاميذ",
      href: "/dashboard/admin/students/monitoring",
      icon: Activity,
      filled: true,
    },
    {
      title: "تنبيهاتي",
      description: "تنبيهات وإشعارات النظام",
      href: "/dashboard/admin/tenebati",
      icon: BellRing,
      filled: false,
    },
    {
      title: "إرسال إشعار",
      description: "إرسال إشعارات للتلاميذ",
      href: "/dashboard/admin/notifications",
      icon: Bell,
      filled: true,
    },
    {
      title: "حصص مباشرة",
      description: "جدولة وبث الحصص المباشرة",
      href: "/dashboard/admin/live-classes",
      icon: Video,
      filled: false,
    },
    {
      title: "الترتيب والنقاط",
      description: "لوحة المتفوقين والنقاط",
      href: "/dashboard/admin/leaderboard",
      icon: Trophy,
      filled: true,
    },
  ];

  return (
    <div className="space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="لوحة تحكم فرع الدراسة"
        description="كل أدوات إدارة الدراسة في مكان واحد"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex h-full flex-col justify-between rounded-[32px] p-6 transition hover:-translate-y-0.5 ${
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
                className={`h-5 w-5 transition group-hover:-translate-x-1 ${
                  link.filled ? "text-white/70" : "text-[#6D28D9]"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-black">{link.title}</h3>
              <p
                className={`mt-2 text-sm font-medium ${
                  link.filled ? "text-white/80" : "text-[#6B6480]"
                }`}
              >
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
