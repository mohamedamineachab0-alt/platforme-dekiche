"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { WILAYAS, LEVELS, STREAMS } from "@/lib/constants";
import {
  User, Phone, Lock, MapPin, GraduationCap, BookOpen,
  Users, Eye, EyeOff, UserPlus, ChevronDown, Loader2, AlertCircle
} from "lucide-react";
import Link from "next/link";

function InputField({
  id, label, name, type = "text", placeholder, icon: Icon, dir,
  required = true, autoComplete,
}: {
  id: string; label: string; name: string; type?: string;
  placeholder: string; icon: React.ElementType; dir?: string;
  required?: boolean; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-sky-600 dark:text-sky-300">
        {label} {required && <span className="text-sky-500">*</span>}
      </label>
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="w-4 h-4" />
        </span>
        <input
          id={id}
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          dir={dir}
          className="w-full pr-10 pl-10 py-3 rounded-xl border border-sky-200 dark:border-blue-950 bg-white dark:bg-blue-950 text-blue-950 dark:text-white font-medium text-sm placeholder:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  id, label, name, options, icon: Icon, placeholder,
}: {
  id: string; label: string; name: string;
  options: { value: string; label: string }[];
  icon: React.ElementType; placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-sky-600 dark:text-sky-300">
        {label} <span className="text-sky-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
        <select
          id={id}
          name={name}
          required
          defaultValue=""
          className="w-full pr-10 pl-8 py-3 rounded-xl border border-sky-200 dark:border-blue-950 bg-white dark:bg-blue-950 text-blue-950 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerUser(formData);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
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
              onClick={() => setRole("STUDENT")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === "STUDENT" ? "bg-white dark:bg-blue-950 text-sky-600 shadow-sm" : "text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"}`}
            >
              حساب تلميذ
            </button>
            <button
              type="button"
              onClick={() => setRole("PARENT")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === "PARENT" ? "bg-white dark:bg-blue-950 text-sky-600 shadow-sm" : "text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"}`}
            >
              حساب ولي
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="role" value={role} />
            <ErrorBanner message={error} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField id="reg-name" label="الاسم الكامل" name="fullName"
                  placeholder="أدخل الاسم الكامل" icon={User} autoComplete="name" />
              </div>
              <div className="md:col-span-2">
                <InputField id="reg-phone" label="رقم الهاتف" name="phoneNumber" type="tel"
                  placeholder="05XXXXXXXX" icon={Phone} dir="ltr" autoComplete="tel" />
              </div>

              {role === "STUDENT" && (
                <>
                  <SelectField
                    id="reg-wilaya" label="الولاية" name="wilaya" icon={MapPin}
                    placeholder="اختر الولاية"
                    options={WILAYAS.map(w => ({ value: w.code, label: `${w.code.replace("W","")} - ${w.name}` }))}
                  />
                  <SelectField
                    id="reg-level" label="المستوى الدراسي" name="level" icon={GraduationCap}
                    placeholder="اختر المستوى"
                    options={LEVELS}
                  />
                  <div className="md:col-span-2">
                    <SelectField
                      id="reg-stream" label="الشعبة" name="stream" icon={BookOpen}
                      placeholder="اختر الشعبة"
                      options={STREAMS}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-blue-950 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-yellow-300/20 hover:shadow-lg hover:shadow-yellow-300/20 hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            لديك حساب بالفعل{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-500 font-bold underline underline-offset-4">
              تسجيل الدخول
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          أكاديمية دقيش التعليمية جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
