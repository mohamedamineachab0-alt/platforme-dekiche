"use client";

import { HeroBanner } from "@/components/shared/HeroBanner";
import { Activity } from "lucide-react";

export default function ParentProgressPage() {
  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      <HeroBanner
        title="تقدم أبنائي"
        description="هنا يمكنك متابعة تقدم أبنائك عبر الرسوم البيانية ومؤشرات الأداء"
        icon={Activity}
        gradientClass="bg-gradient-to-r from-amber-400 to-amber-500"
      />
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="w-16 h-16 text-sky-500 mb-4 mx-auto" />
          <h3 className="text-xl font-black text-slate-800 mb-2">مخططات التقدم متاحة الآن</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">ستعرض هذه المساحة تحليلاً بيانياً شاملاً يتيح لك متابعة وتقييم الأداء الأكاديمي لأبنائك بدقة متناهية.</p>
        </div>
      </div>
    </div>
  );
}
