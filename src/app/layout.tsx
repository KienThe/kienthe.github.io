import "~/styles/globals.css"

import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import Favicon from "~/public/images/meme_sad_frog.png"

export const metadata: Metadata = {
  title: "The Kien Dev",
  description: "The Kien Dev - A pull stack developer",
  icons: [{ rel: "icon", url: Favicon.src }]
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="w-full h-screen">{children}</body>
    </html>
  )
}
