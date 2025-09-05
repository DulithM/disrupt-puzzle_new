"use client"

import { useEffect, useState } from "react"
import { puzzleApi } from "@/lib/puzzle-api"
import type { Puzzle } from "@/lib/types"
import { PuzzleBoard } from "@/components/home/puzzle-board"
import { PuzzleStatus } from "@/components/dev/puzzle-status"

export default function HomePage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const puzzleData = await puzzleApi.getPuzzle("current")
        setPuzzle(puzzleData)
      } catch (error) {
        console.error("Failed to load puzzle:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPuzzle()
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}

    if (puzzle) {
      unsubscribe = puzzleApi.subscribe(puzzle.id, (updatedPuzzle) => {
        setPuzzle(updatedPuzzle)
      })
    }

    return () => {
      unsubscribe()
    }
  }, [puzzle])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Puzzle not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PuzzleBoard puzzle={puzzle} />
    </div>
  )
}
