import { getAdminSubscriptionRequests } from "@/actions/subscription";
import { getAvailableSubjects } from "@/actions/subscription";
import { SubscriptionRequestsList } from "@/components/admin/SubscriptionRequestsList";
import { CreditCard, AlertCircle } from "lucide-react";

export const metadata = {
  title: "طلبات الاشتراك | منصة دقيش",
};

export default async function AdminSubscriptionRequestsPage() {
  const { requests, error } = await getAdminSubscriptionRequests();
  const subjectsData = await getAvailableSubjects();
  
  // Create a map of subject ID to subject title for easy lookup
  const subjectMap = subjectsData.reduce((acc, subject) => {
    acc[subject.id] = subject.title;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0 transform -rotate-6">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">طلبات الاشتراك</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">قم بمراجعة وتأكيد اشتراكات التلاميذ في المواد المختلفة</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex items-center gap-3 font-bold">
          <AlertCircle className="w-6 h-6" />
          {error}
        </div>
      ) : (
        <SubscriptionRequestsList 
          initialRequests={requests || []} 
          subjectMap={subjectMap} 
        />
      )}
    </div>
  );
}
