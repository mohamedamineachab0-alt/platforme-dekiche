"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme } from "@/components/shared/ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    applyTheme(next);
    setDark(next === "dark");
  }

  if (!mounted) {
    return compact ? (
      <span className="flex h-10 w-10 items-center justify-center rounded-full" aria-hidden />
    ) : (
      <span className="block h-12 w-full rounded-[24px] border border-[#EDE9FE] bg-[#F7F5FF]" aria-hidden />
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
      >
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-[24px] border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 text-sm font-black text-[#1E1B4B]"
    >
      <span>{dark ? "الوضع الداكن مفعّل" : "الوضع الفاتح مفعّل"}</span>
      {dark ? <Sun className="h-5 w-5 text-[#6D28D9]" /> : <Moon className="h-5 w-5 text-[#6D28D9]" />}
    </button>
  );
}
