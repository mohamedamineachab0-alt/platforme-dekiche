"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Target, XCircle } from "lucide-react";

export type QuestItem = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const TITLE = "تحدي اليوم";
const NEXT = "التمرين التالي";
const CORRECT = "إجابة صحيحة واصل التفوق";

export function DailyQuest({ exercises }: { exercises: QuestItem[] }) {
  const reduce = useReducedMotion();
  const deck = useMemo(() => exercises.slice(0, Math.max(exercises.length, 0)), [exercises]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  if (deck.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#EDE9FE] bg-white p-8 text-center text-sm font-bold text-[#6B6480]">
        لا توجد تمارين جاهزة لتحدي اليوم بعد
      </div>
    );
  }

  const item = deck[index % deck.length];
  const isCorrect = selected !== null && selected === item.correctAnswer;
  const revealed = selected !== null;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    setAnswered((value) => value + 1);
    if (option === item.correctAnswer) setScore((value) => value + 1);
  }

  function next() {
    setSelected(null);
    setIndex((value) => (value + 1) % deck.length);
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#6D28D9]">أكاديمية الدقيش</p>
          <h2 className="mt-1 text-xl font-black text-[#1E1B4B] sm:text-2xl">{TITLE}</h2>
        </div>
        <div className="rounded-2xl bg-[#F3EFFF] px-3 py-2 text-center">
          <p className="text-sm font-black text-[#1E1B4B]">
            {score}/{answered || 0}
          </p>
          <p className="text-[10px] font-bold text-[#7C3AED]/70">النتيجة</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className="rounded-[28px] border border-[#EDE9FE] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] text-white">
              <Target className="h-5 w-5" />
            </span>
            <p className="text-xs font-black text-[#6B6480]">
              تمرين {index + 1} من {deck.length}
            </p>
          </div>

          <p className="text-base font-black leading-8 text-[#1E1B4B] sm:text-lg">{item.question}</p>

          <div className="mt-5 space-y-2.5">
            {item.options.map((option) => {
              const picked = selected === option;
              const isRight = option === item.correctAnswer;
              let styles =
                "border-slate-200 bg-slate-50 text-slate-800 hover:border-[#C4B5FD] hover:bg-white";
              if (revealed && isRight) {
                styles = "border-emerald-500 bg-emerald-50 text-emerald-900";
              } else if (revealed && picked && !isRight) {
                styles = "border-rose-400 bg-rose-50 text-rose-800";
              } else if (picked) {
                styles = "border-[#6D28D9] bg-[#F3EFFF] text-[#1E1B4B]";
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-start text-sm font-bold transition disabled:cursor-default ${styles}`}
                >
                  <span>{option}</span>
                  {revealed && isRight ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : null}
                  {revealed && picked && !isRight ? (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {revealed ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 space-y-3"
            >
              {isCorrect ? (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
                  {CORRECT}
                </p>
              ) : (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
                  الإجابة الصحيحة هي {item.correctAnswer}
                </p>
              )}
              {item.explanation ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium leading-7 text-slate-700">
                  {item.explanation}
                </p>
              ) : null}
              <button
                type="button"
                onClick={next}
                className="w-full rounded-2xl bg-[#6D28D9] px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(109,40,217,0.28)]"
              >
                {NEXT}
              </button>
            </motion.div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
