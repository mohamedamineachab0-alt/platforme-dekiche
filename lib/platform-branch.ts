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

export function studentHomePath(branch?: string | null) {
  // Dalili / SMART_TEACHER no longer has a separate home
  return "/dashboard/student";
}
