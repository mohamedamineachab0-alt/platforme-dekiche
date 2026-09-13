"use client";

import { Reveal } from "@/components/landing/Reveal";

const STEPS = [
  {
    n: "01",
    title: "افتح حسابك وفعّل موادك",
    desc: "سجّل كتلميذ، اختر مستواك وشعبتك، ثم فعّل كل مادة برمز الاشتراك.",
  },
  {
    n: "02",
    title: "تابع الدرس والخريطة والملخص",
    desc: "تفرّج الشرح المصوّر، افتح الخريطة الذهنية، وحمّل ملخص الدرس قبل التمرين.",
  },
  {
    n: "03",
    title: "حل التمارين وراجع أخطاءك",
    desc: "كل خطأ يُحفظ مع حلّه الصحيح. اختبر مستواك قبل الفرض، وتابع تقدمك.",
  },
];

export function LeaderboardSection() {
  return (
    <section id="steps" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-3 text-sm font-black text-[#6D28D9]">خطوة بخطوة</p>
          <h2 className="text-3xl font-black text-[#1E1B4B] sm:text-5xl">كيف تستخدم المنصة</h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#6B6480] sm:text-lg">
            مسار بسيط: حساب، دراسة، مراجعة. كل خطوة تُبنى على التي قبلها.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.n} delay={index * 90}>
              <article className="h-full rounded-[32px] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFFF] text-sm font-black text-[#6D28D9]">
                  {step.n}
                </span>
                <h3 className="mt-5 text-xl font-black text-[#1E1B4B]">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#6B6480]">{step.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
