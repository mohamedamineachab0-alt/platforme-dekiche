"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { submitLessonOpinion } from "@/actions/lesson-opinions";

export function LessonOpinionForm({
  lessonId,
  initialRating = 0,
  initialComment = "",
}: {
  lessonId: string;
  initialRating?: number;
  initialComment?: string;
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await submitLessonOpinion({ lessonId, rating, comment });
    if (res.error) {
      setError(res.error);
    } else {
      setMessage(initialComment || initialRating ? "تم تحديث رأيك بنجاح" : "تم إرسال رأيك بنجاح");
    }
    setLoading(false);
  }

  const active = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 overflow-hidden rounded-[22px] border border-[#EDE9FE] bg-white shadow-[0_12px_32px_rgba(30,27,75,0.06)]"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 sm:px-5">
        <h3 className="text-base font-black text-[#1E1B4B] sm:text-lg">رأيك في هذا الدرس</h3>
        <span className="h-1.5 w-1.5 rounded-sm bg-[#6D28D9]" />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <p className="text-xs font-medium leading-relaxed text-[#6B6480] sm:text-sm">
          قيّم الدرس واكتب ملاحظاتك ليصل رأيك إلى الإدارة
        </p>

        <div className="rounded-xl border border-[#EDE9FE] bg-[#F7F5FF] px-3 py-3 sm:px-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wide text-[#6D28D9]">التقييم</span>
            <span className="text-xs font-black tabular-nums text-[#1E1B4B]">
              {rating > 0 ? `${rating} / 5` : "اختر التقييم"}
            </span>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="تقييم النجوم">
            {[1, 2, 3, 4, 5].map((value) => {
              const on = value <= active;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(0)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                    on ? "bg-[#6D28D9] text-white" : "bg-white text-[#C4B5FD] hover:bg-white/80"
                  }`}
                  aria-label={`${value} نجوم`}
                  aria-pressed={rating === value}
                >
                  <Star className={`h-5 w-5 ${on ? "fill-white text-white" : "fill-transparent"}`} />
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="اكتب رأيك حول الشرح والوضوح والفائدة"
          className="min-h-[100px] w-full resize-y rounded-xl border border-[#EDE9FE] bg-[#F7F5FF] px-3 py-3 text-sm font-medium text-[#1E1B4B] placeholder:text-[#A8B4D6] focus:border-[#6D28D9] focus:bg-white focus:outline-none sm:px-4"
        />

        {error ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700 sm:text-sm">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 sm:text-sm">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || rating < 1 || comment.trim().length < 5}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1E1B4B] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الإرسال
            </>
          ) : (
            "إرسال الرأي"
          )}
        </button>
      </div>
    </form>
  );
}
