import type { PlatformBranch } from "@/generated/prisma";

export function platformToBranch(platform?: string | null): PlatformBranch {
  switch (platform) {
    case "smart-teacher":
      // Dalili disabled — map to main academy study branch
      return "STUDY";
    case "languages":
      return "LANGUAGES";
    case "soroban":
      return "SOROBAN";
    case "quran":
      return "QURAN";
    case "islamic":
      return "ISLAMIC";
    case "courses":
      return "TRAINING";
    default:
      return "STUDY";
  }
}

/** Login/register account scope: languages vs everything else (study). */
export function accountBranchForPlatform(platform?: string | null): PlatformBranch {
  return platformToBranch(platform) === "LANGUAGES" ? "LANGUAGES" : "STUDY";
}

export function studentHomePath(branch?: string | null) {
  if (branch === "LANGUAGES") return "/dashboard/student/subjects";
  return "/dashboard/student";
}
