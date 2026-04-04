import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  initialized: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      initialized: false,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: () => set({ initialized: true }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
