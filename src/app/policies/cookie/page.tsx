// Cookie Policy page
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookiepolicy | Din Trafikskola Hässleholm",
  description: "Information om hur vi använder cookies på dintrafikskolahlm.se",
}

export default function CookiePolicyPage() {
  return (
    <article className="prose lg:prose-lg mx-auto py-16 px-4">
      <h1 className="text-red-600">🍪 Cookiepolicy</h1>
      <p>
        Vi använder cookies för att ge dig en säker, effektiv och anpassad upplevelse när du besöker vår webbplats.
        Cookies möjliggör funktioner som inloggning, hantering av bokningar och betalningar. De används också för att
        analysera användningen av webbplatsen och förbättra våra tjänster.
      </p>
      <h2 className="text-red-500">📜 Vad är cookies och hur fungerar de?</h2>
      <p>
        Cookies är små textfiler som lagras på din enhet när du besöker vår webbplats. De används för att komma ihåg
        dina inställningar, underlätta navigering och aktivera vissa tjänster. Cookies kan till exempel spara din
        inloggning så att du slipper logga in varje gång. Cookies kan inte användas för att köra program eller sprida
        virus till din enhet.
      </p>
      <h2 className="text-red-500">🗂️ Vilka typer av cookies används?</h2>
      <ul>
        <li>
          <strong>Nödvändiga cookies:</strong> Dessa är nödvändiga för att webbplatsen och våra boknings-/betalningstjänster
          ska fungera korrekt.
        </li>
        <li>
          <strong>Analyscookies:</strong> Samlar in anonym statistik om besök och användarbeteende för att hjälpa oss
          förbättra tjänsten.
        </li>
        <li>
          <strong>Tredjepartscookies:</strong> Våra betalningspartners Klarna och Swish kan placera egna cookies för att
          möjliggöra sina tjänster och skydda mot bedrägerier.
        </li>
      </ul>
      <h2 className="text-red-500">🛠️ Hantera cookies</h2>
      <p>
        Du kan själv hantera och radera cookies i din webbläsare. Observera att vissa funktioner kan sluta fungera
        korrekt om du blockerar cookies.
      </p>
      <h2 className="text-red-500">📧 Kontakt</h2>
      <p>
        Frågor om cookies? Kontakta oss på <a href="mailto:info@dintrafikskolahlm.se" className="text-red-600 hover:underline">info@dintrafikskolahlm.se</a>.
      </p>
    </article>
  )
}

