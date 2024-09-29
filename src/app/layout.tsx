import "~/styles/globals.css"

import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import Favicon from "~/public/images/meme_sad_frog.png"
import { Footer } from "./_components"

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
      <body className="w-full h-screen">
        <div className="star-field">
          <div className="layer" />
          <div className="layer" />
          <div className="layer" />
        </div>

        <h1 className="text-center font-bold text-sky-300 text-3xl p-4">
          {"Hi, I'm The Kien. I'm a..."}
        </h1>

        <main className="bg flex min-h-screen flex-col items-center justify-center">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
