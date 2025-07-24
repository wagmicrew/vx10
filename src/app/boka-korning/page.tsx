"use client"

import { useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContactForm } from "@/components/contact-form"
import { Calendar, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import BookingFlow from "@/components/booking/BookingFlow"
// import { CircularProgress } from "@mui/joy"

export default function BookingPage() {
  const { data: session, status } = useSession()
  const [showContactForm, setShowContactForm] = useState(false)
  const [showBookingSystem, setShowBookingSystem] = useState(false)

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4 mx-auto"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    )
  }

  // If user wants to access booking system
  if (showBookingSystem) {
    return (
      <div className="min-h-screen bg-white">
        <Suspense fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4 mx-auto"></div>
              <p className="text-gray-600">Laddar bokningssystem...</p>
            </div>
          </div>
        }>
          <BookingFlow />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Boka körning</h1>
              <p className="text-xl text-gray-600">Boka din körlektion enkelt online</p>
            </div>

            {/* Booking System Available */}
            <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Bokningssystem nu tillgängligt!</h2>
                <p className="text-gray-700 mb-6">Nu kan du enkelt boka dina körlektioner online:</p>
                <div className="text-left space-y-2 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">Välj lektion och växellådstyp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">Se tillgängliga tider i realtid</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">Betala direkt med Qliro eller Swish</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">Få bekräftelse via e-post</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowBookingSystem(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 w-full"
                >
                  Boka nu <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>

            {/* Alternative Contact Options */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Eller kontakta oss direkt</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <Phone className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">Ring oss</p>
                  <a href="tel:0760389192" className="text-red-600 hover:text-red-700 text-lg font-semibold">
                    0760-389192
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Måndag - Fredag: 08:00 - 18:00</p>
                </div>

                <div className="text-center border-t pt-4">
                  <Mail className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800 mb-3">Skicka meddelande</p>
                  <Button onClick={() => setShowContactForm(true)} className="bg-red-600 hover:bg-red-700 w-full">
                    Kontakta oss
                  </Button>
                </div>
              </div>
            </Card>

            {/* Special Offer */}
            <Card className="p-6 mt-6 bg-yellow-50 border-yellow-200">
              <div className="text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-gray-800 mb-2">Kampanj - Bedömningslektion</h4>
                <p className="text-2xl font-bold text-red-600 mb-2">500 kr</p>
                <p className="text-sm text-gray-600">Ordinarie pris: 580 kr</p>
                <p className="text-sm text-gray-700 mt-2">Perfekt för att komma igång med din körkortsutbildning!</p>
              </div>
            </Card>

            {/* Information */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Bokningssystemet är tillgängligt dygnet runt, 7 dagar i veckan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Contact Form Modal */}
      <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
    </div>
  )
}
