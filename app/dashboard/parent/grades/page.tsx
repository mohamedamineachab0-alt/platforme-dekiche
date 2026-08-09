
import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";
import Link from "next/link";
import { Star, UserMinus, MessageSquare, Activity } from "lucide-react";

export default async function GradesPage() {
  const profile = await getUserSessionProfile();
  if (!profile) {
    return <div className="p-8 text-center">يرجى تسجيل الدخول</div>;
  }

  const linked = await prisma.parentStudentLink.findMany({
    where: { parentId: profile.id },
    select: { studentId: true },
  });

  if (linked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <p className="text-slate-600 mb-4">لم يتم ربط أي تلاميذ بحسابك.</p>
        <Link
          href="/dashboard/parent"
          className="px-6 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition"
        >
          ربط حسابات أبنائي
        </Link>
      </div>
    );
  }

  const studentIds = linked.map(l => l.studentId);
  const submissions = await prisma.studentSubmission.findMany({
    where: { studentId: { in: studentIds } },
    include: {
      student: { select: { fullName: true } },
      exam: {
        include: {
          subject: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 rounded-2xl text-white flex items-center gap-4">
        <Star className="w-6 h-6" />
        <h2 className="text-xl font-black">درجات أبنائي</h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">اسم التلميذ</th>
              <th className="px-4 py-3 text-right">المادة</th>
              <th className="px-4 py-3 text-right">الاختبار</th>
              <th className="px-4 py-3 text-right">النقطة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-medium">
                  لا توجد نقاط مسجلة حالياً
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-700">{s.student?.fullName || "غير متوفر"}</td>
                  <td className="px-4 py-3">{s.exam?.subject?.title || "غير متوفر"}</td>
                  <td className="px-4 py-3">{s.exam?.title || "غير متوفر"}</td>
                  <td className="px-4 py-3 font-bold text-sky-700">{s.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
