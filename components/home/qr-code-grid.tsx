"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Copy, Check } from "lucide-react"
import { QRCode } from "@/components/home/qr-code"
import type { Puzzle } from "@/lib/types"

interface QRCodeGridProps {
  puzzle: Puzzle
}


export function QRCodeGrid({ puzzle }: QRCodeGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, pieceId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(pieceId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadQRCode = (pieceId: string, row: number, col: number) => {
    const canvas = document.querySelector(`[data-piece-id="${pieceId}"] canvas`) as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `puzzle-piece-${row}-${col}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const printAllQRCodes = () => {
    window.print()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">QR Codes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Scan to access individual puzzle pieces</p>
        </div>
        <Button onClick={printAllQRCodes} variant="outline" size="sm" className="w-full sm:w-auto">
          <Printer className="w-4 h-4 mr-2" />
          Print All
        </Button>
      </div>

      {/* QR Code Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {puzzle.pieces.map((piece) => {
          const pieceUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/piece/${piece.id}`

          return (
            <Card key={piece.id} data-piece-id={piece.id} className="print:break-inside-avoid">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm">
                    Piece ({piece.row}, {piece.col})
                  </CardTitle>
                  <Badge variant={piece.isPlaced ? "default" : "secondary"} className="text-xs">
                    {piece.isPlaced ? "Done" : "Open"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {piece.isPlaced ? `Completed by ${piece.placedBy}` : "Available to solve"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 sm:space-y-3">
                                      {/* QR Code or Piece Image */}
                      <div className="flex justify-center h-24 sm:h-32 relative">
                        {piece.isPlaced ? (
                          <div className="relative w-full h-full border rounded overflow-hidden">
                            {/* Background image preview */}
                            <div
                              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage: `url(${puzzle.imageUrl})`,
                                backgroundSize: `${puzzle.cols * 100}% ${puzzle.rows * 100}%`,
                                backgroundPosition: `-${piece.col * (100 / puzzle.cols)}% -${piece.row * (100 / puzzle.rows)}%`,
                              }}
                            />
                          </div>
                        ) : (
                          <QRCode value={pieceUrl} size={96} className="border rounded bg-white" />
                        )}
                      </div>

                {/* URL */}
                <div className="text-xs text-muted-foreground break-all bg-muted p-1 sm:p-2 rounded">{pieceUrl}</div>

                {/* Actions - Only show for unplaced pieces */}
                {!piece.isPlaced && (
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(pieceUrl, piece.id)}
                      className="flex-1 text-xs"
                    >
                      {copiedId === piece.id ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRCode(piece.id, piece.row, piece.col)}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          [data-piece-id] * {
            visibility: visible;
          }
          
          [data-piece-id] {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
