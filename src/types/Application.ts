export interface Application {
  id?: string
  uuid?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  first_name?: string
  last_name?: string
  phone?: string
  date?: string | null
  start_time?: string | null
  end_time?: string | null
  message?: string
  client?: string
  branch?: string
  service?: string
  doctor?: string
  // Legacy fields for backward compatibility
  client_name?: string
  client_phone?: string
  client_age?: number | null
  doctor_name?: string
  doctor_uuid?: string
  service_name?: string
  service_uuid?: string
  appointment_date?: string
  appointment_time?: string
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
}

export interface ApplicationDetail extends Application {
  additional_info?: string
  notes?: string
}

export interface ApplicationsResponse {
  items: Application[]
  page: number
  page_size: number
  total_pages: number
  total_items: number
}

export interface Bill {
  id: number
  amount: string
  status: string
  bill_url: string | null
  client: string
  appointment: string
}

export interface ApplicationDetailResponse {
  appointment: Application
  bills: Bill[]
}

