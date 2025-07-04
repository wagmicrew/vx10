"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, RefreshCw, Copy, ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GenericSwishQRDisplayProps {
  defaultAmount?: number
  defaultMessage?: string
}

export function GenericSwishQRDisplay({ 
  defaultAmount = 0, 
  defaultMessage = "Betalning till Din Trafikskola Hässleholm" 
}: GenericSwishQRDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [fallbackInfo, setFallbackInfo] = useState<{ phoneNumber: string; amount: number; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState(defaultAmount)
  const [message, setMessage] = useState(defaultMessage)
  const { toast } = useToast()

  const generateQRCode = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/swish/generic-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, message }),
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
      setFallbackInfo({
        phoneNumber: "123 273 20 71",
        amount: amount,
        message: message,
      })
    } finally {
      setLoading(false)
    }
  }, [amount, message])

  useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

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
      const swishUrl = `swish://payment?phone=${fallbackInfo.phoneNumber}&amount=${amount}&message=${encodeURIComponent(message)}`
      window.location.href = swishUrl
    }
  }

  return (
    <div className="space-y-6">
      {/* QR Code Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Anpassa Swish-betalning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Belopp (SEK)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Ange belopp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Meddelande</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Meddelande för betalningen"
              />
            </div>
          </div>
          <Button 
            onClick={generateQRCode} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Genererar QR-kod...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Uppdatera QR-kod
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <Card>
          <CardContent className="p-6">
            {loading && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    <Image 
                      src={qrCodeUrl} 
                      alt="Swish QR Code" 
                      width={192}
                      height={192}
                      className="w-48 h-48 object-contain" 
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">Så här betalar du:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Öppna Swish-appen på din telefon</li>
                        <li>Skanna QR-koden ovan</li>
                        <li>Kontrollera belopp och meddelande</li>
                        <li>Bekräfta betalningen i appen</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={openSwishApp} 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Öppna i Swish-appen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium text-lg mb-4">Betalningsinformation</h4>
            
            {fallbackInfo && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Swish-nummer:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold">{fallbackInfo.phoneNumber}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(fallbackInfo.phoneNumber)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Belopp:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold">{amount} SEK</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(amount.toString())}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-gray-600">Meddelande:</span>
                      <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                        {message}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message)}
                        className="w-full"
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Kopiera meddelande
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Observera:</p>
                      <p>
                        När du skannar QR-koden kan du ändra belopp och meddelande i Swish-appen innan du bekräftar betalningen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

