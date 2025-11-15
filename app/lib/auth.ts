import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { NextAuthOptions } from "next-auth"
import { onInit } from './on-init';

const prisma = new PrismaClient();

// Validate required environment variables
const googleClientId = process.env.GOOGLE_SIGNIN_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_SIGNIN_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

if (!googleClientId || !googleClientSecret) {
  console.error('[ERROR] Missing required Google OAuth credentials:');
}

if (!nextAuthUrl) {
  console.warn('[WARNING] NEXTAUTH_URL is not set. Defaulting to http://localhost:3000');
}

const PRODUCTION_DOMAIN = "";
const COOKIE_ENVIRONMENT = process.env.NODE_ENV === "production";
const COOKIE_SECURE = COOKIE_ENVIRONMENT ? true : false;
const COOKIE_DOMAIN  = COOKIE_ENVIRONMENT ? PRODUCTION_DOMAIN : "localhost";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

const COOKIE_INFO = {
    session:COOKIE_ENVIRONMENT ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    callback:COOKIE_ENVIRONMENT ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
    csrf: COOKIE_ENVIRONMENT ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: googleClientId || '',
      clientSecret: googleClientSecret || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        console.log("[+] Signin user[google]:",user.email)
        const existingUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          console.log("[+] Creating user:",user.email)
          await prisma.users.create({
            data: {
              email: user.email || '',
              name: user.name || '',
              image: user.image || '',
              role: 'OTHER',
              googleId: account.providerAccountId,
            },
          });
          onInit()
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // Initial sign in - user object is provided
      const current_user_email=  user?.email || token?.email;
      console.log("[+] JWT - Initial sign in for:", current_user_email);
      if (current_user_email) {
        const currentUser = await prisma.users.findUnique({
          where: { email: current_user_email },
        });
        if (currentUser) {
          token.userId = currentUser.id;
          token.role = currentUser.role as 'ADMIN' | 'OTHER';
          token.email = currentUser.email;
          token.name = currentUser?.name || '';
          token.picture = currentUser?.image || user?.image || '';
          token.refreshedAt = Date.now();

        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[+] Session token:",token)
      console.log("[+] Session session:",session)
      if (token && session.user) {
        session.user.id = token.userId
        session.user.role = token.role
        session.user.email = token.email
        session.user.name = token.name
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    }
  },
  cookies:{
    sessionToken:{
      name: COOKIE_INFO.session,
      options: {
        httpOnly: true,
        sameSite: "lax",       
        path: "/",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN, 
        maxAge: COOKIE_MAX_AGE 
      },
    },
    callbackUrl: {
      name: COOKIE_INFO.callback,
      options: {
        sameSite: "lax",
        path: "/",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN, 
      },
    },
    csrfToken: {
      name: COOKIE_INFO.csrf,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure:COOKIE_SECURE
      },
    },
  }
};



