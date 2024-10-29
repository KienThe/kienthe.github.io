"use client"

import { useAtomValue } from "jotai"
import { gameStateAtom } from "~/stores"
import { Control } from "./Control"

const Header = () => {
  const gameState = useAtomValue(gameStateAtom)

  return (
    <>
      <div className="flex justify-between align-middle">
        <h1 className="text-5xl font-bold">2048</h1>
        <div className="flex gap-5">
          <div className="m-auto rounded-md bg-[#bbada0] p-6 text-center font-bold">
            <div className="font-bold uppercase">Score</div>
            <div>{gameState.score}</div>
          </div>
          <div className="m-auto rounded-md border-2 bg-[#bbada0] p-6 text-center font-bold">
            <div className="font-bold uppercase">Best</div>
            <div>{gameState.best}</div>
          </div>
        </div>
      </div>

      <Control />
    </>
  )
}

export { Header }
