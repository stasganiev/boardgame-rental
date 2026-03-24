export type Locale = 'en' | 'ru'

export type UserRole = 'user' | 'admin' | 'moderator'

export type ContactType = 'phone' | 'telegram' | 'whatsapp' | 'email' | 'other'

export type GameCondition = 'new' | 'excellent' | 'good' | 'satisfactory'

export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface Location {
  lat: number
  lng: number
  city: string
  country: string
  address?: string
}

export interface Contact {
  type: ContactType
  value: string
  isPublic: boolean
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  location?: Location
  contact?: Contact
  role: UserRole
  rating: number
  dealsCount: number
  bio?: string
  createdAt: string
}

export interface Game {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
  minAge: number
  gameDuration: string
  complexity: number // 1-5
  genre: string[]
  weight?: number
  description: string
  officialPhotos: string[]
  moderationStatus: ModerationStatus
  createdBy: string
  createdAt: string
}

export interface GameInstance {
  id: string
  gameId: string
  game?: Game
  ownerId: string
  owner?: UserProfile
  condition: GameCondition
  ownerPhotos: string[]
  availabilityRules: {
    daysOfWeek: number[]
    minRentalDays: number
    maxRentalDays: number
  }
  location: Location
  additionalDescription?: string
  isActive: boolean
  createdAt: string
}

export interface Booking {
  id: string
  gameInstanceId: string
  gameInstance?: GameInstance
  renterId: string
  renter?: UserProfile
  ownerId: string
  owner?: UserProfile
  startDate: string
  endDate: string
  status: BookingStatus
  createdAt: string
  confirmedAt?: string
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  reviewer?: UserProfile
  revieweeId: string
  rating: number // 1-5
  comment: string
  type: 'owner_to_renter' | 'renter_to_owner'
  createdAt: string
}

export interface SearchFilters {
  query?: string
  lat?: number
  lng?: number
  radiusKm?: number
  genre?: string[]
  minPlayers?: number
  maxPlayers?: number
  minAge?: number
  maxComplexity?: number
  city?: string
}
