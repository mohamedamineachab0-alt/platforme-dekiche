"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Sprout, XCircle } from "lucide-react";
import { getCycleByLevel } from "@/lib/constants";

type LessonOption = {
  id: string;
  title: string;
  subjectId: string;
  subjectTitle: string;
  levels: string[];
  streams: string[];
  description: string | null;
  month?: number;
};

type LevelOption = { value: string; label: string };

type LogRow = {
  lessonTitle: string;
  subjectTitle: string;
  status: "success" | "skipped" | "failed";
  detail: string;
};

export function AdminSeedContentClient({
  lessons,
  levels,
}: {
  lessons: LessonOption[];
  levels: LevelOption[];
}) {
  const [gradeLevel, setGradeLevel] = useState(levels[0]?.value || "");
  const [stream, setStream] = useState("");
  const [mode, setMode] = useState<"one" | "all">("all");
  const [lessonId, setLessonId] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [flashcardCount, setFlashcardCount] = useState(50);
  const [exerciseCount, setExerciseCount] = useState(50);
  const [skipIfExists, setSkipIfExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const streamOptions = useMemo(() => {
    const cycle = getCycleByLevel(gradeLevel);
    return cycle?.streams ?? [];
  }, [gradeLevel]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const levelOk = lesson.levels.length === 0 || lesson.levels.includes(gradeLevel);
      const streamOk =
        !stream || lesson.streams.length === 0 || lesson.streams.includes(stream);
      return levelOk && streamOk;
    });
  }, [lessons, gradeLevel, stream]);

  const selectedLesson = useMemo(
    () => filteredLessons.find((l) => l.id === lessonId) ?? null,
    [filteredLessons, lessonId]
  );

  function onLevelChange(value: string) {
    setGradeLevel(value);
    setStream("");
    setLessonId("");
  }

  async function seedOne(lesson: LessonOption, contentOverride?: string) {
    const res = await fetch("/api/admin/seed-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson.id,
        subjectId: lesson.subjectId,
        subject: lesson.subjectTitle,
        gradeLevel,
        stream,
        lessonTitle: lesson.title,
        lessonContent: contentOverride || lesson.description || "",
        month: lesson.month || 1,
        flashcardCount,
        exerciseCount,
        batchSize: 10,
        skipIfExists,
        writeReviewCards: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل التوليد");
    return data as {
      skipped?: boolean;
      reason?: string;
      flashcardsInserted: number;
      exercisesInserted: number;
      reviewCardsInserted: number;
      errors?: string[];
    };
  }

  async function runBulk() {
    if (!stream) {
      setError("اختر الشعبة أولا");
      return;
    }
    const queue = mode === "one" ? (selectedLesson ? [selectedLesson] : []) : filteredLessons;
    if (queue.length === 0) {
      setError(mode === "one" ? "اختر درسا" : "لا توجد دروس لهذا المستوى والشعبة");
      return;
    }

    setLoading(true);
    setError(null);
    setLogs([]);
    setProgress({ done: 0, total: queue.length });

    for (let i = 0; i < queue.length; i += 1) {
      const lesson = queue[i];
      setCurrentLabel(`${lesson.subjectTitle} — ${lesson.title}`);
      setProgress({ done: i, total: queue.length });
      try {
        const data = await seedOne(
          lesson,
          mode === "one" ? lessonContent || lesson.description || "" : undefined
        );
        if (data.skipped) {
          setLogs((prev) => [
            ...prev,
            {
              lessonTitle: lesson.title,
              subjectTitle: lesson.subjectTitle,
              status: "skipped",
              detail: data.reason || "موجود مسبقا",
            },
          ]);
        } else {
          setLogs((prev) => [
            ...prev,
            {
              lessonTitle: lesson.title,
              subjectTitle: lesson.subjectTitle,
              status: "success",
              detail: `${data.flashcardsInserted} بطاقة · ${data.exercisesInserted} تمرين · ${data.reviewCardsInserted} مراجعة`,
            },
          ]);
        }
      } catch (err) {
        setLogs((prev) => [
          ...prev,
          {
            lessonTitle: lesson.title,
            subjectTitle: lesson.subjectTitle,
            status: "failed",
            detail: err instanceof Error ? err.message : "فشل",
          },
        ]);
      }
      setProgress({ done: i + 1, total: queue.length });
    }

    setCurrentLabel("");
    setLoading(false);
  }

  const successCount = logs.filter((l) => l.status === "success").length;
  const skippedCount = logs.filter((l) => l.status === "skipped").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-sans text-[#1E1B4B]" dir="rtl">
      <div>
        <h1 className="text-2xl font-black">توليد بنك الحفظ والتمارين</h1>
        <p className="mt-2 text-sm font-medium text-[#6B6480]">
          يولد بطاقات مراجعة وتمارين دقيقة حسب المنهاج الجزائري لكل مادة ودرس حسب المستوى والشعبة
        </p>
      </div>

      <div className="space-y-4 rounded-[28px] border border-[#EDE9FE] bg-white p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`rounded-2xl border px-4 py-3 text-sm font-black ${
              mode === "all"
                ? "border-[#6D28D9] bg-[#F3EFFF] text-[#5B21B6]"
                : "border-slate-200 text-slate-600"
            }`}
          >
            كل المواد والدروس
          </button>
          <button
            type="button"
            onClick={() => setMode("one")}
            className={`rounded-2xl border px-4 py-3 text-sm font-black ${
              mode === "one"
                ? "border-[#6D28D9] bg-[#F3EFFF] text-[#5B21B6]"
                : "border-slate-200 text-slate-600"
            }`}
          >
            درس واحد
          </button>
        </div>

        <label className="block space-y-1.5 text-sm font-bold">
          المستوى
          <select
            value={gradeLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#6D28D9]"
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 text-sm font-bold">
          الشعبة
          <select
            value={stream}
            onChange={(e) => {
              setStream(e.target.value);
              setLessonId("");
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#6D28D9]"
          >
            <option value="">اختر الشعبة</option>
            {streamOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {mode === "one" ? (
          <>
            <label className="block space-y-1.5 text-sm font-bold">
              اسم الدرس
              <select
                value={lessonId}
                onChange={(e) => {
                  setLessonId(e.target.value);
                  const lesson = filteredLessons.find((l) => l.id === e.target.value);
                  if (lesson?.description) setLessonContent(lesson.description);
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#6D28D9]"
                disabled={!stream}
              >
                <option value="">اختر الدرس</option>
                {filteredLessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} — {lesson.subjectTitle}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-bold">
              نص الدرس اختياري لزيادة الدقة
              <textarea
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                rows={8}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#6D28D9]"
                placeholder="إن وُجد نص الدرس الصقه هنا ليكون التوليد أدق حسب المنهاج"
              />
            </label>
          </>
        ) : (
          <div className="rounded-2xl bg-[#F3EFFF] px-4 py-3 text-sm font-bold text-[#5B21B6]">
            سيتم توليد التمارين وبطاقات المراجعة لـ {filteredLessons.length} درسا مطابقا للمستوى والشعبة
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-bold">
            عدد البطاقات لكل درس
            <input
              type="number"
              min={5}
              max={50}
              value={flashcardCount}
              onChange={(e) => setFlashcardCount(Number(e.target.value) || 50)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#6D28D9]"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-bold">
            عدد التمارين لكل درس
            <input
              type="number"
              min={5}
              max={50}
              value={exerciseCount}
              onChange={(e) => setExerciseCount(Number(e.target.value) || 50)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-[#6D28D9]"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={skipIfExists}
            onChange={(e) => setSkipIfExists(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          تخطي الدروس التي لديها بنك جاهز مسبقا
        </label>

        <button
          type="button"
          disabled={loading || !stream || (mode === "one" && !lessonId)}
          onClick={runBulk}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#6D28D9] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
          {loading
            ? `جاري التوليد ${progress.done}/${progress.total}`
            : mode === "all"
              ? `توليد لكل الدروس (${filteredLessons.length})`
              : "توليد لهذا الدرس"}
        </button>

        {loading && currentLabel ? (
          <p className="text-sm font-bold text-[#6D28D9]">الآن: {currentLabel}</p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>
      ) : null}

      {logs.length > 0 ? (
        <div className="space-y-3 rounded-[28px] border border-[#EDE9FE] bg-white p-5">
          <p className="text-sm font-black">
            النتيجة نجاح {successCount} · تخطي {skippedCount} · فشل {failedCount}
          </p>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={`${log.lessonTitle}-${index}`}
                className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold"
              >
                {log.status === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : log.status === "skipped" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                )}
                <div>
                  <p className="text-[#1E1B4B]">
                    {log.subjectTitle} — {log.lessonTitle}
                  </p>
                  <p className="text-[#6B6480]">{log.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
