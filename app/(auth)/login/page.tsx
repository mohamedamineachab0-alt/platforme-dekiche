"use client";

import { useState } from "react";
import { loginUser } from "@/actions/auth";
import { User, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm font-medium mb-5">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] dark:bg-slate-950 font-arabic flex items-center justify-center p-4 py-12 overflow-hidden selection:bg-sky-200 dark:selection:bg-slate-950/50" dir="rtl">
      {/* Global Background Math Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">منصة دقيش التعليمية</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">
            اصنع مستقبلك بثبات نحو القمة
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">تسجيل الدخول</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form action={loginUser} className="space-y-5">
            <ErrorBanner message={undefined} />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-name" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  الاسم الكامل <span className="text-sky-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-name"
                    name="fullName"
                    type="text"
                    placeholder="أدخل الاسم الكامل"
                    required
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-medium text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-phone" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  رقم الهاتف <span className="text-sky-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-phone"
                    name="phoneNumber"
                    type="tel"
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                    required
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-medium text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="rememberMe" 
                name="rememberMe"
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 bg-white dark:bg-slate-950 accent-sky-600 cursor-pointer" 
              />
              <label htmlFor="rememberMe" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                تذكرني
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black font-black py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 mt-6"
            >
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            ليس لديك حساب{" "}
            <Link href="/register" className="text-sky-600 hover:text-sky-500 font-bold underline underline-offset-4">
              إنشاء حساب جديد
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
