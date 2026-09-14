"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import { RichMathText } from "@/components/shared/MathPreview";
import { QuestionHints } from "@/components/student/QuestionHints";
import { savePracticeAttempt } from "@/actions/practice";
import { saveQuizMistakes } from "@/actions/quiz";
import { scoreOn20, type PracticeQuestion } from "@/lib/practice";
import type { PracticeDifficulty, PracticeKind } from "@/generated/prisma";

type Props = {
  title: string;
  questions: PracticeQuestion[];
  minutes: number;
  kind: PracticeKind;
  subjectId?: string | null;
  month?: number | null;
  difficulty?: PracticeDifficulty | null;
  returnHref?: string;
};

export function PracticeQuizClient({
  title,
  questions,
  minutes,
  kind,
  subjectId,
  month,
  difficulty,
  returnHref = "/dashboard/student",
}: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (finished || minutes <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          void finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, minutes]);

  const correctCount = useMemo(
    () => questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length,
    [answers, questions]
  );

  const mistakes = useMemo(
    () =>
      questions
        .map((q, i) => ({ q, i }))
        .filter(({ q, i }) => answers[i] !== q.correctAnswerIndex)
        .map(({ q, i }) => ({
          question: q.question,
          studentAnswer: q.options[answers[i]] ?? "بدون إجابة",
          correctAnswer: q.options[q.correctAnswerIndex] ?? "",
          lessonId: q.lessonId,
          lessonTitle: q.lessonTitle,
        })),
    [answers, questions]
  );

  async function finish() {
    if (finished) return;
    setFinished(true);
    const score = scoreOn20(
      questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length,
      questions.length
    );
    const reviewLessonIds = [
      ...new Set(
        questions
          .filter((q, i) => answers[i] !== q.correctAnswerIndex && q.lessonId)
          .map((q) => q.lessonId as string)
      ),
    ];

    await savePracticeAttempt({
      kind,
      subjectId,
      month,
      difficulty,
      correctCount: questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length,
      totalQuestions: questions.length,
      score,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      reviewLessonIds,
    });

    const byQuiz = new Map<string, { lessonId: string | null; items: { mistakeContent: string; correctSolution: string }[] }>();
    questions.forEach((q, i) => {
      if (!q.quizId || answers[i] === q.correctAnswerIndex) return;
      const list = byQuiz.get(q.quizId) || { lessonId: q.lessonId || null, items: [] };
      list.items.push({
        mistakeContent: `السؤال: ${q.question}\nإجابتك: ${q.options[answers[i]] ?? "بدون إجابة"}`,
        correctSolution: `الإجابة الصحيحة: ${q.options[q.correctAnswerIndex] ?? ""}`,
      });
      byQuiz.set(q.quizId, list);
    });
    for (const [quizId, bundle] of byQuiz) {
      await saveQuizMistakes(bundle.lessonId, quizId, bundle.items);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-10 text-center">
        <p className="font-black text-[#1E1B4B]">لا توجد أسئلة متاحة</p>
        <Link href={returnHref} className="mt-4 inline-block font-bold text-[#6D28D9]">
          العودة
        </Link>
      </div>
    );
  }

  if (finished) {
    const score = scoreOn20(correctCount, questions.length);
    const reviewLessons = [...new Map(mistakes.filter((m) => m.lessonId).map((m) => [m.lessonId, m])).values()];

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-[#6B6480]">{title}</p>
          <p className="mt-3 text-5xl font-black text-[#6D28D9]">
            {score}
            <span className="text-2xl text-[#A8B4D6]"> / 20</span>
          </p>
          {kind === "DAILY_CHALLENGE" && (
            <p className="mt-2 text-lg font-black text-[#1E1B4B]">
              {correctCount}/{questions.length}
            </p>
          )}
        </div>

        {mistakes.length > 0 ? (
          <div className="space-y-4 rounded-[32px] border border-[#EDE9FE] bg-white p-6">
            <h3 className="text-lg font-black text-[#1E1B4B]">الأسئلة التي أخطأت فيها</h3>
            {mistakes.map((item, i) => (
              <div key={i} className="rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4 space-y-3">
                <div className="font-bold text-[#1E1B4B]">
                  <RichMathText text={item.question} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs font-black text-red-600">
                      <XCircle className="h-4 w-4" /> إجابتك
                    </p>
                    <RichMathText text={item.studentAnswer} />
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs font-black text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> الإجابة الصحيحة
                    </p>
                    <RichMathText text={item.correctAnswer} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 text-center">
            <p className="font-black text-emerald-800">كل إجاباتك صحيحة</p>
          </div>
        )}

        {reviewLessons.length > 0 && (
          <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-6">
            <h3 className="mb-3 text-lg font-black text-[#1E1B4B]">دروس تحتاج مراجعتها</h3>
            <div className="space-y-2">
              {reviewLessons.map((item) => (
                <div
                  key={item.lessonId}
                  className="block rounded-2xl bg-[#F7F5FF] px-4 py-3 text-sm font-bold text-[#6D28D9]"
                >
                  {item.lessonTitle}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-[#6D28D9] px-5 py-3 text-sm font-black text-white hover:bg-[#1E1B4B]"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة المحاولة
          </button>
          <Link
            href={returnHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#F7F5FF] px-5 py-3 text-sm font-black text-[#6D28D9]"
          >
            العودة
          </Link>
        </div>
      </div>
    );
  }

  const current = questions[index];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-bold text-[#6B6480]">{title}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F5FF] px-3 py-1.5 text-sm font-black text-[#6D28D9]">
          <Clock className="h-4 w-4" />
          {mm}:{ss}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#EDE9FE]">
        <div
          className="h-full bg-[#6D28D9] transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-6 sm:p-8">
        <p className="mb-2 text-xs font-bold text-[#A8B4D6]">
          السؤال {index + 1} من {questions.length}
        </p>
        <h2 className="mb-6 text-xl font-black leading-relaxed text-[#1E1B4B]">
          <RichMathText text={current.question} />
        </h2>
        <div className="space-y-3">
          {current.options.map((opt, idx) => {
            const selected = answers[index] === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, [index]: idx }))}
                className={`w-full rounded-2xl border-2 p-4 text-right font-bold transition ${
                  selected
                    ? "border-[#6D28D9] bg-[#F7F5FF] text-[#6D28D9]"
                    : "border-[#EDE9FE] text-[#1E1B4B] hover:border-[#6D28D9]/40"
                }`}
              >
                <RichMathText text={opt} />
              </button>
            );
          })}
        </div>

        <QuestionHints
          key={index}
          question={current.question}
          options={current.options}
          correctAnswerIndex={current.correctAnswerIndex}
          hint1={current.hint1}
          hint2={current.hint2}
          explanation={current.explanation}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-full px-5 py-3 font-bold text-[#6B6480] disabled:opacity-30"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={() => (index === questions.length - 1 ? void finish() : setIndex((i) => i + 1))}
          disabled={answers[index] === undefined}
          className="inline-flex items-center gap-2 rounded-full bg-[#6D28D9] px-6 py-3 font-black text-white hover:bg-[#1E1B4B] disabled:opacity-40"
        >
          {index === questions.length - 1 ? "إنهاء وعرض النتيجة" : "التالي"}
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
