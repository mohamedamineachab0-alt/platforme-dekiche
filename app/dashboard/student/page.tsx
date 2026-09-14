import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ChevronLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { DailyTip } from "@/components/student/DailyTip";
import {
  IconBell,
  IconBot,
  IconCards,
  IconChallenge,
  IconChat,
  IconExam,
  IconLessons,
  IconLive,
  IconMapPin,
  IconMistakes,
  IconQuiz,
  IconTrophy,
} from "@/components/landing/PlayIcons";

export default async function StudentDashboardPage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      studentProfile: true,
      enrollments: true,
      mistakes: true,
    },
  });

  if (!user || !user.studentProfile) redirect("/login");

  if (
    user.studentProfile.branch === "LANGUAGES" ||
    user.accountBranch === "LANGUAGES"
  ) {
    redirect("/dashboard/student/subjects");
  }

  const enrolledSubjectIds = user.enrollments.map((e) => e.subjectId);

  const upcomingLiveClassesCount = await prisma.liveClass.count({
    where: {
      subjectId: { in: enrolledSubjectIds },
      date: { gte: new Date() },
    },
  });

  const mistakesCount = user.mistakes.length;

  const availableSubjectsCount = await prisma.subject.count({
    where: {
      levels: { has: user.studentProfile.level },
      streams: { has: user.studentProfile.stream },
      isPublished: true,
    },
  });

  const SECTIONS = [
    {
      id: "analytics",
      title: "لوحة الحصيلة الدراسية",
      description: "ساعات المشاهدة الفعلية ونسبة التقدم لكل مادة ومتابعة الولي",
      icon: IconTrophy,
      iconBg: "bg-gradient-to-b from-[#CCFBF1] to-[#99F6E4]",
      actionText: "عرض الحصيلة",
      route: "/dashboard/student/analytics",
    },
    {
      id: "subjects",
      title: "موادي",
      description:
        "تصفح الدروس والملحقات والفيديوهات الخاصة بالمواد التي تم تفعيلها وبدء الدراسة",
      icon: IconLessons,
      iconBg: "bg-gradient-to-b from-[#EDE9FE] to-[#DDD6FE]",
      badge: `${availableSubjectsCount} مادة`,
      actionText: "تصفح المواد",
      route: "/dashboard/student/subjects",
    },
    {
      id: "smart-map",
      title: "خريطتي الذكية",
      description: "تتبع مسارك الدراسي ودروسك وإختباراتك ومستواك في كل مادة بخط زمني تفاعلي",
      icon: IconMapPin,
      iconBg: "bg-gradient-to-b from-[#FFE4C4] to-[#FFD0A3]",
      actionText: "عرض الخريطة",
      route: "/dashboard/student/roadmap",
    },
    {
      id: "class-chat",
      title: "دردشة القسم",
      description: "شارك في نقاشات القسم واطرح أسئلتك وتفاعل مع زملائك في مساحة آمنة",
      icon: IconChat,
      iconBg: "bg-gradient-to-b from-[#D6E4FF] to-[#DDD6FE]",
      actionText: "دخول الدردشة",
      route: "/dashboard/student/forums",
    },
    {
      id: "review-cards",
      title: "بطاقات المراجعة",
      description: "راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك",
      icon: IconCards,
      iconBg: "bg-gradient-to-b from-[#EDE4FF] to-[#D4C4FF]",
      actionText: "بدء المراجعة",
      route: "/dashboard/student/review-cards",
    },
    {
      id: "flashcards",
      title: "بطاقات الحفظ السريع",
      description: "احفظ المفاهيم بقلب البطاقة من بنك الدروس الجاهز حسب موادك المفعلة",
      icon: IconCards,
      iconBg: "bg-gradient-to-b from-[#DDD6FE] to-[#C4B5FD]",
      actionText: "بدء الحفظ",
      route: "/dashboard/student/flashcards",
    },
    {
      id: "daily-quest",
      title: "تحدي اليوم",
      description: "تمارين اختيار من متعدد مع تصحيح فوري من بنك الدروس المولد مسبقا",
      icon: IconQuiz,
      iconBg: "bg-gradient-to-b from-[#E0E7FF] to-[#C7D2FE]",
      actionText: "بدء التحدي",
      route: "/dashboard/student/quest",
    },
    {
      id: "daily-exercises",
      title: "تماريني اليومية",
      description: "حل التمارين الجديدة يومياً لرفع رصيدك من النقاط والتصدر في الترتيب عبر منصتنا",
      icon: IconQuiz,
      iconBg: "bg-gradient-to-b from-[#EDE4FF] to-[#C9B6FF]",
      actionText: "بدء التمارين",
      route: "/dashboard/student/exercises",
    },
    {
      id: "exams",
      title: "إختبارات وفروض",
      description: "اختبر مستواك من خلال اختبارات ذكية ومقيمة تلقائياً بدقة واحترافية",
      icon: IconExam,
      iconBg: "bg-gradient-to-b from-[#D6E4FF] to-[#DDD6FE]",
      actionText: "عرض الإختبارات",
      route: "/dashboard/student/exams",
    },
    {
      id: "smart-assistant",
      title: "مساعدي الذكي",
      description: "تحدث مع المساعد الذكي المدعوم بالذكاء الاصطناعي لفهم الدروس وتحليل مستواك",
      icon: IconBot,
      iconBg: "bg-gradient-to-b from-[#EDE4FF] to-[#C9B6FF]",
      actionText: "تحدث مع المساعد",
      route: "/dashboard/student/ai-assistant",
    },
    {
      id: "notifications",
      title: "الإشعارات",
      description: "تابع أحدث التنبيهات ومواعيد الامتحانات وإعلانات المنصة الهامة لحظة بلحظة",
      icon: IconBell,
      iconBg: "bg-gradient-to-b from-[#EDE9FE] to-[#DDD6FE]",
      actionText: "عرض الإشعارات",
      route: "/dashboard/student/notifications",
    },
    {
      id: "mistakes",
      title: "أخطائي",
      description: "بنك خاص بالأخطاء التي ارتكبتها في التمارين مع حلولها الصحيحة لتفاديها لاحقاً",
      icon: IconMistakes,
      iconBg: "bg-gradient-to-b from-[#FFE0D4] to-[#FFB39A]",
      badge: `${mistakesCount} أخطاء`,
      actionText: "مراجعة الأخطاء",
      route: "/dashboard/student/mistakes",
    },
    {
      id: "live-classes",
      title: "حصص مباشرة",
      description: "تفاعل مع أساتذتك في حصص البث المباشر عبر تطبيق زووم ومراجعة الدروس التفاعلية",
      icon: IconLive,
      iconBg: "bg-gradient-to-b from-[#FFD6E8] to-[#FFA8C8]",
      badge: `${upcomingLiveClassesCount} حصص مجدولة`,
      actionText: "جدول الحصص",
      route: "/dashboard/student/live-classes",
    },
    {
      id: "ranking",
      title: "الترتيب والنقاط",
      description: "شاهد ترتيبك بين زملائك واكتشف عدد النقاط التي جمعتها من حل التمارين",
      icon: IconTrophy,
      iconBg: "bg-gradient-to-b from-[#EDE9FE] to-[#DDD6FE]",
      actionText: "عرض الترتيب",
      route: "/dashboard/student/leaderboard",
    },
    {
      id: "friend-challenge",
      title: "منافسة صديق",
      description: "نافس أصدقاءك في حل التمارين والمراجعة وتتبع من الأفضل",
      icon: IconChallenge,
      iconBg: "bg-gradient-to-b from-[#FFE4C4] to-[#FFD0A3]",
      actionText: "دخول المنافسة",
      route: "/dashboard/student/friend-challenge",
    },
  ];

  return (
    <div className="space-y-8 text-[#1E1B4B]">
      <HeroBanner
        title={`مرحباً بك مجدداً، ${user.fullName}`}
        description="واصل مسيرتك التعليمية بكل شغف أنت على بعد خطوات من تحقيق أهدافك"
        icon={GraduationCap}
      />

      <DailyTip variant="card" />

      <div>
        <h2 className="mb-6 text-2xl font-black text-[#1E1B4B]">أقسام المنصة</h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                href={section.route}
                key={section.id}
                className="group block rounded-[32px] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition duration-300 group-hover:scale-105 ${section.iconBg}`}
                  >
                    <Icon size="sm" />
                  </div>
                  {section.badge && (
                    <span className="rounded-full bg-[#6D28D9]/10 px-3 py-1 text-[11px] font-bold text-[#1E1B4B]">
                      {section.badge}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-black text-[#1E1B4B]">{section.title}</h3>
                  <p className="line-clamp-2 text-sm font-medium leading-relaxed text-[#6B6480]">
                    {section.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-sm font-bold text-[#6D28D9]">
                  <span>{section.actionText}</span>
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
