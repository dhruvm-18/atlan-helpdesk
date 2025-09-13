import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Filters {
  topics: string[]
  sentiment: string
  priority: string
  channel: string
  search: string
}

interface UIState {
  theme: 'light' | 'dark'
  filters: Filters
  selectedTicketId: string | null
  isDetailsDrawerOpen: boolean
  
  // Actions
  toggleTheme: () => void
  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void
  setSelectedTicket: (id: string | null) => void
  setDetailsDrawerOpen: (open: boolean) => void
}

const defaultFilters: Filters = {
  topics: [],
  sentiment: '',
  priority: '',
  channel: '',
  search: ''
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      filters: defaultFilters,
      selectedTicketId: null,
      isDetailsDrawerOpen: false,
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }))
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },
      
      resetFilters: () => {
        set({ filters: defaultFilters })
      },
      
      setSelectedTicket: (id) => {
        set({ 
          selectedTicketId: id,
          isDetailsDrawerOpen: id !== null
        })
      },
      
      setDetailsDrawerOpen: (open) => {
        set({ 
          isDetailsDrawerOpen: open,
          selectedTicketId: open ? get().selectedTicketId : null
        })
      }
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ 
        theme: state.theme,
        filters: state.filters 
      })
    }
  )
)