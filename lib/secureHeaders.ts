export const ALLOWED_ORIGIN =
  process.env.NODE_ENV === "production"
    ? "https://dekiche-academy.com"
    : "http://localhost:3000";

/**
 * Returns true only if the request originates from the trusted domain.
 * Used in API routes and Server Actions to block generic script callers.
 */
export function validateOrigin(headers: Headers): boolean {
  const origin = headers.get("origin") ?? headers.get("referer") ?? "";
  return origin.startsWith(ALLOWED_ORIGIN);
}
