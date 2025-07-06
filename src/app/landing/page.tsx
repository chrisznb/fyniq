'use client'

import { useRouter } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default function Landing() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/')
  }

  return <LandingPage onGetStarted={handleGetStarted} />
}