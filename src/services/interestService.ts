import api from './api';

export interface CreateInterestData {
  full_name: string;
  phone: string;
  message: string;
}

export interface InterestResponse {
  success: boolean;
  message: string;
  data?: {
    uuid?: string;
    full_name?: string;
    phone?: string;
    message?: string;
  };
}

export const interestService = {
  createInterest: async (data: CreateInterestData, captchaToken?: string | null): Promise<InterestResponse> => {
    const formData = new FormData();
    
    formData.append('full_name', data.full_name.trim());
    formData.append('phone', data.phone.trim());
    formData.append('message', data.message.trim());

    if (captchaToken) {
      formData.append('captcha', captchaToken);
    }

    // Skip authentication - this endpoint works without token
    return api.post<InterestResponse>('/client/interest/create/', formData, {
      skipAuth: true,
    } as Parameters<typeof api.post>[2]);
  },
};

