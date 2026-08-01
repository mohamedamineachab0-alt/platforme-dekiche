import { Trophy, Medal, Crown } from "lucide-react";
import Image from "next/image";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "محمد الأمين", points: 2450, badge: "الأسطورة", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amin" },
  { rank: 2, name: "أحمد بن علي", points: 2300, badge: "بطل", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" },
  { rank: 3, name: "سارة عبد الله", points: 2150, badge: "محترف", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { rank: 4, name: "ياسين كريم", points: 1980, badge: "مجتهد", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yacine" },
  { rank: 5, name: "فاطمة الزهراء", points: 1850, badge: "مجتهد", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima" },
];

export default function StudentLeaderboardPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">الترتيب والنقاط</h2>
          <p className="text-slate-500">ترتيب الطلاب الأسبوعي حسب النقاط المكتسبة</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -ml-20 -mt-20 opacity-50 pointer-events-none" />
        
        <div className="relative z-10 overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-right border-separate border-spacing-y-4 min-w-[600px]">
            <thead>
              <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 px-6 w-20 text-center">الترتيب</th>
                <th className="pb-3 px-6">الطالب</th>
                <th className="pb-3 px-6 text-center">الشارة</th>
                <th className="pb-3 px-6 text-left">النقاط</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERBOARD.map((student) => (
                <tr key={student.rank} className={`group ${student.rank === 1 ? 'bg-[#6D28D9]/5 shadow-sm rounded-2xl border border-[#6D28D9]/10' : 'hover:bg-gray-50 bg-white border border-transparent hover:border-gray-100'} transition-all`}>
                  <td className="px-6 py-4 rounded-r-2xl align-middle">
                    <div className="flex justify-center items-center font-extrabold text-xl">
                      {student.rank === 1 ? <Crown className="w-8 h-8 text-yellow-500 drop-shadow-md" /> : 
                       student.rank === 2 ? <Medal className="w-7 h-7 text-gray-400" /> : 
                       student.rank === 3 ? <Medal className="w-7 h-7 text-amber-700" /> : 
                       <span className="text-slate-400 w-7 h-7 flex items-center justify-center">{student.rank}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0 relative">
                        <Image src={student.avatar} alt={student.name} fill className="object-cover" />
                      </div>
                      <span className={`text-lg font-bold ${student.rank === 1 ? 'text-[#6D28D9]' : 'text-slate-700 group-hover:text-slate-900 transition-colors'}`}>
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <span className={`text-xs font-extrabold px-4 py-2 rounded-xl border shadow-sm ${
                      student.rank === 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      'bg-white text-slate-600 border-gray-200'
                    }`}>
                      {student.badge}
                    </span>
                  </td>
                  <td className="px-6 py-4 rounded-l-2xl text-left align-middle">
                    <div className="inline-flex items-center gap-1.5 font-black text-xl text-orange-500 bg-orange-50 px-5 py-2.5 rounded-2xl shadow-sm border border-orange-100">
                      {student.points} <span className="text-xs font-bold text-orange-400">نقطة</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
