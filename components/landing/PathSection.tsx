"use client";

import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

const STEPS = [
  {
    n: "01",
    title: "سجّل واختر مستواك",
    desc: "أنشئ حسابك وحدّد الطور والشعبة لتظهر موادك فقط",
  },
  {
    n: "02",
    title: "شاهد الدرس وراجع",
    desc: "فيديو الدرس مع الملحقات وبطاقات الحفظ السريع في مكان واحد",
  },
  {
    n: "03",
    title: "تمرّن وتنقّط من 20",
    desc: "حل تمارين الدرس والكويز وتابع تقدمك في المادة",
  },
];

export function PathSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section id="steps" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-3 text-sm font-black text-[#6D28D9]">طريقة العمل</p>
          <h2 className="max-w-xl text-3xl font-black text-[#1E1B4B] sm:text-5xl">ثلاث خطوات للبدء</h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#6B6480] sm:text-lg">
            من التسجيل إلى أول تمرين بدون تشتيت
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.n} delay={index * 80}>
              <article className="flex h-full flex-col rounded-[28px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_32px_rgba(30,27,75,0.05)] sm:p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#6D28D9] text-sm font-black text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-xl font-black text-[#1E1B4B]">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-[#6B6480]">{step.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={280} className="mt-8">
          <Link
            href={isAuthenticated ? "/dashboard/student" : "/register"}
            className="inline-flex items-center justify-center rounded-full bg-[#6D28D9] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#5B21B6]"
          >
            {isAuthenticated ? "ادخل حسابك" : "ابدأ الآن"}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
