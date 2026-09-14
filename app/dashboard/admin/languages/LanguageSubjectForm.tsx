"use client";

import { useRef, useState, useTransition } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export function LanguageSubjectForm({
  teachers,
  action,
}: {
  teachers: { id: string; name: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const image = formData.get("image") as File | null;
        if (!image || image.size === 0) {
          setError("يجب رفع غلاف المادة بأبعاد 1920 × 1080 px");
          return;
        }
        startTransition(async () => {
          await action(formData);
          form.reset();
          setImageUrl("");
          if (fileRef.current) fileRef.current.value = "";
        });
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-bold">عنوان المادة</label>
        <input
          name="title"
          required
          placeholder="مثال: الإنجليزية — A1"
          className="w-full rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 text-sm font-medium outline-none focus:border-[#6D28D9] focus:bg-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">الوصف</label>
        <textarea
          name="description"
          required
          rows={3}
          placeholder="وصف قصير للدورة"
          className="w-full rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 text-sm font-medium outline-none focus:border-[#6D28D9] focus:bg-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold">
          غلاف المادة <span className="text-[#6D28D9]">(1920 × 1080 px) إلزامي</span>
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#EDE9FE] bg-[#F7F5FF] text-center transition hover:border-[#6D28D9]"
        >
          <input
            ref={fileRef}
            type="file"
            name="image"
            accept="image/*"
            required
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImageUrl(URL.createObjectURL(file));
            }}
          />
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-10">
              <ImageIcon className="mb-2 h-8 w-8 text-[#6D28D9]" />
              <span className="text-sm font-bold text-[#1E1B4B]">ارفع غلاف المادة</span>
              <span className="mt-1 text-xs font-bold text-[#6B6480]">
                الأبعاد المطلوبة: 1920 × 1080 px
              </span>
            </div>
          )}
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold">اسم الأستاذ (اختياري)</label>
        <input
          name="manualTeacherName"
          placeholder="منصة دقيش"
          className="w-full rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 text-sm font-medium outline-none focus:border-[#6D28D9] focus:bg-white"
        />
      </div>
      {teachers.length > 0 ? (
        <div>
          <label className="mb-1 block text-sm font-bold">أو اختر أستاذاً</label>
          <select
            name="teacherId"
            className="w-full rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 text-sm font-medium outline-none focus:border-[#6D28D9]"
            defaultValue=""
          >
            <option value="">بدون ربط</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <input type="hidden" name="price" value="0" />
      <input type="hidden" name="accessType" value="YEARLY" />

      <p className="rounded-2xl bg-[#F3EFFF] px-3 py-2 text-xs font-bold text-[#6D28D9]">
        غلاف المادة والدرس إلزامي 1920×1080 · المادة تُنشأ مخفية حتى تنشرها
      </p>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6D28D9] py-3 text-sm font-black text-white transition hover:bg-[#5B21B6] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        إنشاء المادة
      </button>
    </form>
  );
}
