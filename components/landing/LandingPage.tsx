"use client";

import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { PathSection } from "@/components/landing/PathSection";
import { LandingAskAI } from "@/components/landing/LandingAskAI";
import { OfferingsSection } from "@/components/landing/OfferingsSection";

export function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <LandingNav isAuthenticated={isAuthenticated} />
      <HeroSection isAuthenticated={isAuthenticated} />
      <OfferingsSection />
      <FeaturesSection isAuthenticated={isAuthenticated} />
      <LeaderboardSection />
      <PathSection isAuthenticated={isAuthenticated} />

      <section id="faq" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <LandingAskAI />
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[36px] bg-[#6D28D9] px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="text-3xl font-black text-white sm:text-5xl">سجّل وابدأ المراجعة</h2>
          <p className="mx-auto mt-3 max-w-xl text-base font-medium text-white/80 sm:text-lg">
            افتح حسابك، اختر مستواك وشعبتك، وابدأ من الدرس إلى التمرين في مسار واحد.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={isAuthenticated ? "/dashboard/student" : "/register"}
              className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
            >
              {isAuthenticated ? "ادخل حسابك" : "إنشاء حساب"}
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-white/15 px-8 py-3.5 text-base font-black text-white transition hover:bg-white/25"
            >
              دخول
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 py-10 text-center">
        <p className="text-sm font-black text-[#1E1B4B]">منصة دقيش التعليمية</p>
        <p className="mt-1 text-xs font-bold text-[#6B6480]">
          جميع الحقوق محفوظة © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
