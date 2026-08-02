"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react"; // نستخدم سهم لليمين لأن الواجهة تدعم اللغة العربية (RTL)

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // إخفاء الزر تماماً إذا كنا في الصفحة الرئيسية
  if (pathname === "/") return null;

  return (
    <button
      onClick={() => router.back()}
      className="group inline-flex w-fit items-center justify-center gap-2 px-4 py-2 bg-[#6D28D9] text-white rounded-lg shadow-sm hover:bg-[#5b21b6] transition-colors active:scale-95"
      title="الرجوع"
    >
      <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      <span className="font-bold">الرجوع</span>
    </button>
  );
}
