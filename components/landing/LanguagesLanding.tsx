"use client";

import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";

const BRANCHES = [
  { title: "الإنجليزية", desc: "تحسين المستوى من المبتدئ إلى المتقدم." },
  { title: "الفرنسية", desc: "دروس وتمارين حسب مستواك في الفرنسية." },
  { title: "الإسبانية", desc: "مدخل واضح للإسبانية مع تدرّج في الفهم." },
];

export function LanguagesLanding({ isAuthenticated }: { isAuthenticated: boolean }) {
  const startHref = isAuthenticated ? "/dashboard/student" : "/register?platform=languages";

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <LandingNav isAuthenticated={isAuthenticated} platform="languages" />

      <section className="px-3 pb-6 pt-3 sm:px-4">
        <div className="academy-hero-grid relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-5 pb-8 pt-16 text-center sm:px-10 sm:pb-10 sm:pt-20">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
            منصة مستقلة عن الدراسة الثانوية
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.25] text-white sm:text-6xl">
            تعليم اللغات
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-xl">
            الإنجليزية، الفرنسية، والإسبانية. كل لغة فرع وحدها، بمستوى مبتدئ أو متوسط أو متقدم.
          </p>
          <div className="mt-8">
            <Link
              href={startHref}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
            >
              {isAuthenticated ? "ادخل حسابك" : "إنشاء حساب في تعليم اللغات"}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-black text-[#6D28D9]">فروع المنصة</p>
          <h2 className="text-3xl font-black text-[#1E1B4B] sm:text-5xl">اختر لغتك</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {BRANCHES.map((branch) => (
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

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[36px] bg-[#6D28D9] px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="text-3xl font-black text-white sm:text-5xl">ابدأ من لغتك</h2>
          <p className="mx-auto mt-3 max-w-xl text-base font-medium text-white/80 sm:text-lg">
            سجّل من هنا. هذا الحساب لتعليم اللغات، وليس لحساب الدراسة الثانوية.
          </p>
          <Link
            href={startHref}
            className="mt-8 inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
          >
            {isAuthenticated ? "ادخل حسابك" : "إنشاء حساب"}
          </Link>
        </div>
      </section>

      <footer className="px-4 py-10 text-center">
        <p className="text-sm font-black text-[#1E1B4B]">تعليم اللغات — منصة دقيش</p>
        <p className="mt-1 text-xs font-bold text-[#6B6480]">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
