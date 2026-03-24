'use client'

import { ReactNode, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'

interface ProvidersProps {
  children: ReactNode
  locale: string
}

function AuthInitializer() {
  useUser() // initializes auth state globally
  return null
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <AuthInitializer />
      {children}
    </>
  )
}
