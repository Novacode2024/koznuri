import api from "./api";

// Social Video Types
export interface SocialVideo {
  uuid: string;
  title_uz: string;
  title_kr: string;
  title_ru: string;
  title_en: string;
  title_tj: string;
  title_kz: string;
  title_kg: string;
  link_uz: string;
  link_ru: string;
  link_en: string;
  link_tj: string;
  link_kz: string;
  link_kg: string;
  order: number;
  popular: boolean;
}

// Social Videos API Service
export const socialVideosService = {
  // Get all social videos
  getSocialVideos: async (): Promise<SocialVideo[]> => {
    return api.get<SocialVideo[]>("/social-videos/");
  },

  getPopularVideos: async (): Promise<SocialVideo[]> => {
    return api.get<SocialVideo[]>("/social-videos/popular/");
  },
};
