import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from '@/components/profile/EditProfileForm'

export default async function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {locale === 'ru' ? 'Мой профиль' : 'My Profile'}
      </h1>
      <EditProfileForm profile={profile} locale={locale} />
    </div>
  )
}
