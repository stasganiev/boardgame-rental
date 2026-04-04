'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { useUser } from '@/hooks/useUser'

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const { user, isLoading: userLoading } = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return
    if (!user) { setLoading(false); return }

    const supabase = createClient()
    supabase.from('users').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      }, () => setLoading(false))
  }, [user, userLoading])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {locale === 'ru' ? 'Мой профиль' : 'My Profile'}
      </h1>
      <EditProfileForm profile={profile} locale={locale} />
    </div>
  )
}
