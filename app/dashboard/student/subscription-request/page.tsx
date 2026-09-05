"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentSubscriptionContext, createSubscriptionRequest } from "@/actions/subscription";
import { WILAYAS, LEVELS, STREAMS, getWilayaName } from "@/lib/constants";
import { getCommunesByWilayaId } from "algeria-locations";
import {
  CreditCard,
  BookOpen,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Truck,
  Check,
  ArrowRight
} from "lucide-react";

export default function SubscriptionRequestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subjectIds: [] as string[],
    level: "",
    stream: "",
    wilaya: "",
    baladiya: "",
    address: "",
    phoneNumber: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getStudentSubscriptionContext();
        if (res.error) {
          setError(res.error);
        } else if (res.success && res.student) {
          setStudentInfo(res.student);
          setSubjects(res.subjects || []);
          setFormData(prev => ({
            ...prev,
            level: res.student.level || "",
            stream: res.student.stream || "",
            wilaya: res.student.wilaya || "",
            phoneNumber: res.student.phoneNumber || "",
          }));
        }
      } catch (err) {
        console.error("Error loading subscription context:", err);
        setError("تعذر تحميل بيانات الاشتراك");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === "wilaya") {
        return { ...prev, wilaya: value, baladiya: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubjectToggle = (id: string) => {
    setFormData(prev => {
      const exists = prev.subjectIds.includes(id);
      return {
        ...prev,
        subjectIds: exists
          ? prev.subjectIds.filter(s => s !== id)
          : [...prev.subjectIds, id],
      };
    });
  };

  const handleSelectAll = () => {
    if (formData.subjectIds.length === subjects.length) {
      setFormData(prev => ({ ...prev, subjectIds: [] }));
    } else {
      setFormData(prev => ({ ...prev, subjectIds: subjects.map(s => s.id) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (formData.subjectIds.length === 0) {
      setError("الرجاء اختيار مادة واحدة على الأقل للاشتراك فيها");
      setIsSubmitting(false);
      return;
    }

    if (!formData.wilaya) {
      setError("الرجاء تحديد الولاية");
      setIsSubmitting(false);
      return;
    }

    if (!formData.address.trim()) {
      setError("الرجاء كتابة العنوان الكامل للتوصيل");
      setIsSubmitting(false);
      return;
    }

    const phoneRegex = /^0[567][0-9]{8}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      setError("رقم الهاتف غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 05، 06، أو 07");
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
      console.error(err);
      setError("حدث خطأ غير متوقع أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const levelLabel = LEVELS.find(l => l.value === studentInfo?.level)?.label || studentInfo?.level || "";
  const streamLabel = STREAMS.find(s => s.value === studentInfo?.stream)?.label || studentInfo?.stream || "";

  if (success) {
    return (
      <div className="min-h-[85vh] w-full flex items-center justify-center p-4 lg:p-8" dir="rtl">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-orange-200 dark:border-slate-800 p-8 md:p-10 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
          
          <div className="w-20 h-20 bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto border border-orange-200 dark:border-orange-800/50 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">تم إرسال طلبك بنجاح!</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              تم تسجيل طلب بطاقة الاشتراك الخاص بك بنجاح. سيقوم فريقنا بالاتصال بك هاتفياً لتأكيد العنوان وشحن البطاقة إلى باب منزلك.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-right space-y-2 text-sm">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>المواد المختارة:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.subjectIds.length} مواد</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>الولاية والبلدية:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {getWilayaName(formData.wilaya)}{formData.baladiya ? ` - ${formData.baladiya}` : ""}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>رقم الهاتف للتوصيل:</span>
              <span className="font-bold text-slate-900 dark:text-white" dir="ltr">{formData.phoneNumber}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/student")}
            className="w-full py-4 rounded-2xl text-white font-bold text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>العودة إلى لوحة التحكم</span>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-6 px-4 md:px-8 space-y-8 max-w-5xl mx-auto" dir="rtl">
      
      {/* Header Banner - Clean Light Theme */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 text-xs font-bold">
                <span>خدمة التوصيل السريع لـ 58 ولاية</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">طلب بطاقة الاشتراك</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xl">
                اختر المواد الخاصة بشعبتك وسيتم إرسال بطاقة الاشتراك مع كود التفعيل إلى عنوانك والدفع عند الاستلام.
              </p>
            </div>
          </div>

          {/* Academic Info Pill */}
          {studentInfo && (
            <div className="bg-orange-50/60 dark:bg-slate-800/80 border border-orange-100 dark:border-slate-700 rounded-2xl p-4 shrink-0 flex flex-col gap-1.5 min-w-[220px]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>حسابك الأكاديمي</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{levelLabel}</p>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{streamLabel}</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">جاري تحميل المواد المتاحة لشعبتك ومستواك...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Step 1: Subjects Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <span>المواد المتاحة لمستواك الدراسي</span>
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  تم تحديد المواد المتوافقة تماماً مع شعبتك ({streamLabel}). يمكنك اختيار مادة واحدة أو أكثر.
                </p>
              </div>

              {subjects.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                    {formData.subjectIds.length} من {subjects.length} محددة
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    {formData.subjectIds.length === subjects.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  </button>
                </div>
              )}
            </div>

            {subjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">لا توجد مواد منشورة حالياً لشعبتك</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(sub => {
                  const isSelected = formData.subjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isSelected
                          ? "bg-orange-50/80 dark:bg-orange-950/20 border-orange-500 ring-2 ring-orange-500/20"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {sub.title}
                          </h3>
                          {sub.teacherName && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              الأستاذ: <span className="text-slate-700 dark:text-slate-300 font-bold">{sub.teacherName}</span>
                            </p>
                          )}
                        </div>

                        <div
                          className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      {sub.price && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-bold">سعر الاشتراك</span>
                          <span className="font-black text-orange-600 dark:text-orange-400">{sub.price} دج</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Delivery Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                <span>معلومات التوصيل والاستلام</span>
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                يرجى التأكد من كتابة العنوان ورقم الهاتف بدقة حتى يتمكن موزع خدمة التوصيل من الوصول إليك.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Wilaya */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>الولاية</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  <option value="">--- اختر الولاية ---</option>
                  {WILAYAS.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Baladiya */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>البلدية</span>
                </label>
                <select
                  name="baladiya"
                  value={formData.baladiya}
                  onChange={handleChange}
                  disabled={!formData.wilaya}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">--- اختر البلدية ---</option>
                  {formData.wilaya && getCommunesByWilayaId(parseInt(formData.wilaya.replace("W", ""))).map((c: any) => (
                    <option key={c.id} value={c.name_ar}>{c.name_ar}</option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>رقم الهاتف للتأكيد والتوصيل</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  dir="ltr"
                  pattern="^0[567][0-9]{8}$"
                  title="يجب أن يتكون رقم الهاتف من 10 أرقام ويبدأ بـ 05، 06، أو 07"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-mono"
                />
              </div>

              {/* Address (Clean without placeholder) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>العنوان الكامل</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder=""
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/30 to-white dark:from-slate-900 dark:to-slate-900 border border-orange-200/70 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-right w-full sm:w-auto">
              <h3 className="font-black text-base text-slate-900 dark:text-white">جاهز لإرسال الطلب؟</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {formData.subjectIds.length > 0
                  ? `قمت بتحديد ${formData.subjectIds.length} مواد. الدفع يتم نقداً عند استلام البطاقة.`
                  : "يرجى تحديد مادة واحدة على الأقل قبل المتابعة."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || formData.subjectIds.length === 0}
              className="w-full sm:w-auto min-w-[240px] py-4 px-8 rounded-2xl text-white font-black text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري إرسال الطلب...</span>
                </>
              ) : (
                <>
                  <span>تأكيد وإرسال الطلب</span>
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
