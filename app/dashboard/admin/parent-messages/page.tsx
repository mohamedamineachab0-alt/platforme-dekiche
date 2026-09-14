import { assertAuth } from "@/lib/security";
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
  await assertAuth({ requireRole: "ADMIN" });

  const tickets = await prisma.parentTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      parent: {
        select: {
          fullName: true,
          phoneNumber: true,
          parentLinks: {
            include: {
              student: {
                select: { fullName: true },
              },
            },
          },
        },
      },
    },
  });

  const serialized = tickets.map((ticket) => ({
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8 font-sans text-[#1E1B4B]" dir="rtl">
      <HeroBanner
        title="رسائل الأولياء"
        description="استعرض استفسارات أولياء الأمور، أرسل الرد، وأغلق التذاكر بعد المعالجة"
        icon={MessageSquare}
      />

      <ParentMessagesClient initialTickets={serialized} />
    </div>
  );
}
