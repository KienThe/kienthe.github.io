import { auth } from "@/auth"
import type { Session } from "@auth/core/types"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"

export default async function Layout({ children }: PropsWithChildren) {
  const session: Session | null = await auth()
  if (!session) {
    redirect("/auth/login")
  }
  return <>{children}</>
}
