/**
 * Single source for the Auth.js signing secret (session cookie + JWT).
 * Must match between `auth.ts` and `middleware.ts` (getToken).
 */
export function getAuthSecret(): string | undefined {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-only-do-not-use-in-production-min-32-chars-xx"
      : undefined)
  );
}
