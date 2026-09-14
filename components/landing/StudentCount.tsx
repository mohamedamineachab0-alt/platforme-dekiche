"use client";

import { useEffect, useRef, useState } from "react";
import { IlluStudentsCrowd } from "@/components/landing/LandingIllus";

export function StudentCount({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const to = Math.max(count, 0);
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1100, 1);
          setDisplay(Math.round(to * p));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [count]);

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div
        ref={ref}
        className="game-panel mx-auto grid max-w-6xl items-center gap-6 overflow-hidden rounded-[36px] bg-[#1E1B4B] px-6 py-10 sm:grid-cols-2 sm:px-10 sm:py-12"
      >
        <div className="land-float mx-auto w-full max-w-sm">
          <IlluStudentsCrowd className="h-auto w-full" />
        </div>
        <div className="text-center sm:text-right">
          <p className="text-sm font-black text-[#C4B5FD]">لاعبون في الساحة</p>
          <p className="mt-2 text-6xl font-black tabular-nums text-white sm:text-8xl">{display}</p>
          <p className="mt-2 text-2xl font-black text-white">تلميذ ينافس الآن</p>
        </div>
      </div>
    </section>
  );
}
