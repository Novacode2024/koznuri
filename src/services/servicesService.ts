import api from "./api";

// Service Types
export interface Service {
  uuid: string;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  subtitle_uz: string;
  subtitle_kr: string;
  subtitle_ru: string;
  subtitle_en: string;
  subtitle_tj: string;
  subtitle_kz: string;
  subtitle_kg: string;
  description_uz: string;
  description_kr: string;
  description_ru: string;
  description_en: string;
  description_tj: string;
  description_kz: string;
  description_kg: string;
  order: number;
  image: string;
  popular: boolean;
}

// Type-safe helper to get localized content
export type ServiceLocale = 'uz' | 'kr' | 'ru' | 'en' | 'tj' | 'kz' | 'kg';

export interface LocalizedService {
  uuid: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  image: string;
  popular: boolean;
}

// Helper function to localize service
export const localizeService = (service: Service, locale: ServiceLocale): LocalizedService => {
  // Map locale to property keys
  const keyMap = {
    uz: { title: 'title_uz', subtitle: 'subtitle_uz', description: 'description_uz' },
    kr: { title: 'title_kr', subtitle: 'subtitle_kr', description: 'description_kr' },
    ru: { title: 'title_ru', subtitle: 'subtitle_ru', description: 'description_ru' },
    en: { title: 'title_en', subtitle: 'subtitle_en', description: 'description_en' },
    tj: { title: 'title_tj', subtitle: 'subtitle_tj', description: 'description_tj' },
    kz: { title: 'title_kz', subtitle: 'subtitle_kz', description: 'description_kz' },
    kg: { title: 'title_kg', subtitle: 'subtitle_kg', description: 'description_kg' },
  } as const;

  const keys = keyMap[locale];
  
  return {
    uuid: service.uuid,
    title: service[keys.title] as string,
    subtitle: service[keys.subtitle] as string,
    description: service[keys.description] as string,
    order: service.order,
    image: service.image,
    popular: service.popular,
  };
};

// Services API Service
export const servicesService = {
  // Get all services
  getServices: async (): Promise<Service[]> => {
    return api.get<Service[]>("/services/");
  },

  getPopularServices: async (): Promise<Service[]> => {
    return api.get<Service[]>("/services/popular/");
  },

  getServiceById: async (uuid: string): Promise<Service> => {
    return api.get<Service>(`/service/${uuid}/`);
  },
};
