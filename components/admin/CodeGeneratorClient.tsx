"use client";

import { useState } from "react";
import { Key, Plus, Copy, CheckCircle2 } from "lucide-react";
import { generateAccessCode } from "@/actions/subjects";

export function CodeGeneratorClient({ subjects }: { subjects: { id: string, title: string }[] }) {
  const [pending, setPending] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setGeneratedCodes([]);
    
    const formData = new FormData(e.currentTarget);
    const result = await generateAccessCode(formData);
    
    if (result.success && result.codes) {
      setGeneratedCodes(result.codes);
    }
    
    setPending(false);
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-sky-600" />
          توليد رموز جديدة
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">المادة التعليمية</label>
            <select name="subjectId" required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">اختر المادة</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">نوع الوصول</label>
            <select name="accessType" required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="MONTHLY">شهري (اختر الشهور)</option>
              <option value="YEARLY">سنوي (كامل المادة)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">الشهور الصالحة (للشهري فقط)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <label key={m} className="flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <input type="checkbox" name="validMonths" value={m} className="hidden peer" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 peer-checked:text-sky-700 dark:peer-checked:text-sky-400">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">عدد الرموز المراد توليدها</label>
            <input type="number" name="count" required defaultValue={1} min={1} max={100} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          <button disabled={pending} type="submit" className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
            <Plus className={`w-4 h-4 ${pending ? "animate-spin" : ""}`} />
            {pending ? "جاري التوليد" : "توليد الرموز"}
          </button>
        </form>
      </div>

      {generatedCodes.length > 0 && (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-black text-sky-800 dark:text-sky-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            تم التوليد بنجاح
          </h3>
          <div className="space-y-3">
            {generatedCodes.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-900 p-3 rounded-xl">
                <span className="font-mono font-bold text-slate-900 dark:text-white">{c.code}</span>
                <button 
                  onClick={() => handleCopy(c.code)}
                  className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  {copiedCode === c.code ? <CheckCircle2 className="w-5 h-5 text-sky-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
