"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ElementType } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle,
  FileText,
  Video,
  AlertTriangle,
  Trophy,
  Users,
  Key,
  LogOut,
  Settings,
  Bot,
  Wallet,
  Bell,
  Activity,
  Map,
  Library,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  X,
  Swords,
  BellRing,
  Star,
  UserMinus,
  Lightbulb,
  CreditCard,
  GraduationCap,
  UserCircle,
  Sprout,
  Layers,
  Target,
  Languages,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Role } from "@/generated/prisma";
import { getUserSessionProfile } from "@/actions/user";
import { logoutUser } from "@/actions/auth";

const STUDENT_LINKS: { name: string; href: string; icon: ElementType }[] = [
  { name: "الرئيسية", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "لوحة الحصيلة الدراسية", href: "/dashboard/student/analytics", icon: Activity },
  { name: "طلب بطاقة الاشتراك", href: "/dashboard/student/subscription-request", icon: CreditCard },
  { name: "موادي", href: "/dashboard/student/subjects", icon: BookOpen },
  { name: "خريطتي الذكية", href: "/dashboard/student/roadmap", icon: Map },
  { name: "دردشة القسم", href: "/dashboard/student/forums", icon: MessageSquare },
  { name: "بطاقات المراجعة", href: "/dashboard/student/review-cards", icon: Library },
  { name: "بطاقات الحفظ السريع", href: "/dashboard/student/flashcards", icon: Layers },
  { name: "تحدي اليوم", href: "/dashboard/student/quest", icon: Target },
  { name: "تماريني اليومية", href: "/dashboard/student/exercises", icon: CheckCircle },
  { name: "إختبارات وفروض", href: "/dashboard/student/exams", icon: FileText },
  { name: "مساعدي الذكي", href: "/dashboard/student/ai-assistant", icon: Bot },
  { name: "إشعاراتي", href: "/dashboard/student/notifications", icon: Bell },
  { name: "أخطائي", href: "/dashboard/student/mistakes", icon: AlertTriangle },
  { name: "حصص مباشرة", href: "/dashboard/student/live-classes", icon: Video },
  { name: "الترتيب والنقاط", href: "/dashboard/student/leaderboard", icon: Trophy },
  { name: "منافسة صديق", href: "/dashboard/student/friend-challenge", icon: Swords },
  { name: "100 نصيحة للتفوق", href: "/dashboard/student/tips", icon: Lightbulb },
  { name: "ملفي", href: "/dashboard/student/profile", icon: UserCircle },
  { name: "الإعدادات", href: "/dashboard/student/settings", icon: Settings },
];

const ADMIN_LINKS: { name: string; href: string; icon: ElementType }[] = [
  { name: "الرئيسية", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "تعلّم اللغات", href: "/dashboard/admin/languages", icon: Languages },
  { name: "الأساتذة", href: "/dashboard/admin/teachers", icon: Users },
  { name: "التلاميذ والأولياء", href: "/dashboard/admin/students", icon: GraduationCap },
  { name: "مداخيل الأساتذة", href: "/dashboard/admin/teachers/revenues", icon: Wallet },
  { name: "المواد", href: "/dashboard/admin/subjects", icon: BookOpen },
  { name: "الدروس", href: "/dashboard/admin/lessons", icon: FileText },
  { name: "رموز الدخول", href: "/dashboard/admin/codes", icon: Key },
  { name: "طلبات الاشتراك", href: "/dashboard/admin/subscription-requests", icon: CreditCard },
  { name: "دردشة القسم", href: "/dashboard/admin/forums", icon: MessageSquare },
  { name: "رسائل الأولياء", href: "/dashboard/admin/parent-messages", icon: MessageSquare },
  { name: "آراء التلاميذ حول الدروس", href: "/dashboard/admin/lesson-opinions", icon: Star },
  { name: "تمارين يومية", href: "/dashboard/admin/exercises", icon: CheckCircle },
  { name: "توليد بنك الحفظ والتمارين", href: "/dashboard/admin/seed-content", icon: Sprout },
  { name: "الإختبارات والفروض", href: "/dashboard/admin/exams", icon: FileText },
  { name: "بطاقات المراجعة", href: "/dashboard/admin/review-cards", icon: Library },
  { name: "أخطاء تلاميذي", href: "/dashboard/admin/mistakes", icon: AlertTriangle },
  { name: "مراقبة التلاميذ", href: "/dashboard/admin/students/monitoring", icon: Activity },
  { name: "تنبيهاتي", href: "/dashboard/admin/tenebati", icon: BellRing },
  { name: "إرسال إشعار", href: "/dashboard/admin/notifications", icon: Bell },
  { name: "حصص مباشرة", href: "/dashboard/admin/live-classes", icon: Video },
  { name: "الترتيب والنقاط", href: "/dashboard/admin/leaderboard", icon: Trophy },
];

const LANGUAGES_ADMIN_LINKS: { name: string; href: string; icon: ElementType }[] = [
  { name: "عودة للدراسة", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "رئيسية اللغات", href: "/dashboard/admin/languages", icon: Languages },
  { name: "المواد والنشر", href: "/dashboard/admin/languages/subjects", icon: BookOpen },
  { name: "الدروس", href: "/dashboard/admin/languages/lessons", icon: FileText },
  { name: "التلاميذ", href: "/dashboard/admin/languages/students", icon: GraduationCap },
  { name: "رموز الدخول", href: "/dashboard/admin/languages/codes", icon: Key },
  { name: "طلبات الاشتراك", href: "/dashboard/admin/languages/subscription-requests", icon: CreditCard },
  { name: "دردشة القسم", href: "/dashboard/admin/languages/forums", icon: MessageSquare },
  { name: "آراء التلاميذ", href: "/dashboard/admin/languages/lesson-opinions", icon: Star },
  { name: "تمارين يومية", href: "/dashboard/admin/languages/exercises", icon: CheckCircle },
  { name: "بنك الحفظ والتمارين", href: "/dashboard/admin/languages/seed-content", icon: Sprout },
  { name: "الإختبارات والفروض", href: "/dashboard/admin/languages/exams", icon: FileText },
  { name: "بطاقات المراجعة", href: "/dashboard/admin/languages/review-cards", icon: Library },
  { name: "أخطاء التلاميذ", href: "/dashboard/admin/languages/mistakes", icon: AlertTriangle },
  { name: "مراقبة التلاميذ", href: "/dashboard/admin/languages/students/monitoring", icon: Activity },
  { name: "تنبيهاتي", href: "/dashboard/admin/languages/tenebati", icon: BellRing },
  { name: "إرسال إشعار", href: "/dashboard/admin/languages/notifications", icon: Bell },
  { name: "حصص مباشرة", href: "/dashboard/admin/languages/live-classes", icon: Video },
  { name: "الترتيب والنقاط", href: "/dashboard/admin/languages/leaderboard", icon: Trophy },
  { name: "الأساتذة", href: "/dashboard/admin/languages/teachers", icon: Users },
];

const TEACHER_LINKS: { name: string; href: string; icon: ElementType }[] = [
  { name: "الرئيسية", href: "/dashboard/teacher", icon: LayoutDashboard },
  { name: "حصص مباشرة", href: "/dashboard/teacher/live-classes", icon: Video },
];

const PARENT_LINKS: { name: string; href: string; icon: ElementType }[] = [
  { name: "معلومات أبنائي", href: "/dashboard/parent", icon: Users },
  { name: "متابعة الولي", href: "/dashboard/parent/analytics", icon: Activity },
  { name: "تقدم أبنائي", href: "/dashboard/parent/progress", icon: Activity },
  { name: "النقاط والتقييمات", href: "/dashboard/parent/grades", icon: Star },
  { name: "غيابات أبنائي", href: "/dashboard/parent/absences", icon: UserMinus },
];

export function Sidebar({
  role,
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}: {
  role: Role;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<{
    fullName: string;
    role: Role;
    avatarUrl?: string | null;
    branch?: string | null;
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoadingProfile(true);
      const data = await getUserSessionProfile();
      if (data) setUserData(data);
      setIsLoadingProfile(false);
    }
    fetchProfile();
  }, []);

  const isLanguagesStudent = role === "STUDENT" && userData?.branch === "LANGUAGES";
  const isLanguagesAdmin =
    role === "ADMIN" && pathname.startsWith("/dashboard/admin/languages");

  const studentLinks = STUDENT_LINKS.map((link) => {
    if (link.href === "/dashboard/student/tips") {
      return {
        ...link,
        name: isLanguagesStudent ? "100 نصيحة لتعلّم اللغات" : "100 نصيحة للتفوق",
      };
    }
    if (isLanguagesStudent && link.href === "/dashboard/student") {
      return { ...link, href: "/dashboard/student/subjects", name: "فصلي" };
    }
    if (isLanguagesStudent && link.href === "/dashboard/student/subjects") {
      return { ...link, name: "دفتر الدروس" };
    }
    return link;
  });

  const links =
    role === "ADMIN"
      ? isLanguagesAdmin
        ? LANGUAGES_ADMIN_LINKS
        : ADMIN_LINKS
      : role === "TEACHER"
        ? TEACHER_LINKS
        : role === "PARENT"
          ? PARENT_LINKS
          : studentLinks;

  const getRoleLabel = (r?: Role) => {
    switch (r) {
      case "ADMIN":
        return "المدير";
      case "TEACHER":
        return "أستاذ";
      case "PARENT":
        return "الولي";
      case "STUDENT":
        return "تلميذ";
      default:
        return "";
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-[99] bg-black/50 transition-all duration-300 md:hidden" onClick={onMobileClose} />
      )}

      <aside
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        className={`fixed inset-y-0 right-0 z-[100] flex h-dvh w-[min(80%,24rem)] max-w-sm flex-col bg-[#6D28D9] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="flex min-h-[72px] items-center justify-between border-b border-white/10 p-4">
          <div className={`flex-1 text-center md:text-right ${isCollapsed ? "md:hidden" : ""}`}>
            <h2 className="text-lg font-black leading-tight text-white sm:text-xl">
              منصة دقيش التعليمية
            </h2>
            <p className="mt-0.5 text-[11px] font-bold text-white/60">
              منصة وطنية للتعليم الجزائري
            </p>
          </div>

          <button
            onClick={onToggleCollapse}
            className={`hidden h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white md:flex ${isCollapsed ? "mx-auto" : ""}`}
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {isCollapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>

          <button onClick={onMobileClose} className="rounded-full p-2 text-white/80 hover:bg-white/10 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-4">
          {links.map((link) => {
            const isRootLink =
              link.href === "/dashboard/student" ||
              link.href === "/dashboard/student/subjects" ||
              link.href === "/dashboard/admin" ||
              link.href === "/dashboard/admin/languages" ||
              link.href === "/dashboard/teacher" ||
              link.href === "/dashboard/parent";
            const isActive = isRootLink
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.name : ""}
                onClick={onMobileClose}
                className={`flex items-center justify-start gap-3 overflow-hidden rounded-full px-3 py-2.5 text-sm font-bold transition-all ${
                  isActive ? "bg-white text-[#6D28D9]" : "text-white/80 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "md:justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={`whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-white/10 p-4">
          {isLoadingProfile ? (
            <div className={`mb-4 flex items-center gap-3 px-2 ${isCollapsed ? "md:justify-center md:px-0" : ""}`}>
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/20" />
              <div className={`flex-1 space-y-2 overflow-hidden ${isCollapsed ? "md:hidden" : ""}`}>
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/20" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/15" />
              </div>
            </div>
          ) : userData ? (
            <Link
              href={userData.role === "STUDENT" ? "/dashboard/student/profile" : "#"}
              className={`mb-4 flex items-center gap-3 px-2 ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
            >
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.fullName}
                  className="h-10 w-10 shrink-0 rounded-full border border-white/30 object-cover"
                  title={isCollapsed ? userData.fullName : ""}
                />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#6D28D9]"
                  title={isCollapsed ? userData.fullName : ""}
                >
                  {userData.fullName.charAt(0)}
                </div>
              )}
              <div className={`flex-1 overflow-hidden text-right ${isCollapsed ? "md:hidden" : ""}`}>
                <p className="truncate text-sm font-bold text-white">{userData.fullName}</p>
                <p className="truncate text-[11px] font-bold text-white/55">
                  {userData.role === "STUDENT" ? "ملفي الشخصي" : getRoleLabel(userData.role)}
                </p>
              </div>
            </Link>
          ) : null}

          <div className={`mb-2 ${isCollapsed ? "flex justify-center" : ""}`}>
            <ThemeToggle compact />
          </div>

          <form action={logoutUser}>
            <button
              title={isCollapsed ? "تسجيل الخروج" : ""}
              className={`flex w-full items-center justify-start gap-3 overflow-hidden rounded-full px-3 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 ${
                isCollapsed ? "md:justify-center md:px-0" : ""
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={`whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
