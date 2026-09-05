"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { UploadCloud, Loader2, Wand2 } from 'lucide-react';
import { MathPreview } from '@/components/shared/MathPreview';

type GenerationType = 'daily_exercise' | 'exam';

interface AIGenerationFormProps {
  type: GenerationType;
}

export default function AIGenerationForm({ type }: AIGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [aiLanguage, setAiLanguage] = useState<"ar" | "fr" | "en" | "es">("ar");
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      metadata: { level: '', stream: '', subject: '', month: '', maxScore: 20 },
      questions: [] as any[]
    }
  });

  const { fields: questions, replace } = useFieldArray({ 
    control, 
    name: 'questions' 
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
      setStatusMsg(null);
    }
  };

  const handleGenerate = async (data: any) => {
    if (selectedFiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please upload at least one file.' });
      return;
    }
    
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const formData = new FormData();
      if (customPrompt) {
        formData.append("customPrompt", customPrompt);
      }
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      formData.append("metadata", JSON.stringify({ ...data.metadata, language: aiLanguage }));
      formData.append("type", type);

      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate questions, please try a clearer file');
      }

      const result = await res.json();
      if (result.questions && Array.isArray(result.questions)) {
        replace(result.questions);
        setStatusMsg({ type: 'success', text: 'Generated successfully!' });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-neutral-950 text-white rounded-xl w-full max-w-4xl mx-auto border border-neutral-900 shadow-2xl font-arabic">
      
      <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
        {/* Metadata configuration */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <input {...register('metadata.level')} placeholder="Education Level" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
          <input {...register('metadata.stream')} placeholder="Academic Track" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
          <input {...register('metadata.subject')} placeholder="Subject" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
          <input {...register('metadata.month')} type="number" placeholder="Month" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
          <input {...register('metadata.maxScore')} type="number" placeholder="Max Score" className="bg-neutral-900 border border-neutral-800 rounded-md p-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none" required />
        </div>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-neutral-800 rounded-xl p-10 text-center hover:bg-neutral-900/50 transition-colors relative group">
          <input type="file" multiple accept="*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <UploadCloud className="mx-auto h-12 w-12 text-neutral-500 mb-3 group-hover:text-purple-500 transition-colors" />
          <p className="text-sm text-neutral-400 font-medium">اسحب وأفلت الملفات هنا، أو اضغط للاختيار (يدعم كافة الملفات: PDF، صور، Word، ملخصات، نصوص)</p>
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs text-emerald-400 font-semibold">{selectedFiles.length} file(s) loaded:</p>
              {selectedFiles.map((f, idx) => (
                <p key={idx} className="text-xs text-neutral-500">{f.name}</p>
              ))}
            </div>
          )}
        </div>

        {/* Language Selection for AI */}
        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">لغة صياغة الكويز (Question Language)</label>
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
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  aiLanguage === l.id
                    ? "border-purple-500 bg-purple-950/40 text-purple-300 shadow-sm"
                    : "border-neutral-800 hover:border-neutral-700 text-neutral-400 bg-neutral-900"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-bold text-neutral-300 mb-2">تعليمات إضافية للذكاء الاصطناعي (اختياري)</label>
          <textarea 
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="مثال: ركز على وحدة الميكانيك وتجنب وحدة الكهرباء..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
          />
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-md text-sm font-semibold text-center ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Trigger Button */}
        <button type="submit" disabled={isGenerating} className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {isGenerating ? <Loader2 className="animate-spin mr-2" size={20} /> : <Wand2 className="mr-2 text-purple-600" size={20} />}
          {isGenerating ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي'}
        </button>
      </form>

      {/* Dynamic Form Builder Area */}
      {questions.length > 0 && (
        <div className="space-y-6 mt-8 border-t border-neutral-900 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-white">Generated Form</h3>
          
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-neutral-900/50 p-6 rounded-lg border border-neutral-800 space-y-5">
                <textarea 
                  {...register(`questions.${index}.question`)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none text-white placeholder-neutral-500" 
                  rows={3} 
                  placeholder="Question Text" 
                />
                {((q as any).question?.includes('$') || (q as any).question?.includes('\\')) && (
                  <div className="bg-neutral-950/80 p-3 rounded-md border border-neutral-800">
                    <MathPreview text={(q as any).question} />
                  </div>
                )}
                
                {type === 'daily_exercise' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3 rtl:space-x-reverse bg-neutral-950 p-2 rounded-md border border-neutral-800 focus-within:border-purple-500 transition-colors">
                        <input 
                          type="radio" 
                          {...register(`questions.${index}.correctAnswerIndex`)} 
                          value={optIndex} 
                          className="text-purple-600 focus:ring-purple-500 bg-neutral-900 border-neutral-700" 
                        />
                        <input 
                          {...register(`questions.${index}.options.${optIndex}`)} 
                          className="w-full bg-transparent border-none text-sm focus:ring-0 outline-none text-white placeholder-neutral-600" 
                          placeholder={`Option ${optIndex + 1}`} 
                        />
                      </div>
                    ))}
                  </div>
                )}

                {type === 'exam' && (
                  <div className="space-y-4">
                    <textarea 
                      {...register(`questions.${index}.modelAnswer`)} 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-50 placeholder-neutral-500" 
                      rows={2} 
                      placeholder="Suggested Model Answer" 
                    />
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="text-sm text-neutral-400">Allocated Marks:</span>
                      <input 
                        type="number" 
                        {...register(`questions.${index}.allocatedMarks`)} 
                        className="w-24 bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none text-center font-bold" 
                        placeholder="Marks" 
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
