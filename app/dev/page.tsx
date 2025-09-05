"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  Copy,
  Check,
  Target,
  RefreshCw
} from "lucide-react"
import { puzzleApi } from "@/lib/puzzle-api"
import type { Puzzle, PuzzlePiece } from "@/lib/types"
import { QRCode } from "@/components/home/qr-code"

export default function DevPage() {
  const router = useRouter()
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCompletingAll, setIsCompletingAll] = useState(false)
  const [completingPiece, setCompletingPiece] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        setLoading(true)
        // Load the actual puzzle from the backend API
        const puzzleData = await puzzleApi.getPuzzle("current")
        if (puzzleData) {
          setPuzzle(puzzleData)
          console.log('🔍 Dev Page - Loaded puzzle from backend:', puzzleData)
          console.log('🖼️ Dev Page - Puzzle image URL:', puzzleData.imageUrl)
          console.log('🖼️ Dev Page - First piece image URL:', puzzleData.pieces[0]?.imageUrl)
        } else {
          console.error('❌ Dev Page - No puzzle data received from backend')
        }
      } catch (error) {
        console.error("Failed to load puzzle:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPuzzle()
  }, [])

  // Subscribe to puzzle updates for real-time sync
  useEffect(() => {
    let unsubscribe = () => {}

    if (puzzle && puzzle.id) {
      unsubscribe = puzzleApi.subscribe(puzzle.id, (updatedPuzzle) => {
        console.log('🔄 Dev Page - Received puzzle update from subscription')
        setPuzzle(updatedPuzzle)
      })
    }

    return () => {
      unsubscribe()
    }
  }, [puzzle])

  const completePiece = async (pieceId: string) => {
    if (!puzzle) return
    
    setCompletingPiece(pieceId)
    try {
      console.log('🎮 Dev Page - Completing piece:', pieceId)
      await puzzleApi.placePiece(pieceId, "Dev User")
      console.log('✅ Dev Page - Piece completed successfully')
      
      // Refresh puzzle data from backend to get the latest state
      const updatedPuzzle = await puzzleApi.getPuzzle("current")
      if (updatedPuzzle) {
        setPuzzle(updatedPuzzle)
        console.log('🔄 Dev Page - Puzzle data refreshed from backend')
      }
    } catch (error) {
      console.error("❌ Dev Page - Failed to complete piece:", error)
    } finally {
      setCompletingPiece(null)
    }
  }

  const completeAllPieces = async () => {
    if (!puzzle || isCompletingAll) return
    
    setIsCompletingAll(true)
    const unplacedPieces = puzzle.pieces.filter(p => !p.isPlaced)
    
    console.log('🚀 Dev Page - Starting to complete all pieces:', unplacedPieces.length)
    
    for (const piece of unplacedPieces) {
      setCompletingPiece(piece.id)
      try {
        console.log('🎮 Dev Page - Completing piece:', piece.id)
        await puzzleApi.placePiece(piece.id, "Dev User")
        console.log('✅ Dev Page - Piece completed:', piece.id)
        
        // Small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error("❌ Dev Page - Failed to complete piece:", piece.id, error)
      }
    }
    
    // Refresh puzzle data from backend to get the latest state
    try {
      const updatedPuzzle = await puzzleApi.getPuzzle("current")
      if (updatedPuzzle) {
        setPuzzle(updatedPuzzle)
        console.log('🔄 Dev Page - All pieces completed, puzzle data refreshed')
      }
    } catch (error) {
      console.error("❌ Dev Page - Failed to refresh puzzle data:", error)
    }
    
    setIsCompletingAll(false)
    setCompletingPiece(null)
  }

  const refreshPuzzle = async () => {
    try {
      setLoading(true)
      console.log('🔄 Dev Page - Refreshing puzzle data from backend')
      const freshPuzzle = await puzzleApi.getPuzzle("current")
      if (freshPuzzle) {
        setPuzzle(freshPuzzle)
        console.log('✅ Dev Page - Puzzle data refreshed successfully')
      }
    } catch (error) {
      console.error("❌ Dev Page - Failed to refresh puzzle data:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetPuzzle = async () => {
    if (!puzzle) return
    
    console.log('🔄 Dev Page - Resetting puzzle (local only - backend reset not available)')
    
    // Note: Backend doesn't have a reset function, so this is local only
    // In a real scenario, you might want to reload the puzzle from backend
    const resetPieces = puzzle.pieces.map(p => ({
      ...p,
      isPlaced: false,
      placedBy: undefined,
      placedAt: undefined
    }))
    setPuzzle({ ...puzzle, pieces: resetPieces })
    
    // Alternative: Reload from backend to get fresh state
    // const freshPuzzle = await puzzleApi.getPuzzle("current")
    // if (freshPuzzle) setPuzzle(freshPuzzle)
  }

  const copyToClipboard = async (text: string, pieceId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(pieceId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-white to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading development puzzle...</p>
        </div>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-white to-orange-100">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to create development puzzle</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Puzzle
          </Button>
        </div>
      </div>
    )
  }

  const completedPieces = puzzle.pieces.filter(p => p.isPlaced).length
  const totalPieces = puzzle.pieces.length
  const completionPercentage = (completedPieces / totalPieces) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-orange-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-3 sm:mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-3 sm:mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main Puzzle
          </Button>

          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              🛠️ Dev Console
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Test and manage puzzle pieces
            </p>
          </div>
          
          {/* Badges - Stack on mobile */}
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <Badge variant="outline" className="text-xs">
              {puzzle.rows}×{puzzle.cols}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {totalPieces} pieces
            </Badge>
          </div>

          {/* Progress Section - Better mobile layout */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col gap-3">
              {/* Progress Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Progress</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  {completedPieces}/{totalPieces} ({Math.round(completionPercentage)}%)
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={completeAllPieces}
                  disabled={isCompletingAll || completedPieces === totalPieces}
                  size="sm"
                  className="text-xs flex-1 sm:flex-none"
                >
                  {isCompletingAll ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-2" />
                      Complete All
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={refreshPuzzle}
                  variant="outline"
                  disabled={loading}
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Puzzle Pieces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Puzzle Pieces
            </CardTitle>
            <CardDescription className="text-sm">
              Click "Complete" to test individual pieces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3">
              {puzzle.pieces.map((piece) => {
                const pieceUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/piece/${piece.id}`
                const isCompleting = completingPiece === piece.id

                return (
                  <Card 
                    key={piece.id} 
                    data-piece-id={piece.id}
                    className={`transition-all duration-200 hover:shadow-md ${
                      piece.isPlaced 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : ''
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs">
                          ({piece.row}, {piece.col})
                        </CardTitle>
                        <Badge 
                          variant={piece.isPlaced ? "default" : "secondary"} 
                          className="text-xs"
                        >
                          {piece.isPlaced ? "Done" : "Open"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      {/* QR Code */}
                      <div className="flex justify-center h-12 sm:h-16">
                        <a 
                          href={pieceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <QRCode value={pieceUrl} size={48} className="border rounded bg-white" />
                        </a>
                      </div>

                      {/* Quick Complete Button */}
                      {!piece.isPlaced && (
                        <Button
                          size="sm"
                          onClick={() => completePiece(piece.id)}
                          disabled={isCompleting}
                          className="w-full text-xs h-6 sm:h-7"
                        >
                          {isCompleting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              ...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </>
                          )}
                        </Button>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(pieceUrl, piece.id)}
                          className="w-full text-xs h-5 sm:h-6"
                        >
                          {copiedId === piece.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
