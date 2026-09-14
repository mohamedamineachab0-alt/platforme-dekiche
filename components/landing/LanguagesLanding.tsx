"use client";

import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { Reveal } from "@/components/landing/Reveal";
import { loginPath, registerPath } from "@/lib/auth-platform";

const SKILLS = [
  { title: "استماع", desc: "تدرّب أذنك على الأصوات والجمل اليومية", mark: "01" },
  { title: "كلام", desc: "كرّر العبارات حتى تخرج بطلاقة وثقة", mark: "02" },
  { title: "قراءة", desc: "اقرأ نصوصاً قصيرة مناسبة لمستوى A1", mark: "03" },
  { title: "كتابة", desc: "اكتب جملاً بسيطة عن نفسك ويومك", mark: "04" },
];

const A1_UNITS = [
  { n: "01", title: "التعارف والتحية", items: "مرحبا · اسمي · من أين أنت" },
  { n: "02", title: "الأرقام والوقت", items: "العد · الساعة · الأيام" },
  { n: "03", title: "العائلة والبيت", items: "أفراد العائلة · الغرف · الأشياء" },
  { n: "04", title: "اليوم والعادات", items: "أفعال يومية · أسئلة بسيطة" },
];

const STEPS = [
  {
    n: "١",
    title: "سجّل في الفرع التعليمي",
    desc: "حساب تعلّم اللغات منفصل عن حساب الدراسة الثانوية.",
  },
  {
    n: "٢",
    title: "ادخل درس المستوى A1",
    desc: "دروسك المسجّلة تظهر مباشرة وتبدأ من الوحدة الأولى.",
  },
  {
    n: "٣",
    title: "راجع وثبّت ما تعلّمته",
    desc: "استمع، كرّر، واقرأ النصيحة اليومية حتى ترسخ العادة.",
  },
];

export function LanguagesLanding({ isAuthenticated }: { isAuthenticated: boolean }) {
  const startHref = isAuthenticated
    ? "/dashboard/student/subjects"
    : registerPath("languages");
  const enterHref = isAuthenticated ? "/dashboard/student/subjects" : loginPath("languages");

  return (
    <div className="languages-landing relative min-h-dvh overflow-x-hidden">
      <LandingNav isAuthenticated={isAuthenticated} platform="languages" />

      {/* Hero — brand first, classroom board + lesson notebook */}
      <section className="px-3 pb-4 pt-3 sm:px-4">
        <div className="languages-hero relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-5 pb-10 pt-14 sm:px-10 sm:pb-12 sm:pt-16">
          <div className="languages-hero-chalk pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:text-start">
            <div className="text-center lg:text-start">
              <p className="text-sm font-black tracking-wide text-white/70">فرع تعليمي مستقل · منصة دقيش</p>
              <h1 className="mt-3 text-5xl font-black leading-[1.1] text-white sm:text-6xl lg:text-7xl">
                تعلّم اللغات
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-base font-medium leading-relaxed text-white/85 sm:text-lg lg:mx-0">
                مسار مدرسي واضح من المستوى A1: دروس، استماع، ومراجعة يومية — حساب منفصل عن الثانوية.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href={startHref}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#EA580C] px-7 py-3.5 text-base font-black text-white transition hover:bg-[#C2410C]"
                >
                  {isAuthenticated ? "ادخل فصلك" : "انضم للدورة"}
                </Link>
                {!isAuthenticated ? (
                  <Link
                    href={enterHref}
                    className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-base font-black text-white transition hover:bg-white/20"
                  >
                    دخول التلميذ
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Educational visual: open lesson notebook */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="languages-notebook rounded-[28px] border border-[#FED7AA] bg-[#FFFEF8] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-dashed border-[#FED7AA] pb-3">
                  <span className="rounded-full bg-[#EA580C] px-3 py-1 text-[11px] font-black text-white">
                    دفتر الدرس · A1
                  </span>
                  <span className="text-xs font-bold text-[#EA580C]">الوحدة 01</span>
                </div>
                <p className="mt-4 text-xs font-black text-[#6D28D9]">اليوم نتعلّم:</p>
                <h2 className="mt-1 text-2xl font-black text-[#1E1B4B]">التعارف والتحية</h2>
                <ul className="languages-ruled mt-4 space-y-3 text-sm font-bold text-[#4C4670]">
                  <li className="flex items-baseline justify-between gap-3">
                    <span>Hello, my name is…</span>
                    <span className="text-xs font-black text-[#6D28D9]">EN</span>
                  </li>
                  <li className="flex items-baseline justify-between gap-3">
                    <span>Bonjour, je m&apos;appelle…</span>
                    <span className="text-xs font-black text-[#EA580C]">FR</span>
                  </li>
                  <li className="flex items-baseline justify-between gap-3">
                    <span>مرحبا، اسمي…</span>
                    <span className="text-xs font-black text-[#6D28D9]">AR</span>
                  </li>
                </ul>
                <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#FFF7ED] px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6D28D9] text-white">
                    <SpeakerIcon />
                  </span>
                  <p className="text-xs font-bold leading-snug text-[#1E1B4B]">
                    استمع للجملة · كرّرها · اكتبها في دفترك
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four language skills — curriculum feel */}
      <section id="features" className="scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="mb-2 text-sm font-black text-[#6D28D9]">المنهج التعليمي</p>
            <h2 className="max-w-2xl text-3xl font-black text-[#1E1B4B] sm:text-4xl">أربع مهارات في كل درس</h2>
            <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[#6B6480] sm:text-lg">
              مثل القسم الحقيقي: تسمع، تتكلم، تقرأ، ثم تكتب — خطوة بخطوة.
            </p>
          </Reveal>

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((skill, index) => (
              <Reveal key={skill.title} delay={index * 60}>
                <article className="languages-skill-card flex h-full flex-col rounded-[24px] border border-[#EDE9FE] bg-white/90 p-5">
                  <span className="font-mono text-xs font-black text-[#6D28D9]">{skill.mark}</span>
                  <h3 className="mt-3 text-xl font-black text-[#1E1B4B]">{skill.title}</h3>
                  <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-[#6B6480]">{skill.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* A1 syllabus */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-[#EDE9FE] bg-white">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-[#6D28D9] px-6 py-10 text-white sm:px-8 sm:py-12">
              <p className="text-sm font-black text-white/70">المستوى الحالي</p>
              <h2 className="mt-2 text-4xl font-black sm:text-5xl">A1</h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-white/85">
                برنامج المبتدئين: وحدات قصيرة، أمثلة حية، ومراجعة بعد كل درس.
              </p>
              <p className="mt-6 text-xs font-bold text-white/60">A2 و B1 يُفتحان لاحقاً بعد تثبيت الأساس</p>
            </div>
            <div className="px-5 py-8 sm:px-8 sm:py-10">
              <h3 className="text-lg font-black text-[#1E1B4B]">محتوى الوحدات الأولى</h3>
              <ol className="mt-5 space-y-4">
                {A1_UNITS.map((unit) => (
                  <li
                    key={unit.n}
                    className="flex gap-4 border-b border-[#EDE9FE] pb-4 last:border-0 last:pb-0"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3EFFF] text-sm font-black text-[#6D28D9]">
                      {unit.n}
                    </span>
                    <div>
                      <p className="font-black text-[#1E1B4B]">{unit.title}</p>
                      <p className="mt-1 text-sm font-medium text-[#6B6480]">{unit.items}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* How learning works */}
      <section id="steps" className="scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="mb-2 text-sm font-black text-[#6D28D9]">طريقة الدراسة</p>
            <h2 className="max-w-2xl text-3xl font-black text-[#1E1B4B] sm:text-4xl">من التسجيل إلى أول واجب</h2>
          </Reveal>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 70}>
                <article className="relative h-full rounded-[28px] border border-[#EDE9FE] bg-[#FFFEF8] p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6D28D9] text-lg font-black text-white">
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

      {/* Final educational CTA */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="languages-cta mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-[36px] px-6 py-12 text-center sm:flex-row sm:justify-between sm:px-10 sm:py-12 sm:text-start">
          <div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">افتح دفتر تعلّم اللغات</h2>
            <p className="mt-2 max-w-md text-base font-medium text-white/80">
              ابدأ وحدتك الأولى في المستوى A1 اليوم — بنفس انضباط القسم الدراسي.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={startHref}
              className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-black text-[#6D28D9] transition hover:bg-[#F3EFFF]"
            >
              {isAuthenticated ? "ادخل فصلك" : "إنشاء حساب تلميذ"}
            </Link>
            {!isAuthenticated ? (
              <Link
                href={enterHref}
                className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
              >
                لدي حساب
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="px-4 py-10 text-center">
        <p className="text-sm font-black text-[#1E1B4B]">تعلّم اللغات — فرع تعليمي من منصة دقيش</p>
        <p className="mt-1 text-xs font-bold text-[#6B6480]">
          جميع الحقوق محفوظة © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" />
      <path d="M16 9.5a3.5 3.5 0 010 5M18.5 7a7 7 0 010 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
