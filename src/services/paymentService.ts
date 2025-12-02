import api from './api'
import type { Payment } from '../types/Payment'

export interface PaymePaymentResponse {
  payment_link: string;
}

export interface ClickLink {
  transaction_id: string;
  payment_url: string;
  amount: string;
  account_id: number;
  status: string;
  service_id: string;
  merchant_id: string;
}

export interface ClickPaymentResponse {
  click_link: ClickLink;
}

export const paymentService = {
  // Get all bills/payments for current user
  getPayments: async (): Promise<Payment[]> => {
    return api.get<Payment[]>('/client/bills/')
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    return api.get<Payment>(`/payments/${id}/`)
  },

  // Get payments by application
  getPaymentsByApplication: async (applicationId: string): Promise<Payment[]> => {
    return api.get<Payment[]>(`/payments/?application_id=${applicationId}`)
  },

  // Create Payme payment
  createPaymePayment: async (appointmentUuid: string, amount: string, captchaToken?: string | null): Promise<PaymePaymentResponse> => {
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('appointment', appointmentUuid);
    
    if (captchaToken) {
      formData.append('captcha', captchaToken);
    }
    
    return api.post<PaymePaymentResponse>('/payment/create/payme/', formData);
  },

  // Create Click payment
  createClickPayment: async (appointmentUuid: string, amount: string, captchaToken?: string | null): Promise<ClickPaymentResponse> => {
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('appointment', appointmentUuid);
    
    if (captchaToken) {
      formData.append('captcha', captchaToken);
    }
    
    return api.post<ClickPaymentResponse>('/payment/create/click/', formData);
  },
}

