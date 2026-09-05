"use client";

import { Trash2 } from "lucide-react";

export function DeleteForumButton() {
  return (
    <button 
      type="submit" 
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
      title="حذف المنتدى"
      onClick={(e) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتدى وجميع الرسائل التي فيه؟ لا يمكن التراجع عن هذا الإجراء.')) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
