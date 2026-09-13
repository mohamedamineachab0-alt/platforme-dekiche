import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  const isAuthenticated = !!sessionId;

  return (
    <div
      dir="rtl"
      className="academy-page-grid min-h-dvh scroll-smooth font-sans text-[#1E1B4B] selection:bg-[#DDD6FE] selection:text-[#1E1B4B]"
    >
      <LandingPage isAuthenticated={isAuthenticated} />
    </div>
  );
}
