'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  location_city: z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
  contact_type: z.enum(['phone', 'telegram', 'whatsapp', 'email', 'other']).optional(),
  contact_value: z.string().max(200).optional(),
  contact_is_public: z.boolean().optional(),
})

export type ProfileResult = {
  error?: string
  success?: boolean
}

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name') as string,
    bio: (formData.get('bio') as string) || undefined,
    location_city: (formData.get('location_city') as string) || undefined,
    location_country: (formData.get('location_country') as string) || undefined,
    contact_type: (formData.get('contact_type') as string) || undefined,
    contact_value: (formData.get('contact_value') as string) || undefined,
    contact_is_public: formData.get('contact_is_public') === 'true',
  }

  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase
    .from('users')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  if (file.size > 2 * 1024 * 1024) return { error: 'File too large (max 2MB)' }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { error: 'Invalid file type. Use JPEG, PNG, or WebP' }
  }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)

  await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', user.id)

  revalidatePath('/', 'layout')
  return { url: data.publicUrl }
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}
