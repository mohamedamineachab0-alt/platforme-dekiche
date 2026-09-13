"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { DAILY_TIPS } from "@/lib/tips";

type DailyTipProps = {
  variant?: "sidebar" | "card";
  isCollapsed?: boolean;
};

export function DailyTip({ variant = "sidebar", isCollapsed = false }: DailyTipProps) {
  const [tip, setTip] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
    setTip(DAILY_TIPS[randomIndex]);
  }, []);

  if (!isClient || !tip) return null;

  if (variant === "sidebar") {
    if (isCollapsed) return null; // Don't show in collapsed mode to save space

    return (
      <div className="bg-[#F3EFFF] rounded-2xl p-4 border border-[#EDE9FE] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0 shadow-sm border border-white">
            <Lightbulb className="w-4 h-4 text-[#6D28D9]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-1">نصيحة اليوم</h4>
            <p className="text-xs font-bold text-[#5B21B6]/80 leading-relaxed">
              {tip}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-[#EDE9FE] bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6D28D9]">
        <Lightbulb className="h-6 w-6 text-white" />
      </div>
      <div>
        <h4 className="mb-1 text-sm font-black text-[#1E1B4B]">نصيحة اليوم للنجاح</h4>
        <p className="text-sm font-bold leading-relaxed text-[#6B6480]">
          {tip}
        </p>
      </div>
    </div>
  );
}
