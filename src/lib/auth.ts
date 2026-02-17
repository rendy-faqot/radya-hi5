import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Adapter } from 'next-auth/adapters'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, teamMemberId: true },
        })
        session.user.isAdmin = dbUser?.isAdmin || false
        session.user.teamMemberId = dbUser?.teamMemberId || null
      }
      return session
    },
    // No signIn callback - let PrismaAdapter handle everything
    // This ensures team members can sign in without any errors
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
