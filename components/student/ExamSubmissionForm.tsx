"use client";

import { useState } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { gradeStudentSubmission } from "@/actions/exams";

interface ExamSubmissionFormProps {
  examId: string;
  studentId: string;
  hasSubmitted: boolean;
  previousScore?: number | null;
  previousFeedback?: string | null;
}

export function ExamSubmissionForm({ examId, studentId, hasSubmitted, previousScore, previousFeedback }: ExamSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(hasSubmitted);
  const [score, setScore] = useState(previousScore);
  const [feedback, setFeedback] = useState(previousFeedback);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("examId", examId);
    formData.append("studentId", studentId);

    const result = await gradeStudentSubmission(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setScore(result.score);
      setFeedback(result.feedback);
    }
    
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="p-6 bg-[#F3EFFF] border border-[#EDE9FE] rounded-2xl space-y-4">
        <div className="flex items-center gap-3 text-[#1E1B4B] font-black">
          <CheckCircle className="w-6 h-6" />
          <h3>تم استلام حلك وتصحيحه بنجاح!</h3>
        </div>
        
        {score !== undefined && score !== null && (
          <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-xl border border-[#EDE9FE]">
            <span className="font-bold text-slate-700">العلامة الممنوحة من الذكاء الاصطناعي:</span>
            <span className="text-2xl font-black text-[#6D28D9]">{score}/20</span>
          </div>
        )}

        {feedback && (
          <div className="bg-white p-4 rounded-xl border border-[#EDE9FE] text-sm font-medium text-slate-700 leading-relaxed">
            {feedback}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 font-bold text-sm">
          {error}
        </div>
      )}

      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-center">
        <Upload className="w-10 h-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-800">ارفع صورة حلك بخط اليد</h4>
        <p className="text-sm text-slate-500 font-medium">سيقوم المساعد الذكي بقراءة خطك وتصحيح الإجابة آلياً بناءً على الأسئلة</p>
        
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="w-full text-base text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-[#EDE9FE] file:text-[#1E1B4B] hover:file:bg-[#DDD6FE] cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#6D28D9] hover:bg-[#1E1B4B] text-white rounded-xl font-bold text-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            جاري رفع الحل والتصحيح بالذكاء الاصطناعي..
          </>
        ) : (
          "إرسال الحل للتصحيح"
        )}
      </button>
    </form>
  );
}
