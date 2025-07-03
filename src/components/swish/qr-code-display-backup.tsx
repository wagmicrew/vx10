"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Smartphone, AlertCircle, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SwishQRCodeDisplayProps {
  amount: number
  message: string
  bookingId: string
  onClose: () => void
  onConfirmBooking: () => void
}

export function SwishQRCodeDisplay({ amount, message, bookingId, onClose, onConfirmBooking }: SwishQRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [fallbackInfo, setFallbackInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentReady, setPaymentReady] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    generateQRCode()
  }, [amount, message, bookingId])

  const generateQRCode = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/swish/qr-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, message, bookingId }),
      })
      const data = await response.json()
      if (data.success && data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl)
        setFallbackInfo(data.fallbackInfo)
      } else {
        setError(data.error || "Kunde inte generera QR-kod")
        setFallbackInfo(data.fallbackInfo)
      }
    } catch (err) {
      console.error("QR Code generation error:", err)
      setError("Kunde inte ansluta till Swish API")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast({
      title: "Kopierat!",
      description: "Informationen har kopierats till urklipp",
    })
  }

  const openSwishApp = () => {
    if (fallbackInfo) {
      const swishUrl = `swish://payment?phone=${fallbackInfo.phoneNumber}&amount=${fallbackInfo.amount}&message=${encodeURIComponent(
        fallbackInfo.message
      )}`
      window.location.href = swishUrl
    }
  }

  const handlePaymentReady = () => {
    setPaymentReady(true)
  }

  const handleConfirmBooking = () => {
    onConfirmBooking()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-gray-500/70 backdrop-blur-sm" />
        <DialogContent className="max-w-4xl mx-auto z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span>Betala med Swish</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-green-600">{amount.toLocaleString("sv-SE")} SEK</div>
            <div className="text-sm text-gray-600">{message}</div>
          </div>

          <Separator className="mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {loading && (
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-sm text-gray-500">Genererar QR-kod...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Något gick fel</h4>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateQRCode}
                        className="mt-3 border-red-300 text-red-700"
                      >
                        Försök igen
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {qrCodeUrl && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <img src={qrCodeUrl} alt="Swish QR Code" className="w-48 h-48 object-contain" />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Så här betalar du:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Öppna Swish-appen på din telefon</li>
                          <li>Skanna QR-koden ovan</li>
                          <li>Bekräfta betalningen i appen</li>
                          <li>Klicka på "Jag har betalat" till höger</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Button onClick={openSwishApp} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Öppna i Swish-appen
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {fallbackInfo && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-3">Manuell betalning:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Telefonnummer:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{fallbackInfo.phoneNumber}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(fallbackInfo.phoneNumber)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Belopp:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{fallbackInfo.amount} SEK</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(fallbackInfo.amount.toString())}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-gray-600">Meddelande:</span>
                        <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                          {fallbackInfo.message}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(fallbackInfo.message)}
                          className="w-full"
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Kopiera meddelande
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!paymentReady ? (
                <Button onClick={handlePaymentReady} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Jag har betalat
                </Button>
              ) : (
                <div className="space-y-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Betalning markerad som klar</p>
                          <p className="text-sm text-green-600">Du kan nu bekräfta din bokning</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleConfirmBooking} className="w-full bg-red-600 hover:bg-red-700" size="lg">
                    Bekräfta bokning
                  </Button>
                </div>
              )}

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Viktigt att veta:</p>
                      <p>
                        Skolan behöver manuellt bekräfta din bokning efter att betalningen mottagits. Du kommer att få ett
                        bekräftelsemail när bokningen är godkänd.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

