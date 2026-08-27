"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

export function ExportCodesClient({ codes }: { codes: any[] }) {
  const handleExport = () => {
    // Transform the codes data for Excel
    const data = codes.map((code) => ({
      "الرمز": code.code,
      "المادة": code.subject?.title || "غير محدد",
      "النوع": code.accessType === "YEARLY" ? "سنوي" : "شهري",
      "الشهور": code.validMonths && code.validMonths.length > 0 ? code.validMonths.join(", ") : "كل الشهور",
      "الحالة": code.isUsed ? "مستخدم" : "غير مستخدم",
      "تاريخ الصلاحية (من)": code.startDate ? new Date(code.startDate).toLocaleDateString("ar-DZ") : "-",
      "تاريخ الصلاحية (إلى)": code.endDate ? new Date(code.endDate).toLocaleDateString("ar-DZ") : "-",
      "تاريخ الإنشاء": code.createdAt ? new Date(code.createdAt).toLocaleDateString("ar-DZ") : "-",
    }));

    // Create a new workbook and add the worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) {
        worksheet['!views'] = [];
    }
    worksheet['!views'].push({ rightToLeft: true });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "رموز الدخول");

    // Export the file
    XLSX.writeFile(workbook, `Access_Codes_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
    >
      <Download className="w-4 h-4" />
      تصدير إلى Excel
    </button>
  );
}
