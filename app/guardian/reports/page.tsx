"use client";

export default function GuardianReportsPage() {
  const mockResults = [
    { id: 1, subject: "رياضيات", score: 18, evaluation: "ممتاز" },
    { id: 2, subject: "فيزياء", score: 16, evaluation: "جيد جداً" },
    { id: 3, subject: "لغة عربية", score: 14, evaluation: "جيد" },
    { id: 4, subject: "كيمياء", score: 12, evaluation: "مقبول" },
  ];
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-extrabold text-[#6D28D9] mb-6 text-center">النتائج والتقارير</h1>
      <div className="overflow-x-auto">
        <table className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100">
          <thead className="bg-[#6D28D9]/10">
            <tr>
              <th className="p-4 text-right font-medium text-[#6D28D9]">المادة</th>
              <th className="p-4 text-right font-medium text-[#6D28D9]">الدرجة (من 20)</th>
              <th className="p-4 text-right font-medium text-[#6D28D9]">التقييم</th>
            </tr>
          </thead>
          <tbody>
            {mockResults.map(item => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="p-4 text-right">{item.subject}</td>
                <td className="p-4 text-right font-bold text-[#6D28D9]">{item.score}</td>
                <td className="p-4 text-right">{item.evaluation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
