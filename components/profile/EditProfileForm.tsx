'use client'

import { useState, useRef } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: any
  locale: string
}

const contactTypes = ['phone', 'telegram', 'whatsapp', 'email', 'other'] as const

export function EditProfileForm({ profile, locale }: Props) {
  const { setUser, user } = useAuthStore()
  const [isPending, setIsPending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = {
    en: {
      save: 'Save Changes', saving: 'Saving...', saved: 'Changes saved!',
      name: 'Name', bio: 'About me', city: 'City', country: 'Country',
      contact: 'How to reach me', contactType: 'Type', contactValue: 'Contact details',
      contactPublic: 'Show contact to other users', changePhoto: 'Change photo',
    },
    ru: {
      save: 'Сохранить', saving: 'Сохраняю...', saved: 'Изменения сохранены!',
      name: 'Имя', bio: 'О себе', city: 'Город', country: 'Страна',
      contact: 'Как со мной связаться', contactType: 'Тип', contactValue: 'Контактные данные',
      contactPublic: 'Показывать контакт другим пользователям', changePhoto: 'Изменить фото',
    },
  }[locale] ?? {
    save: 'Save Changes', saving: 'Saving...', saved: 'Changes saved!',
    name: 'Name', bio: 'About me', city: 'City', country: 'Country',
    contact: 'How to reach me', contactType: 'Type', contactValue: 'Contact details',
    contactPublic: 'Show contact to other users', changePhoto: 'Change photo',
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('File too large (max 2MB)'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Invalid file type'); return }

    setIsUploading(true)
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { setIsUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${authUser.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) { setError(uploadError.message); setIsUploading(false); return }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', authUser.id)

    setAvatarUrl(data.publicUrl)
    if (user) setUser({ ...user, avatarUrl: data.publicUrl })
    setIsUploading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { setError('Not authenticated'); setIsPending(false); return }

    const fd = new FormData(e.currentTarget)
    const updateData = {
      name: fd.get('name') as string,
      bio: (fd.get('bio') as string) || null,
      location_city: (fd.get('location_city') as string) || null,
      location_country: (fd.get('location_country') as string) || null,
      contact_type: (fd.get('contact_type') as string) || null,
      contact_value: (fd.get('contact_value') as string) || null,
      contact_is_public: fd.get('contact_is_public') === 'true',
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', authUser.id)

    if (updateError) { setError(updateError.message) }
    else { setSuccess(true) }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={profile?.name || ''} avatarUrl={avatarUrl} size="xl" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm">
              {t.changePhoto}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 2MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.name} *</label>
          <input name="name" type="text" defaultValue={profile?.name} required className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.bio}</label>
          <textarea name="bio" rows={3} defaultValue={profile?.bio || ''} maxLength={500} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.city}</label>
            <input name="location_city" type="text" defaultValue={profile?.location_city || ''} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.country}</label>
            <input name="location_country" type="text" defaultValue={profile?.location_country || ''} className="input" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-6 space-y-4">
        <h2 className="font-medium text-gray-900">{t.contact}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactType}</label>
            <select name="contact_type" defaultValue={profile?.contact_type || ''} className="input">
              <option value="">—</option>
              {contactTypes.map((ct) => (
                <option key={ct} value={ct}>{ct.charAt(0).toUpperCase() + ct.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactValue}</label>
            <input name="contact_value" type="text" defaultValue={profile?.contact_value || ''} className="input" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            name="contact_is_public"
            type="checkbox"
            value="true"
            defaultChecked={profile?.contact_is_public ?? true}
            className="rounded text-primary-500"
          />
          <span className="text-sm text-gray-600">{t.contactPublic}</span>
        </label>
      </div>

      {/* Submit */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
          <p className="text-sm text-green-600">{t.saved}</p>
        </div>
      )}
      <button type="submit" disabled={isPending || isUploading} className="btn-primary w-full">
        {isPending ? t.saving : t.save}
      </button>
    </form>
  )
}
