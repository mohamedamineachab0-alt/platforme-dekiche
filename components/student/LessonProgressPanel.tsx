"use client";

import { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import { CheckCircle2, Circle } from "lucide-react";
import { markLessonComplete, recordLessonWatch } from "@/actions/lesson-progress";

type Props = {
  lessonId: string;
  vimeoVideoId: string;
  lessonTitle: string;
  subjectTitle: string;
  completedCount: number;
  totalLessons: number;
  initiallyCompleted: boolean;
  initialWatchedSeconds: number;
};

export function LessonProgressPanel({
  lessonId,
  vimeoVideoId,
  lessonTitle,
  subjectTitle,
  completedCount,
  totalLessons,
  initiallyCompleted,
  initialWatchedSeconds,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSentRef = useRef(initialWatchedSeconds);
  const completedRef = useRef(initiallyCompleted);
  const completingRef = useRef(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [doneCount, setDoneCount] = useState(completedCount);
  const [watchPercent, setWatchPercent] = useState(initiallyCompleted ? 100 : 0);
  const [message, setMessage] = useState<string | null>(
    initiallyCompleted ? "الدرس منجز عبر المشاهدة" : null
  );

  const subjectPercent =
    totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  function applyCompleteLocally() {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    setWatchPercent(100);
    setDoneCount((v) => Math.min(totalLessons, v + 1));
  }

  async function completeFromWatch() {
    if (completedRef.current || completingRef.current) return;
    completingRef.current = true;
    const res = await markLessonComplete({ lessonId });
    completingRef.current = false;
    if (res.error) {
      setMessage(res.error);
      return;
    }
    applyCompleteLocally();
    setMessage("أحسنت تم إنجاز الدرس عبر المشاهدة");
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const player = new Player(iframe);
    let cancelled = false;

    const flush = async (seconds: number, percent: number) => {
      if (cancelled) return;
      setWatchPercent(Math.round(percent * 100));
      if (seconds <= lastSentRef.current + 8) return;
      lastSentRef.current = seconds;
      await recordLessonWatch({ lessonId, watchedSeconds: Math.floor(seconds) });
    };

    const onTimeUpdate = (data: { seconds: number; percent: number }) => {
      void flush(data.seconds, data.percent);
      if (data.percent >= 0.9) {
        void completeFromWatch();
      }
    };

    const onEnded = () => {
      setWatchPercent(100);
      void completeFromWatch();
    };

    player.on("timeupdate", onTimeUpdate);
    player.on("ended", onEnded);

    return () => {
      cancelled = true;
      player.off("timeupdate", onTimeUpdate);
      player.off("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bind once per lesson
  }, [lessonId]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm ring-2 ring-[#6D28D9]/30 sm:rounded-2xl">
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoVideoId}?title=0&byline=0&portrait=0`}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={lessonTitle}
        />
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#EDE9FE] bg-white shadow-[0_12px_32px_rgba(30,27,75,0.06)]">
        <div className="flex items-center justify-between border-b border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 sm:px-5">
          <h2 className="text-base font-black text-[#1E1B4B] sm:text-lg">تقدم الدرس</h2>
          <span className="rounded-lg bg-[#F3EFFF] px-2.5 py-1 text-[11px] font-black tabular-nums text-[#1E1B4B]">
            {subjectPercent}%
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-[#6B6480]">{subjectTitle}</p>
              <p className="text-xs font-black tabular-nums text-[#1E1B4B]">
                {doneCount} / {totalLessons} درس
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F3EFFF]">
              <div
                className="h-full rounded-full bg-[#6D28D9] transition-all duration-500"
                style={{ width: `${subjectPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#EDE9FE] bg-[#F7F5FF] p-3.5 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6D28D9]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#C4B5FD]" />
                )}
                <p className="truncate text-sm font-black text-[#1E1B4B]">{lessonTitle}</p>
              </div>
              <span className="shrink-0 text-[11px] font-black tabular-nums text-[#1E1B4B]">
                {completed ? "مكتمل" : `${watchPercent}% مشاهدة`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
                style={{ width: `${completed ? 100 : watchPercent}%` }}
              />
            </div>
          </div>

          {message ? (
            <p className="rounded-xl bg-[#F3EFFF] px-3 py-2.5 text-xs font-bold text-[#1E1B4B] sm:text-sm">
              {message}
            </p>
          ) : (
            <p className="text-center text-xs font-bold text-[#6B6480]">
              شاهد 90% من الفيديو لإتمام الدرس
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
