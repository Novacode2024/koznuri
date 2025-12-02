import api from './api'

export interface Profile {
  first_name?: string
  last_name?: string
  phone?: string
  age?: number | null
  client_uuid?: string
  username?: string
}

export interface ProfileUpdate {
  first_name?: string
  last_name?: string
  phone?: string
  age?: number | null
  username?: string
  password?: string
}

export const profileService = {
  // Get current user profile
  getProfile: async (): Promise<Profile> => {
    return api.get<Profile>('/profile/')
  },

  // Update profile
  updateProfile: async (data: ProfileUpdate, captchaToken?: string | null): Promise<Profile> => {
    // Prepare FormData - only include fields that are provided
    const formData = new FormData()
    
    if (data.first_name !== undefined && data.first_name !== '') {
      formData.append('first_name', data.first_name)
    }
    if (data.last_name !== undefined && data.last_name !== '') {
      formData.append('last_name', data.last_name)
    }
    if (data.phone !== undefined && data.phone !== '') {
      formData.append('phone', data.phone)
    }
    if (data.age !== undefined && data.age !== null) {
      formData.append('age', String(data.age))
    }
    if (data.username !== undefined && data.username !== '') {
      formData.append('username', data.username)
    }
    if (data.password !== undefined && data.password !== '') {
      formData.append('password', data.password)
    }

    if (captchaToken) {
      formData.append('captcha', captchaToken)
    }

    // Send FormData with POST method to /client/profile/update/
    // Backend PATCH method ni qo'llab-quvvatlamaydi, shuning uchun POST ishlatamiz
    // Axios will automatically set Content-Type to multipart/form-data with boundary
    // Token is automatically added via interceptor
    return api.post<Profile>('/client/profile/update/', formData)
  },
}

