"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { puzzleApi } from "@/lib/puzzle-api"
import type { BackendPuzzleData } from "@/lib/types"
import { Image, Users, Clock } from "lucide-react"

export function PuzzleStatus() {
  const [puzzleData, setPuzzleData] = useState<BackendPuzzleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPuzzleData = async () => {
      try {
        const data = await puzzleApi.getPuzzle("current")
        if (data) {
          const backendData = puzzleApi.getCurrentPuzzleData()
          setPuzzleData(backendData)
        }
      } catch (error) {
        console.error("Failed to load puzzle status:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPuzzleData()

    // Set up polling for real-time updates
    const interval = setInterval(async () => {
      try {
        const backendData = puzzleApi.getCurrentPuzzleData()
        if (backendData) {
          setPuzzleData(backendData)
        }
      } catch (error) {
        console.error("Failed to update puzzle status:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Puzzle Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!puzzleData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Puzzle Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load puzzle status</p>
        </CardContent>
      </Card>
    )
  }

  const completedPieces = puzzleData.status.filter(state => state === 1).length
  const totalPieces = puzzleData.status.length
  const completionPercentage = Math.round((completedPieces / totalPieces) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Image className="w-4 h-4 sm:w-5 sm:h-5" />
          Puzzle Status
        </CardTitle>
        <CardDescription className="text-sm">
          Real-time puzzle progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium">Current Puzzle</span>
          <Badge variant="outline" className="text-xs">Image {puzzleData.current_image}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Progress</span>
            <span>{completedPieces} / {totalPieces} pieces</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {completionPercentage}% complete
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Collaborative</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Real-time</span>
          </div>
        </div>

        {completionPercentage === 100 && (
          <div className="text-center p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold text-sm sm:text-base">🎉 Puzzle Complete!</p>
            <p className="text-green-600 text-xs sm:text-sm">Moving to next puzzle...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

