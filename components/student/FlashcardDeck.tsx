"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, RotateCcw } from "lucide-react";

export type FlashcardItem = {
  id: string;
  frontText: string;
  backText: string;
};

const TITLE = "بطاقات الحفظ السريع";
const FLIP = "اقلب البطاقة";

export function FlashcardDeck({ cards }: { cards: FlashcardItem[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-[#EDE9FE] bg-white px-6 py-10 text-center text-sm font-bold text-[#6B6480]">
        لا توجد بطاقات جاهزة لهذا الدرس بعد
      </div>
    );
  }

  const card = cards[index % cards.length];
  const progress = `${index + 1} من ${cards.length}`;

  function next() {
    setFlipped(false);
    setIndex((value) => (value + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((value) => (value - 1 + cards.length) % cards.length);
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDE9FE] pb-3">
        <h2 className="text-lg font-black text-[#1E1B4B] sm:text-xl">{TITLE}</h2>
        <span className="rounded-xl bg-[#F3EFFF] px-3 py-1.5 text-xs font-black tabular-nums text-[#5B21B6]">
          {progress}
        </span>
      </div>

      <div className="mx-auto h-1.5 w-full overflow-hidden rounded-full bg-[#F3EFFF]">
        <div
          className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      <div className="perspective-[1400px]">
        <AnimatePresence mode="wait">
          <motion.button
            key={`${card.id}-${flipped ? "b" : "f"}`}
            type="button"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            onClick={() => setFlipped((value) => !value)}
            className={`relative flex min-h-[280px] w-full flex-col overflow-hidden rounded-[22px] text-start shadow-[0_16px_40px_rgba(30,27,75,0.1)] ${
              flipped
                ? "border border-[#5B21B6] bg-[#6D28D9] text-white"
                : "border border-[#EDE9FE] bg-white text-[#1E1B4B]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-3 ${
                flipped ? "border-white/15 bg-[#5B21B6]/35" : "border-[#EDE9FE] bg-[#F7F5FF]"
              }`}
            >
              <span
                className={`text-[11px] font-black tracking-wide ${
                  flipped ? "text-[#DDD6FE]" : "text-[#6D28D9]"
                }`}
              >
                {flipped ? "الجواب" : "السؤال"}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-sm ${
                  flipped ? "bg-[#C4B5FD]" : "bg-[#6D28D9]"
                }`}
              />
            </div>

            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
              <p className="max-w-lg text-lg font-black leading-8 sm:text-xl">
                {flipped ? card.backText : card.frontText}
              </p>
            </div>

            <div
              className={`border-t px-5 py-3 text-center text-[11px] font-bold ${
                flipped
                  ? "border-white/15 text-[#DDD6FE]"
                  : "border-[#EDE9FE] text-[#6B6480]"
              }`}
            >
              {FLIP}
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={prev}
          className="rounded-xl border border-[#EDE9FE] bg-white px-3 py-3 text-sm font-bold text-[#6B6480] transition hover:bg-[#F7F5FF]"
        >
          السابقة
        </button>
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-3 py-3 text-sm font-black text-white transition hover:bg-[#5B21B6]"
        >
          <RotateCcw className="h-4 w-4" />
          {FLIP}
        </button>
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#EDE9FE] bg-white px-3 py-3 text-sm font-bold text-[#5B21B6] transition hover:bg-[#F7F5FF]"
        >
          التالية
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
