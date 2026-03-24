export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'admin' | 'moderator'
          rating: number
          deals_count: number
          location_lat: number | null
          location_lng: number | null
          location_city: string | null
          location_country: string | null
          location_address: string | null
          contact_type: 'phone' | 'telegram' | 'whatsapp' | 'email' | 'other' | null
          contact_value: string | null
          contact_is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin' | 'moderator'
          rating?: number
          deals_count?: number
          location_lat?: number | null
          location_lng?: number | null
          location_city?: string | null
          location_country?: string | null
          location_address?: string | null
          contact_type?: 'phone' | 'telegram' | 'whatsapp' | 'email' | 'other' | null
          contact_value?: string | null
          contact_is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
    }
  }
}

// Storage helpers
export type StorageBucket = 'avatars' | 'game-photos'

export function getPublicUrl(
  supabaseUrl: string,
  bucket: StorageBucket,
  path: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
