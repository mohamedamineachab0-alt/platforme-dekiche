"use client";

import { useState, useMemo } from "react";
import { Search, User, Phone, CheckCircle2, XCircle, MoreVertical, Edit2, Link as LinkIcon, Trash2, Filter, ChevronDown, GraduationCap, MapPin, Users } from "lucide-react";
import { STREAMS, LEVELS } from "@/lib/constants";

type StudentData = {
  id: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  studentProfile: {
    stream: string;
    level: string;
    wilaya: string;
  } | null;
  parent: {
    id: string;
    fullName: string;
    phoneNumber: string;
  } | null;
};

export default function StudentsTableClient({
  initialStudents,
  totalStudentsCount,
  totalParentsCount
}: {
  initialStudents: StudentData[];
  totalStudentsCount?: number;
  totalParentsCount?: number;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterStream, setFilterStream] = useState<string>("ALL");
  const [filterLinkStatus, setFilterLinkStatus] = useState<"ALL" | "LINKED" | "UNLINKED">("ALL");

  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      // 1. Search Term (Name or Phone)
      const lowerTerm = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm || 
        student.fullName.toLowerCase().includes(lowerTerm) || 
        student.phoneNumber.includes(lowerTerm) ||
        (student.parent && student.parent.fullName.toLowerCase().includes(lowerTerm));

      // 2. Level Filter
      const matchesLevel = filterLevel === "ALL" || student.studentProfile?.level === filterLevel;

      // 3. Stream Filter
      const matchesStream = filterStream === "ALL" || student.studentProfile?.stream === filterStream;

      // 4. Link Status Filter
      const isLinked = !!student.parent;
      const matchesLinkStatus = 
        filterLinkStatus === "ALL" || 
        (filterLinkStatus === "LINKED" && isLinked) || 
        (filterLinkStatus === "UNLINKED" && !isLinked);

      return matchesSearch && matchesLevel && matchesStream && matchesLinkStatus;
    });
  }, [searchTerm, filterLevel, filterStream, filterLinkStatus, initialStudents]);

  const getStreamLabel = (streamValue?: string) => {
    if (!streamValue) return "غير محدد";
    return STREAMS.find(s => s.value === streamValue)?.label || streamValue;
  };

  const getLevelLabel = (levelValue?: string) => {
    if (!levelValue) return "غير محدد";
    return LEVELS.find(l => l.value === levelValue)?.label || levelValue;
  };

  return (
    <div className="space-y-6">
      
      {/* Advanced Filters Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex flex-col gap-5">
          
          {/* Top Row: Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="block w-full pl-4 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all font-medium"
                placeholder="ابحث باسم التلميذ، الولي، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {/* True DB Counts */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap">
                <Users className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">إجمالي الأولياء:</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{totalParentsCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap">
                <Users className="w-5 h-5 text-sky-500" />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">إجمالي التلاميذ:</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{totalStudentsCount ?? initialStudents.length}</span>
              </div>

              {/* Filtered Link Stats */}
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 whitespace-nowrap">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">مربوط:</span>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                  {filteredStudents.filter(s => !!s.parent).length}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-500/20 whitespace-nowrap">
                <XCircle className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">غير مربوط:</span>
                <span className="text-lg font-black text-amber-800 dark:text-amber-300">
                  {filteredStudents.filter(s => !s.parent).length}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Dropdown Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            
            {/* Level Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                المستوى الدراسي
              </label>
              <div className="relative">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="ALL">جميع المستويات</option>
                  {LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Stream Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                الشعبة
              </label>
              <div className="relative">
                <select
                  value={filterStream}
                  onChange={(e) => setFilterStream(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="ALL">جميع الشعب</option>
                  {STREAMS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Link Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                حالة ربط الولي
              </label>
              <div className="relative">
                <select
                  value={filterLinkStatus}
                  onChange={(e) => setFilterLinkStatus(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="ALL">الكل</option>
                  <option value="LINKED">مربوطون بحساب الولي</option>
                  <option value="UNLINKED">غير مربوطين بحساب الولي</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">معلومات التلميذ</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">المستوى والشعبة</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">حالة الولي</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-bold text-lg text-slate-700 dark:text-slate-300">لا يوجد نتائج</p>
                    <p className="text-sm mt-1">لم يتم العثور على تلاميذ يطابقون معايير البحث والفرز.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    
                    {/* Student Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-base text-slate-900 dark:text-white">{student.fullName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              ID: {student.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{student.phoneNumber}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Academic Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="inline-flex items-center w-fit px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                          {getLevelLabel(student.studentProfile?.level)}
                        </div>
                        <div className="inline-flex items-center w-fit px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {getStreamLabel(student.studentProfile?.stream)}
                        </div>
                      </div>
                    </td>

                    {/* Parent Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.parent ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="inline-flex items-center w-fit gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-sm font-bold shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            مربوط: {student.parent.fullName}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mr-2">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{student.parent.phoneNumber}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-bold shadow-sm">
                          <XCircle className="w-4 h-4" />
                          لم يتم الربط بحساب الولي
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 dark:hover:border-sky-800 dark:hover:bg-sky-900/30 rounded-xl transition-all shadow-sm hover:shadow" title="تعديل حساب التلميذ">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/30 rounded-xl transition-all shadow-sm hover:shadow" title="ربط بحساب ولي">
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-800 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm hover:shadow" title="حذف الحساب">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
