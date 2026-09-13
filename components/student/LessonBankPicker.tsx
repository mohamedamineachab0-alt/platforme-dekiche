"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function LessonBankPicker({
  lessons,
  selected,
}: {
  lessons: string[];
  selected?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (lessons.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#EDE9FE] bg-white px-4 py-5 text-center text-sm font-bold text-[#6B6480]">
        لا توجد دروس جاهزة لمستواك وشعبتك بعد
      </div>
    );
  }

  function onChange(lessonTitle: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (lessonTitle) params.set("lesson", lessonTitle);
    else params.delete("lesson");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="block space-y-2 text-sm font-bold text-[#1E1B4B]" dir="rtl">
      اسم الدرس
      <select
        value={selected || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#EDE9FE] bg-white px-4 py-3 font-bold text-[#1E1B4B] outline-none focus:border-[#6D28D9]"
      >
        <option value="">اختر الدرس</option>
        {lessons.map((title) => (
          <option key={title} value={title}>
            {title}
          </option>
        ))}
      </select>
    </label>
  );
}
