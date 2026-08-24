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
    <div className="space-y-8 font-arabic relative bg-slate-50 min-h-screen p-4 md:p-8 rounded-3xl" dir="rtl">
      {/* Header */}
      <div className="bg-orange-300/80 rounded-t-3xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">إدارة المواد التعليمية</h1>
        <p className="text-sm font-medium text-slate-800 mt-2 opacity-90">قم بإضافة وتعديل المواد التعليمية بشكل مرن وبسيط</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 md:px-0 mt-[-24px]">
        {/* Live Preview Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col sticky top-6">
            
            <div className="flex items-center justify-between mb-4">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 text-xs font-bold rounded-full">
                معاينة حية
              </span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 text-xs font-bold rounded-full">
                {isFree ? "مجاناً" : `${price} دج`}
              </span>
            </div>

            <div className="aspect-video w-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden relative mb-5">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-300" />
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-2">{title || "عنوان المادة"}</h3>
              <p className="font-medium text-slate-500 text-sm line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {description || "وصف المادة يظهر هنا"}
              </p>
              
              <div className="mt-5 pt-4 flex items-center gap-2 border-t border-slate-100">
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
                  {selectedTeacherName}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                  {accessType === "YEARLY" ? "اشتراك سنوي" : "اشتراك شهري"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              تفاصيل المادة
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">عنوان المادة</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full p-4 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow border-none" 
                  placeholder="الرياضيات المتقدمة" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">الوصف</label>
                <textarea 
                  name="description" 
                  required 
                  rows={3} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full p-4 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow resize-none border-none" 
                  placeholder="وصف المادة"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">صورة الغلاف (1920x1080)</label>
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*"
                  onChange={handleImageChange} 
                  className="w-full p-3 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow border-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-none file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" 
                />
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="text-sm font-semibold text-slate-700">الأستاذ</label>
                  <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
                    <button 
                      type="button" 
                      onClick={() => setTeacherInputMethod("LIST")}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${teacherInputMethod === "LIST" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      من القائمة
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTeacherInputMethod("MANUAL")}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${teacherInputMethod === "MANUAL" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
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
                    className="w-full p-4 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow border-none appearance-none"
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
                    className="w-full p-4 rounded-xl bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow border-none" 
                    placeholder="أدخل اسم الأستاذ" 
                  />
                )}
              </div>

              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full inline-block">
                    المستويات الدراسية
                  </label>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <NeoMultiSelect
                      name="levels"
                      options={levelOptions}
                      selectedValues={selectedLevels}
                      onChange={setSelectedLevels}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full inline-block">
                    الشعب
                  </label>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <NeoMultiSelect
                      name="streams"
                      options={streamOptions}
                      selectedValues={selectedStreams}
                      onChange={setSelectedStreams}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5 pt-6 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-md border-2 border-slate-300 bg-white group-hover:border-blue-400 transition-colors overflow-hidden">
                    <input 
                      type="checkbox" 
                      checked={isFree} 
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="absolute opacity-0 cursor-pointer w-full h-full z-10" 
                    />
                    {isFree && <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>  
                    </div>}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">نشر المادة على أنها مجانية</span>
                </label>

                {!isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">السعر (دج)</label>
                      <input 
                        type="number" 
                        name="price" 
                        required 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full p-4 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow border-none shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">نوع الوصول</label>
                      <select 
                        name="accessType" 
                        required 
                        value={accessType} 
                        onChange={e => setAccessType(e.target.value)} 
                        className="w-full p-4 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow border-none shadow-sm appearance-none"
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
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-base py-4 rounded-xl transition-colors mt-6"
              >
                {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                {pending ? "جاري النشر..." : "نشر المادة"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
