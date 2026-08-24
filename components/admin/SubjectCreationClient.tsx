"use client";

import { useState } from "react";
import { BookOpen, Plus, Loader2, Image as ImageIcon } from "lucide-react";
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
    <div className="space-y-8 font-arabic relative" dir="rtl">
      {/* Neo-Brutalism Graph Paper Background */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-30 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9333ea 1px, transparent 1px),
            linear-gradient(to bottom, #9333ea 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>

      {/* Live Preview Card */}
      <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        <div className="aspect-video w-full relative bg-purple-100 border-b-2 border-black flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-12 h-12 text-black" />
          )}
          <div className="absolute top-4 left-4 bg-black px-3 py-1 text-xs font-black text-white shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] uppercase">
            معاينة حية
          </div>
          <div className="absolute top-4 right-4 bg-white border-black border-2 px-3 py-1 text-xs font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {isFree ? "مجانا" : `${price} دج`}
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col bg-white">
          <h3 className="font-black text-black text-2xl line-clamp-1">{title || "عنوان المادة"}</h3>
          <p className="font-bold text-slate-700 mt-2 line-clamp-2 leading-relaxed bg-yellow-50 p-2 border-black border-2">
            {description || "وصف المادة يظهر هنا"}
          </p>
          
          <div className="mt-6 pt-4 flex items-center justify-between border-t-2 border-black">
            <span className="text-sm font-black text-black bg-purple-200 border-black border-2 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {selectedTeacherName}
            </span>
            <span className="text-sm font-black text-black bg-emerald-200 border-black border-2 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {accessType === "YEARLY" ? "سنوي" : "شهري"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <h2 className="text-2xl font-black text-black mb-8 inline-block bg-purple-200 px-4 py-2 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          إضافة مادة جديدة
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-wider">عنوان المادة</label>
            <input 
              type="text" 
              name="title" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white" 
              placeholder="الرياضيات المتقدمة" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-wider">الوصف</label>
            <textarea 
              name="description" 
              required 
              rows={3} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow resize-none bg-white" 
              placeholder="وصف المادة"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-wider">صورة الغلاف (1920x1080)</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*"
              onChange={handleImageChange} 
              className="w-full p-3 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white file:mr-4 file:py-2 file:px-4 file:border-black file:border-2 file:text-sm file:font-black file:bg-purple-200 file:text-black hover:file:bg-purple-300 file:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer" 
            />
          </div>

          <div className="space-y-4 p-6 border-black border-2 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-sm font-black text-black uppercase tracking-wider">الأستاذ</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setTeacherInputMethod("LIST")}
                  className={`px-4 py-2 text-sm font-black border-black border-2 transition-transform hover:-translate-y-0.5 ${teacherInputMethod === "LIST" ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100"}`}
                >
                  من القائمة
                </button>
                <button 
                  type="button" 
                  onClick={() => setTeacherInputMethod("MANUAL")}
                  className={`px-4 py-2 text-sm font-black border-black border-2 transition-transform hover:-translate-y-0.5 ${teacherInputMethod === "MANUAL" ? "bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100"}`}
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
                className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white appearance-none"
              >
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
                className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white" 
                placeholder="أدخل اسم الأستاذ" 
              />
            )}
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-black text-black uppercase tracking-wider bg-yellow-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
                المستويات الدراسية
              </label>
              <NeoMultiSelect
                name="levels"
                options={levelOptions}
                selectedValues={selectedLevels}
                onChange={setSelectedLevels}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-black uppercase tracking-wider bg-yellow-200 px-2 py-1 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
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

          <div className="space-y-6 pt-6 border-t-2 border-black">
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div className="relative flex items-center justify-center w-6 h-6 border-black border-2 bg-white group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                <input 
                  type="checkbox" 
                  checked={isFree} 
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="absolute opacity-0 cursor-pointer w-full h-full" 
                />
                {isFree && <div className="w-3 h-3 bg-purple-600" />}
              </div>
              <span className="text-sm font-black text-black uppercase">نشر المادة على أنها مجانية</span>
            </label>

            {!isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-black border-2 bg-purple-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase tracking-wider">السعر (دج)</label>
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase tracking-wider">نوع الوصول</label>
                  <select 
                    name="accessType" 
                    required 
                    value={accessType} 
                    onChange={e => setAccessType(e.target.value)} 
                    className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] transition-shadow bg-white appearance-none"
                  >
                    <option value="MONTHLY">شهري</option>
                    <option value="YEARLY">سنوي</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={pending} 
            className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-black text-xl py-5 border-black border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all uppercase mt-8"
          >
            {pending ? <Loader2 className="w-6 h-6 animate-spin" /> : <BookOpen className="w-6 h-6" />}
            {pending ? "جاري النشر..." : "نشر المادة"}
          </button>
        </form>
      </div>
    </div>
  );
}
