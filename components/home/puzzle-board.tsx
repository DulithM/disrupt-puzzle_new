"use client"

import { cn } from "@/lib/utils"
import type { Puzzle } from "@/lib/types"
import { QRCode } from "@/components/home/qr-code"
import { puzzleApi } from "@/lib/puzzle-api"
import { useEffect, useState } from "react"

interface PuzzleBoardProps {
  puzzle: Puzzle
}


export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  const { rows, cols, pieces } = puzzle
  const [isComplete, setIsComplete] = useState(false)

  // Check if puzzle is complete
  useEffect(() => {
    const completedPieces = pieces.filter((p) => p.isPlaced).length
    const totalPieces = pieces.length
    const isPuzzleComplete = completedPieces === totalPieces
    
    if (isPuzzleComplete && !isComplete) {
      setIsComplete(true)
      // Show completion message and potentially move to next puzzle
      setTimeout(() => {
        alert("🎉 Puzzle Complete! Moving to next puzzle...")
        // Reload the page to get the next puzzle
        window.location.reload()
      }, 2000)
    }
  }, [pieces, isComplete])

  return (
    <div className="w-full h-screen p-2">
      {/* Puzzle completion overlay */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Puzzle Complete!</h2>
            <p className="text-gray-600">Moving to the next puzzle...</p>
          </div>
        </div>
      )}

      {/* Puzzle Board with Background Image */}
      <div className="relative w-full h-full rounded-lg shadow-lg overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${puzzle.imageUrl})`,
          }}
        />
        
        {/* Grid Overlay */}
        <div
          className="absolute inset-0 grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const piece = pieces.find((p) => p.row === row && p.col === col)
              if (!piece) return null

              return (
                <div
                  key={piece.id}
                  className={cn(
                    "w-full h-full flex items-center justify-center relative",
                    piece.isPlaced 
                      ? "bg-transparent" // Transparent when placed to show background
                      : "bg-white" // White background when not placed
                  )}
                >
                  {piece.isPlaced ? (
                    // Just show the background image when completed (no indicators)
                    null
                  ) : (
                    // Show QR code when not placed
                    <QRCode
                      value={`${window.location.origin}/piece/${piece.id}`}
                      size={Math.min(120, Math.min(window.innerWidth / cols, window.innerHeight / rows) - 20)}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}
