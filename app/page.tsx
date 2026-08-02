"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  UserSquare2, 
  ShieldCheck,
  MonitorPlay,
  TrendingUp,
  FileText,
  MapPin,
  Laptop,
  CheckCircle2,
  Tag,
  Timer,
  PartyPopper,
  ArrowLeft,
  Rocket,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  // --- State Machine ---
  // Countdown state (seconds left)
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isCounting, setIsCounting] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPortalsUnlocked, setIsPortalsUnlocked] = useState(false);
  
  // Effect to handle countdown ticking
  useEffect(() => {
    if (!isCounting) return;
    if (secondsLeft <= 0) {
      setIsCounting(false);
      handleLaunch();
      return;
    }
    const timerId = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isCounting, secondsLeft]);

  const handleLaunch = () => {
    setIsLaunched(true);
    setShowSuccess(true);
  };

  const handleEnterPlatform = () => {
    setShowSuccess(false);
    setIsPortalsUnlocked(true);
    setTimeout(() => {
      document.getElementById("portals-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col relative z-10 selection:bg-[#6D28D9]/20 font-sans">
      
      {/* ---------------- A. Hero Section ---------------- */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] font-bold text-sm mb-6 border border-[#6D28D9]/20">
          <GraduationCap className="w-4 h-4" />
          <span>مرحباً بكم في أكاديمية دقيش</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          منصة أكاديمية دقيش <br className="hidden md:block" /> التعليمية
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          منصة تعليمية متكاملة تجمع بين التعليم الرقمي، المتابعة المستمرة، والاختبارات الذكية لطلبة التعليم المتوسط والثانوي.
        </p>
      </section>

      {/* ---------------- Launch Countdown Section (Grand Opening) ---------------- */}
      {!isPortalsUnlocked && (
        <section className="w-full max-w-5xl mx-auto px-4 pb-24 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative group overflow-hidden rounded-[3rem] bg-white border border-[#6D28D9]/10 shadow-[0_20px_80px_-15px_rgba(109,40,217,0.15)] hover:shadow-[0_20px_80px_-15px_rgba(109,40,217,0.25)] transition-all duration-700">
            
            {/* Immersive Background Gradients & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-[#6D28D9]/10 via-[#c4b5fd]/10 to-transparent rounded-full blur-3xl -mr-64 -mt-64 transition-all duration-1000 group-hover:scale-110 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-purple-400/10 via-[#6D28D9]/5 to-transparent rounded-full blur-3xl -ml-64 -mb-64 transition-all duration-1000 group-hover:scale-110 pointer-events-none" />
            


            <div className="relative z-10 flex flex-col items-center w-full px-6 py-16 md:py-24 text-center">
              
              {/* Grand Opening Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6D28D9]/10 to-purple-400/10 text-[#6D28D9] font-bold text-sm mb-8 border border-[#6D28D9]/20 shadow-sm backdrop-blur-md">
                <Rocket className="w-4 h-4 animate-pulse" />
                <span className="tracking-wide">الافتتاح الرسمي للمنصة</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                لحظات تفصلنا عن مستقبل <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6D28D9] to-purple-500">التعليم الرقمي</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mb-12">
                انضم إلينا في تجربة تعليمية رائدة تجمع بين أحدث التقنيات وأفضل الممارسات الأكاديمية.
              </p>
              
              {/* Grand Countdown Display */}
              <div className="flex flex-col items-center mb-16 relative">
                <div className="absolute inset-0 bg-[#6D28D9]/5 blur-3xl rounded-full scale-150"></div>
                
                <div className="relative flex flex-col items-center justify-center p-8 bg-white border-2 border-[#6D28D9]/10 rounded-[2.5rem] shadow-xl shadow-[#6D28D9]/10 hover:border-[#6D28D9]/30 transition-colors duration-500 min-w-[200px]">
                  <span className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#6D28D9] to-slate-800 font-mono tracking-tighter leading-none mb-2">
                    {secondsLeft}
                  </span>
                  <span className="text-lg font-bold text-slate-400 uppercase tracking-widest">ثانية</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => { setSecondsLeft(10); setIsCounting(true); }}
                  className="bg-white border-2 border-slate-200 text-slate-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-sm hover:border-[#6D28D9]/30 hover:text-[#6D28D9] hover:bg-slate-50 transition-all duration-300 w-full sm:w-auto"
                >
                  تفعيل العد التنازلي
                </button>
                
                <button 
                  onClick={handleLaunch}
                  className="group relative bg-gradient-to-l from-[#6D28D9] to-[#5b21b6] text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl shadow-[#6D28D9]/30 hover:shadow-[#6D28D9]/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-3 overflow-hidden border border-white/10"
                  title="إطلاق المنصة الآن"
                >
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                  <span className="relative z-10 text-xl">إطلاق المنصة</span>
                  <ArrowLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ---------------- Success Modal ---------------- */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in-90 slide-in-from-bottom-8 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-purple-400 to-[#6D28D9]" />
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3">الريادة</h2>
            <p className="text-slate-500 font-medium mb-8">مرحباً بكم في أفق جديد ومبتكر للتعليم. الأكاديمية تفتح أبوابها لكم الآن.</p>
            <button 
              onClick={handleEnterPlatform}
              className="w-full bg-[#6D28D9] text-white font-bold py-4 rounded-2xl hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20"
            >
              الدخول للمنصة
            </button>
          </div>
        </div>
      )}

      {/* ---------------- B. Portals & Features (Unlocked State) ---------------- */}
      {isPortalsUnlocked && (
        <div id="portals-section" className="animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
          
          {/* Portal Navigation Buttons */}
          <section className="w-full max-w-6xl mx-auto px-4 pb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-800">بوابات الدخول السريع</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
              
              <Link href="/student" className="group relative overflow-hidden bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(109,40,217,0.15)] border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-[#6D28D9]/10" />
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-[#6D28D9] group-hover:border-[#6D28D9] transition-colors">
                  <Users className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">صفحة التلميذ</h3>
                <p className="text-sm text-slate-500 font-medium">تسجيل الدخول وواجهة التلميذ</p>
              </Link>

              <Link href="/guardian" className="group relative overflow-hidden bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(109,40,217,0.15)] border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-[#6D28D9]/10" />
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-[#6D28D9] group-hover:border-[#6D28D9] transition-colors">
                  <UserSquare2 className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">صفحة الولي</h3>
                <p className="text-sm text-slate-500 font-medium">متابعة الأبناء والتقارير</p>
              </Link>

            </div>
          </section>

          {/* C. Video Presentation Section */}
          <section className="w-full max-w-5xl mx-auto px-4 pb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">اكتشف منصة دقيش</h2>
              <p className="text-slate-500 font-medium">شاهد الفيديو التعريفي لتتعرف على مميزات المنصة وطريقة عملها</p>
            </div>
            
            <div className="relative p-4 md:p-8 bg-white rounded-[2.5rem] shadow-xl border border-[#6D28D9]/10 overflow-hidden group hover:shadow-2xl hover:shadow-[#6D28D9]/10 transition-shadow duration-500">
              {/* Physical graph notebook square background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-60"></div>
              
              {/* Subtle Purple Highlights */}
              <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-gradient-to-br from-[#6D28D9]/10 via-[#c4b5fd]/5 to-transparent rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#6D28D9]/5 to-transparent rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />
              
              <div className="relative z-10 w-full aspect-video rounded-[1.5rem] overflow-hidden shadow-lg border-[6px] border-white/80 backdrop-blur-sm">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/KOu_2hDYvrk?si=dzY1WkwoTJUJKhDm" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </section>

          {/* D. Key Features & Highlights Section */}
          <section className="w-full py-20 bg-white/50 border-y border-gray-100">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">لماذا منصة دقيش؟</h2>
                <p className="text-slate-500 font-medium">مميزات فريدة تجعلنا الخيار الأول لنجاحك الأكاديمي</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Feature 1 */}
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <Laptop className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">تعليم رقمي متطور</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    توفير بيئة تعليمية افتراضية تحاكي الواقع وتعتمد على أحدث التقنيات لتقديم المحتوى بأسلوب تفاعلي وممتع.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">برامج ذكية ومتابعة مستمرة</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    متابعة دقيقة لكل متعلم عبر أدوات ذكية تضمن فهم نقاط الضعف والقوة والعمل على تحسينها بانتظام.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">اختبارات وتقارير دورية</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    تقييم مستمر من خلال اختبارات دورية وإرسال تقارير مفصلة للأولياء لمتابعة مستوى الأبناء.
                  </p>
                </div>
                {/* Feature 4 */}
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">بيئة منظمة وآمنة</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    منصة تضمن أعلى معايير الخصوصية والتنظيم، مما يوفر بيئة آمنة للمتعلمين للتركيز التام على الدراسة.
                  </p>
                </div>
                {/* Feature 5 */}
                <div className="flex flex-col items-center text-center p-6 lg:col-span-2 lg:max-w-md lg:mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                    <Tag className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">أسعار مناسبة وعروض</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    تقديم باقات اشتراك تنافسية تناسب الجميع، مع توفير عروض موسمية وتخفيضات لدعم الطلاب.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* D. Academy Pillars & Advantages */}
          <section className="w-full max-w-5xl mx-auto px-4 py-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-12 text-center">ركائز الأكاديمية الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <CheckCircle2 className="w-6 h-6 text-[#6D28D9] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">أساتذة أكفاء وذوو خبرة</h4>
                  <p className="text-sm text-slate-500">نخبة مختارة من الأساتذة المتميزين بخبرة طويلة في مجال التعليم.</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <CheckCircle2 className="w-6 h-6 text-[#6D28D9] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">منصة تعليمية متطورة</h4>
                  <p className="text-sm text-slate-500">نظام مبني بأحدث التقنيات لضمان تجربة تعليمية سلسة وبدون انقطاعات.</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <CheckCircle2 className="w-6 h-6 text-[#6D28D9] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">متابعة دقيقة</h4>
                  <p className="text-sm text-slate-500">إحصائيات، تقارير، ورسوم بيانية توضح مسار تقدم الطالب بشكل لحظي.</p>
                </div>
              </div>
            </div>
          </section>

          {/* E. Location & Contact Section */}
          <section className="w-full px-4 pb-20">
            <div className="max-w-3xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden shadow-xl border border-[#6D28D9]/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6D28D9]/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#6D28D9]/10 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8 text-[#6D28D9]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">مقر الأكاديمية</h3>
                <p className="text-slate-500 font-medium mb-6">نرحب بزيارتكم في مقرنا الكائن بـ:</p>
                
                <div className="bg-gray-50/80 border border-gray-100 rounded-[2rem] p-6 w-full max-w-lg shadow-inner">
                  <p className="text-lg font-bold text-slate-700 leading-relaxed">
                    حي قصدي قدور - برج بونعامة<br />
                    تيسمسيلت
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="inline-flex items-center justify-center bg-[#6D28D9] text-white text-sm font-bold px-5 py-2 rounded-full shadow-md shadow-[#6D28D9]/20 hover:bg-[#5b21b6] transition-colors cursor-default">
                      مع محلات عرابي النجار
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* F. Footer CTA */}
          <footer className="w-full py-8 text-center border-t border-gray-100 bg-white/50">
            <p className="text-lg font-bold text-[#6D28D9] mb-2">نحن بانتظاركم لبناء مستقبل أفضل معاً</p>
            <p className="text-sm font-medium text-slate-400">جميع الحقوق محفوظة &copy; أكاديمية دقيش {new Date().getFullYear()}</p>
          </footer>
          
        </div>
      )}
      
    </div>
  );
}
