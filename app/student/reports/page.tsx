"use client";

export default function StudentReportsPage() {
  const mockResults = [
    { id: 1, subject: "رياضيات", score: 18, evaluation: "ممتاز" },
    { id: 2, subject: "فيزياء", score: 16, evaluation: "جيد جداً" },
    { id: 3, subject: "لغة عربية", score: 14, evaluation: "جيد" },
    { id: 4, subject: "كيمياء", score: 12, evaluation: "مقبول" },
  ];
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-extrabold text-[#6D28D9] mb-6 text-center">النتائج والتقارير</h1>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead className="bg-[#6D28D9]/5">
            <tr className="border-b border-gray-100">
              <th className="p-4 font-bold text-[#6D28D9]">المادة</th>
              <th className="p-4 font-bold text-[#6D28D9]">الدرجة (من 20)</th>
              <th className="p-4 font-bold text-[#6D28D9]">التقييم</th>
            </tr>
          </thead>
          <tbody>
            {mockResults.map(item => (
              <tr key={item.id} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-semibold text-slate-700">{item.subject}</td>
                <td className="p-4 font-extrabold text-[#6D28D9]">{item.score}</td>
                <td className="p-4">
                  <span className="bg-[#6D28D9]/10 text-[#6D28D9] px-3 py-1 rounded-lg text-sm font-bold">
                    {item.evaluation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
