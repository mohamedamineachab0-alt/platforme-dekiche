"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Scale, BatteryLow } from "lucide-react";
import { saveUnderstandingLevel } from "@/actions/understanding";
import { AuthShell } from "@/components/shared/AuthShell";

const OPTIONS = [
  {
    value: "FAST",
    label: "فهم سريع",
    hint: "أستوعب الدرس بسرعة وأكمل بوتيرة أعلى",
    icon: Zap,
    accent: "bg-[#22C55E] text-white",
  },
  {
    value: "AVERAGE",
    label: "متوسط",
    hint: "أحتاج شرحا واضحا وتمارين بالمقدار المناسب",
    icon: Scale,
    accent: "bg-[#F97316] text-white",
  },
  {
    value: "WEAK",
    label: "ضعيف",
    hint: "أحتاج خطوات أبسط ومراجعة أكثر بهدوء",
    icon: BatteryLow,
    accent: "bg-[#EF4444] text-white",
  },
] as const;

export default function UnderstandingOnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (value: string) => {
    setSelected(value);
    setError(null);
    startTransition(async () => {
      const res = await saveUnderstandingLevel(value);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(res.redirectUrl || "/dashboard/student");
    });
  };

  return (
    <AuthShell>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#1E1B4B] sm:text-4xl">مستوى فهمك</h1>
              <p className="mt-2 text-base font-medium text-[#6B6480]">
                اختر الوصف الأقرب إليك لنوجّه المحتوى حسب قدرتك
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => submit(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-[28px] border bg-[#F7F5FF] p-5 text-right transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                      active
                        ? "border-[#6D28D9] shadow-[0_0_0_4px_rgba(109,40,217,0.14)]"
                        : "border-[#EDE9FE]"
                    }`}
                  >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${opt.accent}`}
                    >
                      {isPending && active ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xl font-black text-[#1E1B4B]">{opt.label}</span>
                      <span className="mt-1 block text-sm font-medium text-[#6B6480]">{opt.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
    </AuthShell>
  );
}
