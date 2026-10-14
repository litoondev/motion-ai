// NextAuth configuration with Google OAuth + Email (magic link)
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { isDisposableEmail } from "@/lib/disposable-emails";

type UserRole = "USER" | "ADMIN";

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host:   process.env.EMAIL_SERVER_HOST,
        port:   Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Block disposable emails
      if (user.email && isDisposableEmail(user.email)) return false;
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id   = user.id;
        session.user.role = ((user as unknown) as { role: UserRole }).role ?? "USER";
      }
      return session;
    },
  },

  events: {
    // Auto-promote admin email on first login
    async createUser({ user }) {
      if (user.email === process.env.ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data:  { role: "ADMIN" as UserRole },
        });
      }
    },
  },

  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
    verifyRequest: "/login?verify=1",
  },

  session: { strategy: "database" },
};

// Augment NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      role:  UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
