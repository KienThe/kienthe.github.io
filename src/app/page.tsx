import Image from "next/image"
import MemeImg from "~/public/images/meme.webp"
import { Footer } from "./_components"

export default async function Home() {
  return (
    <>
      <div className="star-field">
        <div className="layer" />
        <div className="layer" />
        <div className="layer" />
      </div>

      <h1 className="text-center font-bold text-sky-300 text-3xl p-4">
        {"Hi, I'm The Kien. I'm a..."}
      </h1>

      <main className="bg flex min-h-screen flex-col items-center justify-center">
        <div className="container p-4 relative">
          <div className="absolute -z-[1]">
            <div id="circle-small"></div>
            <div id="circle-medium"></div>
            <div id="circle-large"></div>
            <div id="circle-xlarge"></div>
            <div id="circle-xxlarge"></div>
          </div>

          <div className="flex justify-center">
            <Image
              src={MemeImg}
              alt="pull stack"
              className="img-fluid"
              width={800}
              height={800}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
