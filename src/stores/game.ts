import { atom } from "jotai"
import { type GameState } from "~/types"
import { getStoredData, initializeBoard } from "~/utils"

const initialGameState: GameState = {
  boardSize: 4,
  board: [],
  defeat: false,
  victory: false,
  victoryDismissed: false,
  score: 0,
  best: 0,
  moveId: new Date().getTime().toString()
}

const getInitialState = () => {
  const storedData = getStoredData()
  const update = initializeBoard(4)
  return {
    ...initialGameState,
    ...storedData,
    board: storedData.board ?? update.board
  }
}

export const gameStateAtom = atom<GameState>(getInitialState())
