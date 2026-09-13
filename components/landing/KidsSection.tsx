"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/landing/Reveal";
import { IconBot, IconLanguages, IconSoroban } from "@/components/landing/PlayIcons";

const KIDS_TRACKS = [
  {
    chip: "دورات مهارات",
    title: "برمجة وروبوتات مبسّطة",
    desc: "أول خطوة في البرمجة والروبوتات بمشاريع صغيرة وأسلوب سهل",
    icon: IconBot,
    tone: "bg-[#F2FBF5] border-[#BBF7D0]",
    badge: "bg-white text-[#16A34A]",
  },
  {
    chip: "السوروبان",
    title: "ألعاب ذكاء وحساب ذهني",
    desc: "تمارين تركيز وسرعة في قالب لعبة يحبّها الصغار",
    icon: IconSoroban,
    tone: "bg-[#FFF1EC] border-[#FED7AA]",
    badge: "bg-white text-[#EA580C]",
  },
  {
    chip: "تعليم اللغات",
    title: "لغات للأطفال",
    desc: "إنجليزية وفرنسية وإسبانية بطريقة تفاعلية وممتعة",
    icon: IconLanguages,
    tone: "bg-[#EEF7FF] border-[#BFDBFE]",
    badge: "bg-white text-[#2563EB]",
  },
];

export function KidsSection() {
  return (
    <section id="kids" className="scroll-mt-28 px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#5B21B6] px-6 py-12 sm:px-10 sm:py-16">
        <span className="land-float pointer-events-none absolute -top-8 right-10 h-24 w-24 rounded-full bg-white/10" aria-hidden />
        <span className="land-float-slow pointer-events-none absolute bottom-6 left-10 h-16 w-16 rounded-full bg-white/10" aria-hidden />

        <Reveal className="relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
            ركن الصغار
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black text-white sm:text-5xl">تعلّم يشبه اللعب</h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-white/80 sm:text-lg">
            هذا الركن قريبا على منصتنا والدراسة متاحة الآن
          </p>
        </Reveal>

        <div className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
          {KIDS_TRACKS.map((track, index) => {
            const Icon = track.icon;
            return (
              <Reveal key={track.title} delay={index * 90}>
                <motion.div className="h-full">
                  <div
                    className={`relative flex h-full cursor-not-allowed flex-col overflow-hidden rounded-[28px] border-2 p-6 text-right opacity-80 ${track.tone}`}
                    aria-disabled="true"
                  >
                    <span className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-white/50" aria-hidden />
                    <div className="relative z-10 mb-4 flex items-center justify-between">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white grayscale shadow-[0_10px_22px_rgba(30,27,75,0.12)]">
                        <Icon size="sm" />
                      </span>
                      <span className="rounded-full bg-[#6D28D9] px-3 py-1 text-[11px] font-black text-white">
                        قريبا
                      </span>
                    </div>
                    <h3 className="relative z-10 text-lg font-black text-[#1E1B4B]">{track.title}</h3>
                    <p className="relative z-10 mt-2 flex-1 text-sm font-medium leading-relaxed text-[#6B6480]">{track.desc}</p>
                    <span className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#9B95B3]">
                      قريبا على المنصة
                    </span>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
