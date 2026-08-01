"use client";

export default function GuardianAttendancePage() {
  const mockLogs = [
    { date: "15 أكتوبر 2026", type: "غياب", subject: "الرياضيات", justified: false },
    { date: "02 أكتوبر 2026", type: "تأخر (15 دقيقة)", subject: "الفيزياء", justified: true },
    { date: "18 سبتمبر 2026", type: "غياب", subject: "العلوم الطبيعية", justified: true },
  ];
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-extrabold text-[#6D28D9] mb-6 text-center">الحضور والغياب</h1>
      <div className="overflow-x-auto">
        <table className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100">
          <thead className="bg-[#6D28D9]/10">
            <tr className="border-b border-gray-100 text-gray-400 font-bold text-sm">
              <th className="p-4 text-right">التاريخ</th>
              <th className="p-4 text-right">النوع</th>
              <th className="p-4 text-right">المادة</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, idx) => (
              <tr key={idx} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-sm font-bold text-slate-700">{log.date}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${log.type.includes('تأخر') ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                    {log.type}
                  </span>
                </td>
                <td className="p-4 text-sm font-semibold text-gray-600">{log.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
