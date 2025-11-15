import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      role: 'ADMIN' | 'OTHER';
    };
  }

  interface User {
    id: string;
    role: 'ADMIN' | 'OTHER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: 'ADMIN' | 'OTHER';
    email: string;
    name: string;
    picture?: string;
    refreshedAt?: number;
  }
}
