'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types'

function fetchProfile(userId: string): Promise<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return fetch(`${url}/rest/v1/users?id=eq.${userId}&select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Accept': 'application/vnd.pgrst.object+json',
    },
  }).then((res) => (res.ok ? res.json() : null))
}

export function useUser() {
  const { user, initialized, isLoading } = useAuthStore()

  useEffect(() => {
    const store = useAuthStore.getState()
    if (store.initialized) return

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const s = useAuthStore.getState()

      if (session?.user) {
        // Fetch profile via REST API to avoid singleton client lock
        const profile = await fetchProfile(session.user.id)
        if (profile) s.setUser(mapProfile(profile))
        else s.setUser(null)
      } else {
        s.setUser(null)
      }

      if (!s.initialized) s.setInitialized()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, isLoading: !initialized || isLoading }
}

function mapProfile(p: any): UserProfile {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    avatarUrl: p.avatar_url ?? undefined,
    bio: p.bio ?? undefined,
    role: p.role,
    rating: p.rating,
    dealsCount: p.deals_count,
    location: p.location_lat
      ? {
          lat: p.location_lat,
          lng: p.location_lng,
          city: p.location_city,
          country: p.location_country,
          address: p.location_address ?? undefined,
        }
      : undefined,
    contact: p.contact_type
      ? {
          type: p.contact_type,
          value: p.contact_value,
          isPublic: p.contact_is_public,
        }
      : undefined,
    createdAt: p.created_at,
  }
}
