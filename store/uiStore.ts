import { create } from 'zustand'
import type { Locale } from '@/types'

interface UIState {
  locale: Locale
  isMobileMenuOpen: boolean
  setLocale: (locale: Locale) => void
  setMobileMenuOpen: (isOpen: boolean) => void
  toggleMobileMenu: () => void
}

export const useUIStore = create<UIState>((set) => ({
  locale: 'en',
  isMobileMenuOpen: false,
  setLocale: (locale) => set({ locale }),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}))
