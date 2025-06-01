import type { User as UserType } from "@/server/db/types"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: UserType & DefaultSession["user"]
  }

  interface User extends UserType {
    // Add any additional properties from your database User type here
    avatar?: string[] | null
    level?: number | null
    exp?: number | null
    objectType?: string | null
    role?: "guest" | "user" | "admin" | "moderator" | "premium" | null
    password?: string | null
  }
}
