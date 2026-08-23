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
          <Activity className="w-16 h-16 text-slate-200 mb-4 mx-auto" />
          <h3 className="text-xl font-black text-slate-800 mb-2">لوحة المؤشرات قيد التطوير</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">سيتم قريباً توفير مخططات بيانية وتحليلية مفصلة لمتابعة الأداء الأكاديمي بدقة.</p>
        </div>
      </div>
    </div>
  );
}
