"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, Mail, Car, Building2, Users, Lightbulb, Sofa, Monitor } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PremisesPage() {
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <main className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Våra Lokaler</h1>
              <p className="text-xl text-gray-600">Besök oss på Östergatan i centrala Hässleholm</p>
            </div>

            {/* Welcome Message */}
            <div className="mb-12">
              <Card className="p-8 bg-gradient-to-r from-red-50 to-yellow-50 border-red-200">
                <div className="text-center">
                  <Image
                    src="/images/welcome-sign.jpg"
                    alt="Välkomstskylt - Här börjar din resa mot frihet"
                    className="rounded-lg shadow-md max-w-full h-auto mx-auto mb-6"
                    width={600}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 600px"
                    priority
                  />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    &ldquo;Här börjar din resa mot frihet - Varmt välkommen!&rdquo;
                  </h2>
                  <p className="text-lg text-gray-700">
                    Detta är budskapet som möter dig när du kliver in i våra moderna och välkomnande lokaler på
                    Östergatan i Hässleholm.
                  </p>
                </div>
              </Card>
            </div>

            {/* Image Gallery */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Reception Area */}
              <Card className="overflow-hidden">
                <Image
                  src="/images/office-reception.jpg"
                  alt="Moderna och välkomnande reception med elegant inredning"
                  className="w-full h-64 object-cover"
                  width={400}
                  height={256}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-red-600 mb-3">Modern reception och väntområde</h3>
                  <p className="text-gray-700 mb-4">
                    Vår reception präglas av modern skandinavisk design med varma träelement och professionell
                    belysning. Det öppna och luftiga rummet skapar en välkomnande atmosfär där du direkt känner dig
                    hemma.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Building2 className="w-3 h-3 mr-1" />
                      Modern design
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Professionell belysning
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Waiting Area */}
              <Card className="overflow-hidden">
                <Image
                  src="/images/waiting-area.jpg"
                  alt="Bekvämt väntområde med moderna fåtöljer och gula accentkuddar"
                  className="w-full h-64 object-cover"
                  width={400}
                  height={256}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-red-600 mb-3">Komfortabelt väntområde</h3>
                  <p className="text-gray-700 mb-4">
                    Vårt väntområde är inrett med bekväma designfåtöljer i grått med gula accentkuddar som speglar våra
                    varma färger. Den runda mattan och de små sidoborden skapar en hemkänsla där du kan koppla av innan
                    din lektion.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Sofa className="w-3 h-3 mr-1" />
                      Bekväma möbler
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Users className="w-3 h-3 mr-1" />
                      Avslappnad miljö
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Conference Room */}
              <Card className="overflow-hidden lg:col-span-2">
                <Image
                  src="/images/conference-room.jpg"
                  alt="Professionellt konferensrum för teoriundervisning och möten"
                  className="w-full h-64 object-cover"
                  width={800}
                  height={256}
                  sizes="(max-width: 1024px) 100vw, 100vw"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-red-600 mb-3">Konferensrum för teoriundervisning</h3>
                  <p className="text-gray-700 mb-4">
                    Vårt konferensrum är perfekt utformat för teoriundervisning och personliga konsultationer. Den
                    fräscha och funktionella miljön med bekväma stolar runt ett modernt konferensbord skapar en optimal
                    lärmiljö. Vi erbjuder kaffe och te för att göra din teoriundervisning så bekväm som möjligt. Rummet
                    har även utmärkt akustik för tydlig kommunikation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Users className="w-3 h-3 mr-1" />
                      Teoriundervisning
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Users className="w-3 h-3 mr-1" />
                      Kaffe & Te
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Fräsch miljö
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Location Info */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Centralt beläget</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Adress</p>
                      <p className="text-gray-700">Östergatan 3a, 281 30 Hässleholm</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Car className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Parkering</p>
                      <p className="text-gray-700">Närliggande parkeringsplatser på Östergatan</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Building2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Läge</p>
                      <p className="text-gray-700">Mitt i centrala Hässleholm, nära kollektivtrafik och service</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Öppettider</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Kontorstider:</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Onsdag:</span>
                        <span className="text-gray-700">16:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fredag:</span>
                        <span className="text-gray-700">14:00 - 16:00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Körlektioner:</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Måndag - Fredag:</span>
                        <span className="text-gray-700">08:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Lördag:</span>
                        <span className="text-gray-700">09:00 - 15:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>*</strong> Flexibla tider efter överenskommelse
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Facilities */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Våra faciliteter</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                  <Car className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Moderna fordon</h3>
                  <p className="text-gray-600">Välunderhållna bilar med senaste säkerhetsutrustningen</p>
                </Card>

                <Card className="p-6 text-center">
                  <Building2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Bekväma lokaler</h3>
                  <p className="text-gray-600">Moderna och välkomnande lokaler för teori och administration</p>
                </Card>

                <Card className="p-6 text-center">
                  <Monitor className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Teoriundervisning</h3>
                  <p className="text-gray-600">Dedikerat utrymme för teoriundervisning med kaffe och te</p>
                </Card>

                <Card className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Perfekt läge</h3>
                  <p className="text-gray-600">Centralt beläget med god tillgänglighet</p>
                </Card>
              </div>
            </div>

            {/* Storefront Image - Responsive Two Column Layout */}
            <div className="mb-16">
              <Card className="overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image Column */}
                  <div className="relative">
                    <Image
                      src="/images/storefront.jpg"
                      alt="Din Trafikskola Hässleholm butik på Östergatan 3a i Hässleholm"
                      className="w-full h-full object-cover min-h-[300px] lg:min-h-[400px]"
                      width={600}
                      height={400}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  
                  {/* Content Column */}
                  <CardContent className="p-6 lg:p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-red-600 mb-4">Vår butik på Östergatan</h3>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        Våra lokaler på Östergatan 3a är lätt att hitta och välkomnar dig med professionell skyltning. Den
                        centrala platsen gör det enkelt att besöka oss oavsett om du kommer med bil, cykel eller
                        kollektivtrafik.
                      </p>
                      
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <h4 className="font-semibold text-red-800 mb-2">📍 Lätt att hitta:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Mitt i centrala Hässleholm</li>
                          <li>• Nära kollektivtrafik och service</li>
                          <li>• Närliggande parkeringsplatser</li>
                          <li>• Tillgängligt även för rullstol</li>
                        </ul>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <MapPin className="w-3 h-3 mr-1" />
                          Centralt läge
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Car className="w-3 h-3 mr-1" />
                          Parkering
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Building2 className="w-3 h-3 mr-1" />
                          Tillgängligt
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Contact and Visit */}
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Besök oss eller kontakta oss</h2>
                <p className="text-gray-600">
                  Välkommen att besöka våra lokaler eller kontakta oss för mer information om våra tjänster.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Phone className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">Telefon</p>
                  <a href="tel:0760389192" className="text-red-600 hover:text-red-700">
                    0760-389192
                  </a>
                </div>
                <div className="text-center">
                  <Mail className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">E-post</p>
                  <a href="mailto:info@dintrafikskolahlm.se" className="text-red-600 hover:text-red-700">
                    info@dintrafikskolahlm.se
                  </a>
                </div>
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">Adress</p>
                  <p className="text-gray-700">
                    Östergatan 3a
                    <br />
                    281 30 Hässleholm
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setShowContactForm(true)} className="bg-red-600 hover:bg-red-700">
                  Kontakta oss
                </Button>
                <Link href="/boka-korning">
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full sm:w-auto"
                  >
                    Boka besök
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contact Form Modal */}
      <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
    </div>
  )
}

