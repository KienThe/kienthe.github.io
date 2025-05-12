import { atom } from "jotai"
import React from "react"
import {
  ActionType,
  type ActionModel,
  type Direction,
  type GameState
} from "~/types"
import {
  getStoredData,
  initializeBoard,
  movePossible,
  setStoredData,
  updateBoard
} from "~/utils"

// Initialize state from localStorage
const storedData = getStoredData()
const initialBoardSize = storedData.boardSize ?? 4
const initialBoard = storedData.board ?? []
const initialScore = storedData.score ?? 0
const initialBest = storedData.best ?? 0
const initialDefeat = storedData.defeat ?? false
const initialVictoryDismissed = storedData.victoryDismissed ?? false

// Separate atoms for different parts of the state
export const boardSizeAtom = atom(initialBoardSize)
export const boardAtom = atom<number[]>(initialBoard)
export const scoreAtom = atom(initialScore)
export const bestScoreAtom = atom(initialBest)
export const defeatAtom = atom(initialDefeat)
export const victoryAtom = atom(false)
export const victoryDismissedAtom = atom(initialVictoryDismissed)
export const moveIdAtom = atom(new Date().getTime().toString())
export const previousBoardAtom = atom<number[] | undefined>(undefined)
export const animationsAtom = atom<GameState["animations"]>(undefined)
export const scoreIncreaseAtom = atom<number | undefined>(undefined)

// Derived atom for the complete game state
export const gameStateAtom = atom(
  (get) => ({
    boardSize: get(boardSizeAtom),
    board: get(boardAtom),
    defeat: get(defeatAtom),
    victory: get(victoryAtom),
    victoryDismissed: get(victoryDismissedAtom),
    score: get(scoreAtom),
    best: get(bestScoreAtom),
    moveId: get(moveIdAtom),
    previousBoard: get(previousBoardAtom),
    animations: get(animationsAtom),
    scoreIncrease: get(scoreIncreaseAtom)
  }),
  (get, set, action: ActionModel) => {
    const currentState = get(gameStateAtom)

    switch (action.type) {
      case ActionType.RESET: {
        const size = action.value ?? currentState.boardSize
        const update = initializeBoard(size)
        set(boardSizeAtom, size)
        set(boardAtom, update.board)
        set(scoreAtom, 0)
        set(animationsAtom, update.animations)
        set(previousBoardAtom, undefined)
        set(victoryAtom, false)
        set(victoryDismissedAtom, false)
        break
      }
      case ActionType.MOVE: {
        if (get(defeatAtom)) break

        const direction = action.value as Direction
        const update = updateBoard(get(boardAtom), direction)
        set(previousBoardAtom, [...get(boardAtom)])
        set(boardAtom, update.board)
        set(scoreAtom, (prev) => prev + update.scoreIncrease)
        set(animationsAtom, update.animations)
        set(scoreIncreaseAtom, update.scoreIncrease)
        set(moveIdAtom, new Date().getTime().toString())
        break
      }
      case ActionType.UNDO: {
        const prevBoard = get(previousBoardAtom)
        if (!prevBoard) break

        set(boardAtom, prevBoard)
        set(previousBoardAtom, undefined)
        const scoreIncrease = get(scoreIncreaseAtom)
        if (scoreIncrease) {
          set(scoreAtom, (prev) => prev - scoreIncrease)
        }
        break
      }
      case ActionType.DISMISS: {
        set(victoryDismissedAtom, true)
        break
      }
    }

    // Update best score if needed
    const currentScore = get(scoreAtom)
    const currentBest = get(bestScoreAtom)
    if (currentScore > currentBest) {
      set(bestScoreAtom, currentScore)
    }

    // Update game state
    const currentBoard = get(boardAtom)
    set(defeatAtom, !movePossible(currentBoard))
    set(victoryAtom, !!currentBoard.find((value) => value === 2048))

    // Save to localStorage
    setStoredData(get(gameStateAtom))
  }
)

const Board = React.memo(() => {
  // ... code như cũ
})

export { Board }
