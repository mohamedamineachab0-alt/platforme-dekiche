"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronLeft, RotateCcw, XCircle } from "lucide-react";

type Flashcard = { id: string; frontText: string; backText: string };
type Exercise = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const LOADING = "جاري تحضير بطاقات وتمارين هاد الدرس";
const CARDS_TITLE = "بطاقات الحفظ السريع";
const QUIZ_TITLE = "اختبر فهمك للدرس";
const FLIP = "اقلب البطاقة";
const NEXT = "السؤال التالي";
const CORRECT = "إجابة صحيحة واصل التفوق";
const OPTION_MARKS = ["أ", "ب", "ج", "د", "هـ", "و"];

function MaterialsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label={LOADING}>
      <div className="h-10 animate-pulse rounded-xl bg-[#EDE9FE]/80" />
      <div className="h-56 animate-pulse rounded-[22px] bg-[#F7F5FF]" />
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-[#F7F5FF]" />
        ))}
      </div>
      <p className="text-center text-sm font-black text-[#1E1B4B]">{LOADING}</p>
    </div>
  );
}

function FlashcardsBlock({ cards }: { cards: Flashcard[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (cards.length === 0) return null;

  const card = cards[index % cards.length];

  function next() {
    setFlipped(false);
    setIndex((v) => (v + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((v) => (v - 1 + cards.length) % cards.length);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDE9FE] pb-3">
        <h3 className="text-base font-black text-[#1E1B4B] sm:text-lg">{CARDS_TITLE}</h3>
        <span className="rounded-lg bg-[#F3EFFF] px-2.5 py-1 text-[11px] font-black tabular-nums text-[#1E1B4B]">
          {index + 1} / {cards.length}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-[#F3EFFF]">
        <div
          className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={`${card.id}-${flipped ? "b" : "f"}`}
          type="button"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          onClick={() => setFlipped((v) => !v)}
          className={`flex min-h-[240px] w-full flex-col overflow-hidden rounded-[22px] text-start shadow-[0_12px_32px_rgba(30,27,75,0.08)] ${
            flipped
              ? "border border-[#1E1B4B] bg-[#6D28D9] text-white"
              : "border border-[#EDE9FE] bg-white text-[#1E1B4B]"
          }`}
        >
          <div
            className={`flex items-center justify-between border-b px-4 py-2.5 ${
              flipped ? "border-white/15 bg-[#1E1B4B]/40" : "border-[#EDE9FE] bg-[#F7F5FF]"
            }`}
          >
            <span
              className={`text-[11px] font-black tracking-wide ${
                flipped ? "text-[#DDD6FE]" : "text-[#6D28D9]"
              }`}
            >
              {flipped ? "جواب" : "سؤال"}
            </span>
            <span
              className={`h-1.5 w-1.5 rounded-sm ${flipped ? "bg-[#C4B5FD]" : "bg-[#6D28D9]"}`}
            />
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
            <p className="max-w-lg text-base font-black leading-8 sm:text-lg">
              {flipped ? card.backText : card.frontText}
            </p>
          </div>

          <div
            className={`border-t px-4 py-2.5 text-center text-[11px] font-bold ${
              flipped ? "border-white/15 text-[#DDD6FE]" : "border-[#EDE9FE] text-[#6B6480]"
            }`}
          >
            {FLIP}
          </div>
        </motion.button>
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={prev}
          className="rounded-xl border border-[#EDE9FE] bg-white px-3 py-2.5 text-sm font-bold text-[#6B6480] transition hover:bg-[#F7F5FF]"
        >
          السابقة
        </button>
        <button
          type="button"
          onClick={() => setFlipped((v) => !v)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6D28D9] px-3 py-2.5 text-sm font-black text-white transition hover:bg-[#1E1B4B]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {FLIP}
        </button>
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#EDE9FE] bg-white px-3 py-2.5 text-sm font-bold text-[#1E1B4B] transition hover:bg-[#F7F5FF]"
        >
          التالية
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function ExercisesBlock({ exercises }: { exercises: Exercise[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  if (exercises.length === 0) return null;

  const item = exercises[index % exercises.length];
  const revealed = selected !== null;
  const isCorrect = selected === item.correctAnswer;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
  }

  function next() {
    setSelected(null);
    setIndex((v) => (v + 1) % exercises.length);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-[#EDE9FE] pb-3">
        <h3 className="text-base font-black text-[#1E1B4B] sm:text-lg">{QUIZ_TITLE}</h3>
        <span className="rounded-lg bg-[#F3EFFF] px-2.5 py-1 text-[11px] font-black tabular-nums text-[#1E1B4B]">
          {index + 1} / {exercises.length}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-[#F3EFFF]">
        <div
          className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
          style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-[22px] border border-[#EDE9FE] bg-white shadow-[0_12px_32px_rgba(30,27,75,0.06)]"
        >
          <div className="border-b border-[#EDE9FE] bg-[#F7F5FF] px-4 py-2.5">
            <span className="text-[11px] font-black tracking-wide text-[#6D28D9]">تمرين</span>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <p className="text-base font-black leading-8 text-[#1E1B4B]">{item.question}</p>

            <div className="space-y-2">
              {item.options.map((option, i) => {
                const picked = selected === option;
                const isRight = option === item.correctAnswer;
                let styles =
                  "border-[#EDE9FE] bg-[#F7F5FF] text-[#1E1B4B] hover:border-[#6D28D9]/35 hover:bg-white";
                if (revealed && isRight) styles = "border-[#6D28D9] bg-[#F3EFFF] text-[#1E1B4B]";
                else if (revealed && picked && !isRight)
                  styles = "border-rose-300 bg-rose-50 text-rose-800";

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={revealed}
                    onClick={() => choose(option)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start text-sm font-bold transition disabled:cursor-default ${styles}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                        revealed && isRight
                          ? "bg-[#6D28D9] text-white"
                          : revealed && picked && !isRight
                            ? "bg-rose-500 text-white"
                            : "bg-white text-[#6D28D9]"
                      }`}
                    >
                      {OPTION_MARKS[i] ?? i + 1}
                    </span>
                    <span className="flex-1">{option}</span>
                    {revealed && isRight ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6D28D9]" /> : null}
                    {revealed && picked && !isRight ? (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {revealed ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 border-t border-[#EDE9FE] pt-4"
              >
                {isCorrect ? (
                  <p className="rounded-xl bg-[#F3EFFF] px-4 py-3 text-sm font-black text-[#1E1B4B]">
                    {CORRECT}
                  </p>
                ) : (
                  <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
                    الإجابة الصحيحة هي {item.correctAnswer}
                  </p>
                )}
                {item.explanation ? (
                  <p className="rounded-xl bg-[#F7F5FF] px-4 py-3 text-sm font-medium leading-7 text-[#6B6480]">
                    {item.explanation}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={next}
                  className="w-full rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1E1B4B]"
                >
                  {NEXT}
                </button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export function LessonMaterialsWidget({
  lessonId,
  lessonTitle,
  gradeLevel,
  branch,
}: {
  lessonId: string;
  lessonTitle: string;
  gradeLevel: string;
  branch: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!lessonId || !gradeLevel || !branch) {
      setLoading(false);
      setError("بيانات المستوى أو الشعبة غير متوفرة");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch("/api/lesson-materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            lessonTitle,
            gradeLevel,
            branch,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر التحميل");
        if (cancelled) return;
        setFlashcards(Array.isArray(data.flashcards) ? data.flashcards : []);
        setExercises(Array.isArray(data.exercises) ? data.exercises : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "تعذر التحميل");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonId, lessonTitle, gradeLevel, branch]);

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#EDE9FE] bg-white shadow-[0_12px_32px_rgba(30,27,75,0.06)]" dir="rtl">
      <div className="flex items-center justify-between border-b border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 sm:px-5">
        <h2 className="text-base font-black text-[#1E1B4B] sm:text-lg">مواد الدرس</h2>
        <span className="h-1.5 w-1.5 rounded-sm bg-[#6D28D9]" />
      </div>

      <div className="space-y-8 p-4 sm:p-5">
        {loading ? <MaterialsSkeleton /> : null}

        {!loading && error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-600">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <>
            <FlashcardsBlock cards={flashcards} />
            <ExercisesBlock exercises={exercises} />
            {flashcards.length === 0 && exercises.length === 0 ? (
              <p className="text-center text-sm font-bold text-[#6B6480]">
                لا توجد مواد جاهزة لهذا الدرس بعد
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
