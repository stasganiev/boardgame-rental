'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GameCard } from '@/components/games/GameCard'
import { useAuthStore } from '@/store/authStore'
import type { Database } from '@/types/database'

type GameRow = Database['public']['Tables']['games']['Row']

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function GamesPage({ params: { locale } }: { params: { locale: string } }) {
  const user = useAuthStore((s) => s.user)
  const [games, setGames] = useState<GameRow[]>([])
  const [loading, setLoading] = useState(true)

  const t = locale === 'ru' ? {
    title: 'Каталог игр',
    addGame: 'Добавить игру',
    noGames: 'В каталоге пока нет игр. Будьте первым!',
    addFirst: 'Добавить первую игру',
    myGames: 'Мои игры',
    allGames: 'Все игры',
  } : {
    title: 'Game Catalog',
    addGame: 'Add Game',
    noGames: 'No games in the catalog yet. Be the first to add one!',
    addFirst: 'Add the first game',
    myGames: 'My Games',
    allGames: 'All Games',
  }

  const [tab, setTab] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/games?select=*&order=created_at.desc`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        )
        if (res.ok) {
          setGames(await res.json())
        }
      } catch {
        // ignore
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredGames = tab === 'mine' && user
    ? games.filter((g) => g.created_by === user.id)
    : games

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        {user && (
          <Link href={`/${locale}/games/new`} className="btn-primary text-sm">
            + {t.addGame}
          </Link>
        )}
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('all')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'all' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.allGames}
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'mine' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.myGames}
          </button>
        </div>
      )}

      {/* Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">🎲</span>
          <p className="text-gray-500 mt-4">{t.noGames}</p>
          {user && (
            <Link href={`/${locale}/games/new`} className="btn-primary inline-block mt-4">
              {t.addFirst}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
