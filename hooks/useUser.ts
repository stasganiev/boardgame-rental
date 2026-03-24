'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types'

export function useUser() {
  const { user, setUser, setLoading, isLoading } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          setUser(mapProfile(profile))
        }
      } else {
        setUser(null)
      }
      setInitialized(true)
    })

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) setUser(mapProfile(profile))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

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
