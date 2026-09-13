import Link from "next/link";
import { FileText, Image as ImageIcon, FileSpreadsheet, Download, Eye, FileBox, File } from "lucide-react";

type FileViewerProps = {
  title: string;
  fileUrl: string;
  fileType?: string | null;
  variant?: "default" | "compact";
};

export function UniversalFileViewer({ title, fileUrl, fileType, variant = "default" }: FileViewerProps) {
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
  const isWord = type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isExcel = type.includes('excel') || type.includes('spreadsheet');
  const isViewable = isImage || isPdf || isWord || isExcel;

  const renderIcon = (compact: boolean = false) => {
    const sizeClasses = compact ? "w-5 h-5" : "w-8 h-8";
    if (isImage) return <ImageIcon className={`${sizeClasses} text-sky-500`} />;
    if (isPdf) return <File className={`${sizeClasses} text-red-500`} />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className={`${sizeClasses} text-emerald-500`} />;
    if (type.includes('zip') || type.includes('rar')) return <FileBox className={`${sizeClasses} text-amber-500`} />;
    return <FileText className={`${sizeClasses} text-slate-500`} />;
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-[#F7F5FF] border border-[#EDE9FE] rounded-xl hover:bg-white transition-all min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 sm:p-2 bg-white rounded-lg shrink-0 border border-[#EDE9FE]">
            {renderIcon(true)}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-[#1E1B4B] truncate" dir="rtl">{title}</h4>
            <p className="text-[10px] text-[#6B6480] uppercase mt-0.5">{isImage ? 'IMAGE' : isPdf ? 'PDF' : 'DOCUMENT'}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
           {isViewable && (
             <Link href={`/dashboard/student/viewer?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`} className="p-2 text-[#6D28D9] hover:bg-[#EEF1FF] rounded-lg transition-colors">
               <Eye className="w-4 h-4" />
             </Link>
           )}
           <a href={fileUrl} download={title} target="_blank" rel="noopener noreferrer" className="p-2 text-[#6D28D9] hover:bg-[#EEF1FF] rounded-lg transition-colors">
             <Download className="w-4 h-4" />
           </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-3 flex flex-col justify-between shadow-sm transition-all hover:shadow-md hover:border-emerald-500/40 group relative overflow-hidden card-grid">
      <div className="flex items-start gap-2 mb-3 z-10">
        <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 shrink-0 scale-75 md:scale-100">
          {renderIcon(false)}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate" dir="rtl">{title}</h4>
          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 uppercase truncate" dir="ltr">
            {isImage ? 'IMAGE' : isPdf ? 'PDF' : 'DOCUMENT'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 z-10 w-full mt-auto">
        {isViewable && (
          <Link
            href={`/dashboard/student/viewer?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg transition-colors text-xs md:text-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            عرض
          </Link>
        )}
        <a
          href={fileUrl}
          download={title}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold rounded-lg transition-colors text-xs md:text-sm"
        >
          <Download className="w-3.5 h-3.5" />
          تحميل
        </a>
      </div>
    </div>
  );
}
