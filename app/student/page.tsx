export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";
import { 
  BookOpen, 
  Target, 
  Trophy, 
  CalendarDays, 
  Lightbulb, 
  FileText, 
  Map, 
  MessageCircle, 
  Bot, 
  Layers, 
  Share2 
} from "lucide-react";

import Link from "next/link";

const DASHBOARD_CARDS = [
  { title: "الدروس", subtitle: "شاهد وتعلم", icon: BookOpen, color: "bg-purple-50 text-purple-600", badge: "جديد", href: "/student/lessons" },
  { title: "أخطائي", subtitle: "تعلم من أخطائك", icon: Target, color: "bg-[#6D28D9]/10 text-[#6D28D9]", href: "/student/mistakes" },
  { title: "تمارين يومية", subtitle: "تدرب باستمرار", icon: CalendarDays, color: "bg-amber-50 text-amber-600", href: "/student/exercises" },
  { title: "الترتيب والنقاط", subtitle: "نافس زملائك", icon: Trophy, color: "bg-orange-50 text-orange-600", href: "/student/leaderboard" },
  { title: "خطتي الذكية", subtitle: "مسار تفوقك", icon: Lightbulb, color: "bg-teal-50 text-teal-600", href: "/student/roadmap" },
  { title: "اختبارات وفروض", subtitle: "قيم مستواك", icon: FileText, color: "bg-violet-50 text-violet-600", href: "/student/exams" },
  { title: "خريطة الإتقان", subtitle: "تتبع تقدمك", icon: Map, color: "bg-emerald-50 text-emerald-600", href: "/student/mastery" },
  { title: "دردشة القسم", subtitle: "تواصل مع زملائك", icon: MessageCircle, color: "bg-green-50 text-green-600", href: "/student/chat" },
  { title: "اسأل الأستاذ الذكي", subtitle: "مساعدك الخاص", icon: Bot, color: "bg-purple-50 text-[#6D28D9]", badge: "AI", href: "/student/ai-tutor" },
  { title: "بطاقات المراجعة", subtitle: "حفظ ومراجعة", icon: Layers, color: "bg-rose-50 text-rose-600", href: "/student/flashcards" },
  { title: "شارك المنصة", subtitle: "ادعُ أصدقاءك", icon: Share2, color: "bg-fuchsia-50 text-fuchsia-600", href: "/student/referral" },
];

export default async function StudentDashboard() {
  const user = await prisma.user.findFirst({
    where: { role: "STUDENT" }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 md:mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          مرحباً بك
        </h2>
        <p className="text-slate-500">أهلاً بك في منصة أكاديمية دقيش التعليمية</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {DASHBOARD_CARDS.map((card, idx) => (
          <Link href={card.href} key={idx} className="block touch-manipulation">
            <div 
              className="group bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 h-full"
            >
              {/* Floating Badge */}
              {card.badge && (
                <span className="absolute top-4 right-4 bg-[#6D28D9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 border border-white">
                  {card.badge}
                </span>
              )}
              
              {/* Icon Circle */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 ${card.color}`}>
                <card.icon className="w-8 h-8" strokeWidth={2} />
              </div>
              
              {/* Texts */}
              <h3 className="text-lg font-bold text-slate-800 mb-1.5">{card.title}</h3>
              <p className="text-xs text-gray-500 font-medium">{card.subtitle}</p>
              
              {/* Subtle Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#6D28D9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
