"use client";

import { useState, useMemo } from "react";
import { Search, User, Phone, CheckCircle2, XCircle, MoreVertical, Edit2, Link as LinkIcon, Trash2 } from "lucide-react";
import { STREAMS } from "@/lib/constants";

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
}: {
  initialStudents: StudentData[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return initialStudents;
    const lowerTerm = searchTerm.toLowerCase();
    
    return initialStudents.filter((student) => {
      const nameMatch = student.fullName.toLowerCase().includes(lowerTerm);
      
      const streamLabel = STREAMS.find(s => s.value === student.studentProfile?.stream)?.label || "";
      const streamMatch = streamLabel.toLowerCase().includes(lowerTerm);
      
      const phoneMatch = student.phoneNumber.includes(lowerTerm);

      return nameMatch || streamMatch || phoneMatch;
    });
  }, [searchTerm, initialStudents]);

  const getStreamLabel = (streamValue?: string) => {
    if (!streamValue) return "غير محدد";
    return STREAMS.find(s => s.value === streamValue)?.label || streamValue;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
      
      {/* Search Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full pl-3 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all sm:text-sm"
            placeholder="ابحث بالاسم، الشعبة، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          إجمالي التلاميذ: <span className="font-bold text-sky-600 dark:text-sky-400">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">اسم التلميذ</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">الشعبة</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">معلومات الاتصال</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">حالة الولي</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">لم يتم العثور على أي تلاميذ متطابقين.</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Student Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          ID: {student.id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Specialty / Branch */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {getStreamLabel(student.studentProfile?.stream)}
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium font-mono text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {student.phoneNumber}
                    </div>
                  </td>

                  {/* Parent Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.parent ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {student.parent.fullName}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        لم يتم الربط بحساب الولي
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors" title="تعديل">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="ربط بحساب ولي">
                        <LinkIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
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
  );
}
