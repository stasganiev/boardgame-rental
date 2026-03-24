import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Providers } from '@/components/layout/Providers'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'BoardGame Rental — Rent Board Games Near You',
    template: '%s | BoardGame Rental',
  },
  description:
    'Find and rent board games from local owners. Free platform for board game lovers worldwide.',
  keywords: ['board games', 'rental', 'настольные игры', 'аренда'],
  openGraph: {
    type: 'website',
    siteName: 'BoardGame Rental',
  },
}

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ru' }]
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Providers locale={locale}>
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-gray-100 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} BoardGame Rental. Free forever.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
