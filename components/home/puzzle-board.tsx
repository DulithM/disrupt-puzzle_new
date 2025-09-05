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

  return (
    <div className="w-full h-screen p-2">

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
