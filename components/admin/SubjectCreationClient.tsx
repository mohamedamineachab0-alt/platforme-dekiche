"use client";

import { useState } from "react";
import { BookOpen, Plus, Loader2, Image as ImageIcon, Settings, User } from "lucide-react";
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
    <div className="font-arabic space-y-6" dir="rtl">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">إدارة المواد التعليمية</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">قم بإضافة وتعديل المواد التعليمية بشكل مرن وبسيط</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <BookOpen className="w-5 h-5 text-sky-500" />
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-700" 
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none text-slate-700" 
                  placeholder="وصف المادة"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">صورة الغلاف (1920x1080)</label>
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*"
                  onChange={handleImageChange} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 cursor-pointer text-slate-600" 
                />
              </div>

              <div className="space-y-4 p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    الأستاذ
                  </label>
                  <div className="flex bg-white p-1 rounded-lg border border-slate-200 w-fit">
                    <button 
                      type="button" 
                      onClick={() => setTeacherInputMethod("LIST")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${teacherInputMethod === "LIST" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      من القائمة
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTeacherInputMethod("MANUAL")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${teacherInputMethod === "MANUAL" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none text-slate-700"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-700" 
                    placeholder="أدخل اسم الأستاذ" 
                  />
                )}
              </div>

              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500">
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
                  <label className="text-xs font-bold text-slate-500">
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

              <div className="space-y-5 pt-6 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 bg-white group-hover:border-sky-400 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isFree} 
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="absolute opacity-0 cursor-pointer w-full h-full z-10" 
                    />
                    {isFree && <div className="w-full h-full bg-sky-500 flex items-center justify-center rounded-[3px]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>  
                    </div>}
                  </div>
                  <span className="text-sm font-bold text-slate-700">نشر المادة على أنها مجانية</span>
                </label>

                {!isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">السعر (دج)</label>
                      <input 
                        type="number" 
                        name="price" 
                        required 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">نوع الوصول</label>
                      <select 
                        name="accessType" 
                        required 
                        value={accessType} 
                        onChange={e => setAccessType(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none text-slate-700"
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
                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold text-sm py-4 rounded-xl transition-colors mt-6"
              >
                {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {pending ? "جاري النشر..." : "نشر المادة"}
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            
            <div className="aspect-video w-full bg-slate-100 flex items-center justify-center relative">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-300" />
              )}
              
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 text-xs font-bold rounded-lg shadow-sm border border-slate-100">
                معاينة
              </div>
              <div className="absolute top-3 left-3 bg-sky-500 text-white px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                {isFree ? "مجاناً" : `${price} دج`}
              </div>
            </div>

            <div className="p-5 flex flex-col">
              <h3 className="font-black text-slate-800 text-lg line-clamp-1 mb-2">{title || "عنوان المادة"}</h3>
              <p className="font-bold text-slate-500 text-sm line-clamp-2 leading-relaxed">
                {description || "وصف المادة يظهر هنا"}
              </p>
              
              <div className="mt-6 pt-4 flex items-center gap-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  {selectedTeacherName}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  {accessType === "YEARLY" ? "اشتراك سنوي" : "اشتراك شهري"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
