import api from "./api";

export interface CreateAppointmentData {
  first_name: string;
  last_name: string;
  branch_uuid: string;
  doctor_uuid?: string;
  phone: string;
  date: string;
  language: string;
  age?: string;
  price?: string;
}

export interface AppointmentResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  appointment?: string; // Appointment UUID
  uuid?: string; // Alternative field name for appointment UUID
}

export const appointmentService = {
  createAppointment: async (data: CreateAppointmentData, captchaToken?: string | null): Promise<AppointmentResponse> => {
    const formData = new FormData();
    
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("branch_uuid", data.branch_uuid);
    
    // XOR logic: doctor_uuid va age bir-birini istisno qiladi
    if (data.doctor_uuid) {
      formData.append("doctor_uuid", data.doctor_uuid);
    }
    
    if (data.age) {
      formData.append("age", data.age);
    }
    
    formData.append("phone", data.phone);
    formData.append("date", data.date);
    formData.append("language", data.language);
    
    if (data.price) {
      formData.append("price", data.price);
    }

    if (captchaToken) {
      formData.append("captcha", captchaToken);
    }

    return api.post<AppointmentResponse>("/client/appointment/create/", formData);
  },
};

