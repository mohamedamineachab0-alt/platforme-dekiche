"use client";

import { useState } from "react";
import { Upload, Plus, BrainCircuit, Loader2, X, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createDailyExercise } from "@/actions/exercises";
import { LEVELS, STREAMS } from "@/lib/constants";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { compressImageForAi } from "@/lib/utils/image-compression";
import { MathPreview } from "@/components/shared/MathPreview";

type Subject = {
  id: string;
  title: string;
  level: string;
  stream: string;
};

type QuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
};

export function DailyExerciseForm({ subjects }: { subjects: Subject[] }) {
  const [level, setLevel] = useState("");
  const [stream, setStream] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiLanguage, setAiLanguage] = useState<"ar" | "fr" | "en" | "es">("ar");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  const [materials, setMaterials] = useState<{ file: File; title: string }[]>([]);
  const [materialTitle, setMaterialTitle] = useState("");

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);

  const handleQuestionChange = (index: number, value: string) => {
    const newQs = [...manualQuestions];
    newQs[index].question = value;
    setManualQuestions(newQs);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...manualQuestions];
    newQs[qIndex].options[optIndex] = value;
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

  const handleRemoveQuestion = (index: number) => {
    if (manualQuestions.length > 1) {
      const newQs = manualQuestions.filter((_, i) => i !== index);
      setManualQuestions(newQs);
    }
  };

  const handleAiGenerate = async () => {
    if (!file) {
      setError("يرجى رفع صورة أولاً");
      return;
    }

    setIsGeneratingAi(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('files', file);
      
      materials.forEach(mat => {
        formData.append('files', mat.file);
      });

      if (customPrompt) {
        formData.append('customPrompt', customPrompt);
      }

      const activeSubjectId = selectedSubjectId || (document.querySelector('select[name="subjectId"]') as HTMLSelectElement)?.value;
      const selectedSubject = subjects.find(s => s.id === activeSubjectId);

      if (!selectedSubject) {
        alert("يرجى تحديد المادة أولاً لضمان عدم خلط المواد وتوليد أسئلة دقيقة للمادة المحددة حصراً.");
        return;
      }

      formData.append('metadata', JSON.stringify({
        level,
        stream,
        subject: selectedSubject.title,
        month: (document.querySelector('select[name="month"]') as HTMLSelectElement)?.value || '',
        maxScore: quizMaxScore,
        numberOfQuestions: numberOfQuestions || 5,
        language: aiLanguage
      }));
      formData.append('type', 'daily_exercise');
      
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل توليد الأسئلة");
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
            correctAnswerIndex: typeof q.correctAnswerIndex === "number" && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3 ? q.correctAnswerIndex : 0,
          };
        });
        setManualQuestions(sanitized);
        setQuizType("MANUAL");
      } else {
        setError("لم يتم التعرف على أي أسئلة صالحة في الصورة");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    if (level && s.level !== level) return false;
    if (stream && s.stream !== stream) return false;
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        file: f,
        title: materialTitle.trim() !== "" ? materialTitle : f.name.split(".")[0]
      }));
      setMaterials([...materials, ...newFiles]);
      setMaterialTitle("");
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى إرفاق صورة أو ملف التمرين");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Upload to Supabase bucket 'daily-excercicse'
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("daily-excercicse")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("daily-excercicse")
        .getPublicUrl(filePath);

      // Add to formData
      formData.set("a4ImageUrl", publicUrl);
      
      const uploadedMaterials = [];
      for (const mat of materials) {
        const fileExt = mat.file.name.split('.').pop();
        const fName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const fPath = `${fName}`;

        const { error: mErr } = await supabase.storage
          .from("daily-excercicse")
          .upload(fPath, mat.file);
        if (mErr) throw mErr;

        const { data: { publicUrl: mUrl } } = supabase.storage
          .from("daily-excercicse")
          .getPublicUrl(fPath);

        uploadedMaterials.push({ title: mat.title, fileUrl: mUrl, fileType: mat.file.type });
      }
      formData.set("materials", JSON.stringify(uploadedMaterials));
      
      // Append manual questions if selected
      if (quizType === "MANUAL") {
        formData.set("manualQuestions", JSON.stringify(manualQuestions));
      }
      formData.set("quizType", quizType);

      await createDailyExercise(formData);
      
      // Reset form
      const formEl = e.target as HTMLFormElement;
      formEl.reset();
      setFile(null);
      setLevel("");
      setStream("");
      setMaterials([]);
      setMaterialTitle("");
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ التمرين. حاول مجدداً.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
      <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-sky-600" />
        إضافة تمرين جديد
      </h2>

      {error && (
        <div className="bg-amber-50 text-amber-600 p-3 rounded-lg text-sm font-bold mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">عنوان التمرين</label>
          <input type="text" name="title" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none" placeholder="مثال: تمرين حول المتتاليات" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 block mb-2">ملف أو صورة التمرين (PDF، صور، خط يد، مستندات)</label>
          <label className="block border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-sky-50">
            <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            <span className="font-bold text-slate-600 text-sm">
              {file ? file.name : "اضغط لرفع أي ملف أو صورة أو اسحبه هنا"}
            </span>
            <input 
              type="file" 
              accept="*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && (
          <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100 space-y-4 mt-4">
            {/* Subject Selection for AI */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">
                مادة التمرين (إلزامي لمنع خلط المواد)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-sky-500 outline-none text-slate-800"
              >
                <option value="">-- اختر مادة هذا التمرين لحصر الأسئلة فيها حصراً --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">عدد الأسئلة</label>
                <input 
                  type="number" 
                  value={numberOfQuestions}
                  onChange={e => setNumberOfQuestions(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">مجموع النقاط</label>
                <input 
                  type="number" 
                  value={quizMaxScore}
                  onChange={e => setQuizMaxScore(Number(e.target.value))}
                  min={1}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
            
            {/* Language Selection for AI */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">لغة صياغة الكويز (Question Language)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "ar", label: "العربية", flag: "🇩🇿" },
                  { id: "fr", label: "Français", flag: "🇫🇷" },
                  { id: "en", label: "English", flag: "🇬🇧" },
                  { id: "es", label: "Español", flag: "🇪🇸" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setAiLanguage(l.id as any)}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      aiLanguage === l.id
                        ? "border-sky-500 bg-white text-sky-800 shadow-sm"
                        : "border-slate-200 hover:border-sky-200 text-slate-600 bg-white/70"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">تعليمات إضافية للذكاء الاصطناعي (اختياري)</label>
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="مثال: ركز على أسئلة الفهم وتجنب الحفظ..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-bold focus:ring-2 focus:ring-sky-500 outline-none resize-none h-20"
                />
            </div>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري استخراج الأسئلة...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  استخراج الأسئلة وتوليد كويز رقمي
                </>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">المستوى</label>
            <select
              name="level"
              value={level}
              onChange={e => setLevel(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="">اختر المستوى..</option>
              {LEVELS.map(lvl => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الشعبة</label>
            <select
              name="stream"
              value={stream}
              onChange={e => setStream(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="">اختر الشعبة..</option>
              {STREAMS.map(str => (
                <option key={str.value} value={str.value}>{str.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">المادة الأساسية</label>
            <select
              name="subjectId"
              required
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="">اختر المادة..</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">المادة الثانوية (اختياري)</label>
            <select
              name="secondarySubjectId"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="">بدون مادة ثانوية</option>
              {filteredSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الشهر</label>
            <MonthSelect name="month" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">العلامة القصوى</label>
            <input 
              type="number" 
              name="maxScore" 
              defaultValue={20} 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none" 
            />
          </div>
        </div>

        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <label className="text-sm font-bold text-slate-700">التنقيط الإجمالي للكويز (ثابت)</label>
            <input 
              type="number" 
              value={quizMaxScore}
              disabled
              className="w-24 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-center font-bold text-slate-500 cursor-not-allowed"
            />
          </div>
            
            <div className="space-y-6">
              {manualQuestions.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 relative group shadow-sm">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(i)}
                    className="absolute top-4 left-4 text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="font-bold text-lg leading-none">&times;</span>
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-sky-600 mb-2">
                        السؤال {i + 1} <span className="text-slate-400 font-medium mr-2">({(quizMaxScore / manualQuestions.length).toFixed(1).replace(/\.0$/, '')} نقاط)</span>
                      </label>
                      <input 
                        type="text" 
                        value={q.question}
                        onChange={e => handleQuestionChange(i, e.target.value)}
                        placeholder="نص السؤال"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                      {(q.question.includes('$') || q.question.includes('\\') || /[=+\-*/^_{}]/.test(q.question)) && <MathPreview text={q.question} />}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center gap-3 border rounded-lg p-2 transition-colors ${q.correctAnswerIndex === optIndex ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-sky-300'}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange(i, optIndex)}
                            className="shrink-0 flex items-center justify-center"
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${q.correctAnswerIndex === optIndex ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300'}`}>
                              {q.correctAnswerIndex === optIndex && <span className="text-xs">✓</span>}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => handleOptionChange(i, optIndex, e.target.value)}
                              placeholder={`الخيار ${optIndex + 1}`}
                              className="w-full bg-transparent text-sm font-medium focus:outline-none text-slate-700"
                            />
                            {(opt.includes('$') || opt.includes('\\') || /[=+\-*/^_{}]/.test(opt)) && <MathPreview text={opt} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-bold text-sm bg-sky-50 hover:bg-sky-100 px-4 py-2.5 rounded-lg transition-colors mt-4 w-full justify-center border border-sky-100"
            >
              <Plus className="w-4 h-4" /> إضافة سؤال جديد
            </button>
          </div>

        {/* Materials Section */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-700">ملحقات أخرى (ملفات إضافية)</h2>
          
          <div className="space-y-4">
            <label className="block border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white hover:bg-sky-50">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
              <span className="font-bold text-slate-600">صور أو ملفات مع التمرين تأخذ التمام حجمهم</span>
              <input 
                type="file" 
                multiple 
                onChange={handleMultipleFileChange}
                className="hidden"
              />
            </label>

            <div className="mt-4 w-full">
              <label className="block text-xs font-medium text-gray-700 mb-1 text-right">عنوان المرفق (يُطبق على الملفات المضافة معاً)</label>
              <input
                type="text"
                placeholder="اكتب عنوان المرفق هنا..."
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-sky-600 bg-white text-right"
              />
            </div>

            {materials.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {materials.map((mat, i) => (
                  <div key={i} className="flex flex-col gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative group">
                    <button 
                      type="button"
                      onClick={() => removeMaterial(i)}
                      className="absolute top-2 left-2 p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3 pr-2">
                      <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate" dir="ltr">{mat.file.name}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-1 border-t border-slate-200 pt-3">
                      <label className="text-xs font-bold text-slate-700 block">عنوان المرفق</label>
                      <input 
                        type="text" 
                        value={mat.title}
                        required
                        onChange={e => {
                          const updated = [...materials];
                          updated[i].title = e.target.value;
                          setMaterials(updated);
                        }}
                        className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button  
          type="submit" 
          disabled={uploading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black font-bold py-3 rounded-xl transition-all shadow-sm shadow-amber-500/20 mt-4 disabled:opacity-50"
        >
          {uploading ? "جاري النشر..." : "نشر التمرين"}
        </button>
      </form>
    </div>
  );
}
