"use client";

import Link from "next/link";
import { Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("student123");
  const [password, setPassword] = useState("student123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/student");
    }, 1000);
  };
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 relative z-10">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            تسجيل الدخول
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            مرحباً بعودتك إلى أكاديمية دقيش
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Phone */}
          <div className="relative group">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="اسم المستخدم أو الهاتف"
              required
              className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200 font-bold"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400 peer-focus:text-[#6D28D9] transition-colors duration-200" />
            </div>
          </div>

          {/* Password */}
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              required
              className="peer w-full pl-3 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-200 font-bold"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 peer-focus:text-[#6D28D9] transition-colors duration-200" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#6D28D9]/20 mt-6 flex justify-center items-center"
          >
            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "دخول (حساب تجريبي)"}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-[#6D28D9] font-medium hover:underline transition-all">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
