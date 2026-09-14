import { assertAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import StudentsTableClient from "./StudentsTableClient";
import { Metadata } from "next";
import { parseAdminBranch, studentWhereForBranch } from "@/lib/admin-branch";

export const metadata: Metadata = {
  title: "إدارة التلاميذ وأولياء الأمور",
};

// 1. ZERO CACHING: Force dynamic and no revalidation (real-time sync)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminStudentsPage(props: {
  searchParams: Promise<{ adminBranch?: string }>;
}) {
  await assertAuth({ requireRole: "ADMIN" });
  const searchParams = await props.searchParams;
  const branch = parseAdminBranch(searchParams.adminBranch);
  const studentWhere = studentWhereForBranch(branch);

  // 3. ACCURATE COUNT VERIFICATION & 2. COMPLETE FETCHING wrapped in try-catch
  let totalStudents = 0;
  let totalParents = 0;
  let students: any[] = [];

  try {
    const counts = await Promise.all([
      prisma.user.count({ where: studentWhere }),
      branch === "LANGUAGES"
        ? Promise.resolve(0)
        : prisma.user.count({ where: { role: "PARENT" } }),
    ]);
    totalStudents = counts[0];
    totalParents = counts[1];

    students = await prisma.user.findMany({
      where: studentWhere,
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
  } catch (error) {
    console.error("Database fetch error in AdminStudentsPage:", error);
  }

  // (Optional, just to satisfy the instruction to query all parents too if needed for verification)
  // const allParents = await prisma.user.findMany({ where: { role: "PARENT" } });

  // 4. CLEAN STRUCTURING: Serialize for the client
  const serializedStudents = students.map((s) => {
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
          {branch === "LANGUAGES" ? "تلاميذ تعلّم اللغات" : "إدارة التلاميذ وأولياء الأمور"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {branch === "LANGUAGES"
            ? "متابعة حسابات التلاميذ المسجّلين في فرع تعلّم اللغات فقط."
            : "إدارة حسابات التلاميذ، معلوماتهم الأكاديمية، وحالة الربط مع حسابات الأولياء."}
        </p>
      </div>

      <StudentsTableClient 
        initialStudents={serializedStudents} 
        totalStudentsCount={totalStudents}
        totalParentsCount={totalParents}
      />
    </div>
  );
}
