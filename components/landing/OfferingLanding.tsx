"use client";

import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";

export function OfferingLanding({
  platform,
  title,
  badge,
  desc,
  branches,
  registerHref,
  isAuthenticated,
}: {
  platform: "languages" | "soroban" | "quran" | "islamic" | "courses";
  title: string;
  badge: string;
  desc: string;
  branches: { title: string; desc: string }[];
  registerHref: string;
  isAuthenticated: boolean;
}) {
  const startHref = isAuthenticated ? "/dashboard/student" : registerHref;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <LandingNav isAuthenticated={isAuthenticated} platform={platform} />

      <section className="px-3 pb-6 pt-3 sm:px-4">
        <div className="academy-hero-grid relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-5 pb-8 pt-16 text-center sm:px-10 sm:pb-10 sm:pt-20">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
            {badge}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.25] text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-xl">
            {desc}
          </p>
          <div className="mt-8">
            <Link
              href={startHref}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
            >
              {isAuthenticated ? "ادخل حسابك" : "إنشاء حساب"}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-black text-[#6D28D9]">الفروع</p>
          <h2 className="text-3xl font-black text-[#1E1B4B] sm:text-5xl">ماذا ستجد</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <article
                key={branch.title}
                className="rounded-[32px] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
              >
                <h3 className="text-xl font-black text-[#1E1B4B]">{branch.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#6B6480]">{branch.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-4 py-10 text-center">
        <p className="text-sm font-black text-[#1E1B4B]">{title} — منصة دقيش</p>
        <p className="mt-1 text-xs font-bold text-[#6B6480]">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
