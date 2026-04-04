'use client'

import { useEffect, useState } from 'react'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    fetch(`${url}/rest/v1/users?id=eq.${user.id}&select=*`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/vnd.pgrst.object+json',
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  if (!user || loading) {
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
