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
    <div dir="rtl" className="relative min-h-screen bg-[#0B0410] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Global Background Math Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      </div>

      <div className="relative z-10">
        <HeroSection isAuthenticated={isAuthenticated} />
        <LeaderboardSection totalStudents={totalStudents} totalParents={totalParents} topStudents={topStudents} />
        <FeaturesSection />
        <TeamSection />
        
        {/* Footer minimal */}
        <footer className="relative py-12 bg-[#0B0410]/80 backdrop-blur-md border-t border-purple-500/20 text-center z-10">
          <p className="text-sm font-bold text-purple-200/50">
            جميع الحقوق محفوظة لمنصة دقيش التعليمية
          </p>
        </footer>
      </div>
    </div>
  );
}
