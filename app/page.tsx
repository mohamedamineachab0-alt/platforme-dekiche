import { cookies } from "next/headers";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { prisma } from "@/lib/prisma";



export default async function Home() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  const isAuthenticated = !!sessionId;

  // Fetch dynamic student statistics
  const totalStudents = await prisma.studentProfile.count();
  const totalParents = await prisma.parentStudentLink.count();
  
  // Fetch top 10 students by points
  const topProfiles = await prisma.studentProfile.findMany({
    orderBy: { totalPoints: 'desc' },
    take: 10,
    include: { user: true }
  });

  const topStudents = topProfiles.map(profile => ({
    id: profile.userId,
    name: profile.user.fullName,
    points: profile.totalPoints
  }));

  return (
    <div dir="rtl" className="relative min-h-screen bg-[#F8F9FA] dark:bg-slate-950 font-sans selection:bg-sky-200 dark:selection:bg-slate-950/50 overflow-hidden">
      {/* Global Background Math Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      </div>

      <div className="relative z-10">
        <HeroSection isAuthenticated={isAuthenticated} />
        <LeaderboardSection totalStudents={totalStudents} totalParents={totalParents} topStudents={topStudents} />
        <FeaturesSection />
        <TeamSection />
        
        {/* Footer minimal */}
        <footer className="relative py-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            جميع الحقوق محفوظة لمنصة دقيش التعليمية
          </p>
        </footer>
      </div>
    </div>
  );
}
