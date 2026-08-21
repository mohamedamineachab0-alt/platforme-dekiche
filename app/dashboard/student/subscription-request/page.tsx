"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvailableSubjects, createSubscriptionRequest } from "@/actions/subscription";
import { WILAYAS, LEVELS, STREAMS } from "@/lib/constants";
import { CreditCard, BookOpen, MapPin, Phone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SubscriptionRequestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subjectIds: [] as string[],
    level: "",
    stream: "",
    wilaya: "",
    address: "",
    phoneNumber: "",
  });

  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await getAvailableSubjects();
        setSubjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSubjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectToggle = (id: string) => {
    setFormData(prev => {
      if (prev.subjectIds.includes(id)) {
        return { ...prev, subjectIds: prev.subjectIds.filter(s => s !== id) };
      } else {
        return { ...prev, subjectIds: [...prev.subjectIds, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (formData.subjectIds.length === 0 || !formData.level || !formData.stream || !formData.wilaya || !formData.address || !formData.phoneNumber) {
      setError("الرجاء ملء جميع الحقول المطلوبة واختيار مادة واحدة على الأقل");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createSubscriptionRequest(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] w-full card-grid flex items-center justify-center p-4 lg:p-8" dir="rtl">
        <div className="w-full max-w-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-emerald-500/20 p-8 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">تم إرسال طلبك بنجاح!</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            لقد تم تسجيل طلب بطاقة الاشتراك الخاص بك بنجاح. سنتواصل معك في أقرب وقت لتأكيد التفاصيل وتفعيل حسابك.
          </p>
          <button
            onClick={() => router.push("/dashboard/student")}
            className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] w-full card-grid flex items-center justify-center p-4 lg:p-8" dir="rtl">
      <div className="w-full max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden relative">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600" />
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">طلب بطاقة الاشتراك</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">يرجى ملء الاستمارة أدناه للحصول على بطاقة الاشتراك الخاصة بك.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Subjects Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                اختر المواد (يمكنك اختيار أكثر من مادة)
              </label>
              
              {isLoading ? (
                <div className="p-4 text-center text-slate-500 text-sm bg-white/50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-slate-700">جاري تحميل المواد...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {subjects.map((sub) => {
                    const isSelected = formData.subjectIds.includes(sub.id);
                    return (
                      <div 
                        key={sub.id}
                        onClick={() => handleSubjectToggle(sub.id)}
                        className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700"}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>{sub.title}</p>
                          {sub.teacherName && <p className="text-xs text-slate-500 dark:text-slate-400">الأستاذ {sub.teacherName}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Level */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">المستوى الدراسي</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">--- اختر المستوى ---</option>
                  {LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Stream */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">الشعبة</label>
                <select
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">--- اختر الشعبة ---</option>
                  {STREAMS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wilaya */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  الولاية
                </label>
                <select
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">--- اختر الولاية ---</option>
                  {WILAYAS.map(w => (
                    <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="05xx xx xx xx"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">العنوان الكامل</label>
              <textarea
                name="address"
                placeholder="يرجى كتابة عنوانك بدقة لتسهيل التوصيل..."
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 mt-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "تأكيد وإرسال الطلب"
              )}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
