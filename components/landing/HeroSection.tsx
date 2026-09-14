"use client";

import Link from "next/link";

export function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="px-3 pb-4 pt-3 sm:px-4">
      <div className="edu-hero relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-5 pb-10 pt-14 sm:px-10 sm:pb-12 sm:pt-16">
        <div className="edu-hero-chalk pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="text-center lg:text-start">
            <p className="text-sm font-black tracking-wide text-white/70">
              منصة دقيش التعليمية · 2 و 3 ثانوي
            </p>
            <h1 className="mt-3 text-4xl font-black leading-[1.15] text-white sm:text-6xl lg:text-7xl">
              منصة دقيش
              <span className="mt-2 block text-3xl font-black text-white/95 sm:text-5xl lg:text-6xl">
                نحو التفوق في البكالوريا
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base font-medium leading-relaxed text-white/85 sm:text-lg lg:mx-0">
              دروس مصوّرة، خريطة ذهنية، ملخص وتمارين — مسار مدرسي واضح من الدرس إلى الفرض.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href={isAuthenticated ? "/dashboard/student" : "/register"}
                className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#EA580C] px-7 py-3.5 text-base font-black text-white transition hover:bg-[#C2410C]"
              >
                {isAuthenticated ? "ادخل فصلك" : "انضم للمنصة"}
              </Link>
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-base font-black text-white transition hover:bg-white/20"
                >
                  دخول التلميذ
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="edu-notebook rounded-[28px] border border-[#FED7AA] bg-[#FFFEF8] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-dashed border-[#FED7AA] pb-3">
                <span className="rounded-full bg-[#EA580C] px-3 py-1 text-[11px] font-black text-white">
                  دفتر المراجعة · باك
                </span>
                <span className="text-xs font-bold text-[#EA580C]">درس اليوم</span>
              </div>
              <p className="mt-4 text-xs font-black text-[#6D28D9]">خطة الحصة:</p>
              <h2 className="mt-1 text-2xl font-black text-[#1E1B4B]">من الفهم إلى الفرض</h2>
              <ul className="edu-ruled mt-4 space-y-3 text-sm font-bold text-[#4C4670]">
                <li className="flex items-baseline justify-between gap-3">
                  <span>شاهد الشرح المصوّر</span>
                  <span className="text-xs font-black text-[#EA580C]">01</span>
                </li>
                <li className="flex items-baseline justify-between gap-3">
                  <span>راجع الخريطة والملخص</span>
                  <span className="text-xs font-black text-[#6D28D9]">02</span>
                </li>
                <li className="flex items-baseline justify-between gap-3">
                  <span>حل التمرين وتنقّط من 20</span>
                  <span className="text-xs font-black text-[#EA580C]">03</span>
                </li>
              </ul>
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#FFF7ED] px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6D28D9] text-[11px] font-black text-white">
                  BAC
                </span>
                <p className="text-xs font-bold leading-snug text-[#1E1B4B]">
                  درس · خريطة · ملخص · تمرين — في مكان واحد
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
