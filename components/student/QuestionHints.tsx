"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

type Props = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint1?: string;
  hint2?: string;
  explanation?: string;
};

export function QuestionHints({
  options,
  correctAnswerIndex,
  hint1,
  hint2,
  explanation,
}: Props) {
  const [step, setStep] = useState(0);

  const h1 = hint1 || "اقرأ السؤال بتمعن وحدد المعطيات ثم المطلوب";
  const h2 = hint2 || "استبعد الخيارين الأبعد عن المعطيات ثم قارن ما تبقى";
  const full = explanation || `الحل الصحيح: ${options[correctAnswerIndex] || ""}`;

  return (
    <div className="mt-6 space-y-3">
      {step >= 1 ? (
        <div className="rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4">
          <p className="mb-1 text-xs font-black text-[#6D28D9]">تلميح أول</p>
          <p className="text-sm font-medium leading-relaxed text-[#1E1B4B]">{h1}</p>
        </div>
      ) : null}
      {step >= 2 ? (
        <div className="rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4">
          <p className="mb-1 text-xs font-black text-[#6D28D9]">تلميح ثان</p>
          <p className="text-sm font-medium leading-relaxed text-[#1E1B4B]">{h2}</p>
        </div>
      ) : null}
      {step >= 3 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-1 text-xs font-black text-emerald-700">الحل الكامل</p>
          <p className="text-sm font-medium leading-relaxed text-emerald-900">{full}</p>
        </div>
      ) : null}

      {step < 3 ? (
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(s + 1, 3))}
          className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-2.5 text-sm font-black text-[#6D28D9] transition hover:border-[#6D28D9]/40"
        >
          <HelpCircle className="h-4 w-4" />
          {step === 0 ? "لا أفهم هذا السؤال" : step === 1 ? "ما زلت لا أفهم" : "أظهر الحل الكامل"}
        </button>
      ) : null}
    </div>
  );
}
