import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  locale: string
}

const navItems = {
  en: [
    { href: '/games', label: 'Game Catalog' },
    { href: '/search', label: 'Browse Games' },
    { href: '/listings/new', label: 'List a Game' },
    { href: '/bookings', label: 'My Bookings' },
  ],
  ru: [
    { href: '/games', label: 'Каталог игр' },
    { href: '/search', label: 'Найти игры' },
    { href: '/listings/new', label: 'Разместить' },
    { href: '/bookings', label: 'Мои брони' },
  ],
}

export function Header({ locale }: HeaderProps) {
  const items = navItems[locale as keyof typeof navItems] ?? navItems.en

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-2xl">🎲</span>
          <span className="font-bold text-gray-900 hidden sm:block">
            BoardGame Rental
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {items.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <UserMenu locale={locale} />
        </div>
      </div>
    </header>
  )
}
