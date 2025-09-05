"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Target, AlertTriangle } from "lucide-react"
import { puzzleApi } from "@/lib/puzzle-api"
import type { PuzzlePiece, Puzzle } from "@/lib/types"
import { GameManager } from "@/components/mini-games/game-manager"
import Image from "next/image"

export default function PiecePage() {
  const params = useParams()
  const router = useRouter()
  const pieceId = params.id as string

  const [piece, setPiece] = useState<PuzzlePiece | null>(null)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pieceSubmitted, setPieceSubmitted] = useState(false)

  // Load the current puzzle and find the piece
  useEffect(() => {
    const loadPiece = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Piece Page - Looking for piece:', pieceId)
        
        // Load the current puzzle
        const puzzleData = await puzzleApi.getPuzzle("current")
        if (puzzleData) {
          setPuzzle(puzzleData)
          
          // Find the piece in the puzzle
          const pieceData = puzzleData.pieces.find(p => p.id === pieceId)
          if (pieceData) {
            setPiece(pieceData)
            console.log('🔍 Piece Page - Found piece:', pieceData)
          } else {
            setError("Piece not found in current puzzle")
          }
        } else {
          setError("No puzzle data available")
        }
      } catch (error) {
        console.error("Failed to load piece:", error)
        setError("Failed to load piece data")
      } finally {
        setLoading(false)
      }
    }

    loadPiece()
  }, [pieceId])

  // Subscribe to puzzle updates
  useEffect(() => {
    let unsubscribe = () => {}

    if (puzzle && puzzle.id) {
      unsubscribe = puzzleApi.subscribe(puzzle.id, (updatedPuzzle) => {
        setPuzzle(updatedPuzzle)
        const updatedPiece = updatedPuzzle.pieces.find((p) => p.id === pieceId)
        if (updatedPiece) {
          setPiece(updatedPiece)
        }
      })
    }

    return () => {
      unsubscribe()
    }
  }, [puzzle, pieceId])

  const handleGameSuccess = async () => {
    console.log('🎮 [FRONTEND] handleGameSuccess called with piece:', piece?.id)
    if (!piece) {
      console.log('❌ [FRONTEND] No piece found, returning')
      return
    }

    console.log('🎮 [FRONTEND] Setting isSubmitting to true')
    setIsSubmitting(true)
    try {
      console.log('🎮 [FRONTEND] Calling puzzleApi.placePiece...')
      await puzzleApi.placePiece(piece.id, "Anonymous")
      console.log('✅ [FRONTEND] puzzleApi.placePiece completed successfully')
      
      // Refresh the puzzle data to get the updated piece
      const updatedPuzzle = await puzzleApi.getPuzzle("current")
      if (updatedPuzzle) {
        setPuzzle(updatedPuzzle)
        const updatedPiece = updatedPuzzle.pieces.find(p => p.id === pieceId)
        if (updatedPiece) {
          setPiece(updatedPiece)
        }
      }
      
      setPieceSubmitted(true)
      
      // Close tab after 5 seconds
      setTimeout(() => {
        window.close()
      }, 5000)
    } catch (error) {
      console.error("❌ [FRONTEND] Failed to submit piece:", error)
      console.error("❌ [FRONTEND] Error details:", (error as Error).message)
      console.error("❌ [FRONTEND] Error stack:", (error as Error).stack)
      setError("Failed to place piece. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-white to-orange-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-cyan-100 via-white to-orange-100">
        <Card className="w-full max-w-xs sm:max-w-sm">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-12 sm:h-12 md:w-16 md:h-16 relative">
                <Image
                  src="/logos/logo-02.png"
                  alt="Disrupt Asia Logo"
                  width={80}
                  height={80}
                  className="object-contain scale-150 sm:scale-150"
                />
              </div>
              <div className="block">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Disrupt <span className="text-red-600">Asia</span> 2025
                </h2>
                <p className="text-xs sm:text-sm font-bold text-cyan-600">Puzzle Challenge</p>
              </div>
            </div>
            <CardDescription className="text-sm mt-2">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!piece || !puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-cyan-100 via-white to-orange-100">
        <Card className="w-full max-w-xs sm:max-w-sm">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-12 sm:h-12 md:w-16 md:h-16 relative">
                <Image
                  src="/logos/logo-02.png"
                  alt="Disrupt Asia Logo"
                  width={80}
                  height={80}
                  className="object-contain scale-150 sm:scale-150"
                />
              </div>
              <div className="block">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Disrupt <span className="text-red-600">Asia</span> 2025
                </h2>
                <p className="text-xs sm:text-sm font-bold text-cyan-600">Puzzle Challenge</p>
              </div>
            </div>
            <CardDescription className="text-sm mt-2">The requested puzzle piece could not be loaded.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Only redirect if piece is placed AND we're not showing the success state
  if (piece.isPlaced && !pieceSubmitted) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-100 via-white to-orange-100">
      {/* Game Content */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
          {/* Game Card */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-12 sm:h-12 md:w-16 md:h-16 relative">
                  <Image
                    src="/logos/logo-01.png"
                    alt="Disrupt Asia Logo"
                    width={80}
                    height={80}
                    className="object-contain scale-150 sm:scale-150"
                  />
                </div>
                <div className="block">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    Disrupt <span className="text-red-600">Asia</span> 2025
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-cyan-600">Puzzle Challenge</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <GameManager 
                piece={piece} 
                onSuccess={handleGameSuccess} 
                onFailure={() => {}} 
                isSubmitting={isSubmitting}
                pieceSubmitted={pieceSubmitted}
              />
            </CardContent>
          </Card>
          
          {/* Footer Branding */}
          <div className="text-center px-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Part of the Disrupt Asia 2025 Interactive Experience
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
