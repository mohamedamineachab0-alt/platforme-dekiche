"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, X, Play, RefreshCw, Video, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPendingQuizLessons, saveLessonQuiz, type PendingQuizLesson } from "@/actions/quiz";

type Props = {
  currentSubjectId?: string;
  currentSubjectTitle?: string;
};

type ProcessLog = {
  lessonTitle: string;
  status: "success" | "failed";
  error?: string;
};

export function BatchQuizGeneratorModal({ currentSubjectId, currentSubjectTitle }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [scope, setScope] = useState<"current" | "all">(currentSubjectId ? "current" : "all");
  const [pendingLessons, setPendingLessons] = useState<PendingQuizLesson[]>([]);

  // Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLessonName, setCurrentLessonName] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Load pending lessons whenever modal opens or scope changes
  const loadPendingLessons = async (targetScope: "current" | "all") => {
    setIsLoadingList(true);
    try {
      const subjectParam = targetScope === "current" && currentSubjectId ? currentSubjectId : "ALL";
      const res = await getPendingQuizLessons(subjectParam);
      if (res.success && res.lessons) {
        setPendingLessons(res.lessons);
      } else {
        setPendingLessons([]);
      }
    } catch (err) {
      console.error("Failed to load pending lessons:", err);
      setPendingLessons([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsFinished(false);
    setLogs([]);
    setSuccessCount(0);
    setFailedCount(0);
    setCurrentIndex(0);
    setCurrentLessonName("");
    loadPendingLessons(scope);
  };

  const handleClose = () => {
    if (isProcessing) return; // Prevent closing mid-batch
    setIsOpen(false);
    if (isFinished) {
      router.refresh();
    }
  };

  const handleScopeChange = (newScope: "current" | "all") => {
    setScope(newScope);
    loadPendingLessons(newScope);
  };

  // Client-side sequential loop
  const handleStartBatch = async () => {
    if (pendingLessons.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsFinished(false);
    setSuccessCount(0);
    setFailedCount(0);
    setLogs([]);
    setCurrentIndex(0);

    let localSuccess = 0;
    let localFailed = 0;

    for (let i = 0; i < pendingLessons.length; i++) {
      const lesson = pendingLessons[i];
      setCurrentIndex(i);
      setCurrentLessonName(lesson.title);

      try {
        // Step 1: Call API to generate quiz questions
        const response = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            subjectTitle: lesson.subjectTitle,
            vimeoUrl: lesson.vimeoUrl,
            pdfUrl: lesson.pdfUrl,
            level: lesson.level,
            stream: lesson.stream,
            numberOfQuestions: 5,
            totalPoints: 20,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `فشل التوليد (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error("لم يرجع الذكاء الاصطناعي أي أسئلة صالحة");
        }

        // Step 2: Save generated quiz to DB using Prisma Server Action
        const saveResult = await saveLessonQuiz(lesson.id, data.questions, 20);
        if (!saveResult.success) {
          throw new Error(saveResult.error || "فشل حفظ الكويز في قاعدة البيانات");
        }

        localSuccess++;
        setSuccessCount(localSuccess);
        setLogs((prev) => [...prev, { lessonTitle: lesson.title, status: "success" }]);
      } catch (err: any) {
        console.error(`Error processing quiz for "${lesson.title}":`, err);
        localFailed++;
        setFailedCount(localFailed);
        setLogs((prev) => [
          ...prev,
          { lessonTitle: lesson.title, status: "failed", error: err?.message || "خطأ غير متوقع" },
        ]);
        // Continue to the next lesson!
      }
    }

    setIsProcessing(false);
    setIsFinished(true);
    router.refresh();
  };

  const total = pendingLessons.length;
  const progressPercent = total > 0 ? Math.round(((currentIndex + (isFinished ? 1 : 0)) / total) * 100) : 0;

  return (
    <>
      {/* Primary Trigger Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>توليد الكويزات الناقصة (AI)</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    توليد الكويزات التسلسلي (Batch AI Generator)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    توليد وحفظ كويزات تلقائية للدروس التي لا تملك كويز مع معالجة تسلسلية لمنع توقف الخادم
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

            {/* Scope Filter Tabs */}
            {!isProcessing && !isFinished && currentSubjectId && (
              <div className="px-6 pt-4 flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">نطاق التوليد:</span>
                <button
                  onClick={() => handleScopeChange("current")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    scope === "current"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  المادة المحددة ({currentSubjectTitle || "الحالية"})
                </button>
                <button
                  onClick={() => handleScopeChange("all")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    scope === "all"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  جميع المواد
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">جاري فحص الدروس المتبقية...</p>
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
                      <span className="text-purple-600 dark:text-purple-400 font-black">{progressPercent}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Processing Indicator */}
                  {isProcessing && (
                    <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">الدرس قيد التوليد الآن:</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{currentLessonName}</p>
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
                            تم إنشاء {successCount} من أصل {total} كويز بنجاح
                            {failedCount > 0 ? ` (${failedCount} تعذر توليدها)` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors"
                      >
                        إغلاق وتحديث
                      </button>
                    </div>
                  )}

                  {/* Live Progress Logs */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p className="text-xs font-bold text-slate-400">سجل المعالجة:</p>
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
                          <span className="font-bold truncate">{log.lessonTitle}</span>
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      الدروس الجاهزة للتوليد (تملك فيديو Vimeo أو مرفقات PDF بدون كويز):
                    </p>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs">
                      {pendingLessons.length} درس
                    </span>
                  </div>

                  {pendingLessons.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-black text-slate-800 dark:text-white text-base">جميع الدروس تحتوي على كويزات!</p>
                      <p className="text-xs text-slate-400 mt-1">لا توجد أي دروس بدون كويز في النطاق المحدد</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {pendingLessons.map((l) => (
                        <div
                          key={l.id}
                          className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between"
                        >
                          <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                {l.subjectTitle}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">الشهر {l.month}</span>
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{l.title}</p>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 shrink-0">
                            {l.vimeoUrl && (
                              <span title="يحتوي على فيديو Vimeo" className="p-1 rounded bg-sky-50 dark:bg-sky-950 text-sky-600">
                                <Video className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {l.pdfUrl && (
                              <span title="يحتوي على مرفق PDF" className="p-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-600">
                                <FileText className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
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
                {isFinished ? "إغلاق" : "إلغاء"}
              </button>

              {!isFinished && (
                <button
                  onClick={handleStartBatch}
                  disabled={isProcessing || pendingLessons.length === 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>بدء التوليد التلقائي ({pendingLessons.length})</span>
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
