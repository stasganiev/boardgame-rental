'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getAccessToken } from '@/lib/supabase/token'
import { GameDuplicateSearch } from '@/components/games/GameDuplicateSearch'
import { MultiImageUpload } from '@/components/games/MultiImageUpload'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const GENRE_PRESETS = {
  en: ['Strategy', 'Family', 'Party', 'Cooperative', 'Card Game', 'Dice', 'Adventure', 'Economic', 'War', 'Puzzle', 'Trivia', 'Deduction'],
  ru: ['Стратегия', 'Семейная', 'Вечеринка', 'Кооперативная', 'Карточная', 'Кости', 'Приключение', 'Экономическая', 'Военная', 'Головоломка', 'Викторина', 'Дедукция'],
}

export default function NewGamePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [minPlayers, setMinPlayers] = useState(2)
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [minAge, setMinAge] = useState(8)
  const [gameDuration, setGameDuration] = useState('')
  const [complexity, setComplexity] = useState(3)
  const [genres, setGenres] = useState<string[]>([])
  const [genreInput, setGenreInput] = useState('')
  const [weight, setWeight] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [gameId] = useState(() => crypto.randomUUID())

  const t = locale === 'ru' ? {
    title: 'Добавить игру',
    gameName: 'Название игры',
    gameNamePh: 'Например: Каттан, Колонизаторы...',
    minPlayers: 'Мин. игроков',
    maxPlayers: 'Макс. игроков',
    minAge: 'Мин. возраст',
    duration: 'Длительность партии',
    durationPh: 'Например: 30-60 мин',
    complexity: 'Сложность (1-5)',
    genre: 'Жанр',
    genrePh: 'Свой жанр...',
    addGenre: 'Добавить',
    weight: 'Вес (кг)',
    weightPh: 'Например: 1.5',
    description: 'Описание',
    descriptionPh: 'Расскажите игрокам об этой игре...',
    photos: 'Фото игры',
    submit: 'Отправить на модерацию',
    submitting: 'Отправляю...',
    submitted: 'Игра отправлена на модерацию!',
    loginRequired: 'Войдите, чтобы добавить игру',
    goToLogin: 'Войти',
    viewGame: 'Посмотреть',
    required: 'Заполните обязательные поля',
  } : {
    title: 'Add New Game',
    gameName: 'Game Name',
    gameNamePh: 'e.g. Catan, Ticket to Ride...',
    minPlayers: 'Min Players',
    maxPlayers: 'Max Players',
    minAge: 'Minimum Age',
    duration: 'Game Duration',
    durationPh: 'e.g. 30-60 min',
    complexity: 'Complexity (1-5)',
    genre: 'Genre',
    genrePh: 'Custom genre...',
    addGenre: 'Add',
    weight: 'Weight (kg)',
    weightPh: 'e.g. 1.5',
    description: 'Description',
    descriptionPh: 'Tell players about this game...',
    photos: 'Game Photos',
    submit: 'Submit for Moderation',
    submitting: 'Submitting...',
    submitted: 'Game submitted for moderation!',
    loginRequired: 'Sign in to add a game',
    goToLogin: 'Sign In',
    viewGame: 'View',
    required: 'Please fill in required fields',
  }

  function addGenre(genre: string) {
    const trimmed = genre.trim()
    if (trimmed && !genres.includes(trimmed)) {
      setGenres([...genres, trimmed])
    }
    setGenreInput('')
  }

  function removeGenre(genre: string) {
    setGenres(genres.filter((g) => g !== genre))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!name.trim() || !gameDuration.trim()) {
      setError(t.required)
      return
    }

    setIsPending(true)
    setError('')

    const token = getAccessToken()
    const body = {
      id: gameId,
      name: name.trim(),
      min_players: minPlayers,
      max_players: maxPlayers,
      min_age: minAge,
      game_duration: gameDuration.trim(),
      complexity,
      genre: genres,
      weight: weight ? parseFloat(weight) : null,
      description: description.trim(),
      official_photos: photos,
      created_by: user.id,
      moderation_status: 'pending',
    }

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/games`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token || supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setError(err?.message || 'Failed to create game')
        setIsPending(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Failed to create game')
    }
    setIsPending(false)
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{t.loginRequired}</h1>
        <a href={`/${locale}/login`} className="btn-primary inline-block mt-4">{t.goToLogin}</a>
      </div>
    )
  }

  // Success
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{t.submitted}</h1>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => router.push(`/${locale}/games/${gameId}`)} className="btn-primary">
            {t.viewGame}
          </button>
        </div>
      </div>
    )
  }

  const presets = GENRE_PRESETS[locale as keyof typeof GENRE_PRESETS] || GENRE_PRESETS.en

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game name + duplicate search */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.gameName} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.gameNamePh}
              required
              className="input"
            />
            <GameDuplicateSearch
              query={name}
              locale={locale}
              onSelect={(id) => router.push(`/${locale}/games/${id}`)}
            />
          </div>

          {/* Players */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.minPlayers} *</label>
              <input
                type="number"
                min={1}
                max={99}
                value={minPlayers}
                onChange={(e) => setMinPlayers(parseInt(e.target.value) || 1)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxPlayers} *</label>
              <input
                type="number"
                min={1}
                max={99}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 1)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.minAge}</label>
              <input
                type="number"
                min={0}
                max={99}
                value={minAge}
                onChange={(e) => setMinAge(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
          </div>

          {/* Duration & Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.duration} *</label>
              <input
                type="text"
                value={gameDuration}
                onChange={(e) => setGameDuration(e.target.value)}
                placeholder={t.durationPh}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.complexity}</label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setComplexity(val)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                      val <= complexity
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.weight}</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={t.weightPh}
              className="input"
            />
          </div>
        </div>

        {/* Genre */}
        <div className="card p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">{t.genre}</label>

          {/* Selected genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {g}
                  <button type="button" onClick={() => removeGenre(g)} className="text-primary-400 hover:text-primary-600">&times;</button>
                </span>
              ))}
            </div>
          )}

          {/* Preset genres */}
          <div className="flex flex-wrap gap-2">
            {presets.filter((g) => !genres.includes(g)).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => addGenre(g)}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                + {g}
              </button>
            ))}
          </div>

          {/* Custom genre input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGenre(genreInput) } }}
              placeholder={t.genrePh}
              className="input flex-1"
            />
            <button type="button" onClick={() => addGenre(genreInput)} className="btn-secondary text-sm px-4">
              {t.addGenre}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder={t.descriptionPh}
            className="input resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{description.length}/2000</p>
        </div>

        {/* Photos */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">{t.photos}</label>
          <MultiImageUpload
            gameId={gameId}
            onPhotosChange={setPhotos}
            locale={locale}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  )
}
