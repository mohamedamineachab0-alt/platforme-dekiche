"use client";

import React from "react";

interface MonthSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  // Add any specific props if needed
}

export function MonthSelect({ className, ...props }: MonthSelectProps) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none font-ibm-plex-sans-arabic ${className || ""}`}
    >
      <option value="">اختر الشهر..</option>
      {[...Array(12)].map((_, i) => {
        const monthNum = i + 1;
        const formatted = monthNum.toString().padStart(2, '0');
        return (
          <option key={monthNum} value={monthNum}>
            الشهر {formatted}
          </option>
        );
      })}
    </select>
  );
}
