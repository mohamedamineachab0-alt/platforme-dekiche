import { assertAuth } from "@/lib/security";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await assertAuth({ requireRole: "PARENT" });


  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
