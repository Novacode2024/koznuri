import api from './api'
import type { Application, ApplicationsResponse, ApplicationDetailResponse } from '../types/Application'

export interface GetApplicationsParams {
  page?: number
  page_size?: number
}

export const applicationService = {
  // Get all applications for current user with pagination
  getApplications: async (params?: GetApplicationsParams): Promise<ApplicationsResponse> => {
    const { page = 1, page_size = 10 } = params || {}
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    })
    return api.get<ApplicationsResponse>(`/client/appointments/?${queryParams.toString()}`)
  },

  // Get application by ID with bills
  getApplicationById: async (uuid: string): Promise<ApplicationDetailResponse> => {
    return api.get<ApplicationDetailResponse>(`/client/appointment/${uuid}/`)
  },

  // Create new application
  createApplication: async (data: Partial<Application>, captchaToken?: string | null): Promise<Application> => {
    const formData = new FormData()
    if (data.doctor_uuid) formData.append('doctor_uuid', data.doctor_uuid)
    if (data.service_uuid) formData.append('service_uuid', data.service_uuid)
    if (data.appointment_date) formData.append('appointment_date', data.appointment_date)
    if (data.appointment_time) formData.append('appointment_time', data.appointment_time)
    if (data.message) formData.append('message', data.message)
    
    if (captchaToken) {
      formData.append('captcha', captchaToken)
    }
    
    return api.post<Application>('/applications/', formData)
  },

  // Update application
  updateApplication: async (id: string, data: Partial<Application>): Promise<Application> => {
    const formData = new FormData()
    if (data.appointment_date) formData.append('appointment_date', data.appointment_date)
    if (data.appointment_time) formData.append('appointment_time', data.appointment_time)
    if (data.message) formData.append('message', data.message)
    if (data.status) formData.append('status', data.status)
    return api.patch<Application>(`/applications/${id}/`, formData)
  },
}

