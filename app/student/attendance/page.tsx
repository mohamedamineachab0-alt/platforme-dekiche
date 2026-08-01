"use client";

export default function StudentAttendancePage() {
  const mockLogs = [
    { date: "15 أكتوبر 2026", type: "غياب", subject: "الرياضيات" },
    { date: "02 أكتوبر 2026", type: "تأخر (15 دقيقة)", subject: "الفيزياء" },
    { date: "18 سبتمبر 2026", type: "غياب", subject: "العلوم الطبيعية" },
  ];
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-extrabold text-[#6D28D9] mb-6 text-center">الحضور والغياب</h1>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead className="bg-[#6D28D9]/5">
            <tr className="border-b border-gray-100">
              <th className="p-4 font-bold text-[#6D28D9]">التاريخ</th>
              <th className="p-4 font-bold text-[#6D28D9]">النوع</th>
              <th className="p-4 font-bold text-[#6D28D9]">المادة</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, idx) => (
              <tr key={idx} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-semibold text-slate-700">{log.date}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${log.type.includes('تأخر') ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                    {log.type}
                  </span>
                </td>
                <td className="p-4 font-medium text-slate-500">{log.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
