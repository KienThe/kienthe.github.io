import { useAtom } from "jotai"
import { useCallback } from "react"
import { dismissAction, gameStateAtom, resetAction } from "~/stores"

const Overlay: React.FC = () => {
  const [gameState, setGameState] = useAtom(gameStateAtom)
  const reset = useCallback(
    () => setGameState(resetAction(gameState.boardSize)),
    [gameState.boardSize, setGameState]
  )

  const dismiss = useCallback(
    () => setGameState(dismissAction()),
    [setGameState]
  )

  const victory = gameState.victory && !gameState.victoryDismissed

  if (victory) {
    return (
      <div className="z-999 absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-center bg-[#EEE4DA] bg-opacity-80 text-center align-middle">
        <h1 className="text-2xl font-bold">You win!</h1>
        <div className="flex justify-center gap-2">
          <button onClick={dismiss}>Keep going</button>
          <button onClick={reset}>Try again</button>
        </div>
      </div>
    )
  }

  if (gameState.defeat) {
    return (
      <div className="z-999 absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-center bg-[#f08437] bg-opacity-50 text-center align-middle">
        <h1 className="text-2xl font-bold">Game over!</h1>
        <div>
          <button onClick={reset} className="opacity-100">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return null
}

export { Overlay }
