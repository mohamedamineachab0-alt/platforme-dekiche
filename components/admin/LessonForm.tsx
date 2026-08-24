"use client";

import { useState } from "react";
import { createLesson, LessonPayload } from "@/actions/lessons";
import { generateQuizFromImage } from "@/actions/ai";
import { Upload, X, Plus, Loader2, PlayCircle, Save, FileText, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { compressImageForAi } from "@/lib/utils/image-compression";
import { MathPreview } from "@/components/shared/MathPreview";
import { STREAMS } from "@/lib/constants";
import { NeoMultiSelect } from "@/components/shared/NeoMultiSelect";

type Subject = {
  id: string;
  title: string;
  level: string;
  stream: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points?: number;
};

export function LessonForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [month, setMonth] = useState("1");
  const [vimeoVideoId, setVimeoVideoId] = useState("");

  const [quizType, setQuizType] = useState<"MANUAL" | "AI">("MANUAL");
  const [quizMaxScore, setQuizMaxScore] = useState(20);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [materials, setMaterials] = useState<{ file: File; title: string }[]>([]);
  const [materialTitle, setMaterialTitle] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...manualQuestions];
    updated[index].question = value;
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[optIndex] = value;
    setManualQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    const updated = [...manualQuestions];
    updated[qIndex].correctAnswerIndex = optIndex;
    setManualQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleAiGenerate = async () => {
    if (!aiImageFile) {
      setError("يرجى رفع صورة أولاً");
      return;
    }

    setIsGeneratingAi(true);
    setError(null);

    try {
      const base64Data = await compressImageForAi(aiImageFile);
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          numberOfQuestions: numberOfQuestions,
          totalPoints: quizMaxScore
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل توليد الأسئلة");
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setManualQuestions(data.questions);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        title: materialTitle.trim() !== "" ? materialTitle : file.name.split(".")[0]
      }));
      setMaterials([...materials, ...newFiles]);
      setMaterialTitle(""); // Reset for next file
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || subjectIds.length === 0 || !month || !vimeoVideoId) {
      setError("جميع الحقول الأساسية مطلوبة (بما في ذلك اختيار مادة واحدة على الأقل)");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadingFiles(true);

    try {
      const uploadedMaterials = [];

      for (const mat of materials) {
        const fileExt = mat.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${subjectIds[0]}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lesson-materials")
          .upload(filePath, mat.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-materials")
          .getPublicUrl(filePath);

        uploadedMaterials.push({
          title: mat.title,
          fileUrl: publicUrl,
          fileType: mat.file.type
        });
      }

      setUploadingFiles(false);

      const payload: LessonPayload = {
        title,
        subjectId: subjectIds[0],
        subjectIds,
        streams: selectedStreams as any[],
        month: parseInt(month),
        vimeoVideoId,
        materials: uploadedMaterials,
        quiz: manualQuestions[0].question ? {
          maxScore: 20, // Forced max score
          aiGenerated: false,
          questions: manualQuestions.map(q => ({
            ...q,
            points: Number((20 / manualQuestions.length).toFixed(2))
          }))
        } : null
      };

      const result = await createLesson(payload);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/dashboard/admin/lessons");
      }

    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء رفع الملفات");
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const subjectOptions = subjects.map(s => ({
    value: s.id,
    label: s.title,
    subLabel: `${s.level} ${s.stream}`
  }));

  const streamOptions = STREAMS.map(s => ({
    value: s.value,
    label: s.label.replace(/\./g, '')
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-12 font-arabic relative" dir="rtl">
      
      {/* Neo-Brutalism Graph Paper Background */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-30 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9333ea 1px, transparent 1px),
            linear-gradient(to bottom, #9333ea 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>

      {error && (
        <div className="bg-red-200 text-black p-4 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-8">
        <h2 className="text-2xl font-black text-black inline-block bg-purple-200 px-4 py-2 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          معلومات الدرس الأساسية
        </h2>
        
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-wider">عنوان الدرس</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-yellow-50"
              placeholder="مثال: درس الاحتمالات"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-black uppercase tracking-wider bg-purple-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
              المواد (يمكنك اختيار أكثر من مادة)
            </label>
            <div className="max-h-72 overflow-y-auto p-4 border-black border-2 bg-slate-50 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
              <NeoMultiSelect 
                options={subjectOptions}
                selectedValues={subjectIds}
                onChange={setSubjectIds}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-black uppercase tracking-wider bg-emerald-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
              الشعب (يمكن اختيار أكثر من شعبة)
            </label>
            <div className="p-4 border-black border-2 bg-slate-50 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
              <NeoMultiSelect 
                options={streamOptions}
                selectedValues={selectedStreams}
                onChange={setSelectedStreams}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-wider">الشهر</label>
              <MonthSelect 
                value={month}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMonth(e.target.value)}
                className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white appearance-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-wider">Vimeo Video ID (أو رابط الفيديو)</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
                  <PlayCircle className="w-6 h-6" />
                </span>
                <input 
                  type="text" 
                  value={vimeoVideoId}
                  onChange={e => {
                    const val = e.target.value;
                    const match = val.match(/vimeo\.com\/(?:video\/)?(\d+)/);
                    setVimeoVideoId(match ? match[1] : val);
                  }}
                  dir="ltr"
                  className="w-full p-4 pr-12 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white"
                  placeholder="مثال: 123456789"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-8">
        <h2 className="text-2xl font-black text-black inline-block bg-yellow-200 px-4 py-2 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ملحقات الدرس كويز
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-purple-50 border-black border-2 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button
            type="button"
            onClick={() => setQuizType("MANUAL")}
            className={`px-6 py-3 font-black text-sm uppercase transition-transform border-black border-2 ${quizType === "MANUAL" ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"}`}
          >
            توليد كويز يدويا
          </button>
          <button
            type="button"
            onClick={() => setQuizType("AI")}
            className={`px-6 py-3 font-black text-sm uppercase transition-transform border-black border-2 flex items-center gap-2 ${quizType === "AI" ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"}`}
          >
            <BrainCircuit className="w-5 h-5" />
            توليد كويز بالذكاء الاصطناعي
          </button>
        </div>

        {quizType === "MANUAL" ? (
          <div className="space-y-8 bg-slate-50 p-8 border-black border-2 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-black pb-6 gap-4">
              <label className="text-sm font-black text-black uppercase tracking-wider">التنقيط الإجمالي للكويز (ثابت)</label>
              <input 
                type="number" 
                value={20}
                disabled
                className="w-24 bg-slate-200 border-black border-2 px-4 py-2 text-center font-black text-black cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            
            <div className="space-y-8">
              {manualQuestions.map((q, i) => (
                <div key={i} className="bg-white p-6 border-black border-2 relative group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(i)}
                    className="absolute top-4 left-4 bg-red-400 text-black border-black border-2 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
                    title="حذف السؤال"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-black uppercase mb-3 bg-emerald-200 px-2 py-1 border-black border-2 w-fit shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        السؤال {i + 1} <span className="text-slate-700 ml-2">({(20 / manualQuestions.length).toFixed(1).replace(/\.0$/, '')} نقاط)</span>
                      </label>
                      <input 
                        type="text" 
                        value={q.question}
                        onChange={e => handleQuestionChange(i, e.target.value)}
                        placeholder="نص السؤال"
                        className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-yellow-50"
                      />
                      {q.question.includes('$') && <div className="mt-2"><MathPreview text={q.question} /></div>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {q.options.map((opt, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center gap-3 p-3 border-black border-2 transition-colors ${q.correctAnswerIndex === optIndex ? 'bg-purple-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-slate-50'}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange(i, optIndex)}
                            className={`shrink-0 w-6 h-6 border-black border-2 flex items-center justify-center transition-colors ${q.correctAnswerIndex === optIndex ? 'bg-purple-600 text-white' : 'bg-white'}`}
                          >
                            {q.correctAnswerIndex === optIndex && <div className="w-3 h-3 bg-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => handleOptionChange(i, optIndex, e.target.value)}
                              placeholder={`الخيار ${optIndex + 1}`}
                              className="w-full bg-transparent text-sm font-bold text-black focus:outline-none"
                            />
                            {opt.includes('$') && <div className="mt-1"><MathPreview text={opt} /></div>}
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-black font-black text-lg py-4 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform uppercase"
            >
              <Plus className="w-5 h-5 border-black border-2 rounded-full p-0.5" /> إضافة سؤال جديد
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border-black border-2 p-8 space-y-8 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-black uppercase tracking-wider block">عدد الأسئلة</label>
                <input 
                  type="number" 
                  value={numberOfQuestions}
                  onChange={e => setNumberOfQuestions(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-black uppercase tracking-wider block">مجموع النقاط</label>
                <input 
                  type="number" 
                  value={quizMaxScore}
                  onChange={e => setQuizMaxScore(Number(e.target.value))}
                  min={1}
                  className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white"
                />
              </div>
            </div>

            <label className="border-black border-4 border-dashed bg-yellow-50 p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-yellow-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 bg-purple-200 border-black border-2 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Upload className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-black text-black text-xl mb-2">
                {aiImageFile ? aiImageFile.name : "اضغط لرفع صورة أو اسحبها هنا"}
              </h3>
              <p className="font-bold text-slate-700 max-w-md mx-auto">سيتم قراءة المحتوى وتوليد الأسئلة بشكل دقيق بالذكاء الاصطناعي</p>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files?.[0]) setAiImageFile(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi || !aiImageFile}
              className="w-full py-5 bg-black hover:bg-slate-900 text-white border-black border-2 font-black text-lg flex items-center justify-center gap-3 transition-transform disabled:opacity-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-6 h-6" />
                  توليد الأسئلة الآن
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-8">
        <h2 className="text-2xl font-black text-black inline-block bg-emerald-200 px-4 py-2 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ملحقات أخرى
        </h2>
        
        <div className="space-y-6">
          <label className="block border-black border-4 border-dashed bg-slate-50 p-10 text-center cursor-pointer hover:bg-purple-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Upload className="w-10 h-10 mx-auto text-black mb-4" />
            <span className="font-black text-black text-lg uppercase block mb-2">أضف ملفات ومرفقات الدرس</span>
            <span className="font-bold text-slate-600 block">قم برفع الصور أو الملفات لتكون ملحقات للدرس</span>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="w-full">
            <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
              عنوان المرفق الافتراضي عند الرفع
            </label>
            <input
              type="text"
              placeholder="مثال: ملخص الوحدة الأولى..."
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white"
            />
          </div>

          {materials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6 bg-slate-50 border-black border-2 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
              {materials.map((mat, i) => (
                <div key={i} className="flex flex-col bg-white border-black border-2 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-1 transition-transform">
                  <button 
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="absolute top-3 left-3 bg-red-400 text-black border-black border-2 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-200 border-black border-2 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-sm font-black text-black truncate" dir="ltr">{mat.file.name}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">{(mat.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t-2 border-black">
                    <label className="text-xs font-black text-black uppercase tracking-wider block">عنوان المرفق النهائي</label>
                    <input 
                      type="text" 
                      value={mat.title}
                      placeholder="عنوان المرفق"
                      required
                      onChange={e => {
                        const updated = [...materials];
                        updated[i].title = e.target.value;
                        setMaterials(updated);
                      }}
                      className="w-full p-3 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] bg-yellow-50"
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
        disabled={loading}
        className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white font-black text-2xl flex items-center justify-center gap-3 border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all disabled:opacity-70 uppercase tracking-widest mt-12 mb-20"
      >
        {loading ? (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            {uploadingFiles ? "جاري رفع الملفات..." : "جاري الحفظ..."}
          </>
        ) : (
          <>
            <Save className="w-7 h-7" />
            نشر الدرس
          </>
        )}
      </button>
    </form>
  );
}
