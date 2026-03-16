import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Username or email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const identifier = parsed.data.identifier.trim().toLowerCase();
        const isEmail = identifier.includes("@");

        let user;

        try {
          user = await prisma.user.findFirst({
            where: isEmail
              ? {
                  email: identifier,
                }
              : {
                  username: identifier,
                },
          });
        } catch (error) {
          console.error("Auth DB lookup failed", error);
          return null;
        }

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          mobNumber: user.mobNumber,
          role: user.role,
          studentClass: user.studentClass,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
        token.mobNumber = user.mobNumber;
        token.role = user.role;
        token.studentClass = user.studentClass;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.username;
        session.user.mobNumber = token.mobNumber;
        session.user.role = token.role;
        session.user.studentClass = token.studentClass;
      }

      return session;
    },
  },
});
