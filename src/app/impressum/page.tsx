'use client'

import Link from 'next/link'
import AppContainer from '@/components/AppContainer'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default function Impressum() {
  return (
    <AppContainer>
      <Header currentView="dashboard" setCurrentView={() => {}} />
      <main className="p-5 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← Zurück zur App
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold mb-6">Impressum</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold mb-3">Angaben gemäß § 5 TMG</h2>
              <p className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                <strong>Hinweis:</strong> Bitte ersetzen Sie die folgenden Platzhalter mit Ihren tatsächlichen Daten.
              </p>
              <div className="mt-4">
                <p>[Ihr Name / Firmenname]</p>
                <p>[Straße und Hausnummer]</p>
                <p>[PLZ und Ort]</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Kontakt</h2>
              <p>Telefon: [Ihre Telefonnummer]</p>
              <p>E-Mail: [Ihre E-Mail-Adresse]</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                [Ihre USt-IdNr.]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Berufsbezeichnung und berufsrechtliche Regelungen</h2>
              <p>[Falls zutreffend: Ihre Berufsbezeichnung]</p>
              <p>[Zuständige Kammer]</p>
              <p>[Verliehen in]</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p>[Name des Verantwortlichen]</p>
              <p>[Adresse wie oben]</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="mt-2">
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Hinweis zur Beta-Version</h2>
              <p className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                fyniq befindet sich derzeit in der Beta-Phase. Wir arbeiten kontinuierlich an 
                Verbesserungen und freuen uns über Ihr Feedback. Bitte beachten Sie, dass sich 
                Funktionen noch ändern können.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-300">
              <h3 className="text-lg font-bold mb-3">Haftungsausschluss</h3>
              
              <h4 className="font-bold mt-4 mb-2">Haftung für Inhalte</h4>
              <p className="text-sm">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
                Tätigkeit hinweisen.
              </p>

              <h4 className="font-bold mt-4 mb-2">Haftung für Links</h4>
              <p className="text-sm">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                der Seiten verantwortlich.
              </p>

              <h4 className="font-bold mt-4 mb-2">Urheberrecht</h4>
              <p className="text-sm">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppContainer>
  )
}