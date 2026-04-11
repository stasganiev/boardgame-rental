'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type GameRow = Database['public']['Tables']['games']['Row']

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface CreatorInfo {
  id: string
  name: string
  avatar_url: string | null
}

export default function GameDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string }
}) {
  const [game, setGame] = useState<GameRow | null>(null)
  const [creator, setCreator] = useState<CreatorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  const t = locale === 'ru' ? {
    players: 'игроков',
    age: 'Возраст',
    duration: 'Длительность',
    complexity: 'Сложность',
    weight: 'Вес',
    kg: 'кг',
    description: 'Описание',
    genre: 'Жанр',
    addedBy: 'Добавил',
    pending: 'На модерации',
    approved: 'Одобрена',
    rejected: 'Отклонена',
    back: 'Назад к каталогу',
    notFound: 'Игра не найдена',
    noDescription: 'Описание не добавлено',
    details: 'Информация об игре',
    photos: 'фото',
  } : {
    players: 'players',
    age: 'Age',
    duration: 'Duration',
    complexity: 'Complexity',
    weight: 'Weight',
    kg: 'kg',
    description: 'Description',
    genre: 'Genre',
    addedBy: 'Added by',
    pending: 'Pending Moderation',
    approved: 'Approved',
    rejected: 'Rejected',
    back: 'Back to Catalog',
    notFound: 'Game not found',
    noDescription: 'No description added',
    details: 'Game Details',
    photos: 'photos',
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/games?id=eq.${id}&select=*`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Accept': 'application/vnd.pgrst.object+json',
            },
          }
        )
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        setGame(data)

        // Fetch creator info
        if (data.created_by) {
          const creatorRes = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${data.created_by}&select=id,name,avatar_url`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Accept': 'application/vnd.pgrst.object+json',
              },
            }
          )
          if (creatorRes.ok) {
            setCreator(await creatorRes.json())
          }
        }
      } catch {
        // ignore
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{t.notFound}</h1>
        <Link href={`/${locale}/games`} className="text-primary-500 hover:underline mt-4 inline-block">
          {t.back}
        </Link>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: t.pending, className: 'bg-amber-100 text-amber-700' },
    approved: { label: t.approved, className: 'bg-green-100 text-green-700' },
    rejected: { label: t.rejected, className: 'bg-red-100 text-red-700' },
  }
  const status = statusConfig[game.moderation_status]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link href={`/${locale}/games`} className="text-sm text-gray-500 hover:text-primary-500 mb-6 inline-block">
        &larr; {t.back}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Photos */}
        <div>
          {game.official_photos.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={game.official_photos[activePhoto]}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {game.official_photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {game.official_photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        i === activePhoto ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="text-8xl text-gray-300">🎲</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{game.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.className}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{t.players.charAt(0).toUpperCase() + t.players.slice(1)}</p>
              <p className="font-semibold text-gray-900">{game.min_players}–{game.max_players}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{t.age}</p>
              <p className="font-semibold text-gray-900">{game.min_age}+</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{t.duration}</p>
              <p className="font-semibold text-gray-900">{game.game_duration}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{t.complexity}</p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < game.complexity ? 'bg-primary-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Weight */}
          {game.weight && (
            <p className="text-sm text-gray-500">{t.weight}: {game.weight} {t.kg}</p>
          )}

          {/* Genre */}
          {game.genre.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.genre}</p>
              <div className="flex flex-wrap gap-2">
                {game.genre.map((g) => (
                  <span key={g} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t.description}</p>
            <p className="text-gray-600 whitespace-pre-line">
              {game.description || t.noDescription}
            </p>
          </div>

          {/* Creator */}
          {creator && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-2">{t.addedBy}</p>
              <Link
                href={`/${locale}/profile/${creator.id}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-500"
              >
                {creator.avatar_url ? (
                  <img src={creator.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-600 font-medium">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{creator.name}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
