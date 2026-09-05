import { assertAuth } from "@/lib/security";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await assertAuth({ requireRole: "STUDENT" });


  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
