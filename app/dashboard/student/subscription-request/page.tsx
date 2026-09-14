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
} from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

const fieldClass =
  "w-full rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3.5 text-sm font-bold text-[#1E1B4B] outline-none transition focus:border-[#6D28D9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(109,40,217,0.14)] disabled:cursor-not-allowed disabled:opacity-40";

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
          setFormData((prev) => ({
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
    setFormData((prev) => {
      if (name === "wilaya") {
        return { ...prev, wilaya: value, baladiya: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubjectToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.subjectIds.includes(id);
      return {
        ...prev,
        subjectIds: exists ? prev.subjectIds.filter((s) => s !== id) : [...prev.subjectIds, id],
      };
    });
  };

  const handleSelectAll = () => {
    if (formData.subjectIds.length === subjects.length) {
      setFormData((prev) => ({ ...prev, subjectIds: [] }));
    } else {
      setFormData((prev) => ({ ...prev, subjectIds: subjects.map((s) => s.id) }));
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

  const levelLabel = LEVELS.find((l) => l.value === studentInfo?.level)?.label || studentInfo?.level || "";
  const streamLabel = STREAMS.find((s) => s.value === studentInfo?.stream)?.label || studentInfo?.stream || "";

  if (success) {
    return (
      <div className="mx-auto max-w-xl space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
        <div className="rounded-[32px] border border-[#EDE9FE] bg-white p-8 text-center shadow-[0_16px_40px_rgba(30,27,75,0.06)] sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-[#1E1B4B] sm:text-3xl">تم إرسال طلبك بنجاح</h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-[#6B6480]">
            سيتواصل معك الفريق لتأكيد العنوان وإرسال بطاقة الاشتراك إلى باب المنزل.
          </p>

          <div className="mt-6 space-y-2.5 rounded-[24px] border border-[#EDE9FE] bg-[#F7F5FF] p-4 text-right text-sm">
            <div className="flex items-center justify-between text-[#6B6480]">
              <span>المواد المختارة</span>
              <span className="font-black text-[#1E1B4B]">{formData.subjectIds.length} مواد</span>
            </div>
            <div className="flex items-center justify-between text-[#6B6480]">
              <span>الولاية والبلدية</span>
              <span className="font-black text-[#1E1B4B]">
                {getWilayaName(formData.wilaya)}
                {formData.baladiya ? ` - ${formData.baladiya}` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#6B6480]">
              <span>رقم الهاتف</span>
              <span className="font-black text-[#1E1B4B]" dir="ltr">
                {formData.phoneNumber}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/student")}
            className="mt-8 w-full rounded-full bg-[#6D28D9] py-4 text-base font-black text-white transition hover:bg-[#1E1B4B]"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="طلب بطاقة الاشتراك"
        description="اختر مواد شعبتك، ثم أرسل عنوان التوصيل. البطاقة تصل إلى باب المنزل والدفع عند الاستلام."
        icon={CreditCard}
        action={
          studentInfo ? (
            <div className="rounded-[24px] bg-white px-5 py-3 text-center sm:text-right">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#6B6480] sm:justify-start">
                <GraduationCap className="h-3.5 w-3.5 text-[#6D28D9]" />
                حسابك الدراسي
              </p>
              <p className="mt-1 text-sm font-black text-[#1E1B4B]">{levelLabel}</p>
              <p className="text-xs font-bold text-[#6D28D9]">{streamLabel}</p>
            </div>
          ) : undefined
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 py-20 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#6D28D9]" />
          <p className="text-sm font-bold text-[#6B6480]">جاري تحميل المواد المتاحة لشعبتك ومستواك</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6 rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)] sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#EDE9FE] pb-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-lg font-black text-[#1E1B4B]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#6D28D9]">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  المواد المتاحة لمستواك
                </h2>
                <p className="text-xs font-medium text-[#6B6480]">
                  المواد المتوافقة مع شعبتك ({streamLabel}). يمكنك اختيار مادة واحدة أو أكثر.
                </p>
              </div>

              {subjects.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#6D28D9]/10 px-3 py-1.5 text-xs font-bold text-[#6D28D9]">
                    {formData.subjectIds.length} من {subjects.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-[#6D28D9] underline underline-offset-4"
                  >
                    {formData.subjectIds.length === subjects.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  </button>
                </div>
              )}
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-[24px] border border-[#EDE9FE] bg-[#F7F5FF] p-8 text-center">
                <BookOpen className="mx-auto mb-2 h-10 w-10 text-[#A8B4D6]" />
                <p className="text-sm font-bold text-[#6B6480]">لا توجد مواد منشورة حالياً لشعبتك</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((sub) => {
                  const isSelected = formData.subjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={`flex flex-col rounded-[24px] border p-4 text-right transition ${
                        isSelected
                          ? "border-[#6D28D9] bg-[#F7F5FF] shadow-[0_0_0_4px_rgba(109,40,217,0.12)]"
                          : "border-[#EDE9FE] bg-white hover:border-[#6D28D9]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-base font-black text-[#1E1B4B]">{sub.title}</h3>
                          {sub.teacherName && (
                            <p className="text-xs font-bold text-[#6D28D9]">{sub.teacherName}</p>
                          )}
                        </div>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                            isSelected
                              ? "border-[#6D28D9] bg-[#6D28D9] text-white"
                              : "border-[#EDE9FE] bg-[#F7F5FF] text-transparent"
                          }`}
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </span>
                      </div>
                      {sub.price ? (
                        <div className="mt-4 flex items-center justify-between border-t border-[#EDE9FE] pt-3 text-xs">
                          <span className="font-bold text-[#6B6480]">سعر الاشتراك</span>
                          <span className="font-black text-[#6D28D9]">{sub.price} دج</span>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6 rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)] sm:p-8">
            <div className="space-y-1 border-b border-[#EDE9FE] pb-4">
              <h2 className="flex items-center gap-2 text-lg font-black text-[#1E1B4B]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF1FF] text-[#6D28D9]">
                  <Truck className="h-5 w-5" />
                </span>
                معلومات التوصيل
              </h2>
              <p className="text-xs font-medium text-[#6B6480]">
                اكتب العنوان ورقم الهاتف بدقة حتى يصل الموزع إليك.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-[#1E1B4B]">
                  <MapPin className="h-4 w-4 text-[#6D28D9]" />
                  الولاية
                  <span className="text-red-500">*</span>
                </label>
                <select name="wilaya" value={formData.wilaya} onChange={handleChange} className={fieldClass}>
                  <option value="">اختر الولاية</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-[#1E1B4B]">
                  <MapPin className="h-4 w-4 text-[#6D28D9]" />
                  البلدية
                </label>
                <select
                  name="baladiya"
                  value={formData.baladiya}
                  onChange={handleChange}
                  disabled={!formData.wilaya}
                  className={fieldClass}
                >
                  <option value="">اختر البلدية</option>
                  {formData.wilaya &&
                    getCommunesByWilayaId(parseInt(formData.wilaya.replace("W", ""), 10)).map((c) => (
                      <option key={c.id} value={c.name_ar}>
                        {c.name_ar}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-[#1E1B4B]">
                  <Phone className="h-4 w-4 text-[#6D28D9]" />
                  رقم الهاتف للتأكيد والتوصيل
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  dir="ltr"
                  pattern="^0[567][0-9]{8}$"
                  title="يجب أن يتكون رقم الهاتف من 10 أرقام ويبدأ بـ 05 أو 06 أو 07"
                  className={`${fieldClass} font-mono`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-black text-[#1E1B4B]">
                  العنوان الكامل
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-5 rounded-[32px] border border-[#EDE9FE] bg-white p-6 shadow-[0_12px_36px_rgba(30,27,75,0.06)] sm:flex-row sm:p-8">
            <div className="w-full space-y-1 text-right sm:w-auto">
              <h3 className="text-base font-black text-[#1E1B4B]">جاهز لإرسال الطلب؟</h3>
              <p className="text-xs font-medium text-[#6B6480]">
                {formData.subjectIds.length > 0
                  ? `حددت ${formData.subjectIds.length} مواد. الدفع نقداً عند استلام البطاقة.`
                  : "حدد مادة واحدة على الأقل قبل المتابعة."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || formData.subjectIds.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6D28D9] px-8 py-4 text-base font-black text-white transition hover:bg-[#1E1B4B] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري إرسال الطلب
                </>
              ) : (
                <>
                  تأكيد وإرسال الطلب
                  <Check className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
