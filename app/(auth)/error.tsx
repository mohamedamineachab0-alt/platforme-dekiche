"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the exact error to an error reporting service or console
    console.error("Auth Segment Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-arabic" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl shadow-xl max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          عذراً، حدث خطأ غير متوقع
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
          واجهنا مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني إذا استمرت المشكلة.
        </p>
        
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-sky-600/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <RotateCcw className="w-5 h-5" />
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
