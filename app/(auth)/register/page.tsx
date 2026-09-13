"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import {
  WILAYAS,
  SECONDARY_CYCLE,
  SECONDARY_STREAMS,
} from "@/lib/constants";
import {
  User,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  UserPlus,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/shared/AuthShell";

const fieldClass =
  "w-full rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] py-4 pr-12 pl-4 text-lg font-medium text-[#1E1B4B] placeholder:text-[#9B95B3] outline-none transition focus:border-[#6D28D9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(109,40,217,0.14)] focus:ring-0";

function InputField({
  id,
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  dir,
  required = true,
  autoComplete,
  pattern,
  title,
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  dir?: string;
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
  title?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base font-bold text-[#1E1B4B]">
        {label}
        {required && <span className="text-[#6D28D9]"> *</span>}
      </label>
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D28D9]">
          <Icon className="h-5 w-5" />
        </span>
        <input
          id={id}
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          pattern={pattern}
          title={title}
          dir={dir}
          value={value}
          onChange={onChange}
          className={`${fieldClass} ${isPassword ? "pl-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B95B3] transition hover:text-[#1E1B4B]"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  name,
  options,
  icon: Icon,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  options: { value: string; label: string }[];
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base font-bold text-[#1E1B4B]">
        {label}
        <span className="text-[#6D28D9]"> *</span>
      </label>
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D28D9]">
          <Icon className="h-5 w-5" />
        </span>
        <select
          id={id}
          name={name}
          required
          value={value}
          onChange={onChange}
          className={`${fieldClass} appearance-none pl-10`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9B95B3]" />
      </div>
    </div>
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

const ACADEMY_LEVELS = [
  { value: "AS2", label: "السنة الثانية ثانوي" },
  { value: "AS3", label: "السنة الثالثة ثانوي شهادة الباكالوريا" },
];

const ACADEMY_STREAMS = SECONDARY_STREAMS.filter((s) => s.value !== "COMMON_TRUNK");

function RegisterForm() {
  const [role, setRole] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    cycle: "SECONDARY",
    level: "",
    stream: "",
    understandingLevel: "",
  });

  const cycleLevels = ACADEMY_LEVELS;
  const cycleStreams = ACADEMY_STREAMS;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(undefined);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    startTransition(async () => {
      try {
        const data = new FormData(e.currentTarget);
        const res = await registerUser(data);
        if (res?.error) {
          const errorMsg = res.error.toLowerCase();
          if (
            errorMsg.includes("already exists") ||
            errorMsg.includes("unique") ||
            errorMsg.includes("مسجل مسبقا")
          ) {
            setError("هذا الحساب موجود بالفعل الرجاء تسجيل الدخول");
          } else if (
            errorMsg.includes("صيغة رقم الهاتف") ||
            errorMsg.includes("invalid phone") ||
            errorMsg.includes("phone format")
          ) {
            setError("صيغة رقم الهاتف غير صحيحة");
          } else if (errorMsg.includes("password")) {
            setError("كلمة المرور ضعيفة جدا");
          } else {
            const knownMessage = [
              "جميع الحقول مطلوبة",
              "الولاية غير صالحة",
              "المستوى غير صالح",
              "الفرع غير صالح",
              "هذا الفرع لا ينتمي للدورة المختارة",
              "مستوى الفهم غير صالح",
            ].some((message) => res.error.includes(message));
            setError(knownMessage ? res.error : "تعذر إنشاء الحساب، حاول مرة أخرى");
          }
        } else if (res?.success && res.redirectUrl) {
          router.push(res.redirectUrl);
        }
      } catch (err: unknown) {
        console.error("Registration error caught:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <AuthShell wide>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-[#1E1B4B] sm:text-4xl">إنشاء حساب جديد</h2>
              <p className="mt-2 text-base font-medium text-[#6B6480]">
                أكمل البيانات التالية لتسجيل حساب الدراسة
              </p>
            </div>

            <div className="mb-8 flex rounded-full bg-[#F7F5FF] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setRole("STUDENT");
                  setError(undefined);
                }}
                className={`flex-1 rounded-full py-3 text-sm font-bold transition ${
                  role === "STUDENT"
                    ? "bg-[#6D28D9] text-white shadow-sm"
                    : "text-[#6B6480] hover:text-[#1E1B4B]"
                }`}
              >
                حساب تلميذ
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("PARENT");
                  setError(undefined);
                }}
                className={`flex-1 rounded-full py-3 text-sm font-bold transition ${
                  role === "PARENT"
                    ? "bg-[#6D28D9] text-white shadow-sm"
                    : "text-[#6B6480] hover:text-[#1E1B4B]"
                }`}
              >
                حساب ولي
              </button>
            </div>

              <form onSubmit={(e) => {
                if (role === "STUDENT" && !formData.understandingLevel) {
                  e.preventDefault();
                  setError("اختر مستوى فهمك");
                  return;
                }
                handleSubmit(e);
              }} className="relative space-y-6">
              <input type="hidden" name="role" value={role} />

              <div className="pointer-events-none absolute -z-50 opacity-0" aria-hidden="true">
                <label htmlFor="website_url">Website URL (Do not fill this)</label>
                <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
              </div>

              <ErrorBanner message={error} />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <InputField
                    id="reg-name"
                    label="الاسم الكامل"
                    name="fullName"
                    placeholder="أدخل الاسم الكامل"
                    icon={User}
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    id="reg-phone"
                    label="رقم الهاتف"
                    name="phoneNumber"
                    type="tel"
                    placeholder="05XXXXXXXX"
                    icon={Phone}
                    dir="ltr"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                {role === "STUDENT" && (
                  <>
                    <SelectField
                      id="reg-wilaya"
                      label="الولاية"
                      name="wilaya"
                      icon={MapPin}
                      placeholder="اختر الولاية"
                      options={WILAYAS.map((w) => ({ value: w.code, label: w.name }))}
                      value={formData.wilaya}
                      onChange={handleInputChange}
                    />
                    <input type="hidden" name="cycle" value="SECONDARY" />
                    <div className="rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] px-4 py-3 md:col-span-2">
                      <p className="text-xs font-black text-[#6D28D9]">الطور الدراسي</p>
                      <p className="mt-1 text-base font-black text-[#1E1B4B]">{SECONDARY_CYCLE.label}</p>
                    </div>
                    <SelectField
                      id="reg-level"
                      label="السنة الدراسية"
                      name="level"
                      icon={GraduationCap}
                      placeholder="اختر السنة"
                      options={cycleLevels}
                      value={formData.level}
                      onChange={handleInputChange}
                    />
                    <div className="md:col-span-2">
                      <SelectField
                        id="reg-stream"
                        label="الشعبة"
                        name="stream"
                        icon={BookOpen}
                        placeholder="اختر الشعبة"
                        options={cycleStreams}
                        value={formData.stream}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <p className="block text-base font-bold text-[#1E1B4B]">
                        مستوى فهمك
                        <span className="text-[#6D28D9]"> *</span>
                      </p>
                      <input type="hidden" name="understandingLevel" value={formData.understandingLevel} required />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                          { value: "FAST", label: "فهم سريع", bg: "bg-[#22C55E]", ring: "ring-[#22C55E]" },
                          { value: "AVERAGE", label: "متوسط", bg: "bg-[#F97316]", ring: "ring-[#F97316]" },
                          { value: "WEAK", label: "ضعيف", bg: "bg-[#EF4444]", ring: "ring-[#EF4444]" },
                        ].map((opt) => {
                          const active = formData.understandingLevel === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setError(undefined);
                                setFormData((prev) => ({ ...prev, understandingLevel: opt.value }));
                              }}
                              className={`min-h-[72px] rounded-[24px] px-4 py-5 text-center text-lg font-black text-white transition ${opt.bg} ${
                                active ? `ring-4 ${opt.ring} ring-offset-2 brightness-110` : "hover:brightness-95"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#6D28D9] py-4 text-lg font-black text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                {isPending ? "جاري إنشاء الحساب" : "إنشاء الحساب"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-base font-medium text-[#6B6480]">
                لديك حساب بالفعل{" "}
                <Link
                  href="/login"
                  className="font-black text-[#6D28D9] underline decoration-[#6D28D9] underline-offset-4 hover:text-[#5B21B6]"
                >
                  تسجيل الدخول
                </Link>
              </p>
              <Link href="/" className="mt-5 inline-block text-base font-bold text-[#A78BFA] hover:text-[#6D28D9]">
                العودة للرئيسية
              </Link>
            </div>
    </AuthShell>
  );
}
