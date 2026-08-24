import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ParentMessagesClient } from "./ParentMessagesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "رسائل الأولياء",
};

export const dynamic = "force-dynamic";

export default async function AdminParentMessagesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let tickets: any[] = [];
  try {
    tickets = await prisma.parentTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        parent: {
          select: {
            fullName: true,
            phoneNumber: true,
            parentLinks: {
              include: {
                student: {
                  select: { fullName: true }
                }
              }
            }
          },
        },
      },
    });
  } catch (error) {
    console.error("Database fetch error in AdminParentMessagesPage:", error);
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <HeroBanner 
        title="رسائل الأولياء"
        description="استعرض استفسارات ورسائل أولياء الأمور الواردة للإدارة وقم بمتابعتها وإغلاقها بعد المعالجة"
        icon={MessageSquare}
        gradientClass="bg-gradient-to-r from-sky-600 to-indigo-600"
      />

      <ParentMessagesClient initialTickets={tickets} />
    </div>
  );
}
