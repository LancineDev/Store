import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getAuthSecret } from "@/lib/auth-secret";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) ||
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId:
              process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret:
              process.env.AUTH_GOOGLE_SECRET ??
              process.env.GOOGLE_CLIENT_SECRET ??
              "",
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        const { validateCredentials } = await import("@/lib/users-store");
        const user = validateCredentials(email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user?.email ?? (profile as { email?: string })?.email;
        if (!email) return false;
        const { upsertOAuthUser } = await import("@/lib/users-store");
        upsertOAuthUser(
          email,
          user?.name ??
            (profile as { name?: string })?.name ??
            email.split("@")[0]
        );
      }
      return true;
    },
    async jwt({ token, user }) {
      const { findUserByEmail } = await import("@/lib/users-store");
      if (user?.email) {
        const record = findUserByEmail(user.email);
        if (record) {
          token.sub = record.id;
          token.role = record.role;
          return token;
        }
      }
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
});
