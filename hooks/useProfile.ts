'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types'

export function useProfile() {
  const { user, setUser } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function uploadAvatar(file: File): Promise<string | null> {
    if (!user) return null
    setIsUploading(true)
    setUploadError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (error) {
      setUploadError(error.message)
      setIsUploading(false)
      return null
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    setUser({ ...user, avatarUrl: data.publicUrl })
    setIsUploading(false)
    return data.publicUrl
  }

  return { user, uploadAvatar, isUploading, uploadError }
}
