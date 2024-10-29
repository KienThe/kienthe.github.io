import { atomWithReducer } from "jotai/utils"
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

function gameReducer(state = initialGameState, action: ActionModel) {
  const newState = { ...state }

  switch (action.type) {
    case ActionType.RESET:
      {
        const size = action.value ?? newState.boardSize
        const update = initializeBoard(size)
        newState.boardSize = size
        newState.board = update.board
        newState.score = 0
        newState.animations = update.animations
        newState.previousBoard = undefined
        newState.victory = false
        newState.victoryDismissed = false
      }
      break
    case ActionType.MOVE:
      {
        if (newState.defeat) {
          break
        }

        const direction = action.value as Direction
        const update = updateBoard(newState.board, direction)
        newState.previousBoard = [...newState.board]
        newState.board = update.board
        newState.score += update.scoreIncrease
        newState.animations = update.animations
        newState.scoreIncrease = update.scoreIncrease
        newState.moveId = new Date().getTime().toString()
      }
      break
    case ActionType.UNDO:
      if (!newState.previousBoard) {
        break
      }

      newState.board = newState.previousBoard
      newState.previousBoard = undefined

      if (newState.scoreIncrease) {
        newState.score -= newState.scoreIncrease
      }
      break
    case ActionType.DISMISS:
      newState.victoryDismissed = true
      break
    default:
      return state
  }

  if (newState.score > newState.best) {
    newState.best = newState.score
  }

  newState.defeat = !movePossible(newState.board)
  newState.victory = !!newState.board.find((value) => value === 2048)
  setStoredData(newState)

  return newState
}

export const gameStateAtom = atomWithReducer(getInitialState(), gameReducer)
