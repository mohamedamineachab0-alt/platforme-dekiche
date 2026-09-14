import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await assertAuth({ requireRole: "STUDENT" });

  let needsOnboarding = false;
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: { understandingLevel: true, branch: true },
    });
    if (profile?.branch === "SMART_TEACHER") {
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: { branch: "STUDY" },
      });
    }
    needsOnboarding =
      !!profile &&
      profile.branch !== "LANGUAGES" &&
      !profile.understandingLevel;
  } catch {
    needsOnboarding = false;
  }

  if (needsOnboarding) {
    redirect("/onboarding/understanding");
  }

  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
