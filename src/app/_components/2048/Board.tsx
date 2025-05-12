"use client"

import { useAtom } from "jotai"
import { useCallback, useEffect, useRef, useState } from "react"
import { gameStateAtom, moveAction, resetAction } from "~/stores"
import { AnimationType, Direction, type Animation, type Point } from "~/types"
import { type BoardType } from "~/utils"
import { Overlay } from "./Overlay"
import { Title } from "./Title"

const INITIAL_BOARD_SIZE = 4
const MAX_BOARD_SIZE = 10

const BoardContent = () => {
  const [{ board, boardSize, animations }, setGameState] =
    useAtom(gameStateAtom)
  const startPointerLocation = useRef<Point>()
  const currentPointerLocation = useRef<Point>()

  const animationDuration = 150

  const onMove = useCallback(
    (direction: Direction) => setGameState(moveAction(direction)),
    [setGameState]
  )

  const [renderedBoard, setRenderedBoard] = useState(board)
  const [renderedAnimations, setRenderedAnimations] = useState<Animation[]>([])
  const lastBoard = useRef<BoardType>([...board])
  const animationTimeout = useRef<number>()

  useEffect(() => {
    if (boardSize > MAX_BOARD_SIZE) {
      setGameState(resetAction(MAX_BOARD_SIZE))
    }
  }, [boardSize, setGameState])

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      e.preventDefault()

      switch (e.key) {
        case "ArrowDown":
          onMove(Direction.DOWN)
          break
        case "ArrowUp":
          onMove(Direction.UP)
          break
        case "ArrowLeft":
          onMove(Direction.LEFT)
          break
        case "ArrowRight":
          onMove(Direction.RIGHT)
          break
      }
    }

    window.addEventListener("keydown", keydownListener)

    return () => {
      window.removeEventListener("keydown", keydownListener)
    }
  }, [onMove])

  const finishPointer = useCallback(
    (a: Point, b: Point) => {
      const distance = Math.sqrt((b.y - a.y) ** 2 + (b.x - a.x) ** 2)
      if (distance < 20) {
        return
      }

      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      if (angle < -135 || angle > 135) {
        onMove(Direction.LEFT)
      } else if (angle < -45) {
        onMove(Direction.UP)
      } else if (angle < 45) {
        onMove(Direction.RIGHT)
      } else if (angle < 135) {
        onMove(Direction.DOWN)
      }
    },
    [onMove]
  )

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      const point: Point = { x: touch.pageX, y: touch.pageY }
      startPointerLocation.current = point
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      const point: Point = { x: touch.pageX, y: touch.pageY }
      currentPointerLocation.current = point
    }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (startPointerLocation.current && currentPointerLocation.current) {
        finishPointer(
          startPointerLocation.current,
          currentPointerLocation.current
        )
      }

      startPointerLocation.current = undefined
      currentPointerLocation.current = undefined
    },
    [finishPointer]
  )

  const onMouseStart = useCallback((e: React.MouseEvent) => {
    const point: Point = { x: e.pageX, y: e.pageY }
    startPointerLocation.current = point
  }, [])

  const onMouseEnd = useCallback(
    (e: React.MouseEvent) => {
      if (startPointerLocation.current) {
        finishPointer(startPointerLocation.current, { x: e.pageX, y: e.pageY })
        startPointerLocation.current = undefined
      }
    },
    [finishPointer]
  )

  useEffect(() => {
    if (!animations) {
      setRenderedBoard([...board])
      return
    }

    const moveAnimations = animations.filter(
      (animation) => animation.type === AnimationType.MOVE
    )
    const otherAnimations = animations.filter(
      (animation) => animation.type !== AnimationType.MOVE
    )

    if (moveAnimations.length > 0) {
      setRenderedBoard(lastBoard.current)
      setRenderedAnimations(moveAnimations)

      clearTimeout(animationTimeout.current)
      animationTimeout.current = setTimeout(() => {
        setRenderedAnimations(otherAnimations)
        setRenderedBoard([...board])
      }, animationDuration) as unknown as number
    } else {
      setRenderedAnimations(otherAnimations)
      setRenderedBoard([...board])
    }

    lastBoard.current = [...board]
  }, [animations, board])

  return (
    <div className="relative">
      <div
        className={`border-3 grid touch-none select-none gap-4 rounded-md bg-[#bbada0] p-5`}
        onMouseDown={onMouseStart}
        onMouseUp={onMouseEnd}
        onMouseLeave={onMouseEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: "500px",
          height: "500px",
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}
      >
        {renderedBoard.map((value, i) => (
          <Title
            value={value}
            key={i}
            animations={renderedAnimations?.filter(
              (animation) => animation.index === i
            )}
          />
        ))}
      </div>
      <Overlay />
    </div>
  )
}

const Board = () => {
  const [mounted, setMounted] = useState(false)
  const [, setGameState] = useAtom(gameStateAtom)

  useEffect(() => {
    setMounted(true)
    setGameState(resetAction(INITIAL_BOARD_SIZE))
  }, [setGameState])

  if (!mounted) {
    return (
      <div className="relative">
        <div
          className={`border-3 grid touch-none select-none gap-4 rounded-md bg-[#bbada0] p-5`}
          style={{
            width: "500px",
            height: "500px",
            gridTemplateColumns: `repeat(${INITIAL_BOARD_SIZE}, 1fr)`
          }}
        >
          {Array(INITIAL_BOARD_SIZE * INITIAL_BOARD_SIZE)
            .fill(0)
            .map((_, i) => (
              <Title value={0} key={i} />
            ))}
        </div>
      </div>
    )
  }

  return <BoardContent />
}

export { Board }
