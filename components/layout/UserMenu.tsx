'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface UserMenuProps {
  locale: string
}

export function UserMenu({ locale }: UserMenuProps) {
  const { user } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const t = {
    en: { signIn: 'Sign In', signUp: 'Sign Up', profile: 'Profile', myListings: 'My Listings', myBookings: 'My Bookings', signOut: 'Sign Out' },
    ru: { signIn: 'Войти', signUp: 'Регистрация', profile: 'Профиль', myListings: 'Мои игры', myBookings: 'Мои брони', signOut: 'Выйти' },
  }[locale] ?? { signIn: 'Sign In', signUp: 'Sign Up', profile: 'Profile', myListings: 'My Listings', myBookings: 'My Bookings', signOut: 'Sign Out' }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/${locale}/login`} className="text-sm text-gray-600 hover:text-primary-500 transition-colors">
          {t.signIn}
        </Link>
        <Link href={`/${locale}/register`} className="btn-primary text-sm">
          {t.signUp}
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-lg hover:bg-gray-50 px-2 py-1 transition-colors"
      >
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <Link href={user ? `/${locale}/profile` : `/${locale}/login`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              👤 {t.profile}
            </Link>
            <Link href={`/${locale}/listings/new`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              🎲 {t.myListings}
            </Link>
            <Link href={`/${locale}/bookings`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              📅 {t.myBookings}
            </Link>
            {user.role === 'admin' && (
              <Link href={`/${locale}/admin`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                ⚙️ Admin
              </Link>
            )}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  // Clear all Supabase auth cookies
                  document.cookie.split(';').forEach((c) => {
                    const name = c.trim().split('=')[0]
                    if (name.startsWith('sb-')) {
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    }
                  })
                  // Clear auth store
                  useAuthStore.getState().logout()
                  localStorage.removeItem('auth-storage')
                  window.location.href = `/${locale}`
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                🚪 {t.signOut}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
