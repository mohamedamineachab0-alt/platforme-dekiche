"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Trophy, ArrowLeft, RotateCcw, AlertTriangle, BookOpen } from "lucide-react";
import Link from "next/link";
import { saveQuizMistakes } from "@/actions/quiz";
import { RichMathText } from "@/components/shared/MathPreview";
import { QuestionHints } from "@/components/student/QuestionHints";

type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

type Props = {
  lessonId?: string;
  lessonTitle: string;
  quizId: string;
  questions: Question[];
  contextType?: "lesson" | "exam" | "exercise";
};

type MistakeItem = {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  questionIndex: number;
};

export function QuizClient({ lessonId, lessonTitle, quizId, questions, contextType = "lesson" }: Props) {
  const maxScore = 20;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectOption = (optionIndex: number) => {
    if (isFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
    setMistakes([]);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);

      // Identify mistakes
      const mistakesList: MistakeItem[] = [];
      const mistakesToSave: { mistakeContent: string; correctSolution: string }[] = [];

      questions.forEach((q, i) => {
        const studentChoice = selectedAnswers[i];
        if (studentChoice !== q.correctAnswerIndex) {
          const studentAnsText = q.options[studentChoice] ?? "لم يتم اختيار إجابة";
          const correctAnsText = q.options[q.correctAnswerIndex] ?? "";

          mistakesList.push({
            question: q.question,
            studentAnswer: studentAnsText,
            correctAnswer: correctAnsText,
            questionIndex: i + 1,
          });

          mistakesToSave.push({
            mistakeContent: `السؤال ${i + 1}: ${q.question}\nإجابتك: ${studentAnsText}`,
            correctSolution: `الإجابة الصحيحة: ${correctAnsText}`,
          });
        }
      });

      setMistakes(mistakesList);

      if (mistakesToSave.length > 0) {
        setIsSaving(true);
        try {
          await saveQuizMistakes(lessonId || null, quizId, mistakesToSave);
        } catch (error) {
          console.error("Failed to save mistakes to database:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">لا توجد أسئلة</h2>
        <p className="text-slate-500 mb-6">هذا الاختبار لا يحتوي على أي أسئلة حالياً</p>
        {contextType === "lesson" && lessonId ? (
          <Link href={`/dashboard/student/lessons/${lessonId}`} className="bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold">العودة للدرس</Link>
        ) : (
          <Link href={`/dashboard/student/${contextType === "exam" ? "exams" : "exercises"}`} className="bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold">العودة</Link>
        )}
      </div>
    );
  }

  if (isFinished) {
    let score = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswerIndex) {
        score += 1;
      }
    });

    const finalScore = Math.round((score / questions.length) * maxScore);
    const percentage = (finalScore / maxScore) * 100;

    let uiColor = "";
    let IconComponent = Trophy;
    let feedbackMessage = "";

    if (percentage < 50) {
      uiColor = "red";
      IconComponent = RotateCcw;
      feedbackMessage = "عليك التركيز أكثر، راجع أخطاءك وحاول مجدداً!";
    } else if (percentage >= 50 && percentage < 75) {
      uiColor = "orange";
      IconComponent = Trophy;
      feedbackMessage = "نتيجة جيدة، راجع الأخطاء بالأسفل لتصل إلى الدرجة الكاملة";
    } else {
      uiColor = "emerald";
      IconComponent = Trophy;
      feedbackMessage = "ممتاز يا بطل! أداء استثنائي نفخر به";
    }

    const colorClasses = {
      red: {
        text: "text-amber-600",
        bg: "bg-amber-100 dark:bg-amber-900/30",
        gradient: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30",
        scoreText: "text-amber-600",
      },
      orange: {
        text: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        gradient: "bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-500/30",
        scoreText: "text-orange-500",
      },
      emerald: {
        text: "text-emerald-700",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        gradient: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30",
        scoreText: "text-emerald-600",
      },
    };

    const currentColors = colorClasses[uiColor as keyof typeof colorClasses];

    const returnUrl =
      contextType === "lesson" && lessonId
        ? `/dashboard/student/lessons/${lessonId}`
        : `/dashboard/student/${contextType === "exam" ? "exams" : "exercises"}`;

    return (
      <div className="space-y-8 max-w-3xl mx-auto pb-12">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 md:p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 shadow-lg text-white ${currentColors.gradient}`}>
            <IconComponent className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">النتيجة النهائية</h2>
          <p className="text-slate-500 font-medium mb-6">لقد أكملت اختبار: {lessonTitle}</p>

          <div className={`text-4xl sm:text-6xl font-black mb-6 flex justify-center items-baseline gap-2 ${currentColors.scoreText}`}>
            <span>{finalScore}</span>
            <span className="text-2xl text-slate-400">/ {maxScore}</span>
          </div>

          <div className={`text-base font-bold mb-6 px-6 py-3 rounded-xl inline-block ${currentColors.text} ${currentColors.bg}`}>
            {feedbackMessage}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة المحاولة
            </button>

            <Link
              href="/dashboard/student/mistakes"
              className="inline-flex items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#1E1B4B] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              سجل أخطائي الكامل
            </Link>

            <Link
              href={returnUrl}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              العودة للمحتوى
            </Link>
          </div>
        </div>

        {/* Mistakes Review Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">مراجعة الأسئلة والأخطاء</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mistakes.length === 0
                    ? "إجاباتك صحيحة 100% بدون أي خطأ"
                    : `تم تسجيل ${mistakes.length} خطأ وتمت إضافتها إلى صفحة "أخطائي"`}
                </p>
              </div>
            </div>

            {mistakes.length > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded-lg text-xs font-black">
                {mistakes.length} خطأ
              </span>
            )}
          </div>

          {mistakes.length === 0 ? (
            <div className="py-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-black text-emerald-800 dark:text-emerald-400 text-lg">كل إجاباتك صحيحة!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">لم ترتكب أي أخطاء في هذا الاختبار</p>
            </div>
          ) : (
            <div className="space-y-5">
              {mistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.questionIndex}
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white text-base leading-relaxed">
                      <RichMathText text={item.question} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Student's Wrong Answer */}
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>إجابتك:</span>
                      </div>
                      <div className="font-semibold text-sm text-red-800 dark:text-red-300">
                        <RichMathText text={item.studentAnswer} />
                      </div>
                    </div>

                    {/* Correct Solution */}
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>الحل الصحيح:</span>
                      </div>
                      <div className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                        <RichMathText text={item.correctAnswer} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasSelectedCurrent = selectedAnswers[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={
              contextType === "lesson" && lessonId
                ? `/dashboard/student/lessons/${lessonId}`
                : `/dashboard/student/${contextType === "exam" ? "exams" : "exercises"}`
            }
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            title="خروج من الاختبار"
          >
            <XCircle className="w-5 h-5" />
          </Link>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px] md:max-w-md">
            {lessonTitle}
          </span>
        </div>
        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1.5 rounded-lg text-sm font-bold">
          السؤال {currentQuestionIndex + 1} من {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 leading-relaxed">
          <RichMathText text={currentQuestion.question} />
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-right p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <span className={`font-bold text-lg ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                  <RichMathText text={opt} />
                </span>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-300"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>

        <QuestionHints
          key={currentQuestionIndex}
          question={currentQuestion.question}
          options={currentQuestion.options}
          correctAnswerIndex={currentQuestion.correctAnswerIndex}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          السابق
        </button>

        <button
          onClick={handleNext}
          disabled={!hasSelectedCurrent}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm"
        >
          {currentQuestionIndex === questions.length - 1 ? "إنهاء الاختبار وعرض النتائج" : "التالي"}
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
