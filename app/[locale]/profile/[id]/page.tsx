import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { RatingStars } from '@/components/ui/RatingStars'
import { ContactBadge } from '@/components/ui/ContactBadge'
import { formatDate } from '@/lib/utils'
import type { UserProfile, Contact } from '@/types'

interface Props {
  params: { locale: string; id: string }
}

async function getProfile(id: string) {
  const supabase = createClient()
  const { data } = await supabase.from('users').select('*').eq('id', id).single()
  return data
}

export default async function PublicProfilePage({ params: { locale, id } }: Props) {
  const profile = await getProfile(id)
  if (!profile) notFound()

  const contact: Contact | undefined =
    profile.contact_type && profile.contact_is_public
      ? { type: profile.contact_type as any, value: profile.contact_value!, isPublic: true }
      : undefined

  const t = {
    en: { memberSince: 'Member since', rating: 'Rating', deals: 'Deals', contact: 'Contact', noContact: 'No public contact info', noReviews: 'No reviews yet' },
    ru: { memberSince: 'На платформе с', rating: 'Рейтинг', deals: 'Сделок', contact: 'Контакт', noContact: 'Нет публичного контакта', noReviews: 'Отзывов пока нет' },
  }[locale] ?? { memberSince: 'Member since', rating: 'Rating', deals: 'Deals', contact: 'Contact', noContact: 'No public contact info', noReviews: 'No reviews yet' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <Avatar name={profile.name} avatarUrl={profile.avatar_url} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name}</h1>
            {profile.location_city && (
              <p className="text-gray-500 text-sm mt-1">
                📍 {profile.location_city}{profile.location_country ? `, ${profile.location_country}` : ''}
              </p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {t.memberSince} {formatDate(profile.created_at, locale)}
            </p>
            {profile.bio && (
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5 text-center">
          <div className="text-sm text-gray-500 mb-1">{t.rating}</div>
          <RatingStars rating={profile.rating ?? 0} size="md" />
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-primary-500">{profile.deals_count}</div>
          <div className="text-sm text-gray-500 mt-1">{t.deals}</div>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">{t.contact}</h2>
        {contact ? (
          <ContactBadge contact={contact} locale={locale} />
        ) : (
          <p className="text-sm text-gray-400">{t.noContact}</p>
        )}
      </div>

      {/* Reviews placeholder */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">
          {locale === 'ru' ? 'Отзывы' : 'Reviews'}
        </h2>
        <p className="text-sm text-gray-400">{t.noReviews}</p>
      </div>
    </div>
  )
}
