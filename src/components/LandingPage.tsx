'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.slide-up')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])


  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div className="landing-page">
      <style jsx global>{`
        body:has(.landing-page) {
          overflow: auto !important;
          height: auto !important;
        }
        
        .landing-page {
          margin: 40px;
          border: 3px solid black;
          border-radius: 10px;
          background-color: #ffffff;
          font-family: 'Space Grotesk', sans-serif;
        }

        .landing-page .slide-up {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s ease-out;
        }

        .landing-page .slide-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="flex items-center gap-3 p-8 text-2xl font-bold animate-[fadeIn_1s_ease-in]">
        <Image src="/fyniq-logo.png" alt="fyniq Logo" width={32} height={32} />
        <span>fyniq</span>
      </header>

      <section className="text-center px-5 py-40 animate-[fadeInUp_1s_ease-in]">
        <h1 className="text-5xl md:text-[56px] font-bold mb-3">
          Rechnungen schreiben und bezahlt werden
        </h1>
        <p className="text-2xl md:text-[28px] mb-12">ganz ohne Bürokratie</p>
        
        <div className="mb-10">
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 bg-[#F5EEA8] text-black font-['Courier_New'] text-base border-3 border-black rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Jetzt Beta testen
          </button>
        </div>

        <p className="text-xl max-w-[640px] mx-auto text-[#6B7280]">
          Für Freiberufler:innen, die keine Lust auf Buchhaltungschaos haben. 
          Erstelle Rechnungen, versende Zahlungslinks und automatisiere Mahnungen – mit wenigen Klicks.
        </p>
        
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Beta-Version – Kostenlos testen
        </div>
      </section>

      <section className="px-5 py-[120px] text-center slide-up">
        <h2 className="text-[40px] font-bold mb-16">
          Nie wieder Rechnungen hinterherrennen.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1100px] mx-auto">
          <div className="bg-[#F5EEA8] text-black rounded-[20px] p-12 text-left border-3 border-black slide-up">
            <h3 className="text-[22px] font-bold mb-4">Bezahlung per Link</h3>
            <p className="text-base">
              Füge deiner Rechnung einen Zahlungslink hinzu – deine Kund:innen können 
              per Kreditkarte, Lastschrift oder anderen Methoden direkt online bezahlen.
            </p>
          </div>
          <div className="bg-[#F5EEA8] text-black rounded-[20px] p-12 text-left border-3 border-black slide-up">
            <h3 className="text-[22px] font-bold mb-4">Automatische Erinnerungen</h3>
            <p className="text-base">
              Wenn jemand nicht rechtzeitig zahlt, verschickt das System automatisch 
              eine freundliche Erinnerung. Du musst dich um nichts kümmern.
            </p>
          </div>
          <div className="bg-[#F5EEA8] text-black rounded-[20px] p-12 text-left border-3 border-black slide-up">
            <h3 className="text-[22px] font-bold mb-4">Export für die Steuer</h3>
            <p className="text-base">
              Mit einem Klick exportierst du deine Einnahmen als PDF oder CSV – 
              perfekt für die Steuer oder deinen Steuerberater. Spart Zeit und vermeidet Fehler.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-[120px] text-center bg-[#F9FAFB] slide-up">
        <h2 className="text-[40px] font-bold mb-16">Für wen ist fyniq gemacht?</h2>
        <div className="max-w-[800px] mx-auto text-left">
          <div className="border-b-2 border-[#E5E7EB] py-8">
            <h3 className="text-[22px] font-bold mb-2">Kreative Freelancer:innen</h3>
            <p className="text-base text-[#6B7280]">
              Für Designer:innen, Fotograf:innen, Texter:innen und alle, die mit 
              Kreativität Geld verdienen – ohne Lust auf komplizierte Tools.
            </p>
          </div>
          <div className="border-b-2 border-[#E5E7EB] py-8">
            <h3 className="text-[22px] font-bold mb-2">Dienstleister:innen</h3>
            <p className="text-base text-[#6B7280]">
              Ideal für Handwerker:innen, Friseur:innen, mobile Services oder 
              kleinere Betriebe, die schnell und einfach Rechnungen schreiben wollen.
            </p>
          </div>
          <div className="py-8">
            <h3 className="text-[22px] font-bold mb-2">Coaches & Berater:innen</h3>
            <p className="text-base text-[#6B7280]">
              Für alle, die regelmäßig mit Kund:innen abrechnen, Beratung anbieten 
              oder wiederkehrende Leistungen fakturieren müssen.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-[120px] text-center slide-up">
        <h2 className="text-[40px] font-bold mb-16">Häufige Fragen</h2>
        <div className="max-w-[800px] mx-auto text-left">
          {[
            {
              question: 'Ist das Tool revisionssicher?',
              answer: 'Aktuell richtet sich fyniq an Kleinunternehmer:innen mit einfachen Anforderungen. Für viele reicht die Dokumentation + Export völlig aus – ohne volle Buchhaltungssoftware.'
            },
            {
              question: 'Kann ich E-Rechnungen erstellen?',
              answer: 'Noch nicht, aber es ist geplant. Aktuell liegt der Fokus auf einfachen Rechnungen mit Zahlungslink und Mahnung – die E-Rechnungsfunktion ist in Vorbereitung.'
            },
            {
              question: 'Was kostet das Tool?',
              answer: 'fyniq ist aktuell kostenlos nutzbar, da es sich noch in der Beta befindet. Später wird es ein einfaches, faires Preismodell geben – ohne Abo-Fallen.'
            },
            {
              question: 'Für wen ist das gedacht?',
              answer: 'Für alle, die regelmäßig Rechnungen schreiben, aber keine Lust auf Buchhaltungsstress haben – Freelancer, Coaches, kleine Dienstleister:innen & Co.'
            }
          ].map((item, index) => (
            <div key={index} className="border-3 border-black rounded-[10px] mb-6">
              <div
                className="bg-[#F5EEA8] p-5 px-6 cursor-pointer text-lg font-semibold rounded-[10px] flex justify-between items-center"
                onClick={() => toggleAccordion(index)}
              >
                {item.question}
                <span className="text-2xl">{openAccordion === index ? '−' : '+'}</span>
              </div>
              {openAccordion === index && (
                <div className="p-6 text-base">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="rounded-b-[10px] border-t-3 border-black bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © 2024 fyniq Beta · Railway EU-Hosting
          </div>
          <nav className="flex items-center gap-6">
            <a 
              href="/datenschutz" 
              className="text-sm text-gray-600 hover:text-black transition-colors underline"
            >
              Datenschutz
            </a>
            <a 
              href="/impressum" 
              className="text-sm text-gray-600 hover:text-black transition-colors underline"
            >
              Impressum
            </a>
            <a 
              href="/cookies" 
              className="text-sm text-gray-600 hover:text-black transition-colors underline"
            >
              Cookie-Einstellungen
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}