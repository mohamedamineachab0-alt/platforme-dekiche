"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { WILAYAS, LEVELS, STREAMS } from "@/lib/constants";
import {
  User, Phone, Lock, MapPin, GraduationCap, BookOpen,
  Users, Eye, EyeOff, UserPlus, ChevronDown, Loader2, AlertCircle, Mail
} from "lucide-react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";

function InputField({
  id, label, name, type = "text", placeholder, icon: Icon, dir,
  required = true, autoComplete, value, onChange
}: {
  id: string; label: string; name: string; type?: string;
  placeholder: string; icon: React.ElementType; dir?: string;
  required?: boolean; autoComplete?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="block text-sm font-bold text-sky-700 dark:text-sky-300">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      
      <div className="flex items-center w-full rounded-xl border border-sky-200 dark:border-blue-900 bg-white dark:bg-blue-950 overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400 transition-all shadow-sm" dir={dir || "rtl"}>
        {/* Icon Wrapper - Flex Sibling (No overlap possible) */}
        <div className="flex items-center justify-center w-12 self-stretch border-e border-sky-100 dark:border-blue-900 bg-slate-50 dark:bg-slate-900/50 text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Actual Input */}
        <input
          id={id}
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          dir={dir}
          value={value}
          onChange={onChange}
          className="flex-1 py-3 px-4 outline-none text-slate-900 dark:text-white font-bold text-base placeholder:text-sky-400/70 bg-transparent w-full"
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="flex items-center justify-center w-12 self-stretch text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  id, label, name, options, icon: Icon, placeholder, value, onChange
}: {
  id: string; label: string; name: string;
  options: { value: string; label: string }[];
  icon: React.ElementType; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="block text-sm font-bold text-sky-700 dark:text-sky-300">
        {label} <span className="text-amber-500">*</span>
      </label>

      <div className="flex items-center w-full rounded-xl border border-sky-200 dark:border-blue-900 bg-white dark:bg-blue-950 overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400 transition-all shadow-sm" dir="rtl">
        {/* Icon Wrapper */}
        <div className="flex items-center justify-center w-12 self-stretch border-e border-sky-100 dark:border-blue-900 bg-slate-50 dark:bg-slate-900/50 text-slate-400">
          <Icon className="w-5 h-5" />
        </div>

        {/* Select Wrapper */}
        <div className="relative flex-1 flex items-center">
          <select
            id={id}
            name={name}
            required
            value={value}
            onChange={onChange}
            className="w-full py-3 ps-4 pe-10 outline-none text-slate-900 dark:text-white font-bold text-base bg-transparent appearance-none cursor-pointer"
          >
            <option value="" disabled>{placeholder}</option>
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute end-3 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm font-medium mb-5">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function RegisterPage() {
  const [role, setRole] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    level: "",
    stream: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(undefined);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(undefined);
    
    try {
      const data = new FormData(e.currentTarget);
      const res = await registerUser(data);
      if (res?.error) {
        setIsPending(false);
        const errorMsg = res.error.toLowerCase();
        if (errorMsg.includes("already exists") || errorMsg.includes("unique")) {
          setError("هذا الحساب موجود بالفعل الرجاء تسجيل الدخول");
        } else if (errorMsg.includes("phone") || errorMsg.includes("format")) {
          setError("صيغة رقم الهاتف غير صحيحة");
        } else if (errorMsg.includes("password")) {
          setError("كلمة المرور ضعيفة جدا");
        } else {
          setError(res.error);
        }
      }
    } catch (err: any) {
      // Next.js redirects throw a specific error, we must not catch and swallow it
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) {
        throw err;
      }
      console.error("Registration error caught:", err);
      setError("حدث خطا اثناء الاتصال بالخادم");
      setIsPending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] dark:bg-slate-950 font-arabic flex items-center justify-center p-4 py-12 overflow-hidden selection:bg-sky-200 dark:selection:bg-slate-950/50" dir="rtl">
      {/* Global Background Math Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      </div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-950 dark:text-white leading-tight">منصة دقيش التعليمية</h1>
          <p className="text-sky-600 dark:text-sky-400 font-medium text-sm mt-2">
            اصنع مستقبلك بثبات نحو القمة
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-blue-950 rounded-3xl shadow-xl shadow-sky-200/60 dark:shadow-none border border-sky-100 dark:border-blue-900 overflow-hidden p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-black text-blue-950 dark:text-white">إنشاء حساب جديد</h2>
            <p className="text-sky-600 dark:text-sky-400 text-sm font-medium mt-1">أكمل البيانات التالية لتسجيل حسابك</p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => { setRole("STUDENT"); setError(undefined); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === "STUDENT" ? "bg-white dark:bg-blue-950 text-sky-700 shadow-sm" : "text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"}`}
            >
              حساب تلميذ
            </button>
            <button
              type="button"
              onClick={() => { setRole("PARENT"); setError(undefined); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === "PARENT" ? "bg-white dark:bg-blue-950 text-sky-700 shadow-sm" : "text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"}`}
            >
              حساب ولي
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="role" value={role} />
            <ErrorBanner message={error} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputField id="reg-name" label="الاسم الكامل" name="fullName"
                  placeholder="أدخل الاسم الكامل" icon={User} autoComplete="name" 
                  value={formData.fullName} onChange={handleInputChange} />
              </div>
              <div className="md:col-span-2">
                <InputField id="reg-phone" label="رقم الهاتف" name="phoneNumber" type="tel"
                  placeholder="05XXXXXXXX" icon={Phone} dir="ltr" autoComplete="tel" 
                  value={formData.phoneNumber} onChange={handleInputChange} />
              </div>
              
              {/* Optional Email input for Disposable Check functionality */}
              <div className="md:col-span-2">
                <InputField id="reg-email" label="البريد الإلكتروني (اختياري)" name="email" type="email"
                  placeholder="example@gmail.com" icon={Mail} dir="ltr" autoComplete="email"
                  required={false}
                  value={(formData as any).email || ""} onChange={handleInputChange} />
              </div>

              {role === "STUDENT" && (
                <>
                  <SelectField
                    id="reg-wilaya" label="الولاية" name="wilaya" icon={MapPin}
                    placeholder="اختر الولاية"
                    options={WILAYAS.map(w => ({ value: w.code, label: `${w.code.replace("W","")} - ${w.name}` }))}
                    value={formData.wilaya} onChange={handleInputChange}
                  />
                  <SelectField
                    id="reg-level" label="المستوى الدراسي" name="level" icon={GraduationCap}
                    placeholder="اختر المستوى"
                    options={LEVELS}
                    value={formData.level} onChange={handleInputChange}
                  />
                  <div className="md:col-span-2">
                    <SelectField
                      id="reg-stream" label="الشعبة" name="stream" icon={BookOpen}
                      placeholder="اختر الشعبة"
                      options={STREAMS}
                      value={formData.stream} onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-4 rounded-xl transition-all shadow-md shadow-amber-400/20 hover:shadow-lg hover:shadow-amber-400/30 hover:-translate-y-0.5 active:translate-y-0 mt-8 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            لديك حساب بالفعل{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-500 font-bold underline underline-offset-4">
              تسجيل الدخول
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-8">
          منصة دقيش التعليمية جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
