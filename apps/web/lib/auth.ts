import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@devteam/database';
import * as bcrypt from 'bcryptjs';

export const authOptions = {
  // Remove PrismaAdapter when using credentials with JWT
  // The adapter is only needed for database sessions
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          if (!user.passwordHash) {
            console.log('User has no password hash');
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash,
          );

          if (!isCorrectPassword) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          console.log('Login successful for:', credentials.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }: { token: any; session: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
