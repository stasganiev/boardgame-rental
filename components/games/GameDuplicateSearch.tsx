'use client'

import { useState, useEffect, useRef } from 'react'

interface GameMatch {
  id: string
  name: string
  min_players: number
  max_players: number
  complexity: number
}

interface Props {
  query: string
  locale: string
  onSelect: (gameId: string) => void
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function GameDuplicateSearch({ query, locale, onSelect }: Props) {
  const [matches, setMatches] = useState<GameMatch[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setMatches([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/games?name=ilike.*${encodeURIComponent(query.trim())}*&select=id,name,min_players,max_players,complexity&limit=5`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        )
        if (res.ok) {
          const data = await res.json()
          setMatches(data)
        }
      } catch {
        // ignore search errors
      }
      setLoading(false)
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  if (matches.length === 0 && !loading) return null

  const t = locale === 'ru'
    ? { warning: 'Похожие игры найдены:', use: 'Использовать эту', players: 'игроков' }
    : { warning: 'Similar games found:', use: 'Use this game', players: 'players' }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
      <p className="text-sm font-medium text-amber-800 mb-2">{t.warning}</p>
      {loading ? (
        <div className="text-sm text-amber-600">...</div>
      ) : (
        <ul className="space-y-2">
          {matches.map((game) => (
            <li key={game.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
              <div>
                <span className="font-medium text-gray-900">{game.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {game.min_players}–{game.max_players} {t.players}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelect(game.id)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t.use} &rarr;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
