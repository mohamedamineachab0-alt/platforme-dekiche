import { getMyNotifications } from "@/actions/notifications";
import { StudentNotificationsClient } from "./StudentNotificationsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function StudentNotificationsPage() {
  const notifications = await getMyNotifications();
  
  const safeNotifications = notifications.map(n => ({
    ...n,
    levels: n.levels || [],
    streams: n.streams || [],
    subjectIds: n.subjectIds || [],
  }));

  // Fetch subjects to map subjectIds to names
  const subjectIds = Array.from(new Set(safeNotifications.flatMap(n => n.subjectIds)));
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, title: true }
  });

  return (
    <StudentNotificationsClient 
      notifications={safeNotifications} 
      subjects={subjects} 
    />
  );
}
