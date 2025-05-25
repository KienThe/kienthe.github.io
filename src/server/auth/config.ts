import type { DefaultSession } from "next-auth"
import type { User } from "../db/types"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & DefaultSession["user"]
  }

  interface User {
    // Add any additional properties from your database User type here
    avatar?: string[] | null
    level?: number | null
    exp?: number | null
    objectType?: string | null
    role?: "guest" | "user" | "admin" | "moderator" | "premium" | null
    password?: string | null
  }
}
