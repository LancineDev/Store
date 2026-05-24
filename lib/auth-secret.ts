/**
 * Single source for the Auth.js signing secret (session cookie + JWT).
 * Must match between `auth.ts` and `middleware.ts` (getToken).
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'Missing authentication secret. Set AUTH_SECRET or NEXTAUTH_SECRET in your environment.'
    );
  }
  return secret;
}
