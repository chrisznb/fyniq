'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { 
  User, 
  Users, 
  FileText, 
  BarChart3, 
  Rocket, 
  Building2, 
  Plus, 
  Zap, 
  TrendingUp, 
  MessageCircle, 
  MapPin, 
  Lightbulb 
} from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface OnboardingStep {
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  isLastStep?: boolean
}

// Simple SVG Icon for Fyniq logo (keeping this as it's custom)
const FyniqIcon = () => (
  <svg width="24" height="24" viewBox="0 0 296 369" fill="none">
    <g transform="translate(0,369) scale(0.1,-0.1)" fill="currentColor">
      <path d="M147 3666 c-60 -30 -93 -60 -120 -111 l-22 -40 -3 -1665 -2 -1664 25
      -53 c29 -58 87 -108 146 -123 24 -7 495 -9 1321 -8 1229 3 1284 4 1318 22 49
      26 98 74 123 121 l22 40 3 1378 c1 958 -1 1392 -8 1420 -10 36 -54 84 -329
      359 -299 298 -321 317 -371 332 -48 14 -166 16 -1055 16 l-1000 -1 -48 -23z
      m2033 -396 c0 -262 4 -288 55 -328 27 -21 36 -22 286 -22 l259 0 0 -1341 0
      -1341 -34 -34 -34 -34 -1242 0 -1242 0 -29 29 -29 29 0 1610 0 1610 26 31 26
      31 979 0 979 0 0 -240z"/>
      <path d="M525 3221 c-56 -23 -54 -12 -57 -465 l-2 -418 32 -29 32 -29 376 0
      376 0 29 29 29 29 0 407 c0 442 -2 455 -56 475 -31 12 -731 12 -759 1z m633
      -468 l2 -293 -255 0 -255 0 0 295 0 295 253 -2 252 -3 3 -292z"/>
      <path d="M1612 2814 c-38 -27 -55 -70 -42 -110 20 -61 32 -64 253 -64 200 0
      227 4 254 39 7 9 13 33 13 54 0 29 -7 45 -29 68 l-29 29 -199 0 c-164 0 -202
      -3 -221 -16z"/>
      <path d="M1612 2450 c-28 -12 -55 -71 -46 -105 3 -14 18 -34 31 -45 25 -19 42
      -20 440 -20 l414 0 24 25 c31 30 34 92 6 126 l-19 24 -414 2 c-239 1 -423 -2
      -436 -7z"/>
      <path d="M505 2048 c-57 -33 -60 -113 -6 -155 12 -10 237 -12 974 -13 822 0
      962 2 986 15 32 16 41 33 41 78 -1 36 -15 58 -47 75 -31 17 -1919 16 -1948 0z"/>
      <path d="M1407 1654 c-4 -4 -7 -37 -7 -74 l0 -67 -57 -12 c-83 -16 -137 -46
      -188 -103 -100 -111 -96 -276 9 -377 39 -38 141 -88 195 -97 l41 -7 0 -138 0
      -139 -27 6 c-71 16 -133 80 -133 135 l0 29 -78 0 c-102 0 -117 -11 -109 -73
      19 -135 131 -240 286 -269 l61 -12 0 -52 c0 -68 11 -76 102 -72 l73 3 3 61 3
      62 47 6 c95 14 144 37 203 95 172 172 79 431 -176 492 -27 6 -56 13 -62 15
      -19 5 -18 254 1 254 25 0 67 -42 89 -89 l22 -46 90 0 90 0 3 35 c5 52 -13 102
      -58 159 -47 59 -102 93 -187 117 l-62 17 -3 71 -3 71 -80 3 c-45 1 -84 0 -88
      -4z m-7 -429 c0 -103 -1 -105 -23 -105 -49 0 -96 49 -97 100 0 44 23 78 64 96
      55 24 56 23 56 -91z m240 -361 c51 -21 80 -61 80 -111 0 -48 -20 -78 -70 -103
      -70 -36 -70 -35 -70 105 0 75 4 125 10 125 5 0 28 -7 50 -16z"/>
    </g>
  </svg>
)

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      title: "Willkommen bei fyniq!",
      icon: <FyniqIcon />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--accent)] rounded-lg border-2 border-black">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            <span className="font-semibold">Beta-Version - erstelle Rechnungen in Sekunden</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
            <MessageCircle className="w-4 h-4" />
            <span className="text-gray-700">Dein Feedback hilft bei der Weiterentwicklung</span>
          </div>
          <p className="text-center text-gray-600 text-sm mt-4">
            Lass uns gemeinsam einen kurzen Rundgang durch fyniq machen!
          </p>
        </div>
      )
    },
    {
      title: "Account - Deine Firmendaten",
      icon: <User className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Firmendaten eingeben
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Hier hinterlegst du deine Unternehmensdaten, die automatisch auf allen Rechnungen erscheinen.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Firmenname und Adresse</li>
              <li>• Steuer-ID / USt-ID</li>
              <li>• Bankverbindung für Zahlungen</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            Zu finden im &quot;Account&quot; Tab
          </p>
        </div>
      )
    },
    {
      title: "Kunden verwalten",
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neue Kunden hinzufügen
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Lege deine Kunden einmal an und wähle sie dann einfach beim Rechnung erstellen aus.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Klick auf &quot;Neuer Kunde&quot;</li>
              <li>• Name, Firma und Adresse eingeben</li>
              <li>• Optional: USt-ID für B2B Kunden</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            Zu finden im &quot;Kunden&quot; Tab
          </p>
        </div>
      )
    },
    {
      title: "Rechnungen erstellen",
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-[var(--accent)] p-4 rounded-lg border-2 border-black">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Schnell zur Rechnung
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              In wenigen Sekunden von der Idee zur fertigen Rechnung mit Zahlungslink.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Klick auf &quot;Neue Rechnung&quot;</li>
              <li>• Kunde auswählen oder neu anlegen</li>
              <li>• Leistungen und Beträge eingeben</li>
              <li>• PDF generieren oder versenden</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            Zu finden im &quot;Rechnungen&quot; Tab
          </p>
        </div>
      )
    },
    {
      title: "Dashboard - Dein Überblick",
      icon: <BarChart3 className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Alles auf einen Blick
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Hier siehst du deine wichtigsten Zahlen und neuesten Rechnungen.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Offene und bezahlte Rechnungen</li>
              <li>• Monatliche Übersicht</li>
              <li>• Schnellzugriff auf letzte Aktivitäten</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            Zu finden im &quot;Dashboard&quot; Tab
          </p>
        </div>
      )
    },
    {
      title: "Los geht's!",
      icon: <Rocket className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-[var(--accent)] p-4 rounded-lg border-2 border-black text-center">
            <h4 className="font-bold mb-3">Du bist startklar!</h4>
            <p className="text-sm text-gray-700 mb-4">
              Beginne am besten mit dem <strong>Account Tab</strong> um deine Firmendaten einzugeben, 
              dann füge einen Kunden hinzu und erstelle deine erste Rechnung.
            </p>
            <div className="bg-white/50 p-3 rounded border border-black/20">
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Lightbulb className="w-3 h-3" />
                <strong>Tipp:</strong> Alle Daten werden lokal in deinem Browser gespeichert - 
                keine Anmeldung nötig!
              </p>
            </div>
          </div>
        </div>
      ),
      isLastStep: true
    }
  ], [])

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, onboardingSteps.length])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleFinish = useCallback(() => {
    // Setze localStorage-Flag dass Onboarding gesehen wurde
    localStorage.setItem('hasSeenOnboarding', 'true')
    onClose()
  }, [onClose])

  const handleSkip = useCallback(() => {
    // Setze localStorage-Flag auch beim Überspringen
    localStorage.setItem('hasSeenOnboarding', 'true')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      const currentStepData = onboardingSteps[currentStep]
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        if (!currentStepData.isLastStep) {
          handleNext()
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentStep > 0) {
          handlePrevious()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleSkip()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStep, onboardingSteps, handleNext, handlePrevious, handleSkip])

  if (!isOpen) return null

  const currentStepData = onboardingSteps[currentStep]

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div 
        className={`
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          bg-white border-3 border-black rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto
          shadow-2xl
        `}
      >
        {/* Header mit Schritt-Indikator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-black">{currentStepData.icon}</div>
            <h2 className="text-xl font-bold">{currentStepData.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {onboardingSteps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Überspringen
            </button>
          </div>
        </div>

        {/* Schritt-Indikatoren */}
        <div className="flex items-center justify-center mb-8">
          {onboardingSteps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`
                  w-3 h-3 rounded-full transition-colors
                  ${index === currentStep 
                    ? 'bg-[var(--accent)] border-2 border-black' 
                    : index < currentStep 
                    ? 'bg-black' 
                    : 'bg-gray-200'
                  }
                `}
              />
              {index < onboardingSteps.length - 1 && (
                <div 
                  className={`w-8 h-0.5 ${index < currentStep ? 'bg-black' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mb-8 text-left">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Zurück
              </button>
            )}
            
            <div className="flex-1" />
            
            {currentStepData.isLastStep ? (
              <button
                onClick={handleFinish}
                className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Jetzt loslegen!
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Weiter
              </button>
            )}
          </div>
          
          {/* Keyboard-Hints */}
          <p className="text-xs text-gray-400 text-center">
            ← → Pfeiltasten zum Navigieren • ESC zum Überspringen
          </p>
        </div>
        
      </div>
    </div>
  )
}