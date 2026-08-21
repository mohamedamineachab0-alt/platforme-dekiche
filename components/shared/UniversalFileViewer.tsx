"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, FileSpreadsheet, Download, Eye, X, FileBox, File } from "lucide-react";

type FileViewerProps = {
  title: string;
  fileUrl: string;
  fileType?: string | null;
};

export function UniversalFileViewer({ title, fileUrl, fileType }: FileViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback to determine type from extension if fileType is missing
  const getFileType = () => {
    if (fileType) return fileType.toLowerCase();
    const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image/jpeg';
    if (ext === 'pdf') return 'application/pdf';
    if (['doc', 'docx'].includes(ext)) return 'application/msword';
    if (['xls', 'xlsx'].includes(ext)) return 'application/vnd.ms-excel';
    if (['zip', 'rar'].includes(ext)) return 'application/zip';
    return 'unknown';
  };

  const type = getFileType();
  const isImage = type.startsWith('image/');
  const isPdf = type === 'application/pdf';
  const isViewable = isImage || isPdf;

  const renderIcon = () => {
    if (isImage) return <ImageIcon className="w-8 h-8 text-sky-500" />;
    if (isPdf) return <File className="w-8 h-8 text-red-500" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileBox className="w-8 h-8 text-amber-500" />;
    return <FileText className="w-8 h-8 text-slate-500" />;
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-4 flex flex-col justify-between shadow-sm transition-all hover:shadow-md hover:border-emerald-500/40 group relative overflow-hidden card-grid">
        <div className="flex items-start gap-4 mb-4 z-10">
          <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
            {renderIcon()}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-bold text-slate-900 dark:text-white truncate" dir="rtl">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase truncate" dir="ltr">
              {isImage ? 'IMAGE' : isPdf ? 'PDF' : 'DOCUMENT'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 z-10 w-full mt-auto">
          {isViewable && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              عرض
            </button>
          )}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            تحميل
          </a>
        </div>
      </div>

      {isModalOpen && isViewable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
              <h3 className="font-black text-lg text-slate-900 dark:text-white truncate pr-4" dir="rtl">{title}</h3>
              <div className="flex gap-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-xl transition-colors"
                  title="تحميل"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100/50 dark:bg-black/50 overflow-auto p-4 flex items-center justify-center relative">
              {isImage ? (
                <img 
                  src={fileUrl} 
                  alt={title} 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <iframe 
                  src={`${fileUrl}#view=FitH`} 
                  className="w-full h-full rounded-xl shadow-inner border border-slate-200 dark:border-slate-800"
                  title={title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
