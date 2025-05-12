"use client"

import { useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { resetAction } from "~/stores/action"
import { boardSizeAtom, gameStateAtom } from "~/stores/game"

const MIN_BOARD_SIZE = 4
const MAX_BOARD_SIZE = 10

const ControlContent = () => {
  const boardSize = useAtomValue(boardSizeAtom)
  const setGameState = useSetAtom(gameStateAtom)

  const reset = useCallback(
    (size?: number) => {
      const newSize = size ?? boardSize
      if (newSize >= MIN_BOARD_SIZE && newSize <= MAX_BOARD_SIZE) {
        setGameState(resetAction(newSize))
      }
    },
    [boardSize, setGameState]
  )

  useEffect(() => {
    if (boardSize < MIN_BOARD_SIZE) {
      reset(MIN_BOARD_SIZE)
    }
  }, [boardSize, reset])

  return (
    <div className="my-2 flex w-full justify-between gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-center font-bold">Board size</p>
        <div className="flex w-full flex-row justify-between gap-2">
          <button
            onClick={() => reset(boardSize - 1)}
            disabled={boardSize <= MIN_BOARD_SIZE}
            className="rounded-md bg-[#8f7a66] px-4 py-2 text-white hover:bg-[#9f8b77] disabled:opacity-50"
          >
            -
          </button>
          <div className="flex items-center justify-center px-4">
            {boardSize}
          </div>
          <button
            onClick={() => reset(boardSize + 1)}
            disabled={boardSize >= MAX_BOARD_SIZE}
            className="rounded-md bg-[#8f7a66] px-4 py-2 text-white hover:bg-[#9f8b77] disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex gap-5">
        <button
          onClick={() => reset()}
          className="rounded-md bg-[#8f7a66] px-4 py-2 text-white hover:bg-[#9f8b77]"
        >
          New game
        </button>
      </div>
    </div>
  )
}

const Control = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="my-2 flex w-full justify-between gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-center font-bold">Board size</p>
          <div className="flex w-full flex-row justify-between gap-2">
            <button
              disabled
              className="rounded-md bg-[#8f7a66] px-4 py-2 text-white opacity-50"
            >
              -
            </button>
            <div className="flex items-center justify-center px-4">4</div>
            <button
              disabled
              className="rounded-md bg-[#8f7a66] px-4 py-2 text-white opacity-50"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-5">
          <button
            disabled
            className="rounded-md bg-[#8f7a66] px-4 py-2 text-white opacity-50"
          >
            New game
          </button>
        </div>
      </div>
    )
  }

  return <ControlContent />
}

export { Control }
