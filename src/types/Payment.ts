export interface Payment {
  id: string
  uuid?: string
  application_id?: string
  application_uuid?: string
  amount?: number
  currency?: string
  status?: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  transaction_id?: string
  payment_date?: string
  created_at?: string
  updated_at?: string
  description?: string
}

