import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { languageSubjectsWhere } from "@/lib/language-enrollment";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
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
  Library,
  MessageSquare,
  Sprout,
  Star,
  Trophy,
  Users,
  Video,
} from "lucide-react";

export default async function AdminLanguagesPage() {
  await assertAuth({ requireRole: "ADMIN" });

  const [subjectsCount, studentsCount, lessonsCount, publishedCount] = await Promise.all([
    prisma.subject.count({ where: languageSubjectsWhere() }),
    prisma.studentProfile.count({ where: { branch: "LANGUAGES" } }),
    prisma.lesson.count({ where: { subject: languageSubjectsWhere() } }),
    prisma.subject.count({
      where: { AND: [languageSubjectsWhere(), { isPublished: true }] },
    }),
  ]);

  const cards = [
    {
      title: "المواد والنشر",
      description: "إنشاء مواد اللغات ونشرها أو إخفاؤها",
      href: "/dashboard/admin/languages/subjects",
      icon: BookOpen,
      filled: true,
    },
    {
      title: "الدروس",
      description: "رفع دروس Vimeo والكويزات والملحقات",
      href: "/dashboard/admin/languages/lessons",
      icon: Video,
      filled: false,
    },
    {
      title: "التلاميذ",
      description: "متابعة تلاميذ فرع تعلّم اللغات",
      href: "/dashboard/admin/languages/students",
      icon: Users,
      filled: true,
    },
    {
      title: "رموز الدخول",
      description: "توليد أكواد تفعيل مواد اللغات",
      href: "/dashboard/admin/languages/codes",
      icon: Key,
      filled: false,
    },
    {
      title: "طلبات الاشتراك",
      description: "مراجعة طلبات الاشتراك",
      href: "/dashboard/admin/languages/subscription-requests",
      icon: CreditCard,
      filled: true,
    },
    {
      title: "دردشة القسم",
      description: "منتديات نقاش تلاميذ اللغات",
      href: "/dashboard/admin/languages/forums",
      icon: MessageSquare,
      filled: false,
    },
    {
      title: "آراء التلاميذ",
      description: "ملاحظات التلاميذ حول الدروس",
      href: "/dashboard/admin/languages/lesson-opinions",
      icon: Star,
      filled: true,
    },
    {
      title: "تمارين يومية",
      description: "تحديات وتمارين يومية للغات",
      href: "/dashboard/admin/languages/exercises",
      icon: CheckCircle,
      filled: false,
    },
    {
      title: "بنك الحفظ والتمارين",
      description: "توليد محتوى الحفظ والتمارين",
      href: "/dashboard/admin/languages/seed-content",
      icon: Sprout,
      filled: true,
    },
    {
      title: "الإختبارات والفروض",
      description: "رفع وتصحيح اختبارات اللغات",
      href: "/dashboard/admin/languages/exams",
      icon: FileText,
      filled: false,
    },
    {
      title: "بطاقات المراجعة",
      description: "بطاقات مراجعة دروس اللغات",
      href: "/dashboard/admin/languages/review-cards",
      icon: Library,
      filled: true,
    },
    {
      title: "أخطاء التلاميذ",
      description: "متابعة أخطاء تلاميذ اللغات",
      href: "/dashboard/admin/languages/mistakes",
      icon: AlertTriangle,
      filled: false,
    },
    {
      title: "مراقبة التلاميذ",
      description: "نشاط وتقدّم تلاميذ الفرع",
      href: "/dashboard/admin/languages/students/monitoring",
      icon: Activity,
      filled: true,
    },
    {
      title: "تنبيهاتي",
      description: "تنبيهات النظام",
      href: "/dashboard/admin/languages/tenebati",
      icon: BellRing,
      filled: false,
    },
    {
      title: "إرسال إشعار",
      description: "إشعارات لتلاميذ اللغات",
      href: "/dashboard/admin/languages/notifications",
      icon: Bell,
      filled: true,
    },
    {
      title: "حصص مباشرة",
      description: "جدولة وبث حصص اللغات",
      href: "/dashboard/admin/languages/live-classes",
      icon: Video,
      filled: false,
    },
    {
      title: "الترتيب والنقاط",
      description: "لوحة المتفوقين في اللغات",
      href: "/dashboard/admin/languages/leaderboard",
      icon: Trophy,
      filled: true,
    },
    {
      title: "الأساتذة",
      description: "أساتذة مواد اللغات",
      href: "/dashboard/admin/languages/teachers",
      icon: GraduationCap,
      filled: false,
    },
  ];

  return (
    <div className="space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="لوحة تحكم فرع تعلّم اللغات"
        description="نفس أدوات الدراسة — مفلترة على فرع اللغات. المحتوى مخفي حتى تنشره"
        icon={Languages}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "المواد", value: subjectsCount },
          { label: "منشورة", value: publishedCount },
          { label: "الدروس", value: lessonsCount },
          { label: "التلاميذ", value: studentsCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[24px] border border-[#EDE9FE] bg-white p-5 text-center shadow-[0_10px_28px_rgba(30,27,75,0.05)]"
          >
            <p className="text-3xl font-black text-[#6D28D9]">{stat.value}</p>
            <p className="mt-1 text-xs font-bold text-[#6B6480]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group flex h-full flex-col justify-between rounded-[32px] p-6 transition hover:-translate-y-0.5 ${
              card.filled
                ? "bg-[#6D28D9] text-white shadow-[0_16px_40px_rgba(109,40,217,0.22)]"
                : "bg-white text-[#1E1B4B] shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  card.filled ? "bg-white/15 text-white" : "bg-[#F3EFFF] text-[#6D28D9]"
                }`}
              >
                <card.icon className="h-6 w-6" />
              </span>
              <ChevronLeft
                className={`h-5 w-5 transition group-hover:-translate-x-1 ${
                  card.filled ? "text-white/70" : "text-[#6D28D9]"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-black">{card.title}</h3>
              <p
                className={`mt-2 text-sm font-medium ${
                  card.filled ? "text-white/80" : "text-[#6B6480]"
                }`}
              >
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
