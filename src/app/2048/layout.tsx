import { type Metadata } from "next"
import { type PropsWithChildren } from "react"

export const metadata: Metadata = {
  title: "2048",
  description: "2048"
}

export default function Layout({ children }: PropsWithChildren) {
  return <main className="mx-auto my-5 max-w-lg p-2">{children}</main>
}
