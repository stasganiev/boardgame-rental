'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EditProfileForm } from '@/components/profile/EditProfileForm'

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session }, error: sessErr }) => {
      console.log('[profile] session:', !!session, 'error:', sessErr)
      if (session?.user) {
        const { data, error: dbErr } = await supabase.from('users').select('*').eq('id', session.user.id).single()
        console.log('[profile] db query:', { data: !!data, dbErr })
        setProfile(data)
      }
      setLoading(false)
    })
  }, [])

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
