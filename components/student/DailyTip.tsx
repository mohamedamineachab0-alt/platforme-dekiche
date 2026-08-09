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
      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 shadow-sm border border-white">
            <Lightbulb className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-1">نصيحة اليوم</h4>
            <p className="text-xs font-bold text-sky-700/80 leading-relaxed">
              {tip}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className="bg-gradient-to-r from-sky-50 to-white rounded-2xl p-5 border border-sky-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 border border-sky-200">
        <Lightbulb className="w-6 h-6 text-sky-600 animate-pulse" />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-950 mb-1">نصيحة اليوم للنجاح</h4>
        <p className="text-sm font-bold text-slate-600 leading-relaxed">
          {tip}
        </p>
      </div>
    </div>
  );
}
