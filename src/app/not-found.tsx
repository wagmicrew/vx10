"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Phone, Mail, MapPin, ArrowLeft, Car, User, Calendar, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-black text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo with custom text */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <Image 
              src="/images/din-logo.png" 
              alt="Din Trafikskola Hässleholm" 
              className="h-12 sm:h-14 md:h-16 w-auto" 
              width={64}
              height={64}
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
            />
            <div className="flex flex-col">
              <div
                className="text-red-600 text-xl sm:text-2xl md:text-3xl font-normal leading-tight"
                style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}
              >
                Trafikskola
              </div>
              <div
                className="text-red-600 text-sm sm:text-base md:text-lg font-normal leading-tight ml-6 sm:ml-8 md:ml-10 italic"
                style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}
              >
                Hässleholm
              </div>
            </div>
          </Link>

          {/* Contact info - responsive visibility */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span>0760-389192</span>
            </div>
          </div>

          {/* Mobile contact */}
          <div className="flex lg:hidden items-center">
            <a
              href="tel:0760389192"
              className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">0760-389192</span>
            </a>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <main className="container mx-auto px-6 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto">
          {/* 404 Hero Section */}
          <div className="text-center mb-12">
            {/* Fun 404 Animation */}
            <div className="relative mb-8">
              <div className="text-6xl sm:text-8xl md:text-9xl font-bold text-red-600/20 mb-4 select-none">4🚗4</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-lg animate-bounce">
                  <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              Oops! Fel väg!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Det verkar som att du har kört vilse på vår hemsida! 🗺️ <br />
              Ingen fara - även de bästa förarna behöver ibland hjälp med navigering.
            </p>

            {/* Fun driving school themed message */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 sm:p-6 rounded-lg max-w-2xl mx-auto mb-8">
              <div className="flex items-start space-x-3">
                <Car className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-yellow-800 mb-2">Trafikskole-tips:</h3>
                  <p className="text-yellow-700 text-sm sm:text-base">
                    Precis som när du kör bil - om du kör fel, stanna lugnt, orientera dig och välj rätt väg framåt. Vi
                    hjälper dig hitta rätt!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardContent className="p-4 sm:p-6 text-center">
                <Home className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Startsida</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Tillbaka till hemmaplan</p>
                <Link href="/">
                  <Button className="bg-red-600 hover:bg-red-700 w-full">Hem</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardContent className="p-4 sm:p-6 text-center">
                <Car className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Våra Tjänster</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Se vad vi erbjuder</p>
                <Link href="/vara-tjanster">
                  <Button className="bg-red-600 hover:bg-red-700 w-full">Tjänster</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardContent className="p-4 sm:p-6 text-center">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Boka Körning</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Starta din resa</p>
                <Link href="/boka-korning">
                  <Button className="bg-red-600 hover:bg-red-700 w-full">Boka</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardContent className="p-4 sm:p-6 text-center">
                <Phone className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Ring Oss</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Direkt kontakt</p>
                <a href="tel:0760389192">
                  <Button className="bg-red-600 hover:bg-red-700 w-full">0760-389192</Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Information Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* About Us */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="w-6 h-6 text-red-600 mr-3" />
                  Om Din Trafikskola Hässleholm
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    Vi är Hässleholms nyaste trafikskola med fokus på kvalitet och personlig service. Vår erfarna
                    instruktör, som tidigare arbetat som trafikinspektör, ger dig den bästa möjliga utbildningen.
                  </p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Våra specialiteter:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>B-körkort (personbil) - komplett utbildning</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>A-körkort (motorcykel) - säker körning</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>Bedömningslektion - endast 500 kr</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>Taxiförarlegitimation - yrkesutbildning</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 text-red-600 mr-3" />
                  Kontakta Oss
                </h2>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-500 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Besöksadress</p>
                        <p className="text-gray-600">Östergatan 3a</p>
                        <p className="text-gray-600">281 30 Hässleholm</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-semibold text-gray-800">Telefon</p>
                        <a href="tel:0760389192" className="text-red-600 hover:text-red-700 font-semibold">
                          0760-389192
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-semibold text-gray-800">E-post</p>
                        <a href="mailto:info@dintrafikskolahlm.se" className="text-red-600 hover:text-red-700">
                          info@dintrafikskolahlm.se
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Öppettider</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <p className="font-medium">Kontorstider:</p>
                        <p>Onsdag: 16:00 - 18:00</p>
                        <p>Fredag: 14:00 - 16:00</p>
                      </div>
                      <div className="mt-3">
                        <p className="font-medium">Körlektioner:</p>
                        <p>Måndag - Fredag: 08:00 - 18:00</p>
                        <p>Lördag: 09:00 - 15:00</p>
                        <p className="text-yellow-600 font-medium mt-1">* Flexibla tider efter överenskommelse</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fun fact section */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6 sm:p-8 mb-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Visste du att...</h2>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold mb-2">500kr</div>
                  <p className="text-red-100">Bedömningslektion med erfaren före detta trafikinspektör</p>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold mb-2">100%</div>
                  <p className="text-red-100">Fokus på din säkerhet och utveckling som förare</p>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
                  <p className="text-red-100">Du kan kontakta oss när som helst via telefon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Gå tillbaka
            </Button>

            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
                <Home className="w-4 h-4 mr-2" />
                Till startsidan
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Din Trafikskola Hässleholm</h3>
              <p className="text-gray-300 mb-4">
                Hässleholms nyaste trafikskola med fokus på kvalitet och personlig service.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontaktinformation</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Östergatan 3a, 281 30 Hässleholm</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>0760-389192</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@dintrafikskolahlm.se</span>
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Öppettider</h4>
              <div className="space-y-2 text-gray-300">
                <p>Kontorstider:</p>
                <p>Onsdag: 16:00 - 18:00</p>
                <p>Fredag: 14:00 - 16:00</p>
                <p className="mt-2">Körlektioner:</p>
                <p>Måndag - Fredag: 08:00 - 18:00</p>
                <p>Lördag: 09:00 - 15:00</p>
                <p className="text-sm text-yellow-400 mt-2">* Flexibla tider efter överenskommelse</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Din Trafikskola Hässleholm. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

