import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import StudentsTableClient from "./StudentsTableClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة التلاميذ وأولياء الأمور",
};

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  await assertAuth("ADMIN");

  // Fetch all students with their parent links
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: true,
      studentLinks: {
        include: {
          parent: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize the data for the client component
  const serializedStudents = students.map((s) => {
    // Find the linked parent if one exists
    const linkedParent = s.studentLinks[0]?.parent;
    
    return {
      id: s.id,
      fullName: s.fullName,
      phoneNumber: s.phoneNumber,
      createdAt: s.createdAt.toISOString(),
      studentProfile: s.studentProfile ? {
        stream: s.studentProfile.stream,
        level: s.studentProfile.level,
        wilaya: s.studentProfile.wilaya,
      } : null,
      parent: linkedParent ? {
        id: linkedParent.id,
        fullName: linkedParent.fullName,
        phoneNumber: linkedParent.phoneNumber,
      } : null,
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          إدارة التلاميذ وأولياء الأمور
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          إدارة حسابات التلاميذ، معلوماتهم الأكاديمية، وحالة الربط مع حسابات الأولياء.
        </p>
      </div>

      <StudentsTableClient initialStudents={serializedStudents} />
    </div>
  );
}
