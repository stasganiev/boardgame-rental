import { create } from 'zustand'
import type { SearchFilters } from '@/types'

interface SearchState {
  filters: SearchFilters
  isMapView: boolean
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  setMapView: (isMapView: boolean) => void
}

const defaultFilters: SearchFilters = {
  radiusKm: 50,
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  isMapView: false,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setMapView: (isMapView) => set({ isMapView }),
}))
