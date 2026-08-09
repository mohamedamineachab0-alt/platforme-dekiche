import { Video, CheckCircle, Map, AlertTriangle, BellRing, Trophy } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "دروس مرئية عميقة ومفصلة",
      desc: "في جميع المواد العلمية والأدبية والتقنية مع إمكانية متابعة نسبة الإنجاز والدروس غير المشاهدة",
      icon: Video,
      color: "bg-sky-600 text-white shadow-sky-200 dark:shadow-sky-900/20 border-sky-500",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "تمارين يومية واختبارات تفاعلية",
      desc: "وكويزات ذكية مدعومة بنظام التصحيح الفوري والتقييم الدقيق للمستوى",
      icon: CheckCircle,
      color: "bg-sky-600 text-white shadow-sky-200 dark:shadow-sky-900/20 border-sky-500",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "خرائط ذهنية بصرية ومنظمة",
      desc: "لتفكيك الدروس الصعبة وقوانين الرياضيات والفيزياء والعلوم لتسهيل الحفظ السريع",
      icon: Map,
      color: "bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/20 border-blue-500",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "بنك الأخطاء الشخصي",
      desc: "يتتبع أخطاء التلميذ في التمارين والكويزات ويوجه لمراجعتها بدقة لعدم تكرارها",
      icon: AlertTriangle,
      color: "bg-amber-600 text-white shadow-amber-200 dark:shadow-amber-900/20 border-amber-500",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "نظام تنبيهاتي الذكي",
      desc: "لمراقبة جاهزية الحساب والتنبيه عند وجود نقص في المتابعة أو غياب ربط الحساب بولي الأمر",
      icon: BellRing,
      color: "bg-sky-500 text-white shadow-sky-200 dark:shadow-sky-900/20 border-sky-400",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "لوحة شرف ومنافسة مع الأصدقاء",
      desc: "عبر مشاركة رمز المنافسة الخاص لرفع الحماس وتحقيق أعلى النقاط",
      icon: Trophy,
      color: "bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-900/20 border-amber-400",
      iconBg: "bg-white/20 text-white"
    }
  ];

  return (
    <section className="py-24 border-b border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            ميزات استثنائية مصممة خصيصا لتلاميذ الثانوي
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            منظومة متكاملة تضمن لك التفوق الساحق في الامتحانات الفصلية وشهادة البكالوريا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`group relative rounded-3xl p-8 border shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden ${feat.color}`}
              >
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feat.iconBg}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-xl font-black text-white mb-3">
                  {feat.title}
                </h3>
                <p className="relative z-10 text-white/90 font-bold leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
