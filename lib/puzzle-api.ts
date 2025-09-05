import type { Puzzle, PuzzlePiece, BackendPuzzleData, BackendPieceUpdate } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://online.generationalpha.site"
// Use local API routes to avoid CORS issues
const PUZZLE_API_URL = "/api/puzzle"

// Cache for current puzzle data
let currentPuzzleData: BackendPuzzleData | null = null
let puzzleCache: Puzzle | null = null

// Helper function to get the correct image URL
function getImageUrl(imageLink: string): string {
  console.log('🖼️ getImageUrl - Input:', imageLink)
  
  // If it's already a full URL, return as is
  if (imageLink.startsWith('http')) {
    console.log('🖼️ getImageUrl - Full URL detected:', imageLink)
    return imageLink
  }
  
  // If it's a local path like "/puzzles/image1.png", serve from local public folder
  if (imageLink.startsWith('/puzzles/')) {
    console.log('🖼️ getImageUrl - Local path detected:', imageLink)
    return imageLink // Next.js will serve from public folder
  }
  
  // Otherwise, combine with API base URL
  const fullUrl = `${API_BASE_URL}${imageLink}`
  console.log('🖼️ getImageUrl - Combined URL:', fullUrl)
  return fullUrl
}

// Convert backend data to frontend puzzle format
function convertBackendToPuzzle(backendData: BackendPuzzleData): Puzzle {
  const rows = 10 // Assuming 10x10 grid based on 100 pieces
  const cols = 10
  const pieces: PuzzlePiece[] = []

  // Create pieces from backend status array
  // Ensure we have exactly 100 pieces for a 10x10 grid
  const expectedPieces = rows * cols // 100 pieces
  const actualStatusLength = backendData.status.length
  
  console.log('🧩 Creating puzzle pieces:', {
    expectedPieces,
    actualStatusLength,
    rows,
    cols
  })
  
  for (let i = 0; i < expectedPieces; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const isPlaced = i < actualStatusLength ? backendData.status[i] === 1 : false

    // Debug first few pieces to verify order
    if (i < 5) {
      console.log(`🧩 Piece ${i}:`, { row, col, isPlaced })
    }

    pieces.push({
      id: `piece-${i}`,
      puzzleId: `puzzle-${backendData.current_image}`,
      row,
      col,
      imageUrl: getImageUrl(backendData.image_link),
      isPlaced,
      placedBy: isPlaced ? "Player" : undefined,
      placedAt: isPlaced ? new Date() : undefined,
    })
  }

  return {
    id: `puzzle-${backendData.current_image}`,
    title: `Puzzle ${backendData.current_image}`,
    description: `Collaborative jigsaw puzzle - Image ${backendData.current_image}`,
    imageUrl: getImageUrl(backendData.image_link),
    rows,
    cols,
    pieces,
    createdAt: new Date(),
  }
}

// API functions for backend integration
export const puzzleApi = {
  async getPuzzle(id: string): Promise<Puzzle | null> {
    try {
      const response = await fetch(PUZZLE_API_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const backendData: BackendPuzzleData = await response.json()
      currentPuzzleData = backendData
      puzzleCache = convertBackendToPuzzle(backendData)
      return puzzleCache
    } catch (error) {
      console.error("Failed to fetch puzzle data:", error)
      return puzzleCache // Return cached data if available
    }
  },

  async placePiece(pieceId: string, placedBy: string): Promise<void> {
    if (!currentPuzzleData) {
      throw new Error("No puzzle data available")
    }

    // Extract piece index from pieceId (format: "piece-{index}")
    const pieceIndex = parseInt(pieceId.replace("piece-", ""))
    
    if (isNaN(pieceIndex) || pieceIndex < 0 || pieceIndex >= currentPuzzleData.status.length) {
      throw new Error("Invalid piece ID")
    }

    try {
      const updateData: BackendPieceUpdate = {
        piece_index: pieceIndex,
        state: 1
      }

      const response = await fetch(`${PUZZLE_API_URL}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local cache
      if (currentPuzzleData) {
        currentPuzzleData.status[pieceIndex] = 1
        puzzleCache = convertBackendToPuzzle(currentPuzzleData)
      }
    } catch (error) {
      console.error("Failed to place piece:", error)
      throw error
    }
  },

  async getPiece(pieceId: string): Promise<PuzzlePiece | null> {
    if (!puzzleCache) {
      await this.getPuzzle("current")
    }
    
    if (!puzzleCache) {
      return null
    }

    return puzzleCache.pieces.find(p => p.id === pieceId) || null
  },

  subscribe(puzzleId: string, callback: (puzzle: Puzzle) => void): () => void {
    let isActive = true
    let intervalId: NodeJS.Timeout | null = null

    const startPolling = () => {
      intervalId = setInterval(async () => {
        if (!isActive) return

        try {
          const response = await fetch(PUZZLE_API_URL)
          if (!response.ok) return

          const backendData: BackendPuzzleData = await response.json()
          
          // Check if data has changed
          if (!currentPuzzleData || 
              JSON.stringify(currentPuzzleData.status) !== JSON.stringify(backendData.status) ||
              currentPuzzleData.current_image !== backendData.current_image) {
            
            currentPuzzleData = backendData
            puzzleCache = convertBackendToPuzzle(backendData)
            callback(puzzleCache)
          }
        } catch (error) {
          console.error("Failed to poll puzzle data:", error)
        }
      }, 1000) // Poll every second
    }

    // Start polling immediately
    startPolling()

    // Return unsubscribe function
    return () => {
      isActive = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  },

  // Helper method to get current puzzle data
  getCurrentPuzzleData(): BackendPuzzleData | null {
    return currentPuzzleData
  },

  // Helper method to check if puzzle is complete
  isPuzzleComplete(): boolean {
    if (!currentPuzzleData) return false
    return currentPuzzleData.status.every(state => state === 1)
  }
}
