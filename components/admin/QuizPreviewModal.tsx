"use client";

import { useState } from "react";
import { Eye, X, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { RichMathText } from "@/components/shared/MathPreview";
import { getLessonQuiz } from "@/actions/quiz";

type Props = {
  lessonId: string;
  lessonTitle: string;
  questionCount?: number;
};

export function QuizPreviewModal({ lessonId, lessonTitle, questionCount }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    try {
      const res = await getLessonQuiz(lessonId);
      if (res.success && res.quiz) {
        setQuiz(res.quiz);
      } else {
        setError(res.error || "تعذر تحميل أسئلة الكويز");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ غير متوقع في جلب الكويز");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const questions = quiz ? (Array.isArray(quiz.questions) ? quiz.questions : []) : [];

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors"
        title="معاينة أسئلة الكويز"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>معاينة الكويز ({questionCount ?? 5})</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    معاينة أسئلة الكويز
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {lessonTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">جاري تحميل الأسئلة...</p>
                </div>
              ) : error ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : questions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm">
                  لا توجد أسئلة مسجلة في هذا الكويز
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q: any, qIdx: number) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white text-sm leading-relaxed">
                          <RichMathText text={q.question} />
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 mr-8">
                        {(q.options || []).map((opt: string, optIdx: number) => {
                          const isCorrect = optIdx === q.correctAnswerIndex;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-bold dark:bg-emerald-950/20 dark:border-emerald-800"
                                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                              >
                                {isCorrect ? "✓" : optIdx + 1}
                              </div>
                              <span className="truncate">
                                <RichMathText text={opt} />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                إجمالي الأسئلة: {questions.length} • العلامة القصوى: {quiz?.maxScore ?? 20}
              </span>
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
