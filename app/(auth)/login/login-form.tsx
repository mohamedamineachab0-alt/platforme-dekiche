"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { universalLoginAction } from "@/actions/auth-login";
import { User, Phone, LogIn, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/shared/AuthShell";
import {
  type AuthPlatform,
  homePath,
  registerPath,
} from "@/lib/auth-platform";
import { useAuthPlatform } from "@/lib/use-auth-platform";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#6D28D9] py-4 text-lg font-black text-white transition hover:bg-[#1E1B4B] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري التحقق
        </>
      ) : (
        <>
          <LogIn className="h-5 w-5" />
          تسجيل الدخول
        </>
      )}
    </button>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function LoginForm({ initialPlatform }: { initialPlatform: AuthPlatform }) {
  const router = useRouter();
  const platform = useAuthPlatform(initialPlatform);
  const isLanguages = platform === "languages";
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await universalLoginAction(formData);

        if (result?.error) {
          setError(result.error);
        } else if (result?.success && result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      } catch (err: unknown) {
        console.error("Login error caught:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <AuthShell>
      <div className="mb-9">
        <h2 className="text-3xl font-black text-[#1E1B4B] sm:text-4xl">
          {isLanguages ? "دخول التلميذ — تعلّم اللغات" : "تسجيل الدخول"}
        </h2>
        <p className="mt-2 text-base font-medium text-[#6B6480]">
          {isLanguages
            ? "ادخل حسابك التعليمي في فرع تعلّم اللغات (منفصل عن الدراسة)"
            : "أدخل بياناتك للوصول إلى حساب الدراسة"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="platform" value={platform} />
        <ErrorBanner message={error} />

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="login-name" className="block text-base font-bold text-[#1E1B4B]">
              الاسم الكامل
            </label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D28D9]">
                <User className="h-5 w-5" />
              </span>
              <input
                id="login-name"
                name="fullName"
                type="text"
                placeholder="أدخل الاسم الكامل"
                required
                className="w-full rounded-2xl border border-[#EDE9FE] bg-[#F3EFFF] py-4 pr-12 pl-4 text-lg font-medium text-[#1E1B4B] placeholder:text-[#9B95B3] outline-none transition focus:border-[#6D28D9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(109,40,217,0.16)] focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-phone" className="block text-base font-bold text-[#1E1B4B]">
              رقم الهاتف
            </label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D28D9]">
                <Phone className="h-5 w-5" />
              </span>
              <input
                id="login-phone"
                name="phoneNumber"
                type="tel"
                dir="ltr"
                placeholder="05XXXXXXXX"
                required
                pattern="^0[567][0-9]{8}$"
                title="يجب أن يتكون رقم الهاتف من 10 أرقام ويبدأ بـ 05 أو 06 أو 07"
                className="w-full rounded-2xl border border-[#EDE9FE] bg-[#F3EFFF] py-4 pr-12 pl-4 text-lg font-medium text-[#1E1B4B] placeholder:text-[#9B95B3] outline-none transition focus:border-[#6D28D9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(109,40,217,0.16)] focus:ring-0"
              />
            </div>
          </div>
        </div>

        <SubmitButton pending={isPending} />
      </form>

      <div className="mt-8 text-center">
        <p className="text-base font-medium text-[#6B6480]">
          ليس لديك حساب{" "}
          <Link
            href={registerPath(platform)}
            className="font-black text-[#6D28D9] underline decoration-[#6D28D9] underline-offset-4 hover:text-[#1E1B4B]"
          >
            أنشئ حساباً جديداً
          </Link>
        </p>
        <Link
          href={homePath(platform)}
          className="mt-5 inline-block text-base font-bold text-[#6B6480] hover:text-[#6D28D9]"
        >
          العودة للرئيسية
        </Link>
      </div>
    </AuthShell>
  );
}
