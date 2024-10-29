import { type ActionModel, ActionType, type Direction } from "~/types"

function resetAction(size: number): ActionModel {
  return {
    type: ActionType.RESET,
    value: size
  }
}

function undoAction(): ActionModel {
  return {
    type: ActionType.UNDO
  }
}

function moveAction(direction: Direction): ActionModel {
  return {
    type: ActionType.MOVE,
    value: direction
  }
}

function dismissAction(): ActionModel {
  return {
    type: ActionType.DISMISS
  }
}

export { dismissAction, moveAction, resetAction, undoAction }
