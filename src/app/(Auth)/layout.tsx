import { Sidebar, Topbar } from "@/app/_components/layout"
import { Breadcrumb } from "@/app/_components/layout/Breadcrumb"
import type { Session } from "@auth/core/types"
import { Box } from "@radix-ui/themes"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { auth } from "../../../auth"

export default async function Layout({ children }: PropsWithChildren) {
  const session: Session | null = await auth()
  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <Topbar />
        <Breadcrumb />
        <main className="flex-1 p-4 overflow-y-auto flex flex-col">
          <Box width="100%" height="100%" top="0">
            {children}
          </Box>
        </main>
      </div>
    </div>
  )
}
