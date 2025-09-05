export interface PuzzlePiece {
  id: string
  puzzleId: string
  row: number
  col: number
  imageUrl: string
  isPlaced: boolean
  placedBy?: string
  placedAt?: Date
}

export interface Puzzle {
  id: string
  title: string
  description: string
  imageUrl: string
  rows: number
  cols: number
  pieces: PuzzlePiece[]
  createdAt: Date
  completedAt?: Date
}

export interface PuzzleState {
  puzzle: Puzzle | null
  loading: boolean
  error: string | null
}

// Backend API types
export interface BackendPuzzleData {
  current_image: number
  image_link: string
  status: number[] // Array of 0s and 1s representing piece states
}

export interface BackendPieceUpdate {
  piece_index: number
  state: number // 0 = not placed, 1 = placed
}
