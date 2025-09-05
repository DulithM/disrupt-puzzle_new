"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Star, Gift, Sparkles, X, CheckCircle } from "lucide-react"
import Image from "next/image"
import type { GoldenTicket } from "@/lib/types"

interface GoldenTicketProps {
  ticket: GoldenTicket
  onClose: () => void
  onRedeem?: () => void
}

export function GoldenTicketDisplay({ ticket, onClose, onRedeem }: GoldenTicketProps) {
  const [isRedeemed, setIsRedeemed] = useState(ticket.isRedeemed)

  const handleRedeem = () => {
    setIsRedeemed(true)
    onRedeem?.()
  }

  // Random mystery prize for all games
  const getPrizeInfo = (gameType: string) => {
    const mysteryPrizes = [
      { emoji: '🥤', title: 'RedBull Energy Drink', description: 'Show this ticket at the event booth to claim your RedBull Energy Drink!' },
      { emoji: '🥤', title: 'Pepsi', description: 'Show this ticket at the event booth to claim your Pepsi!' },
      { emoji: '🥤', title: 'Coca-Cola', description: 'Show this ticket at the event booth to claim your Coca-Cola!' },
      { emoji: '🥤', title: 'Sprite', description: 'Show this ticket at the event booth to claim your Sprite!' },
      { emoji: '🥤', title: 'Fanta', description: 'Show this ticket at the event booth to claim your Fanta!' },
      { emoji: '🥤', title: '7Up', description: 'Show this ticket at the event booth to claim your 7Up!' }
    ]
    
    return mysteryPrizes[Math.floor(Math.random() * mysteryPrizes.length)]
  }

  const prizeInfo = getPrizeInfo(ticket.gameType)

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const isExpired = new Date() > ticket.expiresAt

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="space-y-2">
          {/* Disrupt Asia Header */}
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              <Image
                src="/logos/logo-01.png"
                alt="Disrupt Asia Logo"
                width={80}
                height={80}
                className="object-contain scale-150"
              />
            </div>
            <div className="block">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Disrupt <span className="text-red-600">Asia</span> 2025
              </h2>
              <p className="text-sm sm:text-base font-bold text-cyan-600">Puzzle Challenge</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Golden Ticket Card */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-2 border-yellow-400 shadow-lg">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="flex justify-center mb-2">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 sm:p-3 rounded-full">
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-yellow-800">
                🎫 GOLDEN TICKET 🎫
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
                  You Won a Golden Ticket!
                </p>
                <p className="text-yellow-700 text-xs sm:text-sm">
                  Show this ticket at the event to claim your special prize!
                </p>
              </div>

              {/* Prize Information */}
              <div className="bg-white/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl mb-2">{prizeInfo.emoji}</div>
                <h3 className="text-base sm:text-lg font-bold text-yellow-800 mb-1">
                  {prizeInfo.title}
                </h3>
                <p className="text-xs sm:text-sm text-yellow-700">
                  {prizeInfo.description}
                </p>
              </div>

              {/* Time Information */}
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-yellow-800">Won:</span>
                  <span className="text-yellow-700 text-xs">{formatDateTime(ticket.wonAt)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-yellow-800">Expires:</span>
                  <span className={`text-xs ${isExpired ? 'text-red-600 font-semibold' : 'text-yellow-700'}`}>
                    {formatDateTime(ticket.expiresAt)}
                  </span>
                </div>
                {isExpired && (
                  <div className="text-center">
                    <Badge variant="destructive" className="text-xs">
                      EXPIRED
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-blue-800 text-center leading-relaxed">
              💡 <strong>Instructions:</strong> Take a screenshot of this ticket and show it to our staff at the event booth to claim your {prizeInfo.title.toLowerCase()}! 
              {!isExpired ? ` This ticket expires on ${formatDateTime(ticket.expiresAt)}.` : ' This ticket has expired and cannot be redeemed.'}
            </p>
          </div>
                    
          {/* Close Button */}
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-sm sm:text-base py-2 sm:py-3"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}
