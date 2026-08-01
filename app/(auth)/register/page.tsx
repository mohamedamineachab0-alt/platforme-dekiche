"use client";

import { useState, useTransition } from "react";
import { User, Phone, Lock, BookOpen, MapPin, Loader2 } from "lucide-react";
import { registerUser } from "../../actions/auth";
import { useRouter } from "next/navigation";

const ALGERIAN_STATES = [
  "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة",
  "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
  "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو",
  "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
  "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة",
  "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
  "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس",
  "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة",
  "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة",
  "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - تيميمون", "50 - برج باجي مختار",
  "51 - أولاد جلال", "52 - بني عباس", "53 - إن صالح", "54 - إن قزام", "55 - تقرت",
  "56 - جانت", "57 - المغير", "58 - المنيعة",
];

const LEVELS = [
  "الأولى متوسط", "الثانية متوسط", "الثالثة متوسط", "الرابعة متوسط",
  "الأولى ثانوي", "الثانية ثانوي", "الثالثة ثانوي"
];

const TRACKS = [
  "بدون شعبة (متوسط)", "جذع مشترك علوم وتكنولوجيا", "جذع مشترك آداب",
  "علوم تجريبية", "رياضيات", "تقني رياضي", "تسيير واقتصاد", "آداب وفلسفة", "لغات أجنبية"
];

export default function RegisterPage() {
  const [role, setRole] = useState<"STUDENT" | "GUARDIAN">("STUDENT");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await registerUser(formData);
      if (res.success) {
        if (role === "STUDENT") {
          router.push("/student");
        } else {
          router.push("/dashboard");
        }
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-500">
            قم بملء البيانات أدناه للانضمام إلينا
          </p>
        </div>

        {/* Tabs - Pill Switch */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-8">
          <button
            onClick={() => setRole("STUDENT")}
            className={`flex-1 py-3 text-center font-bold text-base rounded-full transition-all duration-300 ${
              role === "STUDENT"
                ? "bg-white text-[#6D28D9] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            تلميذ
          </button>
          <button
            onClick={() => setRole("GUARDIAN")}
            className={`flex-1 py-3 text-center font-bold text-base rounded-full transition-all duration-300 ${
              role === "GUARDIAN"
                ? "bg-white text-[#6D28D9] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ولي
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="role" value={role} />
          {/* Name */}
          <div className="relative group">
            <input
              type="text"
              name="name"
              placeholder="الإسم واللقب"
              required
              className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 peer-focus:text-tshirt transition-colors duration-200" />
            </div>
          </div>

          {/* Phone */}
          <div className="relative group">
            <input
              type="tel"
              name="phone"
              placeholder="رقم الهاتف"
              required
              className="peer text-right w-full pl-3 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400 peer-focus:text-tshirt transition-colors duration-200" />
            </div>
          </div>

          {/* Password */}
          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              required
              className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 peer-focus:text-tshirt transition-colors duration-200" />
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === "STUDENT" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              {/* Level */}
              <div className="relative group">
                <select
                  required
                  name="level"
                  defaultValue=""
                  className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200 appearance-none text-gray-700"
                >
                  <option value="" disabled>
                    المستوى
                  </option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400 peer-focus:text-tshirt transition-colors duration-200" />
                </div>
              </div>

              {/* Track */}
              <div className="relative group">
                <select
                  required
                  name="track"
                  defaultValue=""
                  className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200 appearance-none text-gray-700"
                >
                  <option value="" disabled>
                    الشعبة
                  </option>
                  {TRACKS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400 peer-focus:text-tshirt transition-colors duration-200" />
                </div>
              </div>

              {/* State */}
              <div className="relative group">
                <select
                  required
                  name="wilayaCode"
                  defaultValue=""
                  className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200 appearance-none text-gray-700"
                >
                  <option value="" disabled>
                    الولاية
                  </option>
                  {ALGERIAN_STATES.map((state) => {
                    const code = state.split(' - ')[0];
                    return (
                      <option key={code} value={code}>
                        {state}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 peer-focus:text-tshirt transition-colors duration-200" />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-tshirt hover:bg-[#5b21b6] text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md mt-6 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : null}
            تسجيل
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            لديك حساب بالفعل؟{" "}
            <a href="/login" className="text-tshirt font-semibold hover:underline transition-all">
              سجل دخولك
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
