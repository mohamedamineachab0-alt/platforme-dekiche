"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { STREAMS, LEVELS } from "@/lib/constants";

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
  const [level, setLevel] = useState("FIRST_YEAR");
  const [stream, setStream] = useState("SCIENCE");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("2500");
  const [accessType, setAccessType] = useState("MONTHLY");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState(false);

  const selectedTeacherName = teacherInputMethod === "LIST" 
    ? (teachers.find(t => t.id === teacherId)?.name || "بدون أستاذ") 
    : (manualTeacherName || "بدون أستاذ");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    if (isFree) {
      formData.set("price", "0");
    }
    await action(formData);
    setPending(false);
    // Reset
    setTitle("");
    setDescription("");
    setTeacherId("");
    setManualTeacherName("");
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

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="h-48 w-full relative bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          )}
          <div className="absolute top-2 left-2 bg-slate-900/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
            معاينة حية
          </div>
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-400 shadow-sm">
            {isFree ? "مجانا" : `${price} دج`}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-black text-slate-900 dark:text-white line-clamp-1">{title || "عنوان المادة"}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{description || "وصف المادة يظهر هنا"}</p>
          
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
              {selectedTeacherName}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
              {accessType === "YEARLY" ? "سنوي" : "شهري"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-sky-600" />
          إضافة مادة جديدة
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">عنوان المادة</label>
            <input type="text" name="title" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="الرياضيات المتقدمة" />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">الوصف</label>
            <textarea name="description" required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="وصف المادة"></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">صورة الغلاف (1080x1080)</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*"
              onChange={handleImageChange} 
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 dark:file:bg-slate-950/30 hover:file:bg-sky-100 transition-all cursor-pointer" 
            />
          </div>

          <div className="space-y-1 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">الأستاذ</label>
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  type="button" 
                  onClick={() => setTeacherInputMethod("LIST")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${teacherInputMethod === "LIST" ? "bg-white dark:bg-slate-950 text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  من القائمة
                </button>
                <button 
                  type="button" 
                  onClick={() => setTeacherInputMethod("MANUAL")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${teacherInputMethod === "MANUAL" ? "bg-white dark:bg-slate-950 text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  إدخال يدوي
                </button>
              </div>
            </div>
            
            {teacherInputMethod === "LIST" ? (
              <select name="teacherId" value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">بدون أستاذ</option>
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
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
                placeholder="أدخل اسم الأستاذ" 
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">المستوى</label>
              <select name="level" required value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label.replace(/\./g, '')}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">الشعبة</label>
              <select name="stream" required value={stream} onChange={e => setStream(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {STREAMS.map(s => <option key={s.value} value={s.value}>{s.label.replace(/\./g, '')}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isFree} 
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950 focus:ring-sky-500" 
              />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">نشر المادة على أنها مجانا</span>
            </label>

            {!isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">السعر</label>
                  <input type="number" name="price" required value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">نوع الوصول</label>
                  <select name="accessType" required value={accessType} onChange={e => setAccessType(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="MONTHLY">شهري</option>
                    <option value="YEARLY">سنوي</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={pending} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            {pending ? "جاري النشر" : "نشر المادة"}
          </button>
        </form>
      </div>
    </div>
  );
}
