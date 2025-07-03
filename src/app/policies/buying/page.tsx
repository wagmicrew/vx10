// Buying Terms page
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Köpvillkor | Din Trafikskola Hässleholm",
  description: "Villkor för köp via webbplatsen och på plats",
}

export default function BuyingPolicyPage() {
  return (
    <article className="prose lg:prose-lg mx-auto py-16 px-4">
      <h1 className="text-red-600">📝 Köpvillkor</h1>
      <h2 className="text-red-500">📃 Allmänt om köpvillkoren</h2>
      <p>
        Dessa köpvillkor gäller för köp av körlektioner, kurspaket, handledarkurser och tillbehör på dintrafikskolahlm.se
        och på plats hos Din Trafikskola Hässleholm AB.
      </p>
      <h2 className="text-red-500">🖊️ Hur bokning och avtal sker</h2>
      <p>
        Genom att boka eller köpa via webbplatsen, telefon eller på plats bekräftar du våra villkor och samtycker enligt
        GDPR till behandling av dina personuppgifter.
      </p>
      <h2 className="text-red-500">💰 Priser och betalningsmetoder</h2>
      <ul>
        <li>Alla priser anges i SEK inklusive moms.</li>
        <li>Betalning sker via Klarna eller Swish.</li>
        <li>Klarna och Swish ansvarar för betalningens säkerhet.</li>
      </ul>
      <h2 className="text-red-500">🕒 Ångerrätt</h2>
      <p>
        Som privatkund har du 14 dagars ångerrätt enligt distansavtalslagen, förutsatt att tjänsten inte påbörjats inom
        ångerfristen.
      </p>
      <h2 className="text-red-500">🔄 Ombokning och avbokning</h2>
      <p>Ombokning eller avbokning ska ske minst 24 timmar före bokad tid. Senare avbokningar faktureras fullt.</p>
      <h2 className="text-red-500">💸 Återbetalning</h2>
      <p>
        Vid godkänd ångerrätt sker återbetalning inom 14 dagar via samma betalningsmetod. Eventuella tjänsteavgifter som
        redan debiterats återbetalas inte.
      </p>
      <h2 className="text-red-500">🚫 Reklamation</h2>
      <p>
        Kontakta oss vid reklamation. Vid tvist följs rekommendationer från Allmänna reklamationsnämnden (ARN).
      </p>
      <h2 className="text-red-500">💬 Kontakt</h2>
      <p>
        Din Trafikskola Hässleholm AB – Väpnaregatan 2, 281 50 Hässleholm – Tel 0702-044955 –
        <a href="mailto:info@dintrafikskolahlm.se" className="text-red-600 hover:underline">info@dintrafikskolahlm.se</a>
      </p>
    </article>
  )
}

