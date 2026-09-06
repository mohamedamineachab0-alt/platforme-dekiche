"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, BookOpen, Filter, Calendar } from "lucide-react";
import Link from "next/link";
import { RichMathText } from "@/components/shared/MathPreview";

export type MistakeRecord = {
  id: string;
  mistakeContent: string;
  correctSolution: string;
  createdAt: string; // ISO string
  title: string;
  subjectTitle: string;
  contextType: "lesson" | "exercise" | "exam" | "general";
  quizUrl?: string;
};

type Props = {
  initialMistakes: MistakeRecord[];
};

export function StudentMistakesClient({ initialMistakes }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    initialMistakes.forEach((m) => {
      if (m.subjectTitle) set.add(m.subjectTitle);
    });
    return Array.from(set);
  }, [initialMistakes]);

  // Filtered mistakes
  const filteredMistakes = useMemo(() => {
    return initialMistakes.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.mistakeContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.correctSolution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subjectTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === "ALL" || m.subjectTitle === selectedSubject;
      const matchesType = selectedType === "ALL" || m.contextType === selectedType;

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [initialMistakes, searchQuery, selectedSubject, selectedType]);

  const typeLabels: Record<string, string> = {
    lesson: "درس",
    exercise: "تمرين يومي",
    exam: "امتحان",
    general: "اختبار",
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نص السؤال أو الحل أو المادة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedSubject("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                selectedSubject === "ALL"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              كل المواد ({initialMistakes.length})
            </button>
            {subjects.map((sub) => {
              const count = initialMistakes.filter((m) => m.subjectTitle === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    selectedSubject === sub
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            النوع:
          </span>
          {[
            { key: "ALL", label: "الكل" },
            { key: "lesson", label: "الدروس" },
            { key: "exercise", label: "التمارين" },
            { key: "exam", label: "الامتحانات" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedType === t.key
                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {initialMistakes.length === 0 ? "لا توجد أي أخطاء مسجلة بعد" : "لا توجد نتائج مطابقة لبحثك"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            {initialMistakes.length === 0
              ? "عندما تحل اختبارات الدروس أو التمارين أو الامتحانات، سيتم تلقائياً حفظ الأسئلة التي أخطأت فيها هنا لتتمكن من مراجعتها وحلها مجدداً."
              : "جرب تغيير كلمات البحث أو إعادة تعيين الفلاتر لعرض كل الأخطاء."}
          </p>
          {(searchQuery || selectedSubject !== "ALL" || selectedType !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("ALL");
                setSelectedType("ALL");
              }}
              className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-colors"
            >
              إعادة ضبط البحث
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((mistake) => (
            <div
              key={mistake.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-black">
                    {mistake.subjectTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                    {typeLabels[mistake.contextType] || "اختبار"}
                  </span>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm md:text-base">
                    {mistake.title}
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1" dir="ltr">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(mistake.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  {mistake.quizUrl && (
                    <Link
                      href={mistake.quizUrl}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                    >
                      <span>إعادة الاختبار</span>
                      <ArrowLeft className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Mistake and Solution Side-by-Side on Desktop, Stacked on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mistake Box */}
                <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>الخطأ المسجل:</span>
                  </div>
                  <div className="text-sm font-semibold text-red-900 dark:text-red-200 leading-relaxed whitespace-pre-wrap">
                    <RichMathText text={mistake.mistakeContent} />
                  </div>
                </div>

                {/* Solution Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>الحل الصحيح والنموذجي:</span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">
                    <RichMathText text={mistake.correctSolution} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
