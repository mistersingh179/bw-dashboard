import NextAuth, { NextAuthOptions, User } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

import { debug } from "util";
import { NextApiHandler } from "next";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { DEFAULT_SCORE_THRESHOLD } from "@/constants";
import findOrCreateSettings from "@/services/findOrCreateSettings";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, token, user }) {
      session.user.id = user.id;
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log("in signIn with: ", user);
      return true;
    },
  },
  events: {
    signIn: async (message) => {
      const { user, account, profile, isNewUser } = message;
      console.log("got signIn event with: ", message);
    },
    createUser: async (message) => {
      const { user } = message;
      console.log("got createUser event with: ", message);
      await findOrCreateSettings(user);
    },
  },
  // Configure one or more authentication providers
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID as string,
    //   clientSecret: process.env.GITHUB_SECRET as string,
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // EmailProvider({
    //   server: {
    //     host: process.env.SMTP_HOST,
    //     port: Number(process.env.SMTP_PORT),
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   },
    //   from: process.env.SMTP_FROM,
    // }),
  ],
  debug: true,
  theme: {
    logo: "/BrandWeaver-Blue-Logo-small.png",
  },
  secret: process.env.SECRET,
};

const authHandler: NextApiHandler = NextAuth(authOptions);
export default authHandler;
