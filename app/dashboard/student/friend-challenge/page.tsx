import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAuth } from "@/lib/security";
import { Swords } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { FriendChallengeClient } from "./FriendChallengeClient";
import { getFriendChallengeData } from "@/actions/friends";

export default async function FriendChallengePage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { studentProfile: true }
  });

  if (!user || !user.studentProfile) {
    redirect("/login");
  }

  let friendCode = user.studentProfile.friendCode;

  // Fallback Generation for older profiles
  if (!friendCode) {
    // Generate a short 8-character unique code based on random bytes or ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    friendCode = `DC-${randomSuffix}`;
    
    await prisma.studentProfile.update({
      where: { id: user.studentProfile.id },
      data: { friendCode }
    });
  }

  const { metrics } = await getFriendChallengeData(sessionUser.id);

  return (
    <div className="space-y-8 pb-12">
      <HeroBanner 
        title="منافسة صديق"
        description="شارك رمزك مع أصدقائك وتنافسوا على حل التمارين وجمع النقاط وتتبع من الأفضل"
        icon={Swords}
      />
      
      <FriendChallengeClient 
        myCode={friendCode} 
        metrics={metrics}
      />
    </div>
  );
}
