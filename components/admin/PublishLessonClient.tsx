"use client";

import { useState } from "react";
import { Plus, X, Upload, File, Loader2 } from "lucide-react";

export function PublishLessonClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAttachments, setHasAttachments] = useState<"yes" | "no">("no");
  const [files, setFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    // Simulation
    setTimeout(() => {
      setIsPublishing(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5 mt-4"
      >
        <Plus className="w-5 h-5" />
        واجهة نشر الدروس
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-arabic" dir="rtl">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">تفاصيل الدرس / Publish Lesson</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="publish-lesson-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">عنوان الدرس <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-700 placeholder:text-slate-400" 
                    placeholder="مثال: مقدمة في الجبر..." 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">وصف الدرس <span className="text-red-500">*</span></label>
                  <textarea 
                    required 
                    rows={3} 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all resize-none text-slate-700 placeholder:text-slate-400" 
                    placeholder="مفاهيم أساسية حول..."
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <h3 className="font-black text-slate-800 text-lg">ملحقات الدرس / Lesson Attachments</h3>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 block">هل يحتوي الدرس على ملحقات؟</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasAttachments === 'yes' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasAttachments === 'yes' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {hasAttachments === 'yes' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                        </div>
                        <span className={`font-bold text-sm ${hasAttachments === 'yes' ? 'text-sky-700' : 'text-slate-600'}`}>نعم / Yes</span>
                        <input type="radio" name="hasAttachments" value="yes" checked={hasAttachments === 'yes'} onChange={() => setHasAttachments('yes')} className="hidden" />
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasAttachments === 'no' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasAttachments === 'no' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {hasAttachments === 'no' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                        </div>
                        <span className={`font-bold text-sm ${hasAttachments === 'no' ? 'text-sky-700' : 'text-slate-600'}`}>لا / No</span>
                        <input type="radio" name="hasAttachments" value="no" checked={hasAttachments === 'no'} onChange={() => setHasAttachments('no')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {hasAttachments === 'yes' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="relative flex flex-col items-center justify-center w-full py-10 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-sky-400 transition-all cursor-pointer group">
                        <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-sky-500" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm mb-1">اضغط هنا أو قم بسحب الملفات</span>
                        <span className="font-medium text-slate-400 text-xs text-center max-w-[200px]">PDF, DOCX, JPG (الحد الأقصى 10MB)</span>
                        <input 
                          type="file" 
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setFiles(Array.from(e.target.files));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                      </label>
                      
                      {files.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
                                  <File className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm text-slate-700 truncate" dir="ltr">{file.name}</span>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs font-bold text-slate-400 text-center bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                    (يمكنك دائمًا إضافة ملحقات أو تعديلها من قائمة تحرير الدرس بعد النشر)
                  </p>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                form="publish-lesson-form"
                type="submit" 
                disabled={isPublishing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 text-white font-black py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5 transition-all"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  "نشر الدرس / Publish Lesson"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
