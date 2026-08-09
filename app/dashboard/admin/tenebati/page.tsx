import { getAdminAlerts } from "@/actions/tenebati";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { BellRing, ShieldAlert, BookX, UserX } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TenebatiPage() {
  const { success, alerts, error } = await getAdminAlerts();

  if (!success) {
    if (error === "غير مصرح") redirect("/login");
    return (
      <div className="p-8 text-center">
        <p className="text-amber-500 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <HeroBanner 
        title="تنبيهاتي"
        description="نظام المراقبة الذكي للرصد الأكاديمي والأمني لحسابات التلاميذ"
        icon={BellRing}
        gradientClass="bg-gradient-to-r from-amber-600 to-amber-500"
      />

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">قائمة التنبيهات النشطة</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            يتم تحديث هذه القائمة تلقائيا بناء على نشاط التلاميذ
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {!alerts || alerts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 mx-auto flex items-center justify-center mb-4">
                <BellRing className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">لا توجد تنبيهات حاليا</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">جميع حسابات التلاميذ في وضع سليم وآمن</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col lg:flex-row gap-6">
                
                {/* Student Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-slate-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <span className="font-black text-lg">{alert.studentName.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg">{alert.studentName}</h3>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono mt-0.5">{alert.studentPhone}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1">معلومات الولي</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.parentName}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">{alert.parentPhone}</p>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex-[2] flex flex-wrap gap-3 items-start content-start">
                  {alert.flags.map((flag) => {
                    const FlagIcon = flag.type === "SECURITY" ? ShieldAlert : flag.type === "ACCOUNT" ? UserX : BookX;
                    return (
                      <div 
                        key={flag.id} 
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm ${flag.color}`}
                      >
                        <FlagIcon className="w-4 h-4 shrink-0" />
                        <span>{flag.message}</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
