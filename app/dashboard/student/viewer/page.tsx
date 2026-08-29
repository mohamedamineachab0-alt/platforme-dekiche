"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";

export default function FileViewerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const fileUrl = searchParams.get("url");
  const title = searchParams.get("title") || "عرض الملف";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">الملف غير موجود</h2>
        <button onClick={() => router.back()} className="text-sky-600 hover:underline">
          العودة
        </button>
      </div>
    );
  }

  const isImage = fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
  const isOffice = fileUrl.toLowerCase().match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/) != null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 font-arabic" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">رجوع</span>
          </button>
          <h1 className="font-black text-lg text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
            {title}
          </h1>
        </div>
        
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-sm"
        >
          <span className="hidden sm:inline">تحميل</span>
          <Download className="w-4 h-4" />
        </a>
      </div>

      {/* Viewer Content */}
      <div className="flex-1 overflow-hidden p-4 md:p-8 flex items-center justify-center">
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={title} 
              className="max-w-full max-h-full object-contain p-4"
            />
          ) : isOffice ? (
            <iframe 
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`} 
              className="w-full h-full border-none"
              title={title}
            />
          ) : (
            <iframe 
              src={`${fileUrl}#view=FitH`} 
              className="w-full h-full border-none"
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
