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
        <p className="text-slate-600">(مخطط تقدّم placeholder)</p>
      </div>
    </div>
  );
}
