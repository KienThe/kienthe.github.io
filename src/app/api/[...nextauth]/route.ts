import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth"
import { db } from "~/server/db"

export const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: []
  // Add your providers and other NextAuth config here
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
