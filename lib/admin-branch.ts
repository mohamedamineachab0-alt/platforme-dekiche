import type { Prisma } from "@/generated/prisma";
import { languageSubjectsWhere } from "@/lib/language-enrollment";

export type AdminBranch = "STUDY" | "LANGUAGES";

export function isLanguagesAdminPath(pathname: string | null | undefined) {
  return Boolean(pathname?.startsWith("/dashboard/admin/languages"));
}

export function parseAdminBranch(
  value?: string | string[] | null
): AdminBranch {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "languages" || raw === "LANGUAGES" ? "LANGUAGES" : "STUDY";
}

export function adminBasePath(branch: AdminBranch) {
  return branch === "LANGUAGES" ? "/dashboard/admin/languages" : "/dashboard/admin";
}

export function adminPath(branch: AdminBranch, suffix = "") {
  const base = adminBasePath(branch);
  if (!suffix || suffix === "/") return base;
  return `${base}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

/** Subjects scoped to the admin branch. */
export function subjectWhereForBranch(branch: AdminBranch): Prisma.SubjectWhereInput {
  if (branch === "LANGUAGES") return languageSubjectsWhere();
  return { NOT: languageSubjectsWhere() };
}

/** Students scoped to the admin branch. */
export function studentWhereForBranch(branch: AdminBranch): Prisma.UserWhereInput {
  if (branch === "LANGUAGES") {
    return {
      role: "STUDENT",
      OR: [{ accountBranch: "LANGUAGES" }, { studentProfile: { branch: "LANGUAGES" } }],
    };
  }
  return {
    role: "STUDENT",
    NOT: {
      OR: [{ accountBranch: "LANGUAGES" }, { studentProfile: { branch: "LANGUAGES" } }],
    },
  };
}

export function studentProfileWhereForBranch(
  branch: AdminBranch
): Prisma.StudentProfileWhereInput {
  if (branch === "LANGUAGES") return { branch: "LANGUAGES" };
  return { branch: "STUDY" };
}
