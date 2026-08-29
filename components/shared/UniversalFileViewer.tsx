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
      <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg shrink-0">
            {renderIcon(true)}
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate" dir="rtl">{title}</h4>
            <p className="text-[10px] text-slate-500 uppercase mt-0.5">{isImage ? 'IMAGE' : isPdf ? 'PDF' : 'DOCUMENT'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 pl-1">
           {isViewable && (
             <Link href={`/dashboard/student/viewer?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(title)}`} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
               <Eye className="w-4 h-4" />
             </Link>
           )}
           <a href={fileUrl} download={title} target="_blank" rel="noopener noreferrer" className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors">
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
