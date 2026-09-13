"use client";

import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

const FEATURES = [
  {
    title: "ادرس في وقتك",
    desc: "تفرّج الدروس وحل التمارين في الوقت اللي يناسبك، من البيت أو أي مكان.",
    icon: ClockIcon,
    filled: false,
  },
  {
    title: "درس، خريطة، وملخص",
    desc: "كل درس فيه شرح مصوّر، خريطة ذهنية، وملخص جاهز للمراجعة قبل الامتحان.",
    icon: LayersIcon,
    filled: true,
  },
  {
    title: "تمارين واختبارات",
    desc: "حل التمرين بعد كل درس، واختبر مستواك بالفروض قبل موعد الامتحان.",
    icon: QuizIcon,
    filled: false,
  },
  {
    title: "مسار واضح لكل مادة",
    desc: "لا تتوه بين المصادر. المادة مرتّبة من الدرس إلى المراجعة في مكان واحد.",
    icon: PathIcon,
    filled: true,
  },
  {
    title: "حصص مباشرة",
    desc: "ادخل الحصة مع الأستاذ، واطرح أسئلتك قبل الفرض أو الاختبار.",
    icon: LiveIcon,
    filled: false,
  },
  {
    title: "متابعة وليّ الأمر",
    desc: "لوحة للوليّ يتابع فيها تقدم الابن، النقاط، وما يحتاج مراجعة.",
    icon: ParentIcon,
    filled: true,
  },
];

export function FeaturesSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section id="features" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-3 text-sm font-black text-[#6D28D9]">لماذا منصة دقيش؟</p>
          <h2 className="max-w-xl text-3xl font-black text-[#1E1B4B] sm:text-5xl">دراسة منظّمة من البيت</h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#6B6480] sm:text-lg">
            عام الدراسة يحتاج متابعة وطريق واضح. المنصة تجمع الدرس، الخريطة الذهنية، الملخص، والتمرين في مكان واحد.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={Math.min(index * 70, 280)}>
                <Link
                  href={isAuthenticated ? "/dashboard/student" : "/register"}
                  className={`block h-full rounded-[32px] p-6 ${
                    feature.filled
                      ? "bg-[#6D28D9] text-white shadow-[0_16px_40px_rgba(109,40,217,0.22)]"
                      : "bg-white text-[#1E1B4B] shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
                  }`}
                >
                  <span
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${
                      feature.filled ? "bg-white/15 text-white" : "bg-[#F3EFFF] text-[#6D28D9]"
                    }`}
                  >
                    <Icon />
                  </span>
                  <h3 className="text-xl font-black">{feature.title}</h3>
                  <p className={`mt-2 text-sm font-medium leading-relaxed ${feature.filled ? "text-white/80" : "text-[#6B6480]"}`}>
                    {feature.desc}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 12l8 4 8-4M4 16l8 4 8-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9h6M9 13h4M9 17l2 1.5 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M6 18c2-6 10-6 12-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="6" r="2.2" fill="currentColor" />
      <circle cx="6" cy="18" r="2.2" fill="currentColor" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <rect x="3" y="7" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 10l6-3v10l-6-3v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ParentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 18c.8-3 2.6-4.5 4.5-4.5s3.7 1.5 4.5 4.5M13 18c.5-2 1.7-3 3-3s2.4 1 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
