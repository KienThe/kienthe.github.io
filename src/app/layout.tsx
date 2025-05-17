import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Metruyencv Crawler",
  description: "Crawler for metruyencv.com"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Theme>
            <main>{children}</main>
          </Theme>
        </Providers>
      </body>
    </html>
  )
}
