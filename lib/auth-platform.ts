export type AuthPlatform = "languages" | "study";

const STORAGE_KEY = "dekiche_auth_platform";

export function resolveAuthPlatform(raw?: string | null): AuthPlatform {
  return raw === "languages" ? "languages" : "study";
}

export function loginPath(platform: AuthPlatform) {
  return platform === "languages" ? "/login?platform=languages" : "/login?platform=study";
}

export function registerPath(platform: AuthPlatform) {
  return platform === "languages"
    ? "/register?platform=languages"
    : "/register?platform=study";
}

export function homePath(platform: AuthPlatform) {
  return platform === "languages" ? "/languages" : "/";
}

export function rememberAuthPlatform(platform: AuthPlatform) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, platform);
  } catch {
    // ignore
  }
}

export function readRememberedAuthPlatform(): AuthPlatform | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value === "languages" || value === "study" ? value : null;
  } catch {
    return null;
  }
}
