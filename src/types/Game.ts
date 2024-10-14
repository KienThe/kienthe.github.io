import { type BoardType } from "~/utils/board"

// Define a type for the game state
export interface GameState {
  /** Board size. Currently always 4. */
  boardSize: number

  /** Current board. */
  board: BoardType

  /** Previous board. */
  previousBoard?: BoardType

  /** Was 2048 tile found? */
  victory: boolean

  /** Is game over? */
  defeat: boolean

  /** Should the victory screen be hidden? */
  victoryDismissed: boolean

  /** Current score. */
  score: number

  /** Score increase after last update. */
  scoreIncrease?: number

  /** Best score. */
  best: number

  /** Used for certain animations. Mainly as a value of the "key" property. */
  moveId?: string

  /** Animations after last update. */
  animations?: Animation[]
}
