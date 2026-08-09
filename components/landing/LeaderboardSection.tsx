import { Trophy, Medal, Users, Sparkles, ShieldCheck } from "lucide-react";

type TopStudent = {
  id: string;
  name: string;
  points: number;
};

export function LeaderboardSection({ 
  totalStudents, 
  totalParents,
  topStudents 
}: { 
  totalStudents: number, 
  totalParents: number,
  topStudents: TopStudent[] 
}) {
  return (
    <section className="py-24 border-b border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        
        {/* Dynamic Student and Parent Counts */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 px-8 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-slate-950/30 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-500 dark:text-slate-400 mb-1">الطلاب المسجلين بالمنصة</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span dir="ltr">{totalStudents.toLocaleString("en-US")}</span>
                <span className="text-lg text-sky-600 dark:text-sky-400">طالب وطالبة</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 px-8 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-500 dark:text-slate-400 mb-1">أولياء الأمور المتابعين</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span dir="ltr">{totalParents.toLocaleString("en-US")}</span>
                <span className="text-lg text-sky-600 dark:text-sky-400">ولي أمر</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4 text-sky-600 dark:text-sky-500 font-bold">
            <Sparkles className="w-5 h-5" />
            <span>نخبة المتفوقين</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            لوحة الشرف الوطنية
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            أفضل التلاميذ أداء ومثابرة على المنصة تصدر الترتيب واحفر اسمك مع النخبة
          </p>
        </div>

        {/* Leaderboard */}
        <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 md:p-6 shadow-xl">
          <div className="space-y-3">
            {topStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-bold">
                جاري حساب النقاط وتحديث الترتيب
              </div>
            ) : (
              topStudents.map((student, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                
                let rankStyle = "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                let icon = <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">{index + 1}</div>;

                if (isFirst) {
                  rankStyle = "bg-gradient-to-r from-sky-50 to-sky-50 dark:from-slate-900/20 dark:to-slate-950/20 border-sky-200 dark:border-sky-800/50 text-slate-950 dark:text-sky-100 transform scale-[1.02] shadow-md z-10 relative";
                  icon = <Trophy className="w-8 h-8 text-sky-500" />;
                } else if (isSecond) {
                  rankStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200";
                  icon = <Medal className="w-8 h-8 text-slate-400" />;
                } else if (isThird) {
                  rankStyle = "bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-900/30 text-sky-900 dark:text-sky-200";
                  icon = <Medal className="w-8 h-8 text-sky-500" />;
                }

                return (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${rankStyle}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 flex items-center justify-center w-10">
                        {icon}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${isFirst ? 'bg-sky-100 dark:bg-slate-950/50 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <h3 className="font-black text-lg">{student.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xl" dir="ltr">{student.points}</span>
                      <span className="text-xs font-bold opacity-70">نقطة</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
