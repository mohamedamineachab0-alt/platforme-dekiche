import { assertAuth } from "@/lib/security";
import { MainStudyDashboard } from "@/components/student/MainStudyDashboard";

export default async function StudentAnalyticsPage() {
  await assertAuth({ requireRole: "STUDENT" });
  return (
    <div className="mx-auto max-w-6xl">
      <MainStudyDashboard />
    </div>
  );
}
