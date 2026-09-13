import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { MainStudyDashboard } from "@/components/student/MainStudyDashboard";
import { redirect } from "next/navigation";

export default async function ParentProgressAnalyticsPage() {
  const session = await assertAuth({ requireRole: "PARENT" });

  const links = await prisma.parentStudentLink.findMany({
    where: { parentId: session.id },
    select: { studentId: true, student: { select: { fullName: true } } },
    take: 1,
  });

  const first = links[0];
  if (!first) redirect("/dashboard/parent");

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <p className="text-sm font-bold text-slate-600" dir="rtl">
        عرض حصيلة {first.student.fullName}
      </p>
      <MainStudyDashboard studentId={first.studentId} />
    </div>
  );
}
