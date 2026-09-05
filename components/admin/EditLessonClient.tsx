"use client";

import { useState } from "react";
import { Edit2, X, Upload, File, Loader2, Image as ImageIcon, BrainCircuit, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { MathPreview } from "@/components/shared/MathPreview";

export function EditLessonClient({ 
  lesson,
  action,
  deleteAction
}: { 
  lesson: any;
  action: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  deleteAction?: (id: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title || "");
  const [description, setDescription] = useState(lesson.description || "");
  const [vimeoVideoId, setVimeoVideoId] = useState(lesson.vimeoVideoId || "");
  
  const [existingMaterials, setExistingMaterials] = useState<any[]>(lesson.materials || []);
  const [deletedMaterialIds, setDeletedMaterialIds] = useState<string[]>([]);

  const [hasAttachments, setHasAttachments] = useState<"yes" | "no">(
    lesson.materials && lesson.materials.length > 0 ? "yes" : "no"
  );
  
  const [selectedLevels, setSelectedLevels] = useState<string[]>(lesson.levels || []);
  const [selectedStreams, setSelectedStreams] = useState<string[]>(lesson.streams || []);
  const [isPublished, setIsPublished] = useState<boolean>(lesson.isPublished !== undefined ? lesson.isPublished : true);
  
  // existing attachments could be displayed, but for simplicity here we focus on the form structure
  const [files, setFiles] = useState<File[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(lesson.image || "");
  
  const [isSaving, setIsSaving] = useState(false);

  // Quiz State
  const [hasQuiz, setHasQuiz] = useState<"yes" | "no">(lesson.quiz ? "yes" : "no");
  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [manualQuestions, setManualQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  const [aiSourceMode, setAiSourceMode] = useState<"lesson_files" | "custom_upload">("lesson_files");
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("subjectId", lesson.subjectId);
    
    if (description) {
      formData.set("description", description);
    }
    
    formData.set("deletedMaterialIds", JSON.stringify(deletedMaterialIds));

    if (imageFile) {
      formData.set("image", imageFile);
    }
    
    if (hasAttachments === "yes") {
      files.forEach((file) => formData.append("materials", file));
    }
    
    if (hasQuiz === "yes") {
      formData.set("quiz", JSON.stringify({
        maxScore: quizMaxScore,
        aiGenerated: quizType === "AI",
        questions: manualQuestions
      }));
    }

    formData.set("settings", JSON.stringify({
      levels: selectedLevels,
      streams: selectedStreams,
      isPublished: isPublished
    }));

    const res = await action(lesson.id, formData);
    
    setIsSaving(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      alert(res.error || "حدث خطأ ما");
    }
  };

  const handleAiGenerate = async () => {
    const filesToSend: File[] = [];
    const fileUrlsToSend: { url: string; name?: string; type?: string }[] = [];

    if (aiSourceMode === "lesson_files") {
      if (existingMaterials && existingMaterials.length > 0) {
        existingMaterials.forEach((m) => {
          if (m.fileUrl) {
            fileUrlsToSend.push({ url: m.fileUrl, name: m.title, type: m.fileType });
          }
        });
      }
      if (files && files.length > 0) {
        filesToSend.push(...files);
      }
      if (filesToSend.length === 0 && fileUrlsToSend.length === 0) {
        if (imageFile) {
          filesToSend.push(imageFile);
        } else if (imageUrl) {
          fileUrlsToSend.push({ url: imageUrl, name: "صورة الدرس" });
        }
      }
    } else if (aiImageFile) {
      filesToSend.push(aiImageFile);
    }

    if (filesToSend.length === 0 && fileUrlsToSend.length === 0) {
      alert("يرجى إرفاق ملحقات للدرس أو رفع ملف مخصص للكويز");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const formData = new FormData();
      filesToSend.forEach((f) => {
        formData.append("files", f);
      });
      if (fileUrlsToSend.length > 0) {
        formData.append("fileUrls", JSON.stringify(fileUrlsToSend));
      }
      formData.append(
        "metadata",
        JSON.stringify({
          level: selectedLevels[0] || "",
          stream: selectedStreams[0] || "",
          maxScore: quizMaxScore,
          numberOfQuestions: numberOfQuestions || 5,
        })
      );
      formData.append("type", "lesson");

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل توليد الأسئلة بواسطة OpenAI");
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const sanitized = data.questions.map((q: any) => {
          let opts = Array.isArray(q.options) ? q.options.map(String) : [];
          while (opts.length < 4) {
            opts.push(`الخيار ${opts.length + 1}`);
          }
          return {
            question: String(q.question || ""),
            options: opts.slice(0, 4) as [string, string, string, string],
            correctAnswerIndex:
              typeof q.correctAnswerIndex === "number" &&
              q.correctAnswerIndex >= 0 &&
              q.correctAnswerIndex <= 3
                ? q.correctAnswerIndex
                : 0,
          };
        });
        setManualQuestions(sanitized);
        setQuizType("MANUAL");
      } else {
        alert("لم يتم التعرف على أي أسئلة صالحة في الوثائق المقدمة");
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء توليد الكويز بواسطة الذكاء الاصطناعي");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQs = [...manualQuestions];
    newQs[index].question = text;
    setManualQuestions(newQs);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const newQs = [...manualQuestions];
    newQs[qIndex].options[optIndex] = text;
    setManualQuestions(newQs);
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    const newQs = [...manualQuestions];
    newQs[qIndex].correctAnswerIndex = optIndex;
    setManualQuestions(newQs);
  };

  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  };

  const handleRemoveExistingMaterial = (id: string) => {
    setDeletedMaterialIds([...deletedMaterialIds, id]);
    setExistingMaterials(existingMaterials.filter((m: any) => m.id !== id));
  };

  const handleRemoveQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!deleteAction || !confirm("هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setIsDeleting(true);
    const result = await deleteAction(lesson.id);
    if (result.error) {
      alert(result.error);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        {deleteAction && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white/90 hover:bg-red-50 p-2 rounded-xl text-red-500 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all hover:scale-105 backdrop-blur-sm border border-slate-100 hover:border-red-100"
            title="حذف الدرس"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        )}
        
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white/90 hover:bg-white p-2 rounded-xl text-slate-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all hover:scale-105 backdrop-blur-sm border border-slate-100"
          title="تعديل الدرس"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

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
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <div className="bg-sky-50 text-sky-500 p-2 rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </div>
                تعديل الدرس
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="edit-lesson-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-sky-50 text-sky-700 text-sm font-bold p-3 rounded-xl flex items-center justify-center">
                  💡 يمكنك تعديل جميع تفاصيل الدرس وملحقاته في أي وقت
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">صورة الغلاف (1920x1080)</label>
                  <label className="relative flex flex-col group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    {imageUrl ? (
                      <div className="relative aspect-video w-full">
                        <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">تغيير الصورة</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="bg-sky-50 text-sky-500 p-4 rounded-full mb-3">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 mb-1">اضغط هنا لرفع صورة الغلاف</span>
                        <span className="text-xs font-bold text-slate-400">JPG, PNG, WEBP (الحد الأقصى 2MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">عنوان الدرس <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-700 placeholder:text-slate-400" 
                    placeholder="مثال: مقدمة في الجبر..." 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Vimeo ID / رابط الفيديو <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="vimeoVideoId"
                    required 
                    dir="ltr"
                    value={vimeoVideoId}
                    onChange={(e) => setVimeoVideoId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-700" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوصف (اختياري)</label>
                  <textarea 
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-700 placeholder:text-slate-400 custom-scrollbar" 
                    placeholder="اكتب وصفاً مفصلاً أو ملاحظات للدرس..." 
                  />
                </div>

                {/* Level and Stream Selection */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="font-black text-slate-800 text-lg">إعدادات النشر والمستويات</h3>
                  
                  <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                    <input 
                      type="checkbox" 
                      id="isPublished" 
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <label htmlFor="isPublished" className="text-sm font-bold text-slate-700 cursor-pointer">
                      نشر الدرس (يظهر للطلاب)
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">المستويات المعنية بالدرس</label>
                    <div className="flex flex-wrap gap-2">
                      {["AS2", "AS3"].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            if (selectedLevels.includes(level)) {
                              setSelectedLevels(selectedLevels.filter(l => l !== level));
                            } else {
                              setSelectedLevels([...selectedLevels, level]);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            selectedLevels.includes(level) 
                              ? 'bg-sky-500 text-white border-sky-500' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          {level === "AS2" ? "السنة الثانية" : "السنة الثالثة"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الشعب المعنية بالدرس</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "SCIENCES", label: "علوم تجريبية" },
                        { id: "MATH", label: "رياضيات" },
                        { id: "TECH_MATH", label: "تقني رياضي" },
                        { id: "GESTION", label: "تسيير واقتصاد" },
                        { id: "LETTRES", label: "آداب وفلسفة" },
                        { id: "LANGUAGES", label: "لغات أجنبية" },
                      ].map(stream => (
                        <button
                          key={stream.id}
                          type="button"
                          onClick={() => {
                            if (selectedStreams.includes(stream.id)) {
                              setSelectedStreams(selectedStreams.filter(s => s !== stream.id));
                            } else {
                              setSelectedStreams([...selectedStreams, stream.id]);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            selectedStreams.includes(stream.id) 
                              ? 'bg-sky-500 text-white border-sky-500' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          {stream.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <h3 className="font-black text-slate-800 text-lg">إدارة ملحقات الدرس</h3>
                  
                  {existingMaterials.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <label className="text-sm font-bold text-slate-700 block">الملحقات الحالية:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {existingMaterials.map((material: any) => (
                          <div key={material.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <File className="w-5 h-5 text-sky-500 shrink-0" />
                              <span className="text-sm font-bold text-slate-700 truncate" title={material.title}>{material.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingMaterial(material.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 block">هل يحتوي الدرس على ملحقات؟</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasAttachments === 'yes' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasAttachments === 'yes' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {hasAttachments === 'yes' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                        </div>
                        <span className={`font-bold text-sm ${hasAttachments === 'yes' ? 'text-sky-700' : 'text-slate-600'}`}>نعم</span>
                        <input type="radio" name="hasAttachments" value="yes" checked={hasAttachments === 'yes'} onChange={() => setHasAttachments('yes')} className="hidden" />
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasAttachments === 'no' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasAttachments === 'no' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {hasAttachments === 'no' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                        </div>
                        <span className={`font-bold text-sm ${hasAttachments === 'no' ? 'text-sky-700' : 'text-slate-600'}`}>لا</span>
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
                        <span className="font-bold text-slate-700 text-sm mb-1">اضغط هنا أو قم بسحب الملفات الجديدة</span>
                        <input 
                          type="file" 
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
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

                </div>

                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <h3 className="font-black text-slate-800 text-lg">كويز الدرس / Lesson Quiz</h3>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 block">هل يحتوي الدرس على كويز؟</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasQuiz === 'yes' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasQuiz === 'yes' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {hasQuiz === 'yes' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                        </div>
                        <span className={`font-bold text-sm ${hasQuiz === 'yes' ? 'text-sky-700' : 'text-slate-600'}`}>نعم / Yes</span>
                        <input type="radio" checked={hasQuiz === 'yes'} onChange={() => setHasQuiz('yes')} className="hidden" />
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasQuiz === 'no' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasQuiz === 'no' ? 'border-sky-500' : 'border-slate-300'}`}>
                          {hasQuiz === 'no' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                        </div>
                        <span className={`font-bold text-sm ${hasQuiz === 'no' ? 'text-sky-700' : 'text-slate-600'}`}>لا / No</span>
                        <input type="radio" checked={hasQuiz === 'no'} onChange={() => setHasQuiz('no')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {hasQuiz === 'yes' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setQuizType("MANUAL")}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${quizType === "MANUAL" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          توليد كويز يدويا
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizType("AI")}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${quizType === "AI" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          <BrainCircuit className="w-4 h-4" />
                          توليد بالذكاء الاصطناعي
                        </button>
                      </div>

                      {quizType === "MANUAL" ? (
                        <div className="space-y-4">
                          {manualQuestions.map((q, i) => (
                            <div key={i} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4 relative group">
                              <button 
                                type="button"
                                onClick={() => handleRemoveQuestion(i)}
                                className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">السؤال {i + 1}</label>
                                <input 
                                  type="text" 
                                  value={q.question}
                                  onChange={e => handleQuestionChange(i, e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500 text-sm font-bold"
                                  placeholder="نص السؤال..."
                                />
                                {q.question.includes('$') && <MathPreview text={q.question} />}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => (
                                  <label key={optIdx} className={`flex flex-col gap-1.5 p-3 rounded-xl border cursor-pointer transition-all ${q.correctAnswerIndex === optIdx ? "border-sky-500 bg-sky-50/50" : "border-slate-200 hover:border-sky-200"}`}>
                                    <div className="flex items-center gap-3 w-full">
                                      <input 
                                        type="radio" 
                                        name={`correct-${i}`} 
                                        checked={q.correctAnswerIndex === optIdx}
                                        onChange={() => handleCorrectAnswerChange(i, optIdx)}
                                        className="hidden" 
                                      />
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correctAnswerIndex === optIdx ? "border-sky-500" : "border-slate-300"}`}>
                                        {q.correctAnswerIndex === optIdx && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                                      </div>
                                      <input 
                                        type="text" 
                                        value={opt}
                                        onChange={e => handleOptionChange(i, optIdx, e.target.value)}
                                        className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold"
                                        placeholder={`الخيار ${optIdx + 1}`}
                                      />
                                    </div>
                                    {opt.includes('$') && (
                                      <div className="pr-7">
                                        <MathPreview text={opt} />
                                      </div>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={handleAddQuestion}
                            className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 hover:border-sky-400 hover:text-sky-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> إضافة سؤال آخر
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">عدد الأسئلة</label>
                              <input 
                                type="number" 
                                value={numberOfQuestions}
                                onChange={e => setNumberOfQuestions(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">النقاط الإجمالية</label>
                              <input 
                                type="number" 
                                value={quizMaxScore}
                                onChange={e => setQuizMaxScore(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                              />
                            </div>
                          </div>
                          
                          {/* Source Selection for AI */}
                          <div className="space-y-3 pt-2">
                            <label className="text-sm font-bold text-slate-700 block">مصدر محتوى الكويز</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setAiSourceMode("lesson_files")}
                                className={`p-3.5 rounded-xl border-2 text-right transition-all flex items-start gap-3 ${
                                  aiSourceMode === "lesson_files"
                                    ? "border-sky-500 bg-sky-50/50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-sky-200"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${aiSourceMode === "lesson_files" ? "border-sky-500 bg-white" : "border-slate-300"}`}>
                                  {aiSourceMode === "lesson_files" && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                                </div>
                                <div>
                                  <span className={`font-bold text-sm block ${aiSourceMode === "lesson_files" ? "text-sky-800" : "text-slate-700"}`}>
                                    ملفات وملحقات الدرس مباشرة
                                  </span>
                                  <span className="text-xs text-slate-500 block mt-0.5">
                                    {existingMaterials.length > 0 || files.length > 0
                                      ? `الاعتماد على ملفات الدرس (${existingMaterials.length + files.length} ملف)`
                                      : imageUrl || imageFile
                                      ? "الاعتماد على صورة الدرس الحالية"
                                      : "استخدام ملفات وملحقات الدرس"}
                                  </span>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setAiSourceMode("custom_upload")}
                                className={`p-3.5 rounded-xl border-2 text-right transition-all flex items-start gap-3 ${
                                  aiSourceMode === "custom_upload"
                                    ? "border-sky-500 bg-sky-50/50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-sky-200"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${aiSourceMode === "custom_upload" ? "border-sky-500 bg-white" : "border-slate-300"}`}>
                                  {aiSourceMode === "custom_upload" && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                                </div>
                                <div>
                                  <span className={`font-bold text-sm block ${aiSourceMode === "custom_upload" ? "text-sky-800" : "text-slate-700"}`}>
                                    رفع ملف / صورة مخصصة
                                  </span>
                                  <span className="text-xs text-slate-500 block mt-0.5">
                                    رفع ملخص أو ورقة أسئلة منفصلة
                                  </span>
                                </div>
                              </button>
                            </div>
                          </div>

                          {aiSourceMode === "lesson_files" ? (
                            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4">
                              {existingMaterials.length > 0 || files.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>جاهز لتوليد الكويز من ملفات الدرس التالية مباشرة بدون إعادة رفع:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {existingMaterials.map((m, i) => (
                                      <span key={`ex-${i}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                        <File className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                        <span className="truncate max-w-[200px]" dir="ltr">{m.title || `ملحق ${i + 1}`}</span>
                                      </span>
                                    ))}
                                    {files.map((f, i) => (
                                      <span key={`f-${i}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                        <File className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                        <span className="truncate max-w-[200px]" dir="ltr">{f.name}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : imageUrl || imageFile ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>سيتم توليد الكويز من صورة الدرس الحالية</span>
                                </div>
                              ) : (
                                <div className="text-xs font-bold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                  ⚠️ لا توجد ملحقات حالية في هذا الدرس. قم بإضافة ملحقات أولاً أو اختر "رفع ملف مخصص".
                                </div>
                              )}
                            </div>
                          ) : (
                            <label className="relative flex flex-col items-center justify-center w-full py-8 px-4 border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/50 hover:bg-sky-50 hover:border-sky-400 transition-all cursor-pointer group">
                              <div className="bg-white p-3 rounded-xl shadow-sm mb-3 text-sky-500 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-6 h-6" />
                              </div>
                              <span className="font-bold text-slate-700 text-sm mb-1">{aiImageFile ? aiImageFile.name : "اضغط لرفع أي ملف أو صورة أو ملخص لتوليد الكويز"}</span>
                              <span className="font-medium text-slate-400 text-xs text-center max-w-[240px]">جميع صيغ الملفات مدعومة (PDF، صور، خط يد، ملخصات، Word)</span>
                              <input 
                                type="file" 
                                accept="*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) setAiImageFile(e.target.files[0]);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              />
                            </label>
                          )}

                          <button
                            type="button"
                            onClick={handleAiGenerate}
                            disabled={
                              isGeneratingAi ||
                              (aiSourceMode === "lesson_files"
                                ? existingMaterials.length === 0 && files.length === 0 && !imageFile && !imageUrl
                                : !aiImageFile)
                            }
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
                          >
                            {isGeneratingAi ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري تحليل محتوى الدرس وتوليد الأسئلة بواسطة OpenAI...
                              </>
                            ) : (
                              <>
                                <BrainCircuit className="w-5 h-5 text-amber-400" />
                                {aiSourceMode === "lesson_files" && (existingMaterials.length > 0 || files.length > 0)
                                  ? `توليد الكويز مباشرة من ملفات الدرس (${existingMaterials.length + files.length})`
                                  : "توليد الأسئلة الآن بالذكاء الاصطناعي"}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4">
              <button 
                form="edit-lesson-form"
                type="submit" 
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 text-white font-black py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
