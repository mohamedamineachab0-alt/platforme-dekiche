"use client";

import Link from "next/link";

const PILLS = [
  { title: "حسابك الدراسي", icon: UserIcon },
  { title: "دروس مصوّرة", icon: PlayIcon },
  { title: "خرائط ذهنية", icon: MapIcon },
  { title: "ملخصات الدرس", icon: NoteIcon },
  { title: "تمارين يومية", icon: CheckIcon },
  { title: "المساعد", icon: BotIcon },
];

export function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="px-3 pb-6 pt-3 sm:px-4">
      <div className="academy-hero-grid relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-5 pb-8 pt-16 text-center sm:px-10 sm:pb-10 sm:pt-20">
        <div className="absolute start-4 top-4 sm:start-6 sm:top-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#6D28D9]">
              <UserIcon />
            </span>
            من الثانية إلى الثالثة ثانوي
          </span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.25] text-white sm:text-6xl lg:text-7xl">
          منصة دراسية واضحة
          <br />
          نحو{" "}
          <span className="relative inline-block whitespace-nowrap">
            التفوق
            <svg
              className="absolute -bottom-1 start-0 h-3 w-full text-red-500 sm:h-4"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M2 8c40-6 80 4 120-2 30-4 56 2 76 4" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </span>
          <br />
          في البكالوريا
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/85 sm:text-xl"
          style={{ animationDelay: "80ms" }}
        >
          دروس مصوّرة، خريطة ذهنية لكل درس، ملخص، وتمارين. مسار منظّم لتلاميذ 2 و 3 ثانوي.
        </p>

        <div className="mt-8">
          <Link
            href={isAuthenticated ? "/dashboard/student" : "/register"}
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6D28D9] shadow-[0_10px_30px_rgba(109,40,217,0.18)] transition hover:bg-[#F3EFFF]"
          >
            اركب معنا سفينة النجاح
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {PILLS.map((pill) => {
            const Icon = pill.icon;
            return (
              <div
                key={pill.title}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[#1E1B4B] shadow-[0_8px_24px_rgba(30,27,75,0.08)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3EFFF] text-[#6D28D9]">
                  <Icon />
                </span>
                <span className="pe-1 text-xs font-black sm:text-sm">{pill.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19c1.4-3.2 3.8-4.8 6.5-4.8S17.1 15.8 18.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 10l5 2-5 2v-4z" fill="currentColor" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M12 20s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12.2l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="5" y="8" width="14" height="11" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 5v3M9 13h.01M15 13h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
