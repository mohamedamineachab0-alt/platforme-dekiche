import { assertAuth } from "@/lib/security";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await assertAuth({ requireRole: "ADMIN" });


  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
