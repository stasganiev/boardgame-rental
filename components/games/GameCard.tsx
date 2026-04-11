import Link from 'next/link'

interface Props {
  game: {
    id: string
    name: string
    min_players: number
    max_players: number
    min_age: number
    game_duration: string
    complexity: number
    genre: string[]
    official_photos: string[]
    moderation_status: string
  }
  locale: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export function GameCard({ game, locale }: Props) {
  const t = locale === 'ru'
    ? { players: 'игроков', pending: 'На модерации', approved: 'Одобрена', rejected: 'Отклонена' }
    : { players: 'players', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

  const statusLabel = t[game.moderation_status as keyof typeof t] || game.moderation_status

  return (
    <Link
      href={`/${locale}/games/${game.id}`}
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Photo */}
      <div className="aspect-[4/3] bg-gray-100 relative">
        {game.official_photos.length > 0 ? (
          <img
            src={game.official_photos[0]}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            🎲
          </div>
        )}
        {game.moderation_status !== 'approved' && (
          <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[game.moderation_status]}`}>
            {statusLabel}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{game.name}</h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>{game.min_players}–{game.max_players} {t.players}</span>
          <span>{game.game_duration}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < game.complexity ? 'bg-primary-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        {game.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {game.genre.slice(0, 3).map((g) => (
              <span key={g} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
