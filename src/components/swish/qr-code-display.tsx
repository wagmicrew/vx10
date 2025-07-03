"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X, Smartphone, AlertCircle, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SwishQRCodeDisplayProps {
  amount: number
  message: string
  bookingId: string
  onClose: () => void
  onConfirmBooking: () => void
  onConfirmPayment?: ({ bookingId }: { bookingId: string }) => Promise<void>
}

export function SwishQRCodeDisplay({
  amount,
  message,
  bookingId,
  onClose,
  onConfirmBooking,
  onConfirmPayment,
}: SwishQRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [fallbackInfo, setFallbackInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentReady, setPaymentReady] = useState(false)
  const [confirming, setConfirming] = useState(false)
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

  const handleConfirm = async () => {
    if (onConfirmPayment) {
      setConfirming(true)
      try {
        // Create or update invoice for this booking payment
        await createOrUpdateInvoiceForBooking(bookingId)
        
        // Confirm payment in the booking system
        await onConfirmPayment({ bookingId } as any)
        
        // If payment confirmation is successful, then proceed
        onConfirmBooking()
      } catch (error) {
        // Error toast is handled in the parent component, so we just stop the process here
        console.error("Payment confirmation failed in SwishQRCodeDisplay", error)
      } finally {
        setConfirming(false)
      }
    } else {
      // Fallback for when onConfirmPayment is not provided
      onConfirmBooking()
    }
  }

  const createOrUpdateInvoiceForBooking = async (bookingId: string) => {
    try {
      const response = await fetch("/api/booking/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, payment_method: "swish" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create invoice")
      }

      const { invoice } = await response.json()
      console.log("Invoice created/updated for booking:", invoice)
      
      // Send payment confirmation email
      await sendPaymentConfirmationEmail(bookingId, "swish")
    } catch (error) {
      console.error("Error creating invoice for booking:", error)
      // Don't throw here as this shouldn't stop the payment confirmation
    }
  }

  const sendPaymentConfirmationEmail = async (bookingId: string, paymentMethod: string) => {
    try {
      const response = await fetch("/api/booking/send-payment-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          booking_id: bookingId, 
          payment_method: paymentMethod 
        }),
      })

      if (!response.ok) {
        console.error("Failed to send payment confirmation email")
      } else {
        console.log("Payment confirmation email sent successfully")
      }
    } catch (error) {
      console.error("Error sending payment confirmation email:", error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[750px] max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-none">
        {/* Glassmorphism Container */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl h-full max-h-[95vh] overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-blue-500/20 rounded-xl sm:rounded-2xl"></div>

          {/* Scrollable Content Container */}
          <div className="relative z-10 h-full overflow-y-auto custom-scrollbar">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              <DialogHeader className="relative mb-3 sm:mb-4 md:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-green-400/30">
                      <span className="text-white font-bold text-sm drop-shadow-lg">S</span>
                    </div>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                      Betala med Swish
                    </DialogTitle>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 group flex-shrink-0"
                    aria-label="Stäng formulär"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-2 sm:mt-3 md:mt-4"></div>
              </DialogHeader>

              {/* Amount and Message */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white drop-shadow-lg">{amount.toLocaleString("sv-SE")} SEK</div>
                <div className="text-sm text-white/70 mt-1">{message}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - QR Code */}
                <div className="space-y-6">
                  {loading && (
                    <div className="flex flex-col items-center space-y-4 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <p className="text-sm text-white/70">Genererar QR-kod...</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-100">Något gick fel</h4>
                          <p className="text-sm text-red-200 mt-1">{error}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={generateQRCode}
                            className="mt-3 text-red-200 hover:text-red-100 hover:bg-red-500/20"
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
                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                          <img src={qrCodeUrl} alt="Swish QR Code" className="w-48 h-48 object-contain" />
                        </div>
                      </div>

                      <div className="bg-blue-500/20 backdrop-blur-sm p-4 rounded-lg border border-blue-400/30">
                        <div className="flex items-start space-x-3">
                          <Smartphone className="w-5 h-5 text-blue-300 mt-0.5" />
                          <div className="text-sm text-blue-100">
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

                      <Button
                        onClick={openSwishApp}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-green-500/30"
                        size="lg"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Öppna i Swish-appen
                      </Button>
                    </div>
                  )}
                </div>

                {/* Right Column - Payment Details */}
                <div className="space-y-6">
                  {fallbackInfo && (
                    <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                      <h4 className="font-medium text-sm mb-3 text-white">Manuell betalning:</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Telefonnummer:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-white/90">{fallbackInfo.phoneNumber}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyToClipboard(fallbackInfo.phoneNumber)}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Belopp:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-white/90">{fallbackInfo.amount} SEK</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(fallbackInfo.amount.toString())}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-white/70">Meddelande:</span>
                          <div className="bg-white/10 backdrop-blur-sm p-2 rounded border border-white/20 text-xs font-mono break-all text-white/90">
                            {fallbackInfo.message}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(fallbackInfo.message)}
                            className="w-full text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Kopiera meddelande
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!paymentReady ? (
                    <Button 
                      onClick={handlePaymentReady} 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-blue-500/30" 
                      size="lg"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Jag har betalat
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                          <div>
                            <p className="text-sm font-medium text-green-100">Betalning markerad som klar</p>
                            <p className="text-sm text-green-200">Du kan nu bekräfta din bokning</p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleConfirm} 
                        disabled={confirming}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-red-500/30" 
                        size="lg"
                      >
                        {confirming ? "Bekräftar..." : "Bekräfta bokning"}
                      </Button>
                    </div>
                  )}

                  <div className="p-4 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-amber-300 mt-0.5" />
                      <div className="text-sm text-amber-100">
                        <p className="font-medium mb-1">Viktigt att veta:</p>
                        <p>
                          Skolan behöver manuellt bekräfta din bokning efter att betalningen mottagits. Du kommer att få ett
                          bekräftelsemail när bokningen är godkänd.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

