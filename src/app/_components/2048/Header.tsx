"use client"

import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { gameStateAtom } from "~/lib/stores"
import { Control } from "./Control"

const Header = () => {
  const gameState = useAtomValue(gameStateAtom)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <div className="flex justify-between align-middle">
        <h1 className="text-5xl font-bold">2048</h1>
        <div className="flex gap-5">
          <div className="m-auto rounded-md bg-[#bbada0] p-6 text-center font-bold">
            <div className="font-bold uppercase">Score</div>
            <div>{isClient ? gameState.score : 0}</div>
          </div>
          <div className="m-auto rounded-md border-2 bg-[#bbada0] p-6 text-center font-bold">
            <div className="font-bold uppercase">Best</div>
            <div>{isClient ? gameState.best : 0}</div>
          </div>
        </div>
      </div>

      <Control />
    </>
  )
}

export { Header }
