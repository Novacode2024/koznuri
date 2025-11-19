import api from "./api";

// Doctor Types from API
export interface DoctorBranch {
  uuid: string;
  is_active: boolean;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  phone: string;
  address_uz: string;
  address_kr: string;
  address_ru: string;
  address_en: string;
  address_tj: string;
  address_kz: string;
  address_kg: string;
  email: string;
  map_embed: string;
}

export interface Doctor {
  uuid: string;
  branch: DoctorBranch;
  image: string;
  experience: string;
  full_name: string;
  job_uz: string;
  job_kr: string;
  job_ru: string;
  job_en: string;
  job_tj: string;
  job_kz: string;
  job_kg: string;
  order: number;
  service_price: number | null;
  description_uz: string;
  description_kr: string;
  description_ru: string;
  description_en: string;
  description_tj: string;
  description_kz: string;
  description_kg: string;
  user: string | null;
}

// Type-safe helper to get localized content
export type DoctorLocale = 'uz' | 'kr' | 'ru' | 'en' | 'tj' | 'kz' | 'kg';

export interface LocalizedDoctor {
  uuid: string;
  branch: DoctorBranch;
  image: string;
  experience: string;
  fullName: string;
  job: string;
  order: number;
  servicePrice: number | null;
  description: string;
}

// Helper function to localize doctor
export const localizeDoctor = (doctor: Doctor, locale: DoctorLocale): LocalizedDoctor => {
  // Map locale to property keys
  const keyMap = {
    uz: { job: 'job_uz', description: 'description_uz' },
    kr: { job: 'job_kr', description: 'description_kr' },
    ru: { job: 'job_ru', description: 'description_ru' },
    en: { job: 'job_en', description: 'description_en' },
    tj: { job: 'job_tj', description: 'description_tj' },
    kz: { job: 'job_kz', description: 'description_kz' },
    kg: { job: 'job_kg', description: 'description_kg' },
  } as const;

  const keys = keyMap[locale];
  
  return {
    uuid: doctor.uuid,
    branch: doctor.branch,
    image: doctor.image,
    experience: doctor.experience,
    fullName: doctor.full_name,
    job: doctor[keys.job] as string,
    order: doctor.order,
    servicePrice: doctor.service_price,
    description: doctor[keys.description] as string,
  };
}

// Doctor Price Response
export interface DoctorPrice {
  price?: string | number;
  service_price?: string;
}

// Age Price Response
export interface AgePrice {
  price: number;
}

// Doctors API Service
export const doctorsService = {
  // Get all doctors
  getDoctors: async (): Promise<Doctor[]> => {
    return api.get<Doctor[]>("/doctors/");
  },

  getDoctorById: async (uuid: string): Promise<Doctor> => {
    return api.get<Doctor>(`/doctors/${uuid}/`);
  },

  // Get doctors by branch UUID
  getDoctorsByBranch: async (branchUuid: string): Promise<Doctor[]> => {
    // Remove any trailing slashes and trim whitespace
    const cleanUuid = branchUuid.trim().replace(/\/+$/, '');
    if (!cleanUuid) {
      throw new Error("Branch UUID is required");
    }
    return api.get<Doctor[]>(`/doctor-filter/${cleanUuid}/`);
  },

  // Get doctor price by UUID
  getDoctorPrice: async (doctorUuid: string): Promise<DoctorPrice> => {
    // Remove any trailing slashes and trim whitespace
    const cleanUuid = doctorUuid.trim().replace(/\/+$/, '');
    if (!cleanUuid) {
      throw new Error("Doctor UUID is required");
    }
    return api.get<DoctorPrice>(`/doctor-price/${cleanUuid}/`);
  },

  // Get price by age
  getPriceByAge: async (age: number): Promise<AgePrice> => {
    if (!age || age < 1 || age > 100) {
      throw new Error("Age must be between 1 and 100");
    }
    return api.get<AgePrice>(`/price-by-age/${age}`);
  },
};
