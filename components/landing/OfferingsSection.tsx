"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  IconCourses,
  IconIslamic,
  IconLanguages,
  IconLessons,
  IconQuran,
  IconSoroban,
} from "@/components/landing/PlayIcons";

const OFFERINGS = [
  {
    href: "/register",
    title: "الدراسة",
    desc: "من الدرس إلى التمرين في مسار واحد.",
    action: "دخول الدراسة",
    icon: IconLessons,
    number: "01",
    tone: "bg-[#F3EFFF] border-[#EDE9FE]",
    iconTone: "bg-gradient-to-br from-[#F3EFFF] to-white ring-2 ring-[#6D28D9]/25",
    numberTone: "bg-[#EA580C] text-white",
    available: true,
  },
  {
    href: "/languages",
    title: "تعلّم اللغات",
    desc: "مسار تعليمي من المستوى A1: دروس، استماع، ومراجعة.",
    action: "دخول الفرع التعليمي",
    icon: IconLanguages,
    number: "02",
    tone: "bg-[#FFF7ED] border-[#FED7AA]",
    iconTone: "bg-gradient-to-br from-[#FFF7ED] to-white ring-2 ring-[#EA580C]/30",
    numberTone: "bg-[#6D28D9] text-white",
    available: true,
  },
  {
    title: "السوروبان",
    desc: "حساب ذهني يربّي السرعة والدقة",
    action: "قريبا",
    icon: IconSoroban,
    number: "03",
    tone: "bg-[#FFFEF8] border-[#EDE9FE]",
    iconTone: "bg-white ring-2 ring-[#EDE9FE]",
    numberTone: "bg-[#F3EFFF] text-[#6D28D9]",
    available: false,
  },
  {
    title: "القرآن الكريم",
    desc: "حفظ وتجويد بخطوات واضحة",
    action: "قريبا",
    icon: IconQuran,
    number: "04",
    tone: "bg-[#F3EFFF] border-[#EDE9FE]",
    iconTone: "bg-white ring-2 ring-[#EDE9FE]",
    numberTone: "bg-[#F3EFFF] text-[#6D28D9]",
    available: false,
  },
  {
    title: "إسلاميات",
    desc: "عقيدة وفقه وسيرة بأسلوب مبسّط",
    action: "قريبا",
    icon: IconIslamic,
    number: "05",
    tone: "bg-[#FFFEF8] border-[#EDE9FE]",
    iconTone: "bg-white ring-2 ring-[#EDE9FE]",
    numberTone: "bg-[#F3EFFF] text-[#6D28D9]",
    available: false,
  },
  {
    title: "دورات أخرى",
    desc: "دورات لتطوير المهارات",
    action: "قريبا",
    icon: IconCourses,
    number: "06",
    tone: "bg-[#F3EFFF] border-[#EDE9FE]",
    iconTone: "bg-white ring-2 ring-[#EDE9FE]",
    numberTone: "bg-[#F3EFFF] text-[#6D28D9]",
    available: false,
  },
] as const;

export function OfferingsSection() {
  return (
    <section id="offerings" className="scroll-mt-28 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-sm font-black text-[#6D28D9]">ماذا نوفر</p>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-black text-[#1E1B4B] sm:text-5xl">فروع المنصة</h2>
          <span className="hidden rounded-full bg-white px-4 py-2 text-xs font-black text-[#6D28D9] shadow-[0_8px_24px_rgba(30,27,75,0.05)] sm:inline-flex">
            الدراسة واللغات متاحتان الآن
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#6B6480] sm:text-lg">
          فرع الدراسة وتعلّم اللغات مفتوحان والباقي قريبا على منصتنا
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERINGS.map((item) => {
            const Icon = item.icon;
            const cardClass = `group relative min-h-[250px] overflow-hidden rounded-[32px] border-2 p-6 sm:p-7 ${item.tone} ${
              item.available
                ? "transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(30,27,75,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6D28D9]/20"
                : "cursor-not-allowed opacity-75"
            }`;

            const body = (
              <>
                <span className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-white/50" aria-hidden />
                <div className="relative z-10 mb-6 flex items-start justify-between">
                  <span
                    className={`flex h-[72px] w-[72px] items-center justify-center rounded-full ${item.iconTone} ${
                      item.available ? "" : "grayscale"
                    }`}
                  >
                    <Icon size="sm" />
                  </span>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${item.numberTone}`}>{item.number}</span>
                    {!item.available ? (
                      <span className="rounded-full bg-[#6D28D9] px-2.5 py-0.5 text-[10px] font-black text-white">
                        قريبا
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-[#1E1B4B]">{item.title}</h3>
                  <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-[#6B6480]">{item.desc}</p>
                  <span
                    className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-black ${
                      item.available
                        ? "bg-white/75 text-[#6D28D9] transition group-hover:bg-white"
                        : "bg-white/60 text-[#9B95B3]"
                    }`}
                  >
                    {item.action}
                    {item.available ? (
                      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    ) : null}
                  </span>
                </div>
              </>
            );

            if (item.available && "href" in item && item.href) {
              return (
                <Link key={item.title} href={item.href} className={cardClass}>
                  {body}
                </Link>
              );
            }

            return (
              <div key={item.title} className={cardClass} aria-disabled="true">
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
