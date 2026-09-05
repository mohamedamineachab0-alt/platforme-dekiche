import { assertAuth } from "@/lib/security";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await assertAuth({ requireRole: "TEACHER" });


  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
