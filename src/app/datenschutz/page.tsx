'use client'

import Link from 'next/link'
import AppContainer from '@/components/AppContainer'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default function Datenschutz() {
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
          
          <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="mt-2">
                fyniq Development Team<br />
                Musterstraße 123<br />
                12345 Musterstadt<br />
                datenschutz@fyniq.app<br />
                +49 (0) 123 456789
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Datenverarbeitung bei fyniq</h2>
              <p>
                fyniq ist eine reine Browser-Anwendung, die ausschließlich lokal in Ihrem Browser läuft. 
                Alle Ihre Daten werden ausschließlich in Ihrem Browser gespeichert und nicht an unsere 
                Server oder Dritte übertragen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. localStorage und Cookies</h2>
              <p>
                Wir nutzen die localStorage-Technologie Ihres Browsers, um folgende Daten lokal zu speichern:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Rechnungsdaten (Rechnungsnummer, Beträge, Datum)</li>
                <li>Kundendaten (Name, Adresse, Kontaktdaten)</li>
                <li>Ihre Profileinstellungen</li>
                <li>App-Einstellungen und Präferenzen</li>
                <li>Cookie-Zustimmung</li>
              </ul>
              <p className="mt-3">
                Diese Daten verbleiben ausschließlich auf Ihrem Gerät und werden zu keinem Zeitpunkt 
                an unsere Server übertragen. Sie haben jederzeit die volle Kontrolle über diese Daten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Datenverschlüsselung und Sicherheit</h2>
              <p>
                Zum Schutz Ihrer sensiblen Daten implementiert fyniq modernste Sicherheitsmaßnahmen:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>AES-256 Client-seitige Verschlüsselung aller sensiblen Daten</li>
                <li>Automatische Datenintegritätsprüfung</li>
                <li>Sichere Schlüsselverwaltung im Browser</li>
                <li>Validierung und Bereinigung aller Eingaben (XSS-Schutz)</li>
                <li>Audit-Trail für alle Datenoperationen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Hosting</h2>
              <p>
                Unsere Website wird in der Europäischen Union gehostet. Der Hosting-Anbieter 
                verarbeitet nur die für den Betrieb der Website notwendigen technischen Daten 
                (IP-Adresse, Zugriffszeit, abgerufene Seiten).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Ihre Rechte</h2>
              <p>
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Auskunftsrecht:</strong> Sie können jederzeit alle in Ihrem Browser gespeicherten Daten einsehen</li>
                <li><strong>Berichtigungsrecht:</strong> Sie können Ihre Daten jederzeit selbst berichtigen</li>
                <li><strong>Löschungsrecht:</strong> Sie können alle Daten jederzeit über die Cookie-Einstellungen löschen</li>
                <li><strong>Datenportabilität:</strong> Sie können Ihre Daten jederzeit exportieren</li>
                <li><strong>Widerspruchsrecht:</strong> Sie können der Datenverarbeitung jederzeit widersprechen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Datenlöschung</h2>
              <p>
                Sie können alle in Ihrem Browser gespeicherten Daten jederzeit selbst löschen:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Über die Cookie-Einstellungen dieser Website</li>
                <li>Über die Browser-Einstellungen (Browserdaten löschen)</li>
                <li>Über die Funktion &quot;Alle Daten löschen&quot; in der App</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Beschwerderecht</h2>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, 
                wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten 
                gegen die DSGVO verstößt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Änderungen dieser Datenschutzerklärung</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte 
                Rechtslagen oder bei Änderungen des Dienstes anzupassen. Die neue Datenschutzerklärung 
                gilt dann bei Ihrem nächsten Besuch.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-300">
              <p className="text-sm text-gray-600">
                Stand: Januar 2025
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppContainer>
  )
}