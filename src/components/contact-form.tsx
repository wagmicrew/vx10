"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Phone } from "lucide-react"

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const [preferredContact, setPreferredContact] = useState<"email" | "phone">("email")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For static version, just show success message
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[750px] max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-none">
        {/* Glassmorphism Container */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl h-full max-h-[95vh] overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20 rounded-xl sm:rounded-2xl"></div>

          {/* Scrollable Content Container */}
          <div className="relative z-10 h-full overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8">
              {/* Header */}
              <DialogHeader className="relative mb-4 sm:mb-6">
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg pr-2">
                  Kontakta oss
                </DialogTitle>
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-3 sm:mt-4"></div>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                    Namn *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ditt fullständiga namn"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-200 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base px-3"
                  />
                </div>

                {/* Contact Method Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                    Föredragen kontaktmetod
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Email Button */}
                    <button
                      type="button"
                      onClick={() => setPreferredContact("email")}
                      className={`flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 ${
                        preferredContact === "email"
                          ? "bg-green-500/30 border-green-400/50 shadow-lg scale-105"
                          : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30"
                      }`}
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">E-post</span>
                    </button>

                    {/* Phone Button */}
                    <button
                      type="button"
                      onClick={() => setPreferredContact("phone")}
                      className={`flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 ${
                        preferredContact === "phone"
                          ? "bg-blue-500/30 border-blue-400/50 shadow-lg scale-105"
                          : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30"
                      }`}
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">Telefon</span>
                    </button>
                  </div>
                </div>

                {/* Email Field */}
                {preferredContact === "email" ? (
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                      E-postadress *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required={preferredContact === "email"}
                      placeholder="din@email.se"
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-200 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base px-3"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                      Telefonnummer *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required={preferredContact === "phone"}
                      placeholder="070-123 45 67 eller 0451-123 456"
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-200 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base px-3"
                    />
                    <p className="text-xs sm:text-sm text-white/70 drop-shadow-sm">
                      Ange svenskt mobilnummer (07X-XXXXXXX) eller fast telefon
                    </p>
                  </div>
                )}

                {/* Optional Field */}
                {preferredContact === "phone" && (
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-white/80 font-medium drop-shadow-sm text-sm sm:text-base">
                      E-postadress (valfritt)
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="din@email.se"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30 transition-all duration-200 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base px-3"
                    />
                  </div>
                )}

                {preferredContact === "email" && (
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-white/80 font-medium drop-shadow-sm text-sm sm:text-base">
                      Telefonnummer (valfritt)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="070-123 45 67"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30 transition-all duration-200 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base px-3"
                    />
                  </div>
                )}

                {/* Message Field */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                    Meddelande *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Berätta vad du är intresserad av - körkort, bedömningslektion, eller andra frågor..."
                    rows={3}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-200 rounded-lg sm:rounded-xl resize-none text-sm sm:text-base min-h-[80px] sm:min-h-[100px] p-3"
                  />
                </div>

                {/* Success Message */}
                {showSuccess && (
                  <div className="p-3 sm:p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg sm:rounded-xl">
                    <p className="text-green-100 text-xs sm:text-sm font-medium drop-shadow-sm">
                      Tack för ditt meddelande! Vi kontaktar dig inom kort.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-red-500/30 text-sm sm:text-base"
                >
                  Skicka meddelande
                </Button>
              </form>

              {/* Privacy Notice */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                <p className="text-xs sm:text-sm text-white/70 text-center drop-shadow-sm leading-relaxed">
                  Vi behandlar dina personuppgifter enligt GDPR och kontaktar dig endast angående din förfrågan.
                  <br />
                  <span className="text-white/50">Din Trafikskola Hässleholm</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
