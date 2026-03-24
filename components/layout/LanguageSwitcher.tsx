'use client'

import { useRouter, usePathname } from 'next/navigation'

interface LanguageSwitcherProps {
  locale: string
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // Replace locale prefix in path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {['en', 'ru'].map((lang) => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === lang
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
