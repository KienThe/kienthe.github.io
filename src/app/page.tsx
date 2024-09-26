import Image from "next/image"

export default async function Home() {
  return (
    // <HydrateClient>
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
          src="/me/images/meme.webp"
          alt="pull stack"
          className="img-fluid"
          width={800}
          height={800}
        />
      </div>
    </div>
    // </HydrateClient>
  )
}
