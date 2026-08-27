"use client";

import { useState } from "react";
import { BookOpen, Plus, Loader2, Image as ImageIcon, User, Layers, Tag, Check } from "lucide-react";
import { STREAMS, LEVELS } from "@/lib/constants";
import { NeoMultiSelect } from "@/components/shared/NeoMultiSelect";

export function SubjectCreationClient({ 
  teachers,
  action
}: {
  teachers: { id: string; name: string }[];
  action: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [manualTeacherName, setManualTeacherName] = useState("");
  const [teacherInputMethod, setTeacherInputMethod] = useState<"LIST" | "MANUAL">("LIST");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("2500");
  const [accessType, setAccessType] = useState("MONTHLY");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    if (isFree) {
      formData.set("price", "0");
    }
    await action(formData);
    setPending(false);
    
    setTitle("");
    setDescription("");
    setTeacherId("");
    setManualTeacherName("");
    setSelectedLevels([]);
    setSelectedStreams([]);
    setImageFile(null);
    setImageUrl("");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const levelOptions = LEVELS.map(l => ({ value: l.value, label: l.label.replace(/\./g, '') }));
  const streamOptions = STREAMS.map(s => ({ value: s.value, label: s.label.replace(/\./g, '') }));

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 font-arabic" dir="rtl">
      <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <div className="bg-orange-50/50 text-orange-500 p-2.5 rounded-2xl border border-orange-100/50">
          <BookOpen className="w-5 h-5" />
        </div>
        تفاصيل المادة
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">عنوان المادة</label>
          <input 
            type="text" 
            name="title" 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-700 placeholder:text-slate-400" 
            placeholder="الرياضيات المتقدمة" 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">الوصف</label>
          <textarea 
            name="description" 
            required 
            rows={3} 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all resize-none text-slate-700 placeholder:text-slate-400" 
            placeholder="وصف المادة يوضح محتواها والهدف منها..."
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">صورة الغلاف (1920x1080)</label>
          <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer">
            <input 
              type="file" 
              name="image" 
              accept="image/*"
              onChange={handleImageChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            {imageUrl ? (
              <div className="relative aspect-[21/9] w-full">
                <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">تغيير الصورة</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="bg-sky-50 text-sky-500 p-4 rounded-full mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-600 mb-1">اضغط هنا أو قم بسحب الصورة</span>
                <span className="text-xs font-bold text-slate-400">JPG, PNG, WEBP (الحد الأقصى 2MB)</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <div className="bg-indigo-50 text-indigo-500 p-1.5 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              الأستاذ
            </label>
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
              <button 
                type="button" 
                onClick={() => setTeacherInputMethod("LIST")}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${teacherInputMethod === "LIST" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                من القائمة
              </button>
              <button 
                type="button" 
                onClick={() => setTeacherInputMethod("MANUAL")}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${teacherInputMethod === "MANUAL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                إدخال يدوي
              </button>
            </div>
          </div>
          
          {teacherInputMethod === "LIST" ? (
            <select 
              name="teacherId" 
              value={teacherId} 
              onChange={e => setTeacherId(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all appearance-none text-slate-700"
            >
              <option value="">-- اختر الأستاذ --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              name="manualTeacherName" 
              value={manualTeacherName} 
              onChange={e => setManualTeacherName(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-700" 
              placeholder="اسم الأستاذ الكامل" 
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2 mb-2">
              <div className="bg-emerald-50 text-emerald-500 p-1 rounded-md">
                <Layers className="w-3.5 h-3.5" />
              </div>
              المستويات الدراسية
            </label>
            <NeoMultiSelect
              name="levels"
              options={levelOptions}
              selectedValues={selectedLevels}
              onChange={setSelectedLevels}
            />
          </div>

          <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2 mb-2">
              <div className="bg-purple-50 text-purple-500 p-1 rounded-md">
                <Tag className="w-3.5 h-3.5" />
              </div>
              الشعب
            </label>
            <NeoMultiSelect
              name="streams"
              options={streamOptions}
              selectedValues={selectedStreams}
              onChange={setSelectedStreams}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] space-y-6">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="relative flex items-center justify-center w-6 h-6 rounded-lg border-2 border-slate-200 bg-white group-hover:border-sky-400 transition-colors">
              <input 
                type="checkbox" 
                checked={isFree} 
                onChange={(e) => setIsFree(e.target.checked)}
                className="absolute opacity-0 cursor-pointer w-full h-full z-10" 
              />
              {isFree && <div className="absolute inset-0 bg-sky-500 flex items-center justify-center rounded-[6px]">
                <Check className="w-4 h-4 text-white" strokeWidth={4} />
              </div>}
            </div>
            <span className="text-sm font-bold text-slate-700">جعل المادة مجانية للجميع</span>
          </label>

          {!isFree && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">السعر (دج)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-full px-5 py-4 pl-14 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-slate-800 font-sans" 
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs bg-slate-200/50 px-2 py-1 rounded-md">DZD</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">مدة الاشتراك</label>
                <div className="relative">
                  <select 
                    name="accessType" 
                    required 
                    value={accessType} 
                    onChange={e => setAccessType(e.target.value)} 
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all appearance-none text-slate-800"
                  >
                    <option value="MONTHLY">شهري (30 يوم)</option>
                    <option value="YEARLY">سنوي (موسم كامل)</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={pending} 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 text-white font-bold text-sm py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5 transition-all mt-8"
        >
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {pending ? "جاري النشر..." : "نشر المادة وإضافتها"}
        </button>
      </form>
    </div>
  );
}
