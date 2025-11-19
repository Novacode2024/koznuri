import api from './api'

export interface CreateDoctorAppointmentData {
  first_name: string
  last_name: string
  phone: string
  date?: string
  language: string
  time?: string
  doctor_uuid: string
}

export interface DoctorAppointmentResponse {
  success?: boolean
  message?: string
  uuid?: string
  appointment?: string
  data?: unknown
}

export const doctorAppointmentService = {
  createDoctorAppointment: async (data: CreateDoctorAppointmentData): Promise<DoctorAppointmentResponse> => {
    const formData = new FormData()
    
    formData.append('first_name', data.first_name)
    formData.append('last_name', data.last_name)
    formData.append('phone', data.phone)
    formData.append('language', data.language)
    formData.append('doctor_uuid', data.doctor_uuid)
    
    // Optional fields
    if (data.date) {
      formData.append('date', data.date)
    } else {
      formData.append('date', '')
    }
    
    if (data.time) {
      formData.append('time', data.time)
    } else {
      formData.append('time', '')
    }

    return api.post<DoctorAppointmentResponse>('/client/doctor-appointments/create/', formData)
  },
}

