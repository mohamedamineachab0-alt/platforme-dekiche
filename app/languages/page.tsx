import { cookies } from "next/headers";
import { LanguagesLanding } from "@/components/landing/LanguagesLanding";
import { getSessionUserId } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export default async function LanguagesPage() {
  const cookieStore = await cookies();
  const hasSession = !!cookieStore.get("session")?.value;
  let isLanguagesAuthenticated = false;

  if (hasSession) {
    const userId = await getSessionUserId();
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { accountBranch: true, studentProfile: { select: { branch: true } } },
      });
      isLanguagesAuthenticated =
        user?.accountBranch === "LANGUAGES" || user?.studentProfile?.branch === "LANGUAGES";
    }
  }

  return (
    <div
      dir="rtl"
      className="languages-page-grid min-h-dvh scroll-smooth font-sans text-[#1E1B4B] selection:bg-[#DDD6FE] selection:text-[#1E1B4B]"
    >
      <LanguagesLanding isAuthenticated={isLanguagesAuthenticated} />
    </div>
  );
}
