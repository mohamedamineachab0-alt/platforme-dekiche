"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { DAILY_TIPS } from "@/lib/tips";

type DailyTipProps = {
  variant?: "sidebar" | "card";
  isCollapsed?: boolean;
  tips?: string[];
  title?: string;
};

export function DailyTip({
  variant = "sidebar",
  isCollapsed = false,
  tips,
  title,
}: DailyTipProps) {
  const [tip, setTip] = useState("");
  const [isClient, setIsClient] = useState(false);
  const heading =
    title || (variant === "card" ? "نصيحة اليوم للنجاح" : "نصيحة اليوم");

  useEffect(() => {
    setIsClient(true);
    const pool = tips && tips.length > 0 ? tips : DAILY_TIPS;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setTip(pool[randomIndex] || "");
  }, [tips]);

  if (!isClient || !tip) return null;

  if (variant === "sidebar") {
    if (isCollapsed) return null;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#EDE9FE] bg-[#F3EFFF] p-4 group">
        <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white bg-[#EDE9FE] shadow-sm">
            <Lightbulb className="h-4 w-4 text-[#6D28D9]" />
          </div>
          <div>
            <h4 className="mb-1 text-xs font-black text-slate-900">{heading}</h4>
            <p className="text-xs font-bold leading-relaxed text-[#1E1B4B]/80">{tip}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-[#EDE9FE] bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6D28D9]">
        <Lightbulb className="h-6 w-6 text-white" />
      </div>
      <div>
        <h4 className="mb-1 text-sm font-black text-[#1E1B4B]">{heading}</h4>
        <p className="text-sm font-bold leading-relaxed text-[#6B6480]">{tip}</p>
      </div>
    </div>
  );
}
