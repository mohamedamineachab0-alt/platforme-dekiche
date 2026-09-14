"use client";

import { useState } from "react";
import { ReviewCard, Subject } from "@/generated/prisma";

type FlipCardProps = {
  card: ReviewCard & { subject: Subject };
};

export function FlipCard({ card }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full aspect-[3/4] sm:aspect-[4/3] perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped((v) => !v);
        }
      }}
      aria-label={isFlipped ? "عرض السؤال" : "عرض الجواب"}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[22px] border border-[#EDE9FE] bg-white backface-hidden shadow-[0_12px_32px_rgba(30,27,75,0.06)]">
          <div className="flex items-center justify-between border-b border-[#EDE9FE] bg-[#F7F5FF] px-4 py-2.5">
            <span className="text-[10px] font-black tracking-wide text-[#6D28D9]">سؤال</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-[#6D28D9]" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center">
            <p className="text-base font-black leading-7 text-[#1E1B4B] sm:text-lg">
              {card.question}
            </p>
          </div>
          <div className="border-t border-[#EDE9FE] px-4 py-2.5 text-center text-[11px] font-bold text-[#6B6480]">
            اقلب البطاقة
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[22px] border border-[#1E1B4B] bg-[#6D28D9] backface-hidden rotate-y-180 shadow-[0_16px_36px_rgba(109,40,217,0.28)]">
          <div className="flex items-center justify-between border-b border-white/15 bg-[#1E1B4B]/40 px-4 py-2.5">
            <span className="text-[10px] font-black tracking-wide text-[#DDD6FE]">جواب</span>
            <span className="h-1.5 w-1.5 rounded-sm bg-[#C4B5FD]" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center">
            <p className="text-base font-black leading-7 text-white sm:text-lg">{card.answer}</p>
          </div>
          <div className="border-t border-white/15 px-4 py-2.5 text-center text-[11px] font-bold text-[#DDD6FE]">
            اضغط للعودة
          </div>
        </div>
      </div>
    </div>
  );
}
