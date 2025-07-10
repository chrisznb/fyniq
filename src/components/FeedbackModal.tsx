'use client'

import { useEffect, useState, useCallback } from 'react'
import { Star, Send, Heart, X, MessageCircle, Mail, Lightbulb, Clock, Ban } from 'lucide-react'
import { useUserActivity } from '@/contexts/UserActivityContext'
import { useForm } from '@formspree/react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FeedbackData {
  rating: number
  usage: string
  pricing: string
  missingFeatures: string
  improvements: string
  recommendation: string
  email: string
  comments: string
  privacyAccepted: boolean
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { 
    feedbackTrigger, 
    onFeedbackSubmitted, 
    onRemindLater, 
    onNeverAskAgain,
    invoiceCount,
    totalActiveTime
  } = useUserActivity()
  
  const [isVisible, setIsVisible] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [formData, setFormData] = useState<FeedbackData>({
    rating: 0,
    usage: '',
    pricing: '',
    missingFeatures: '',
    improvements: '',
    recommendation: '',
    email: '',
    comments: '',
    privacyAccepted: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Formspree hook mit deiner Form ID
  const [state, handleFormspreeSubmit] = useForm("mldnyygb")

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Reset showThankYou when modal opens
      setShowThankYou(false)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    onClose()
    
    // Reset form after closing
    setTimeout(() => {
      setFormData({
        rating: 0,
        usage: '',
        pricing: '',
        missingFeatures: '',
        improvements: '',
        recommendation: '',
        email: '',
        comments: '',
        privacyAccepted: false
      })
      setErrors({})
      setIsVisible(false)
      setShowThankYou(false) // Reset thank you state
    }, 300)
  }, [onClose])

  const handleRemindLater = () => {
    onRemindLater()
    handleClose()
  }

  const handleNeverAskAgain = () => {
    onNeverAskAgain()
    handleClose()
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (formData.rating === 0) {
      newErrors['rating'] = 'Bitte gib eine Bewertung ab'
    }
    
    if (!formData.usage) {
      newErrors['usage'] = 'Bitte wähle eine Option aus'
    }
    
    if (!formData.pricing) {
      newErrors['pricing'] = 'Bitte wähle eine Option aus'
    }
    
    if (!formData.recommendation) {
      newErrors['recommendation'] = 'Bitte wähle eine Option aus'
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors['email'] = 'Bitte gib eine gültige E-Mail-Adresse ein'
    }
    
    if (!formData.privacyAccepted) {
      newErrors['privacyAccepted'] = 'Bitte bestätige die Datenschutzerklärung'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Erstelle eine neue FormData mit lesbaren deutschen Labels
    const formDataToSubmit = new FormData()
    
    // Hauptbewertung
    formDataToSubmit.append('⭐ Gesamtbewertung', `${formData.rating} von 5 Sternen`)
    
    // Nutzungshäufigkeit
    const usageLabels: {[key: string]: string} = {
      'daily': 'Täglich',
      'weekly': 'Wöchentlich', 
      'occasionally': 'Gelegentlich',
      'no': 'Nein'
    }
    formDataToSubmit.append('📅 Würde regelmäßig nutzen', usageLabels[formData.usage] || formData.usage)
    
    // Preismodell
    const pricingLabels: {[key: string]: string} = {
      'free-ads': 'Kostenlos mit Werbung',
      'one-time': 'Einmalig €29-49',
      'subscription': 'Abo €9/Monat',
      'freemium': 'Freemium (Basis kostenlos, Premium kostenpflichtig)',
      'pay-per-use': 'Pay-per-use (pro Rechnung bezahlen)'
    }
    formDataToSubmit.append('💰 Bevorzugtes Preismodell', pricingLabels[formData.pricing] || formData.pricing)
    
    // Empfehlung
    const recommendationLabels: {[key: string]: string} = {
      'yes': 'Ja, auf jeden Fall',
      'probably': 'Wahrscheinlich ja',
      'maybe': 'Vielleicht',
      'no': 'Nein'
    }
    formDataToSubmit.append('👍 Würde weiterempfehlen', recommendationLabels[formData.recommendation] || formData.recommendation)
    
    // Textfelder
    if (formData.missingFeatures) {
      formDataToSubmit.append('🔧 Vermisste Features', formData.missingFeatures)
    }
    
    if (formData.improvements) {
      formDataToSubmit.append('💡 Verbesserungsvorschläge', formData.improvements)
    }
    
    if (formData.email) {
      formDataToSubmit.append('📧 E-Mail-Adresse', formData.email)
    }
    
    if (formData.comments) {
      formDataToSubmit.append('💬 Weitere Anmerkungen', formData.comments)
    }
    
    // Nur minimale, anonyme Metadaten
    formDataToSubmit.append('--- KONTEXT ---', '---')
    
    // Zeitstempel nur mit Datum (ohne Uhrzeit für mehr Anonymität)
    const date = new Date()
    const germanDate = date.toLocaleDateString('de-DE', {
      month: '2-digit', 
      year: 'numeric'
    })
    formDataToSubmit.append('📅 Feedback-Monat', germanDate)
    
    // Nutze Formspree handleSubmit
    await handleFormspreeSubmit(formDataToSubmit)
  }
  
  // Reagiere auf erfolgreiche Submission
  useEffect(() => {
    if (state.succeeded && !showThankYou) {
      // Show thank you message
      setShowThankYou(true)
      
      // Mark feedback as given in context
      onFeedbackSubmitted()
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose()
      }, 3000)
    }
  }, [state.succeeded, showThankYou, onFeedbackSubmitted, handleClose])

  const handleRating = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
    if (errors['rating']) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleRadioChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null
  
  // Zeige Erfolgsmeldung wenn Feedback gesendet wurde
  const isSubmitted = showThankYou

  const getTriggerMessage = () => {
    switch (feedbackTrigger) {
      case 'first_invoice':
        return {
          title: 'Glückwunsch zur ersten Rechnung!',
          message: 'Du hast gerade deine erste Rechnung mit fyniq erstellt. Wie war deine Erfahrung?'
        }
      case 'active_time':
        return {
          title: 'Du nutzt fyniq schon eine Weile',
          message: `Du bist seit ${Math.round(totalActiveTime / 60000)} Minuten aktiv. Deine Meinung ist uns wichtig!`
        }
      case 'second_visit':
        return {
          title: 'Schön, dich wiederzusehen!',
          message: 'Du bist zum zweiten Mal hier. Wie gefällt dir fyniq bisher?'
        }
      case 'reminder':
        return {
          title: 'Erinnerung: Dein Feedback',
          message: 'Du wolltest später Feedback geben. Jetzt wäre ein guter Zeitpunkt!'
        }
      default:
        return {
          title: 'Deine Meinung zählt!',
          message: 'Hilf uns dabei, fyniq noch besser zu machen.'
        }
    }
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[60]" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div 
          className={`
            transform transition-all duration-300 ease-out
            ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            bg-white border-3 border-black rounded-lg p-8 w-full max-w-md text-center
            shadow-2xl
          `}
        >
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-red-500 fill-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Vielen Dank!</h2>
          <p className="text-gray-700 mb-6">
            Dein Feedback ist bei uns angekommen und hilft uns dabei, fyniq noch besser zu machen.
          </p>
          <div className="bg-[var(--accent)] p-3 rounded-lg border-2 border-black">
            <p className="text-sm font-semibold">
              Das Fenster schließt sich automatisch...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center sm:items-center sm:justify-center items-start justify-center pt-4 sm:pt-0 p-4 z-[60]" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div 
        className={`
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          bg-white border-3 border-black rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto
          shadow-2xl
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-black" />
            <h2 className="text-2xl font-bold">Feedback zu fyniq</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Smart introduction based on trigger */}
        <div className="mb-6 p-4 bg-[var(--accent)] rounded-lg border-2 border-black">
          <h3 className="font-bold mb-2">{getTriggerMessage().title}</h3>
          <p className="text-sm text-gray-700">{getTriggerMessage().message}</p>
          {invoiceCount > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              Rechnungen erstellt: {invoiceCount} • Aktive Zeit: {Math.round(totalActiveTime / 60000)} Min
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Wie bewertest du fyniq insgesamt? <span className="text-red-500">*</span>
            </label>
            <input type="hidden" name="rating" value={formData.rating} />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= formData.rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({formData.rating}/5 Stern{formData.rating !== 1 ? 'e' : ''})
                </span>
              )}
            </div>
            {errors['rating'] && (
              <p className="text-red-500 text-sm mt-1">{errors['rating']}</p>
            )}
          </div>

          {/* Usage Frequency */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Würdest du fyniq regelmäßig nutzen? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'daily', label: 'Täglich' },
                { value: 'weekly', label: 'Wöchentlich' },
                { value: 'occasionally', label: 'Gelegentlich' },
                { value: 'no', label: 'Nein' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="usage"
                    value={option.value}
                    checked={formData.usage === option.value}
                    onChange={(e) => handleRadioChange('usage', e.target.value)}
                    className="w-4 h-4 text-black focus:ring-[var(--accent)] focus:ring-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {errors['usage'] && (
              <p className="text-red-500 text-sm mt-1">{errors['usage']}</p>
            )}
          </div>

          {/* Pricing Model */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Welches Preismodell bevorzugst du? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'free-ads', label: 'Kostenlos mit Werbung' },
                { value: 'one-time', label: 'Einmalig €29-49' },
                { value: 'subscription', label: 'Abo €9/Monat' },
                { value: 'freemium', label: 'Freemium (Basis kostenlos, Premium kostenpflichtig)' },
                { value: 'pay-per-use', label: 'Pay-per-use (pro Rechnung bezahlen)' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricing"
                    value={option.value}
                    checked={formData.pricing === option.value}
                    onChange={(e) => handleRadioChange('pricing', e.target.value)}
                    className="w-4 h-4 text-black focus:ring-[var(--accent)] focus:ring-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {errors['pricing'] && (
              <p className="text-red-500 text-sm mt-1">{errors['pricing']}</p>
            )}
          </div>

          {/* Missing Features */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Welche Features vermisst du?
            </label>
            <textarea
              name="missingFeatures"
              value={formData.missingFeatures}
              onChange={(e) => setFormData(prev => ({ ...prev, missingFeatures: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none resize-none"
              placeholder="z.B. Wiederkehrende Rechnungen, Angebote, Mahnungen, Export-Funktionen..."
              rows={3}
            />
          </div>

          {/* Improvements */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Was könnte man verbessern?
            </label>
            <textarea
              name="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none resize-none"
              placeholder="z.B. Benutzerfreundlichkeit, Design, Performance, Funktionen..."
              rows={3}
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Würdest du fyniq weiterempfehlen? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'yes', label: 'Ja, auf jeden Fall' },
                { value: 'probably', label: 'Wahrscheinlich ja' },
                { value: 'maybe', label: 'Vielleicht' },
                { value: 'no', label: 'Nein' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommendation"
                    value={option.value}
                    checked={formData.recommendation === option.value}
                    onChange={(e) => handleRadioChange('recommendation', e.target.value)}
                    className="w-4 h-4 text-black focus:ring-[var(--accent)] focus:ring-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {errors['recommendation'] && (
              <p className="text-red-500 text-sm mt-1">{errors['recommendation']}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              E-Mail (optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              placeholder="deine@email.de"
            />
            {errors['email'] && (
              <p className="text-red-500 text-sm mt-1">{errors['email']}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Nur wenn du möchtest, dass wir dir bei Fragen antworten oder Updates senden
            </p>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Sonstige Anmerkungen
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none resize-none"
              placeholder="Alles was dir sonst noch wichtig ist..."
              rows={3}
            />
          </div>

          {/* Privacy Checkbox */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacyAccepted}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, privacyAccepted: e.target.checked }))
                  if (errors['privacyAccepted']) {
                    setErrors(prev => ({ ...prev, privacyAccepted: '' }))
                  }
                }}
                className="w-5 h-5 mt-0.5 text-black focus:ring-[var(--accent)] focus:ring-2 rounded border-2 border-gray-300 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-gray-700">
                Ich bin damit einverstanden, dass meine Angaben zur Verbesserung von fyniq 
                gespeichert und verarbeitet werden. Die Daten werden nur für diesen Zweck 
                verwendet und nicht an Dritte weitergegeben. <span className="text-red-500">*</span>
              </span>
            </label>
            {errors['privacyAccepted'] && (
              <p className="text-red-500 text-sm mt-2 ml-8">{errors['privacyAccepted']}</p>
            )}
          </div>

          {/* Reminder Options */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Möchtest du nicht jetzt Feedback geben?
            </p>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={handleRemindLater}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                Später erinnern (24h)
              </button>
              <button
                type="button"
                onClick={handleNeverAskAgain}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 text-gray-500"
              >
                <Ban className="w-4 h-4" />
                Nicht mehr fragen
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={state.submitting}
              className="flex-1 px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state.submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Feedback senden
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}