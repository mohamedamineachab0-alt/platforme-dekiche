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
    <section className="scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-[#EDE9FE] bg-white">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-[#6D28D9] px-6 py-10 text-white sm:px-8 sm:py-12">
            <p className="text-sm font-black text-white/70">خطوة بخطوة</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">كيف تستخدم المنصة</h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-white/85">
              مسار بسيط: حساب، دراسة، مراجعة. كل خطوة تُبنى على التي قبلها.
            </p>
          </div>
          <div className="space-y-0 px-5 py-6 sm:px-8 sm:py-8">
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 70}>
                <article className="flex gap-4 border-b border-[#EDE9FE] py-5 last:border-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3EFFF] text-sm font-black text-[#6D28D9]">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-[#1E1B4B]">{step.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-[#6B6480]">{step.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
