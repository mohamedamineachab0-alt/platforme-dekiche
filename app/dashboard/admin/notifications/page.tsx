import { prisma } from "@/lib/prisma";
import { SendNotificationClient } from "./SendNotificationClient";

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, level: true, stream: true }
  });

  return (
    <div className="space-y-6">
      <SendNotificationClient 
        subjects={subjects} 
        notifications={notifications.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content,
          levels: n.levels || [],
          streams: n.streams || [],
          subjectIds: n.subjectIds || [],
          createdAt: n.createdAt,
        }))} 
      />
    </div>
  );
}
