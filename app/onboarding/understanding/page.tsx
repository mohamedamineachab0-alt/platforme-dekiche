import { redirect } from "next/navigation";
import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { studentHomePath } from "@/lib/platform-branch";
import UnderstandingOnboardingPage from "./UnderstandingClient";

export default async function UnderstandingPage() {
  const user = await assertAuth({ requireRole: "STUDENT" });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { understandingLevel: true, branch: true },
  });

  if (!profile) {
    redirect("/dashboard/student");
  }

  if (profile.understandingLevel) {
    redirect(studentHomePath(profile.branch));
  }

  return <UnderstandingOnboardingPage />;
}
