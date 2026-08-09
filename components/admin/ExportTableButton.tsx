"use client";

import { Download } from "lucide-react";
import html2canvas from "html2canvas";

export function ExportTableButton({ targetId }: { targetId: string }) {
  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `revenues_${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed", error);
      alert("حدث خطأ أثناء تصدير الجدول كصورة");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
    >
      <Download className="w-4 h-4" />
      تصدير كصورة
    </button>
  );
}
