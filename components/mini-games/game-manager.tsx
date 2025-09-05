"use client"

import { useState, useEffect } from "react"
import { TicTacToe } from "./tic-tac-toe"
import { RockPaperScissors } from "./rock-paper-scissors"
import { MemoryMatch } from "./memory-match"
import { SpeedTap } from "./speed-tap"
import { GoldenTicketDisplay } from "./golden-ticket"
import type { PuzzlePiece, GoldenTicket, GoldenTicketState } from "@/lib/types"

interface GameManagerProps {
  piece: PuzzlePiece
  onSuccess: () => void
  onFailure: () => void
  isSubmitting?: boolean
  pieceSubmitted?: boolean
}

const AVAILABLE_GAMES = ["tic-tac-toe", "rock-paper-scissors", "memory-match", "speed-tap"]

export function GameManager({ piece, onSuccess, onFailure, isSubmitting = false, pieceSubmitted = false }: GameManagerProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [goldenTicketState, setGoldenTicketState] = useState<GoldenTicketState>({
    hasWonTicket: false,
    ticket: null,
    showTicket: false
  })

  // Randomly select a game when component mounts
  useEffect(() => {
    const randomGame = AVAILABLE_GAMES[Math.floor(Math.random() * AVAILABLE_GAMES.length)]
    setSelectedGame(randomGame)
  }, [])

  // Golden ticket logic
  const checkGoldenTicketWin = (gameType: string): boolean => {
    // 5% chance to win a golden ticket
    const winChance = 0.05 // 5% chance
    return Math.random() < winChance
  }

  const generateGoldenTicket = (gameType: string): GoldenTicket => {
    const wonAt = new Date()
    const expiresAt = new Date(wonAt.getTime() + (30 * 60 * 1000)) // 30 minutes from now
    
    return {
      id: `GT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      wonAt: wonAt,
      expiresAt: expiresAt,
      gameType: gameType,
      pieceId: piece.id,
      isRedeemed: false
    }
  }

  const handleGameSuccess = (gameType: string) => {
    // Check if player wins a golden ticket
    if (checkGoldenTicketWin(gameType)) {
      const ticket = generateGoldenTicket(gameType)
      setGoldenTicketState({
        hasWonTicket: true,
        ticket: ticket,
        showTicket: true
      })
    }
    
    // Call the original success callback
    onSuccess()
  }

  const handleCloseGoldenTicket = () => {
    setGoldenTicketState(prev => ({
      ...prev,
      showTicket: false
    }))
  }

  const handleRedeemGoldenTicket = () => {
    setGoldenTicketState(prev => ({
      ...prev,
      ticket: prev.ticket ? { ...prev.ticket, isRedeemed: true, redeemedAt: new Date() } : null
    }))
  }

  const renderGame = () => {
    switch (selectedGame) {
      case "tic-tac-toe":
        return (
          <TicTacToe
            piece={piece}
            onSuccess={() => handleGameSuccess("tic-tac-toe")}
            onFailure={onFailure}
            isSubmitting={isSubmitting}
            pieceSubmitted={pieceSubmitted}
          />
        )
      case "rock-paper-scissors":
        return (
          <RockPaperScissors
            piece={piece}
            onSuccess={() => handleGameSuccess("rock-paper-scissors")}
            onFailure={onFailure}
            isSubmitting={isSubmitting}
            pieceSubmitted={pieceSubmitted}
          />
        )
      case "memory-match":
        return (
          <MemoryMatch
            piece={piece}
            onSuccess={() => handleGameSuccess("memory-match")}
            onFailure={onFailure}
            isSubmitting={isSubmitting}
            pieceSubmitted={pieceSubmitted}
          />
        )
      case "speed-tap":
        return (
          <SpeedTap
            piece={piece}
            onSuccess={() => handleGameSuccess("speed-tap")}
            onFailure={onFailure}
            isSubmitting={isSubmitting}
            pieceSubmitted={pieceSubmitted}
          />
        )
      default:
        return (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {renderGame()}
      
      {/* Golden Ticket Display */}
      {goldenTicketState.showTicket && goldenTicketState.ticket && (
        <GoldenTicketDisplay
          ticket={goldenTicketState.ticket}
          onClose={handleCloseGoldenTicket}
          onRedeem={handleRedeemGoldenTicket}
        />
      )}
    </div>
  )
}
