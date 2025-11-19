import api from './api'

export interface Interest {
  id?: string
  uuid?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  full_name?: string
  phone?: string
  message?: string
  client?: string
  // Legacy fields for backward compatibility
  title?: string
  description?: string
  status?: string
  [key: string]: unknown // For any additional fields from API
}

export const interestsService = {
  // Get all interests for current user
  getInterests: async (): Promise<Interest[]> => {
    return api.get<Interest[]>('/client/interests/')
  },
}

