import { createContext, useState, type PropsWithChildren } from "react"
import { type GameState } from "~/types"
import { getStoredData } from "~/utils"

const storedData = getStoredData()

// const initialGameState = (): GameState => {
//   const update = initializeBoard(4)

//   return {
//     boardSize: storedData.boardSize || 4,
//     board: storedData.board || update.board,
//     defeat: storedData.defeat || false,
//     victory: false,
//     victoryDismissed: storedData.victoryDismissed || false,
//     score: storedData.score || 0,
//     best: storedData.best || 0,
//     moveId: new Date().getTime().toString()
//   }
// }

const initialGameState: GameState = {
  boardSize: storedData.boardSize ?? 4,
  board: storedData.board ?? [],
  defeat: storedData.defeat ?? false,
  victory: false,
  victoryDismissed: storedData.victoryDismissed ?? false,
  score: storedData.score ?? 0,
  best: storedData.best ?? 0,
  moveId: new Date().getTime().toString()
}

type Game2048ContextType = {
  gameState: GameState
}

const Game2048 = createContext<Game2048ContextType>(null!)

function Game2048Provider({ children }: PropsWithChildren) {
  const [gameState, setGameState] = useState(initialGameState)

  const value = {
    gameState
  }
  return <Game2048.Provider value={value}>{children}</Game2048.Provider>
}

export { Game2048Provider }
