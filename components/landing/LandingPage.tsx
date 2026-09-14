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

      <section id="faq" className="scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <LandingAskAI />
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="edu-cta mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-[36px] px-6 py-12 text-center sm:flex-row sm:justify-between sm:px-10 sm:py-12 sm:text-start">
          <div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">افتح دفتر مراجعتك</h2>
            <p className="mt-2 max-w-md text-base font-medium text-white/80">
              سجّل، اختر مستواك وشعبتك، وابدأ من الدرس إلى التمرين بنفس انضباط القسم.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={isAuthenticated ? "/dashboard/student" : "/register"}
              className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
            >
              {isAuthenticated ? "ادخل فصلك" : "إنشاء حساب تلميذ"}
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
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
