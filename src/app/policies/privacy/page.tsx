// Privacy Policy page
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Integritetspolicy | Din Trafikskola Hässleholm",
  description: "Hur vi behandlar personuppgifter enligt GDPR",
}

export default function PrivacyPolicyPage() {
  return (
    <article className="prose lg:prose-lg mx-auto py-16 px-4">
      <h1 className="text-red-600">🔒 Integritetspolicy</h1>
      <h2 className="text-red-500">📜 Policyansvar och tillämpningsområde</h2>
      <p>
        Din Trafikskola Hässleholm AB behandlar personuppgifter enligt Dataskyddsförordningen (GDPR) och svensk lag.
        Denna policy omfattar alla som kontaktar oss, bokar eller köper våra tjänster, samt använder vår webbplats.
      </p>
      <h2 className="text-red-500">📋 Vilka personuppgifter samlas in?</h2>
      <ul>
        <li>Namn</li>
        <li>Personnummer</li>
        <li>Adress</li>
        <li>Kontaktuppgifter (telefon, e-post)</li>
        <li>Bokningsinformation, utbildningsresultat</li>
        <li>Betalningsinformation (Klarna, Swish)</li>
      </ul>
      <h2 className="text-red-500">🔍 Hur används personuppgifterna?</h2>
      <ul>
        <li>Hantering av bokningar, kurser och betalningar</li>
        <li>Uppföljning av utbildning i elev- och lärarportal</li>
        <li>Lagkrav & myndighetsrapportering</li>
        <li>Kundtjänstärenden</li>
      </ul>
      <h2 className="text-red-500">🔒 Lagring och skydd</h2>
      <p>
        Personuppgifter lagras krypterat och är endast åtkomliga för behörig personal. Vi sparar uppgifter så länge det
        krävs enligt lag eller ändamål.
      </p>
      <h2 className="text-red-500">🔄 Delning med tredje part</h2>
      <p>
        Uppgifter delas endast med våra betalningspartners (Klarna, Swish) eller när det krävs enligt lag. Aldrig för
        marknadsföring.
      </p>
      <h2 className="text-red-500">✋ Dina rättigheter</h2>
      <ul>
        <li>Begära registerutdrag</li>
        <li>Rättelse eller radering</li>
        <li>Dra tillbaka samtycke</li>
        <li>Klagomål till Integritetsskyddsmyndigheten (IMY)</li>
      </ul>
      <h2 className="text-red-500">💬 Kontakt</h2>
      <p>Frågor? Mejla <a href="mailto:info@dintrafikskolahlm.se" className="text-red-600 hover:underline">info@dintrafikskolahlm.se</a></p>
    </article>
  )
}

