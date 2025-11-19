import api from "./api";

// Technology Types from API
export interface Technology {
  uuid: string;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  description_uz: string;
  description_kr: string;
  description_ru: string;
  description_en: string;
  description_tj: string;
  description_kz: string;
  description_kg: string;
  image: string;
  order: number;
}

// Type-safe helper to get localized content
export type TechnologyLocale = 'uz' | 'kr' | 'ru' | 'en' | 'tj' | 'kz' | 'kg';

export interface LocalizedTechnology {
  uuid: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

// Helper function to localize technology
export const localizeTechnology = (
  technology: Technology,
  locale: TechnologyLocale
): LocalizedTechnology => {
  // Map locale to property keys
  const keyMap = {
    uz: { title: 'title_uz', description: 'description_uz' },
    kr: { title: 'title_kr', description: 'description_kr' },
    ru: { title: 'title_ru', description: 'description_ru' },
    en: { title: 'title_en', description: 'description_en' },
    tj: { title: 'title_tj', description: 'description_tj' },
    kz: { title: 'title_kz', description: 'description_kz' },
    kg: { title: 'title_kg', description: 'description_kg' },
  } as const;

  const keys = keyMap[locale];

  return {
    uuid: technology.uuid,
    title: technology[keys.title] as string,
    description: technology[keys.description] as string,
    image: technology.image,
    order: technology.order,
  };
};

// Technologies API Service
export const technologiesService = {
  // Get all technologies
  getTechnologies: async (): Promise<Technology[]> => {
    return api.get<Technology[]>("/technologies/");
  },
};

