"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  FileText,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
  Layers,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPendingQuizLessons,
  getSubjectQuizStats,
  saveLessonQuiz,
  type PendingQuizLesson,
  type SubjectQuizStat,
} from "@/actions/quiz";

type Props = {
  currentSubjectId?: string;
  currentSubjectTitle?: string;
};

type ProcessLog = {
  lessonTitle: string;
  subjectTitle: string;
  status: "success" | "failed";
  error?: string;
};

export function BatchQuizGeneratorModal({ currentSubjectId, currentSubjectTitle }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [subjectsStats, setSubjectsStats] = useState<SubjectQuizStat[]>([]);
  const [pendingLessons, setPendingLessons] = useState<PendingQuizLesson[]>([]);
  
  // New selections
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<"quiz" | "daily_exercise" | "review_cards">("quiz");

  // Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLessonName, setCurrentLessonName] = useState("");
  const [currentSubjectName, setCurrentSubjectName] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Load subject stats and pending lessons
  const loadData = async (targetSubjectId: string) => {
    if (!targetSubjectId) return;
    setIsLoadingList(true);
    try {
      const [statsRes, lessonsRes] = await Promise.all([
        getSubjectQuizStats(),
        getPendingQuizLessons(targetSubjectId),
      ]);

      if (statsRes.success && statsRes.subjects) {
        setSubjectsStats(statsRes.subjects);
        // If the targeted subject wasn't set or valid, fallback to first available
        if (!targetSubjectId && statsRes.subjects.length > 0) {
          setSelectedSubjectId(statsRes.subjects[0].id);
        }
      }

      if (lessonsRes.success && lessonsRes.lessons) {
        setPendingLessons(lessonsRes.lessons);
        setSelectedLessonIds(lessonsRes.lessons.map(l => l.id)); // Select all by default
      } else {
        setPendingLessons([]);
        setSelectedLessonIds([]);
      }
    } catch (err) {
      console.error("Failed to load batch quiz data:", err);
      setPendingLessons([]);
      setSelectedLessonIds([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedSubjectId) {
      loadData(selectedSubjectId);
    }
  }, [isOpen, selectedSubjectId]);

  const handleOpen = async () => {
    setIsOpen(true);
    setIsFinished(false);
    setLogs([]);
    setSuccessCount(0);
    setFailedCount(0);
    setCurrentIndex(0);
    setCurrentLessonName("");
    setCurrentSubjectName("");
    setSelectedLanguage("auto");
    
    let target = currentSubjectId;
    if (!target) {
       const stats = await getSubjectQuizStats();
       if (stats.success && stats.subjects && stats.subjects.length > 0) {
         target = stats.subjects[0].id;
       }
    }
    if (target) {
      setSelectedSubjectId(target);
      loadData(target);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsOpen(false);
    if (isFinished) {
      router.refresh();
      window.location.reload();
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    if (isProcessing || subjectId === selectedSubjectId) return;
    setSelectedSubjectId(subjectId);
  };

  const handleToggleLesson = (id: string) => {
    setSelectedLessonIds(prev => 
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const handleToggleAllLessons = () => {
    if (selectedLessonIds.length === pendingLessons.length) {
      setSelectedLessonIds([]);
    } else {
      setSelectedLessonIds(pendingLessons.map(l => l.id));
    }
  };

  // Client-side sequential loop
  const handleStartBatch = async () => {
    const targetLessons = pendingLessons.filter(l => selectedLessonIds.includes(l.id));
    if (targetLessons.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsFinished(false);
    setSuccessCount(0);
    setFailedCount(0);
    setLogs([]);
    setCurrentIndex(0);

    let localSuccess = 0;
    let localFailed = 0;

    for (let i = 0; i < targetLessons.length; i++) {
      const lesson = targetLessons[i];
      setCurrentIndex(i);
      setCurrentLessonName(lesson.title);
      setCurrentSubjectName(lesson.subjectTitle);

      try {
        // Step 1: Call API to generate & persist
        let endpoint = "/api/generate-quiz";
        if (targetType === "daily_exercise") endpoint = "/api/generate-daily-exercise";
        if (targetType === "review_cards") endpoint = "/api/generate-review-cards";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            subjectTitle: lesson.subjectTitle,
            vimeoUrl: lesson.vimeoUrl,
            pdfUrl: lesson.pdfUrls?.[0], // Fallback
            pdfUrls: lesson.pdfUrls,
            level: lesson.level,
            stream: lesson.stream,
            numberOfQuestions: 5,
            numberOfCards: 5,
            totalPoints: 20,
            forcedLanguage: selectedLanguage,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `فشل التوليد (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (targetType === "quiz" && (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0)) {
          throw new Error("لم يرجع الذكاء الاصطناعي أي أسئلة صالحة");
        }
        if (targetType === "daily_exercise" && !data.exerciseId) {
          throw new Error("فشل توليد التمرين اليومي");
        }
        if (targetType === "review_cards" && (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0)) {
          throw new Error("لم يرجع الذكاء الاصطناعي أي بطاقات صالحة");
        }

        // Step 2: Fallback persist if API didn't already persist (only for quiz)
        if (targetType === "quiz" && !data.saved) {
          const saveResult = await saveLessonQuiz(lesson.id, data.questions, 20);
          if (!saveResult.success) {
            throw new Error(saveResult.error || "فشل حفظ الكويز في قاعدة البيانات");
          }
        }

        localSuccess++;
        setSuccessCount(localSuccess);
        setLogs((prev) => [
          ...prev,
          { lessonTitle: lesson.title, subjectTitle: lesson.subjectTitle, status: "success" },
        ]);
      } catch (err: any) {
        console.error(`Error processing quiz for "${lesson.title}":`, err);
        localFailed++;
        setFailedCount(localFailed);
        setLogs((prev) => [
          ...prev,
          {
            lessonTitle: lesson.title,
            subjectTitle: lesson.subjectTitle,
            status: "failed",
            error: err?.message || "خطأ غير متوقع",
          },
        ]);
      }
    }

    setIsProcessing(false);
    setIsFinished(true);
    router.refresh();
  };

  const targetLessonsCount = selectedLessonIds.length;
  const total = targetLessonsCount;
  const progressPercent =
    total > 0 ? Math.round(((currentIndex + (isFinished ? 1 : 0)) / total) * 100) : 0;

  // Compute total pending across all subjects for summary badge
  const totalPendingAcrossAll = subjectsStats.reduce(
    (acc, curr) => acc + (curr.pendingWithFiles || 0),
    0
  );

  const selectedStat = subjectsStats.find((s) => s.id === selectedSubjectId);

  return (
    <>
      {/* Primary Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>توليد كويزات الذكاء الاصطناعي (AI)</span>
        {totalPendingAcrossAll > 0 && (
          <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-mono font-black">
            {totalPendingAcrossAll}
          </span>
        )}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    توليد الكويزات بالمادة (Batch AI Quiz Generator)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    توليد تلقائي تسلسلي بالذكاء الاصطناعي حصراً للدروس التي تحتوي على وثائق وملفات تعليمية
                  </p>
                </div>
              </div>

              {!isProcessing && (
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Target Type Selector */}
            {!isProcessing && !isFinished && (
              <div className="px-6 pt-6 pb-2 space-y-3 border-b border-slate-100 dark:border-slate-800">
                <label className="text-sm font-bold text-slate-700 block">ماذا تريد أن تولد؟</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType("quiz")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      targetType === "quiz"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    كويز الدرس
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("daily_exercise")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      targetType === "daily_exercise"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تمرين يومي
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("review_cards")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      targetType === "review_cards"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    بطاقات المراجعة
                  </button>
                </div>
              </div>
            )}

            {/* Subject Selector Bar */}
            {!isProcessing && !isFinished && (
              <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    اختر المادة لتنظيم التوليد:
                  </span>
                </div>

                {/* Horizontal Scrollable Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {subjectsStats.map((sub) => {
                    const isSelected = selectedSubjectId === sub.id;
                    const hasPending = sub.pendingWithFiles > 0;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubjectChange(sub.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-purple-700 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        <span>{sub.title}</span>
                        {hasPending ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                              isSelected
                                ? "bg-amber-400 text-slate-950"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sub.pendingWithFiles}
                          </span>
                        ) : (
                          <Check className="w-3 h-3 text-emerald-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Configuration Bar */}
            {!isProcessing && !isFinished && pendingLessons.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">لغة الكويز:</span>
                </div>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold px-3 py-1.5 text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500"
                >
                  <option value="auto">تلقائي (حسب المادة)</option>
                  <option value="العربية (Arabic)">العربية (Arabic)</option>
                  <option value="الفرنسية (French)">الفرنسية (French)</option>
                  <option value="الإنجليزية (English)">الإنجليزية (English)</option>
                  <option value="الإسبانية (Spanish)">الإسبانية (Spanish)</option>
                  <option value="الألمانية (German)">الألمانية (German)</option>
                  <option value="الإيطالية (Italian)">الإيطالية (Italian)</option>
                </select>
              </div>
            )}

            {/* Quality Rule Banner */}
            {!isProcessing && !isFinished && (
              <div className="px-6 py-2.5 bg-purple-50/60 dark:bg-purple-950/20 border-b border-purple-100/50 dark:border-purple-900/30 flex items-center gap-2 text-[11px] font-bold text-purple-800 dark:text-purple-300">
                <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  قاعدة الجودة الأكاديمية: يتم توليد الكويز حصراً للدروس المرفقة بملفات تعليمية وسيتم استخراج المحتوى من كافة ملفات الدرس.
                </span>
              </div>
            )}

            {/* Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">جاري فحص حالة الدروس والملفات...</p>
                </div>
              ) : isProcessing || isFinished ? (
                /* Execution & Progress Section */
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-700 dark:text-slate-200">
                        {isProcessing
                          ? `جاري معالجة الدرس ${currentIndex + 1} من ${total}...`
                          : `اكتملت العملية (${successCount + failedCount} من ${total})`}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-black">
                        {progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Processing Indicator */}
                  {isProcessing && (
                    <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                          المادة: {currentSubjectName}
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {currentLessonName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Finished Banner */}
                  {isFinished && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-black text-emerald-900 dark:text-emerald-300 text-sm">
                            تم إنهاء التوليد التلقائي بنجاح!
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                            تم إنشاء وحفظ {successCount} من أصل {total} كويز بنجاح
                            {failedCount > 0 ? ` (${failedCount} تعذر توليدها)` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors"
                      >
                        إغلاق وتحديث الواجهة
                      </button>
                    </div>
                  )}

                  {/* Live Progress Logs */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p className="text-xs font-bold text-slate-400">سجل العمليات:</p>
                    {logs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          log.status === "success"
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-300"
                            : "bg-amber-50/50 border-amber-100 text-amber-800 dark:bg-amber-950/10 dark:border-amber-900/20 dark:text-amber-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {log.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className="font-bold truncate">
                            [{log.subjectTitle}] {log.lessonTitle}
                          </span>
                        </div>
                        <span className="shrink-0 font-medium">
                          {log.status === "success" ? "تم بنجاح" : log.error || "فشل"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Initial Pending Lessons Review */
                <div className="space-y-4">
                  {/* Summary of current view */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {selectedStat?.title || "المادة المحددة"}
                      </span>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-xl">
                      <input 
                        type="checkbox" 
                        checked={pendingLessons.length > 0 && selectedLessonIds.length === pendingLessons.length}
                        onChange={handleToggleAllLessons}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                      />
                      <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                        تحديد الكل ({pendingLessons.length})
                      </span>
                    </label>
                  </div>

                  {pendingLessons.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="font-black text-slate-800 dark:text-white text-base">
                        كافة الدروس المرفقة بملفات في هذه المادة تحتوي على كويزات مكتملة!
                      </p>
                      <p className="text-xs text-slate-400">
                        لا توجد أي دروس بحاجة لكويز هنا
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {pendingLessons.map((l) => (
                        <label
                          key={l.id}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            selectedLessonIds.includes(l.id)
                             ? "border-purple-300 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20"
                             : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <input 
                              type="checkbox"
                              checked={selectedLessonIds.includes(l.id)}
                              onChange={() => handleToggleLesson(l.id)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 shrink-0"
                            />
                            <div className="space-y-1 overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">
                                  الشهر {l.month}
                                </span>
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {l.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {l.pdfUrls && l.pdfUrls.length > 0 && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30"
                              >
                                <FileText className="w-3 h-3" />
                                <span>{l.pdfUrls.length} ملفات</span>
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                {isFinished ? "إغلاق وتحديث" : "إلغاء"}
              </button>

              {!isFinished && (
                <button
                  onClick={handleStartBatch}
                  disabled={isProcessing || selectedLessonIds.length === 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {targetType === "quiz" && `توليد ${selectedLessonIds.length} كويزات (AI)`}
                        {targetType === "daily_exercise" && `توليد ${selectedLessonIds.length} تمارين يومية (AI)`}
                        {targetType === "review_cards" && `توليد بطاقات المراجعة (AI)`}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
