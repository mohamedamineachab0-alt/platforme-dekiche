import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { AiChatClient } from "@/components/student/AiChatClient";
import { prisma } from "@/lib/prisma";
import { assertAuth } from "@/lib/security";
import { LEVELS, STREAMS } from "@/lib/constants";

export default async function AiAssistantPage() {
  const sessionUser = await assertAuth({ requireRole: "STUDENT" });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      studentProfile: true,
      mistakes: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user || !user.studentProfile) {
    redirect("/login");
  }

  const rawLevel = user.studentProfile.level;
  const rawStream = user.studentProfile.stream;
  const levelStr = LEVELS.find(l => l.value === rawLevel)?.label || rawLevel;
  const streamStr = STREAMS.find(s => s.value === rawStream)?.label || rawStream;

  const studentName = user.fullName;
  const studentLevelStr = `${levelStr} - ${streamStr}`;
  const studentMistakesStr = user.mistakes.length > 0
    ? user.mistakes.map(m => m.mistakeContent).join('، ')
    : 'لا توجد اخطاء مسجلة حتى الان';

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6 pt-2">
      <HeroBanner
        title="dekiche academy"
        description="متصل بمعرفتك ومستواك وأخطائك"
        icon={Bot}
      />
      <div className="flex-1 min-h-0 bg-white rounded-[28px] shadow-sm border border-[#EDE9FE] overflow-hidden flex flex-col">
        <AiChatClient
          studentId={sessionUser.id}
          greetingText={`أنت طالب في ${levelStr} في ${streamStr}`}
          userAvatarUrl={user.avatarUrl}
          studentName={studentName}
          studentLevel={studentLevelStr}
          studentMistakes={studentMistakesStr}
        />
      </div>
    </div>
  );
}
