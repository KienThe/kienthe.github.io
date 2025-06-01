import { db } from "@/server/db"
import {
  accounts,
  sessions,
  users,
  verificationTokens
} from "@/server/db/schema"
import type { User } from "@/server/db/types"
import type { JWT } from "@auth/core/jwt"
import Credentials from "@auth/core/providers/credentials"
import type { Session } from "@auth/core/types"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import bcrypt from "bcrypt"
import NextAuth from "next-auth"

declare module "@auth/core/types" {
  interface Session {
    user: User
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts as any,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
        // Find user by email
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, credentials.email as string)
        })

        if (!user?.password) {
          throw new Error("Invalid credentials.")
        }

        // Compare password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid credentials.")
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
