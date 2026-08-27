import { prisma } from "@/lib/prisma";
import { Key, Plus, Hash, Copy } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { CodeGeneratorClient } from "@/components/admin/CodeGeneratorClient";
import { ExportCodesClient } from "@/components/admin/ExportCodesClient";

export default async function AdminCodesPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true, user: true },
    take: 50, // Display last 50 codes for performance
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="رموز الدخول"
        description="توليد وتتبع الأكواد الخاصة بتفعيل المواد للطلاب"
        icon={Key}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generator Form */}
        <div className="lg:col-span-1">
          <CodeGeneratorClient subjects={subjects} />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Hash className="w-5 h-5 text-sky-500" />
              قائمة الرموز المولدة
            </h2>
            <ExportCodesClient codes={codes} />
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">الرمز</th>
                  <th className="px-6 py-4 font-bold">المادة</th>
                  <th className="px-6 py-4 font-bold">النوع</th>
                  <th className="px-6 py-4 font-bold">الشهور</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map(code => (
                  <tr key={code.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit">
                        {code.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{code.subject.title}</td>
                    <td className="px-6 py-4 text-slate-500">{code.accessType === "YEARLY" ? "سنوي" : "شهري"}</td>
                    <td className="px-6 py-4 text-slate-500 dir-ltr">{code.validMonths.join(", ") || "-"}</td>
                    <td className="px-6 py-4">
                      {code.isUsed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700">
                          مستخدم ({code.user?.fullName})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700">
                          غير مستخدم
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      لا توجد رموز دخول مولدة بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
